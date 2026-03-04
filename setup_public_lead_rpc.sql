-- Function to allow public leads creation (Partner Form)
-- SECURITY DEFINER allows it to run with privileges of the creator (postgres), bypassing RLS for public users.
DROP FUNCTION IF EXISTS public.create_prospect_lead;

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
    -- 1. Find an admin user (owner of the funnel)
    SELECT id INTO v_admin_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    
    IF v_admin_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'No admin user found');
    END IF;

    -- 2. Find or Create "Funil Prospecção"
    SELECT id INTO v_funnel_id FROM public.funnels WHERE name = 'Funil Prospecção' AND user_id = v_admin_id LIMIT 1;
    
    IF v_funnel_id IS NULL THEN
        INSERT INTO public.funnels (user_id, name) VALUES (v_admin_id, 'Funil Prospecção') RETURNING id INTO v_funnel_id;
        
        -- Create default columns
        INSERT INTO public.funnel_columns (funnel_id, title, sort_order, color) VALUES
        (v_funnel_id, 'Leads', 0, '#8B5CF6'),
        (v_funnel_id, 'Em Negociação', 1, '#3B82F6'),
        (v_funnel_id, 'Fechado', 2, '#10B981');
    END IF;

    -- 3. Find or Create "Leads" Column
    SELECT id INTO v_column_id FROM public.funnel_columns WHERE funnel_id = v_funnel_id AND title = 'Leads' LIMIT 1;
    
    IF v_column_id IS NULL THEN
        INSERT INTO public.funnel_columns (funnel_id, title, sort_order, color) 
        VALUES (v_funnel_id, 'Leads', 0, '#8B5CF6') 
        RETURNING id INTO v_column_id;
    END IF;

    -- 4. Format Description
    v_description := 'Plano: ' || _plan || E'\n' ||
                     'Email: ' || _email || E'\n' ||
                     'WhatsApp: ' || _whatsapp || E'\n' ||
                     'Instagram: ' || _instagram || E'\n' ||
                     'Estabelecimento: ' || _business_name || E'\n' ||
                     'Endereço: ' || _address;

    -- 5. Insert Lead
    INSERT INTO public.leads (column_id, title, description, value, labels, sort_order)
    VALUES (v_column_id, _name, v_description, _value, ARRAY['cold'], 0)
    RETURNING id INTO v_lead_id;

    RETURN jsonb_build_object('success', true, 'lead_id', v_lead_id);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
