-- ==============================================================================
-- FUNÇÃO RPC PARA CRIAR USUÁRIOS (ADMIN) - VERSÃO CORRIGIDA
-- Permite que administradores criem usuários diretamente pelo Dashboard
-- ==============================================================================

-- 1. Habilitar extensão pgcrypto para criptografar senhas
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Remover função antiga para evitar conflito de assinatura
DROP FUNCTION IF EXISTS public.create_user_by_admin(TEXT, TEXT, TEXT, TEXT);

-- 3. Criar a função RPC com nomes de parametros DIFERENTES das colunas para evitar ambiguidade
CREATE OR REPLACE FUNCTION public.create_user_by_admin(
    email_input TEXT,
    password_input TEXT,
    full_name_input TEXT,
    role_input TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_user_id UUID;
    encrypted_pw TEXT;
BEGIN
    -- 1. Verificar se quem está chamando é ADMIN
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    ) THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem criar novos usuários.';
    END IF;

    -- 2. Verificar se email já existe
    IF EXISTS (SELECT 1 FROM auth.users WHERE auth.users.email = email_input) THEN
        RAISE EXCEPTION 'Este email já está cadastrado.';
    END IF;

    -- 3. Criptografar Senha
    encrypted_pw := crypt(password_input, gen_salt('bf'));

    -- 4. Inserir na tabela de autenticação (auth.users)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        email_input,
        encrypted_pw,
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object('full_name', full_name_input),
        NOW(),
        NOW()
    ) RETURNING id INTO new_user_id;

    -- 5. Inserir na tabela de perfis (public.profiles)
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (new_user_id, full_name_input, role_input)
    ON CONFLICT (id) DO UPDATE
    SET role = EXCLUDED.role, full_name = EXCLUDED.full_name;

    RETURN jsonb_build_object(
        'id', new_user_id,
        'email', email_input,
        'role', role_input
    );
END;
$$;

-- 4. Permitir execução
GRANT EXECUTE ON FUNCTION public.create_user_by_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_by_admin TO service_role;
