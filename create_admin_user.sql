-- ==============================================================================
-- SCRIPT PARA CRIAR SUPER ADMIN E CONFIGURAR PERMISSÕES
-- Execute este script no SQL Editor do Painel do Supabase
-- ==============================================================================

-- 1. Habilitar extensão para criptografia de senhas (necessário para criar usuário via SQL)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Adicionar coluna de ROLE na tabela de profiles (se não existir)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN 
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user'; 
    END IF; 
END $$;

-- 3. Função para criar ou atualizar o Super Admin
DO $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Verificar se o usuário já existe
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'sinvaldo.p.oliveira@gmail.com';

    IF new_user_id IS NULL THEN
        -- CRIAR NOVO USUÁRIO
        new_user_id := gen_random_uuid();
        
        INSERT INTO auth.users (
            id,
            instance_id,
            id,
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
            recovery_token
        ) VALUES (
            new_user_id,
            '00000000-0000-0000-0000-000000000000',
            new_user_id,
            'authenticated',
            'authenticated',
            'sinvaldo.p.oliveira@gmail.com',
            crypt('572419', gen_salt('bf')), -- Senha criptografada
            NOW(), -- Email confirmado automaticamente
            NULL,
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Sinvaldo Oliveira"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
    ELSE
        -- ATUALIZAR SENHA SE USUÁRIO JÁ EXISTIR
        UPDATE auth.users 
        SET encrypted_password = crypt('572419', gen_salt('bf')),
            updated_at = NOW()
        WHERE id = new_user_id;
    END IF;

    -- 4. Criar ou Atualizar Perfil com Role de Super Admin
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (new_user_id, 'Sinvaldo Oliveira', 'super_admin')
    ON CONFLICT (id) DO UPDATE 
    SET role = 'super_admin',
        full_name = 'Sinvaldo Oliveira',
        updated_at = NOW();

    RAISE NOTICE 'Super Admin criado/atualizado com sucesso! ID: %', new_user_id;
END $$;
