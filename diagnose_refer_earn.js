
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Carregar .env
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabase = createClient(envConfig.VITE_SUPABASE_URL, envConfig.VITE_SUPABASE_ANON_KEY);

async function diagnose() {
    console.log('--- DIAGNÓSTICO INDIQUE E GANHE ---');

    console.log('\n1. Listando CONFIGURAÇÕES (refer_earn_config):');
    const { data: configs, error: configError } = await supabase
        .from('refer_earn_config')
        .select('*');

    if (configError) console.error('Erro ao ler configs:', configError);
    else {
        console.log(`Encontradas ${configs.length} configurações.`);
        configs.forEach(c => console.log(` - ID: ${c.id} | Headline: "${c.headline?.substring(0, 30)}..." | Created: ${c.updated_at || 'N/A'}`));
    }

    console.log('\n2. Listando FEATURES/SLIDES (refer_earn_features):');
    const { data: features, error: featureError } = await supabase
        .from('refer_earn_features')
        .select('*');

    if (featureError) console.error('Erro ao ler features:', featureError);
    else {
        console.log(`Encontradas ${features.length} features.`);
        features.forEach(f => console.log(` - ID: ${f.id} | Title: "${f.title}" | Config ID: ${f.config_id} | Step: ${f.step}`));
    }

    if (configs && features) {
        console.log('\n--- ANÁLISE ---');
        configs.forEach(c => {
            const count = features.filter(f => f.config_id === c.id).length;
            console.log(`Config ${c.id} possui ${count} features vinculadas.`);
        });

        const orphans = features.filter(f => !configs.find(c => c.id === f.config_id));
        if (orphans.length > 0) {
            console.log(`ALERTA: Existem ${orphans.length} features órfãs (vinculadas a config inexistente)!`);
            orphans.forEach(o => console.log(` -> Feature "${o.title}" aponta para ${o.config_id}`));
        }
    }
}

diagnose();
