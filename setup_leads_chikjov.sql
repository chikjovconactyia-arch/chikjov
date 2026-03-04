-- SCRIPT DE CORREÇÃO FINAL - CHIKJOV
-- Flexível para encontrar "Funil-Prospecção" e "Pistas" automaticamente

CREATE OR REPLACE FUNCTION public.create_prospect_lead(
    _name TEXT,
    _email TEXT,
    _whatsapp TEXT,
    _instagram TEXT,
    _business_name TEXT,
    _address TEXT,
    _plan TEXT,
    _value TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin_id UUID;
    v_funnel_id UUID;
    v_column_id UUID;
    v_lead_id UUID;
    v_description TEXT;
BEGIN
    -- 1. Buscar o ID do administrador
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'sinvaldo.p.oliveira@gmail.com' LIMIT 1;
    IF v_admin_id IS NULL THEN
        SELECT id INTO v_admin_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    END IF;

    -- 2. Buscar Funil (Flexível)
    SELECT id INTO v_funnel_id FROM public.funnels 
    WHERE name ILIKE 'Funil%Prospecção%' 
    LIMIT 1;
    
    IF v_funnel_id IS NULL THEN
        INSERT INTO public.funnels (user_id, name) VALUES (v_admin_id, 'Funil Prospecção') RETURNING id INTO v_funnel_id;
    END IF;

    -- 3. Buscar Coluna (Flexível: Leads ou Pistas)
    SELECT id INTO v_column_id FROM public.funnel_columns 
    WHERE funnel_id = v_funnel_id 
    AND (title ILIKE 'Leads' OR title ILIKE 'Pistas' OR title ILIKE 'Pista%')
    ORDER BY sort_order ASC
    LIMIT 1;
    
    IF v_column_id IS NULL THEN
        INSERT INTO public.funnel_columns (funnel_id, title, sort_order, color) 
        VALUES (v_funnel_id, 'Leads', 0, '#8B5CF6') 
        RETURNING id INTO v_column_id;
    END IF;

    -- 4. Formatar Descrição
    v_description := 'Plano: ' || _plan || E'\n' ||
                     'Email: ' || _email || E'\n' ||
                     'WhatsApp: ' || _whatsapp || E'\n' ||
                     'Instagram: ' || _instagram || E'\n' ||
                     'Estabelecimento: ' || _business_name || E'\n' ||
                     'Endereço: ' || _address;

    -- 5. Inserir Lead
    INSERT INTO public.leads (column_id, title, description, value, labels, sort_order)
    VALUES (v_column_id, _name, v_description, _value, ARRAY['cold'], -1)
    RETURNING id INTO v_lead_id;

    RETURN jsonb_build_object('success', true, 'lead_id', v_lead_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_prospect_lead TO anon, authenticated, service_role;
