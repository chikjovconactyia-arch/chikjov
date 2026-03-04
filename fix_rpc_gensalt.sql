-- ==============================================================================
-- SCRIPT DE CORREÇÃO FINAL: ERRO 'gen_salt' NÃO ENCONTRADO
-- ==============================================================================

-- 1. Garantir extensão pgcrypto instalada no schema 'extensions' (padrão Supabase novo)
--    Se já existe em outro schema, ele ignora.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 2. Recriar a função RPC adicionando 'extensions' no search_path
CREATE OR REPLACE FUNCTION public.create_user_by_admin(
    email_input TEXT,
    password_input TEXT,
    full_name_input TEXT,
    role_input TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
-- IMPORTANTE: Adiciona 'extensions' aqui para encontrar gen_salt() e crypt()
SET search_path = public, extensions
AS $$
DECLARE
    new_user_id UUID;
    encrypted_pw TEXT;
BEGIN
    -- Validação de segurança: Apenas Admins podem executar
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    ) THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem criar novos usuários.';
    END IF;

    -- Validação de e-mail duplicado
    IF EXISTS (SELECT 1 FROM auth.users WHERE auth.users.email = email_input) THEN
        RAISE EXCEPTION 'Este email já está cadastrado.';
    END IF;

    -- Criptografar Senha (agora encontra crypt/gen_salt no schema extensions)
    -- Explícito cast para text para evitar ambiguidade 'unknown'
    encrypted_pw := crypt(password_input, gen_salt('bf'::text));

    -- Inserir novo usuário em auth.users
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

    -- Inserir perfil na tabela public.profiles (garantindo created_at)
    INSERT INTO public.profiles (id, full_name, role, created_at)
    VALUES (new_user_id, full_name_input, role_input, NOW())
    ON CONFLICT (id) DO UPDATE
    SET role = EXCLUDED.role, full_name = EXCLUDED.full_name;

    RETURN jsonb_build_object(
        'id', new_user_id,
        'email', email_input,
        'role', role_input
    );
END;
$$;

-- 3. Conceder permissões novamente
GRANT EXECUTE ON FUNCTION public.create_user_by_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_by_admin TO service_role;
