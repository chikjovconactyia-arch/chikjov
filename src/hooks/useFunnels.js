import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useFunnels() {
    const [funnels, setFunnels] = useState([]);
    const [activeFunnelId, setActiveFunnelId] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: funnelsData, error: funnelsError } = await supabase
                .from('funnels')
                .select(`
                    *,
                    columns:funnel_columns (
                        *,
                        cards:leads (*)
                    )
                `);

            if (funnelsError) throw funnelsError;

            if (funnelsData) {
                const processed = funnelsData.map(f => ({
                    ...f,
                    columns: (f.columns || []).sort((a, b) => a.sort_order - b.sort_order).map(c => ({
                        ...c,
                        cards: (c.cards || []).sort((a, b) => a.sort_order - b.sort_order)
                    }))
                }));
                setFunnels(processed);
            }
        } catch (error) {
            console.error('Error fetching funnels:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (funnels.length > 0) {
            if (!activeFunnelId || !funnels.find(f => f.id === activeFunnelId)) {
                setActiveFunnelId(funnels[0].id);
            }
        }
    }, [funnels, activeFunnelId]);

    const activeFunnel = funnels.find(f => f.id === activeFunnelId) || funnels[0];

    // ── Funnel CRUD ──
    const addFunnel = useCallback(async (name) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Você precisa estar logado para criar um funil.');
                return;
            }

            const { data, error } = await supabase
                .from('funnels')
                .insert([{ name, user_id: user.id }])
                .select();

            if (error) throw error;
            const newFunnel = data[0];

            // Create default columns
            const defaultCols = [
                { funnel_id: newFunnel.id, title: 'Leads', color: '#8B5CF6', sort_order: 0 },
                { funnel_id: newFunnel.id, title: 'Qualificação', color: '#3B82F6', sort_order: 1 },
                { funnel_id: newFunnel.id, title: 'Fechado', color: '#10B981', sort_order: 2 },
            ];

            const { error: colError } = await supabase.from('funnel_columns').insert(defaultCols);
            if (colError) throw colError;

            await fetchData();
            setActiveFunnelId(newFunnel.id);
            return newFunnel.id;
        } catch (error) {
            console.error('Error adding funnel:', error);
            alert('Erro ao criar funil. Verifique se você tem permissão.');
        }
    }, [fetchData]);

    const deleteFunnel = useCallback(async (funnelId) => {
        try {
            const { error } = await supabase.from('funnels').delete().eq('id', funnelId);
            if (error) throw error;
            setFunnels(prev => prev.filter(f => f.id !== funnelId));
        } catch (error) {
            console.error('Error deleting funnel:', error);
        }
    }, []);

    const renameFunnel = useCallback(async (funnelId, name) => {
        try {
            const { error } = await supabase.from('funnels').update({ name }).eq('id', funnelId);
            if (error) throw error;
            setFunnels(prev => prev.map(f => f.id === funnelId ? { ...f, name } : f));
        } catch (error) {
            console.error('Error renaming funnel:', error);
        }
    }, []);

    // ── Column CRUD ──
    const addColumn = useCallback(async (title) => {
        if (!activeFunnelId) return;
        try {
            const { error } = await supabase.from('funnel_columns').insert([{
                funnel_id: activeFunnelId,
                title,
                sort_order: (activeFunnel?.columns?.length || 0)
            }]);
            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error('Error adding column:', error);
        }
    }, [activeFunnelId, activeFunnel, fetchData]);

    const deleteColumn = useCallback(async (colId) => {
        try {
            const { error } = await supabase.from('funnel_columns').delete().eq('id', colId);
            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error('Error deleting column:', error);
        }
    }, [fetchData]);

    const renameColumn = useCallback(async (colId, title) => {
        try {
            const { error } = await supabase.from('funnel_columns').update({ title }).eq('id', colId);
            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error('Error renaming column:', error);
        }
    }, [fetchData]);

    // ── Card CRUD ──
    const addCard = useCallback(async (colId, cardData = {}) => {
        try {
            const { data, error } = await supabase.from('leads').insert([{
                column_id: colId,
                title: cardData.title || 'Novo lead',
                description: cardData.description || '',
                value: cardData.value || '',
                labels: cardData.labels || [],
                sort_order: 0
            }]).select();

            if (error) throw error;
            fetchData();
            return data[0]?.id;
        } catch (error) {
            console.error('Error adding card:', error);
        }
    }, [fetchData]);

    const updateCard = useCallback(async (colId, cardId, updates) => {
        try {
            const { error } = await supabase.from('leads').update(updates).eq('id', cardId);
            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error('Error updating card:', error);
        }
    }, [fetchData]);

    const deleteCard = useCallback(async (colId, cardId) => {
        try {
            const { error } = await supabase.from('leads').delete().eq('id', cardId);
            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error('Error deleting card:', error);
        }
    }, [fetchData]);

    const moveCard = useCallback(async (fromColId, toColId, cardId, toIndex) => {
        try {
            const { error } = await supabase.from('leads').update({
                column_id: toColId,
                sort_order: toIndex
            }).eq('id', cardId);

            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error('Error moving card:', error);
        }
    }, [fetchData]);

    return {
        funnels,
        activeFunnel,
        activeFunnelId,
        setActiveFunnelId,
        loading,
        addFunnel,
        deleteFunnel,
        renameFunnel,
        addColumn,
        deleteColumn,
        renameColumn,
        addCard,
        updateCard,
        deleteCard,
        moveCard,
        refreshFunnels: fetchData,
    };
}

export async function addLeadToFunnel(leadData) {
    try {
        const { data, error } = await supabase.rpc('create_prospect_lead', {
            _name: leadData.name,
            _email: leadData.email,
            _whatsapp: leadData.whatsapp,
            _instagram: leadData.instagram || '',
            _business_name: leadData.businessName,
            _address: leadData.address,
            _plan: leadData.plan,
            _value: leadData.value
        });

        if (error) throw error;
        
        if (data && data.success) {
            return true;
        } else {
            console.error('RPC Error:', data?.error);
            return false;
        }
    } catch (err) {
        console.error("Failed to add lead to Supabase", err);
        return false;
    }
}
