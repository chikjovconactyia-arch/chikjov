-- ==============================================================================
-- SCRIPT DE CORREÇÃO UNIFICADO: GESTÃO DE USUÁRIOS
-- Resolve: Erro 400 (Profiles) e Erro 404 (RPC Create User)
-- ==============================================================================

-- 1. Garantir que a coluna 'created_at' exista na tabela profiles
-- (Corrige erro 400 ao listar usuários)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. Habilitar extensão pgcrypto (necessária para senhas)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. Remover versões antigas da função RPC para evitar conflitos
-- (Dropa todas as variações possíveis de assinatura que possam ter sido criadas)
DROP FUNCTION IF EXISTS public.create_user_by_admin(TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_user_by_admin(jsonb);

-- 4. Recriar a função create_user_by_admin com a assinatura CORRETA
-- (Corrige erro 404 ao criar usuário)
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

    -- Criptografar Senha
    encrypted_pw := crypt(password_input, gen_salt('bf'));

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

    -- Inserir perfil na tabela public.profiles
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

-- 5. Conceder permissões de execução
GRANT EXECUTE ON FUNCTION public.create_user_by_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_by_admin TO service_role;

-- 6. Garantir que o usuário atual (você) seja super_admin para testar
UPDATE public.profiles
SET role = 'super_admin'
WHERE id = auth.uid();
