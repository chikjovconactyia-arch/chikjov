import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULT_SETTINGS = {
    speed: 6000,
    effect: 'slide',
};

const DEFAULT_SLIDES = [
    {
        id: 'default-1',
        title: 'Programas de Indicação',
        headline: 'Ganhe para usar!',
        description: 'Indique amigos e ganhe dinheiro no ChikJov! Participe de um ou mais programas e ganhe recompensas incríveis.',
        button_text: 'Cadastrar-se',
        button_link: '#',
        second_button_text: '',
        second_button_link: '',
        image_url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
        is_active: true,
        sort_order: 0,
    },
    {
        id: 'default-2',
        title: 'Cinema e Lazer',
        headline: 'Encontre seu filme',
        description: 'Compre ingressos com descontos exclusivos. Assista aos melhores lançamentos nas redes parceiras.',
        button_text: 'Ver filmes',
        button_link: '#',
        second_button_text: '',
        second_button_link: '',
        image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
        is_active: true,
        sort_order: 1,
    },
];

export function useSlides() {
    const [slides, setSlides] = useState([]);
    const [carouselSettings, setCarouselSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState('idle');

    const fetchData = useCallback(async () => {
        console.log('useSlides: Iniciando busca de dados...');
        console.log('useSlides: URL do Supabase:', import.meta.env.VITE_SUPABASE_URL);
        console.log('useSlides: Chave Anon presente:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

        setLoading(true);
        try {
            // Fetch Slides
            const { data: slidesData, error: slidesError } = await supabase
                .from('hero_slides')
                .select('*')
                .order('sort_order', { ascending: true });

            if (slidesError) {
                if (slidesError.code === '401' || slidesError.status === 401 || slidesError.message?.includes('JWT')) {
                    console.error('useSlides: Erro de autenticação detectado (401). Verifique as chaves no .env ou se o projeto está pausado.');
                    setSaveStatus('auth_error');
                }
                throw slidesError;
            }

            if (slidesData && slidesData.length > 0) {
                setSlides(slidesData);
            } else {
                setSlides(DEFAULT_SLIDES);
            }

            // Fetch Settings
            const { data: settingsData, error: settingsError } = await supabase
                .from('hero_settings')
                .select('*')
                .limit(1);

            if (settingsError) throw settingsError;
            if (settingsData && settingsData.length > 0) {
                setCarouselSettings(settingsData[0]);
            }
        } catch (error) {
            console.error('Error fetching slides data:', error);
            // If it's an auth error, slides will be empty or DEFAULT_SLIDES will show locally but keep the error status
            if (saveStatus !== 'auth_error') {
                setSlides(DEFAULT_SLIDES);
            }
        } finally {
            setLoading(false);
        }
    }, [saveStatus]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateCarouselSettings = useCallback(async (updates) => {
        setSaveStatus('saving');
        try {
            const newSettings = { ...carouselSettings, ...updates };
            const { error } = await supabase
                .from('hero_settings')
                .upsert({ id: carouselSettings.id, ...newSettings });

            if (error) throw error;
            setCarouselSettings(newSettings);
            setSaveStatus('saved');
        } catch (error) {
            console.error('Error saving settings:', error);
            setSaveStatus('idle');
        }
    }, [carouselSettings]);

    const addSlide = useCallback(async () => {
        const newSlide = {
            title: '',
            headline: 'Novo Slide',
            description: '',
            button_text: 'Saiba mais',
            button_link: '#',
            image_url: '',
            is_active: true,
            sort_order: slides.length,
        };

        setSaveStatus('saving');
        try {
            const { data, error } = await supabase
                .from('hero_slides')
                .insert([newSlide])
                .select();

            if (error) {
                console.error('Supabase error adding slide:', error);
                throw error;
            }

            const insertedSlide = data[0];
            setSlides(prev => [...prev, insertedSlide]);
            setSaveStatus('saved');
            return insertedSlide.id;
        } catch (error) {
            console.error('Error adding slide:', error);
            setSaveStatus('error');
            return null;
        }
    }, [slides.length]);

    const updateSlide = useCallback(async (id, updates) => {
        setSaveStatus('saving');
        try {
            const { error } = await supabase
                .from('hero_slides')
                .update(updates)
                .eq('id', id);

            if (error) {
                console.error('Supabase error updating slide:', error);
                throw error;
            }

            setSlides(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
            setSaveStatus('saved');
        } catch (error) {
            console.error('Error updating slide:', error);
            setSaveStatus('error');
        }
    }, []);

    const deleteSlide = useCallback(async (id) => {
        try {
            const { error } = await supabase
                .from('hero_slides')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setSlides(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error('Error deleting slide:', error);
        }
    }, []);

    const toggleSlide = useCallback((id) => {
        const slide = slides.find(s => s.id === id);
        if (slide) {
            updateSlide(id, { is_active: !slide.is_active });
        }
    }, [slides, updateSlide]);

    const reorderSlides = useCallback(async (fromIndex, toIndex) => {
        const newSlides = [...slides];
        const [moved] = newSlides.splice(fromIndex, 1);
        newSlides.splice(toIndex, 0, moved);

        // Update local state immediately for UX
        const reordered = newSlides.map((s, i) => ({ ...s, sort_order: i }));
        setSlides(reordered);

        // Update database
        try {
            const updates = reordered.map(s => ({
                id: s.id,
                sort_order: s.sort_order
            }));
            const { error } = await supabase.from('hero_slides').upsert(updates);
            if (error) throw error;
        } catch (error) {
            console.error('Error reordering slides:', error);
            fetchData(); // Rollback on error
        }
    }, [slides, fetchData]);

    const getActiveSlides = useCallback(() => {
        return slides.filter(s => s.is_active).sort((a, b) => a.sort_order - b.sort_order);
    }, [slides]);

    return {
        slides,
        loading,
        saveStatus,
        carouselSettings,
        updateCarouselSettings,
        addSlide,
        updateSlide,
        deleteSlide,
        toggleSlide,
        reorderSlides,
        getActiveSlides,
    };
}
