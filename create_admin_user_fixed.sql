-- ==============================================================================
-- SCRIPT CORRIGIDO PARA CRIAR SUPER ADMIN
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN 
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user'; 
    END IF; 
END $$;

DO $$
DECLARE
    new_user_id UUID;
    v_cnt INT;
BEGIN
    -- Check if user exists
    SELECT count(*) INTO v_cnt FROM auth.users WHERE email = 'sinvaldo.p.oliveira@gmail.com';
    
    IF v_cnt = 0 THEN
        new_user_id := gen_random_uuid();
        
        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token,
            is_super_admin
        ) VALUES (
            new_user_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'sinvaldo.p.oliveira@gmail.com',
            crypt('572419', gen_salt('bf')),
            NOW(),
            NULL,
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Sinvaldo Oliveira"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            '',
            FALSE
        );
        
        -- Insert profile
        INSERT INTO public.profiles (id, full_name, role)
        VALUES (new_user_id, 'Sinvaldo Oliveira', 'super_admin');
        
    END IF;
END $$;
