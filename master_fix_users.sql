-- ==============================================================================
-- MASTER FIX: GESTÃO DE USUÁRIOS
-- Limpa tentativas anteriores e reinstala TUDO corretamente
-- RESOLVE: Erro 500 (Token/Login), 404 (RPC Function), 400 (Profiles List)
-- ==============================================================================

-- 1. LIMPEZA: Remover o usuário "Fernanda" problemático
DELETE FROM auth.users WHERE email = 'm.cfer03@gmail.com';

-- 2. LIMPEZA DA FUNÇÃO ANTIGA
-- Apaga TODAS as versões da função para garantir que a nova seja única
DROP FUNCTION IF EXISTS public.create_user_by_admin(TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_user_by_admin(jsonb);

-- 3. ESTRUTURA: Garantir coluna 'created_at' e extensão 'pgcrypto'
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 4. CRIAÇÃO DA FUNÇÃO RPC (VERSÃO FINAL)
CREATE OR REPLACE FUNCTION public.create_user_by_admin(
    email_input TEXT,
    password_input TEXT,
    full_name_input TEXT,
    role_input TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions -- Crucial para funcionar!
AS $$
DECLARE
    new_user_id UUID;
    encrypted_pw TEXT;
BEGIN
    -- Validação: Apenas Admin/Super Admin executa
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    ) THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem criar novos usuários.';
    END IF;

    -- Validação: Email já existe?
    IF EXISTS (SELECT 1 FROM auth.users WHERE auth.users.email = email_input) THEN
        RAISE EXCEPTION 'Este email já está cadastrado.';
    END IF;

    -- Criptografia
    encrypted_pw := crypt(password_input, gen_salt('bf'::text));

    -- Inserir em auth.users
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
        email_input, encrypted_pw, NOW(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object('full_name', full_name_input),
        NOW(), NOW()
    ) RETURNING id INTO new_user_id;

    -- Inserir em public.profiles
    INSERT INTO public.profiles (id, full_name, role, created_at)
    VALUES (new_user_id, full_name_input, role_input, NOW())
    ON CONFLICT (id) DO UPDATE
    SET role = EXCLUDED.role, full_name = EXCLUDED.full_name;

    RETURN jsonb_build_object('id', new_user_id, 'email', email_input, 'role', role_input);
END;
$$;

-- 5. PERMISSÕES E CACHE
GRANT EXECUTE ON FUNCTION public.create_user_by_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_by_admin TO service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

-- Forçar atualização do Supabase
NOTIFY pgrst, 'reload config';
