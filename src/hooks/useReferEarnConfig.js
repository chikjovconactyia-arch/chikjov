import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULT_CONFIG = {
    badge_text: 'Indique e Ganhe',
    headline: 'Use, economize e ainda ganhe dinheiro com a ChikJov',
    subheadline: 'Aproveite descontos exclusivos, benefícios completos e transforme suas indicações em renda extra todos os meses.',
    description: 'A ChikJov é o app ideal para quem quer economizar em serviços de beleza, cuidar da saúde com telemedicina 24h e ainda ganhar dinheiro indicando amigos.',
    highlight_title: 'Por apenas R$ 39,90 por mês',
    highlight_text: 'Você pode economizar, usar benefícios exclusivos e ainda gerar renda extra.',
    cta_button_text: 'Quero economizar e ganhar dinheiro',
    cta_button_link: '#',
    secondary_button_text: 'Começar agora',
    secondary_button_link: '#',
    features: []
};

export const useReferEarnConfig = () => {
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);

    const loadConfig = useCallback(async () => {
        setLoading(true);
        try {
            // Get Config
            const { data: configDataArray, error: configError } = await supabase
                .from('refer_earn_config')
                .select('*')
                .order('updated_at', { ascending: false })
                .limit(1);

            if (configError) throw configError;

            const configData = configDataArray && configDataArray.length > 0 ? configDataArray[0] : null;
            let finalConfig = configData ? { ...DEFAULT_CONFIG, ...configData } : DEFAULT_CONFIG;

            // Get Features if config exists
            if (configData) {
                const { data: featuresData, error: featuresError } = await supabase
                    .from('refer_earn_features')
                    .select('*')
                    .eq('config_id', configData.id)
                    .order('sort_order', { ascending: true });

                if (featuresError) throw featuresError;
                finalConfig.features = featuresData || [];
            } else {
                finalConfig.features = [];
            }

            setConfig(finalConfig);
        } catch (error) {
            console.error("Failed to load Refer & Earn config from Supabase", error);
            setConfig(DEFAULT_CONFIG);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadConfig();
    }, [loadConfig]);

    const saveConfig = async (newConfig) => {
        try {
            const { features, ...mainConfig } = newConfig;

            // Upsert main config
            const { data: savedConfigArray, error: configError } = await supabase
                .from('refer_earn_config')
                .upsert(mainConfig)
                .select();

            if (configError) throw configError;
            const savedConfig = savedConfigArray[0];

            // Handle features (simple delete/insert for migration ease)
            if (features && features.length > 0) {
                await supabase.from('refer_earn_features').delete().eq('config_id', savedConfig.id);

                const featuresToInsert = features.map((f, i) => ({
                    config_id: savedConfig.id,
                    step: f.step,
                    title: f.title,
                    content: f.content,
                    image_url: f.image_url || f.image,
                    sort_order: i
                }));

                const { error: featuresError } = await supabase.from('refer_earn_features').insert(featuresToInsert);
                if (featuresError) throw featuresError;
            }

            setConfig(newConfig);
            return true;
        } catch (error) {
            console.error("Failed to save config to Supabase", error);
            return false;
        }
    };

    return { config, saveConfig, loading, defaults: DEFAULT_CONFIG };
};
