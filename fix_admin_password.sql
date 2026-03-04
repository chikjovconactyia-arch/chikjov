-- ==============================================================================
-- SCRIPT DE CORREÇÃO DE SENHA E PERMISSÕES
-- Execute no SQL Editor do Supabase
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- 1. Tentar encontrar o usuário
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'sinvaldo.p.oliveira@gmail.com';

    IF target_user_id IS NOT NULL THEN
        -- 2. Se existir, FORÇAR atualização da senha e confirmação de email
        UPDATE auth.users
        SET encrypted_password = crypt('572419', gen_salt('bf')),
            email_confirmed_at = NOW(),
            raw_app_meta_data = '{"provider": "email", "providers": ["email"]}',
            raw_user_meta_data = '{"full_name": "Sinvaldo Oliveira"}'
        WHERE id = target_user_id;
        
        -- 3. Garantir perfil de super_admin
        INSERT INTO public.profiles (id, full_name, role)
        VALUES (target_user_id, 'Sinvaldo Oliveira', 'super_admin')
        ON CONFLICT (id) DO UPDATE 
        SET role = 'super_admin';

        RAISE NOTICE 'Senha atualizada para o usuário existente: %', target_user_id;
    ELSE
        RAISE NOTICE 'Usuário não encontrado. Crie-o manualmente no painel Authentication.';
    END IF;
END $$;
