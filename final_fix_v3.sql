-- ==============================================================================
-- SCRIPT DE CORREÇÃO DEFINITIVA (V3): LOGIN E GESTÃO DE USUÁRIOS
-- Resolve: "Database error querying schema" e "Function not found"
-- ==============================================================================

-- 1. LIMPEZA PROFUNDA (Remover funções e políticas antigas para evitar conflitos)
DROP FUNCTION IF EXISTS public.create_user_by_admin(TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_user_by_admin(jsonb);
DROP FUNCTION IF EXISTS public.get_all_profiles_secure();

-- Remover políticas RLS antigas (todas as variações possíveis)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Visibility: Own Profile or Admin View" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- 2. GARANTIR EXTENSÕES E COLUNAS
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

-- 3. PERMISSÕES DE SCHEMA (Crucial para Login)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
-- Importante: Acesso ao schema de extensões para criptografia
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- 4. RECRIAR FUNÇÃO DE CRIAÇÃO DO USUÁRIO (RPC)
CREATE OR REPLACE FUNCTION public.create_user_by_admin(
    email_input TEXT,
    password_input TEXT,
    full_name_input TEXT,
    role_input TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions -- Garante acesso a pgcrypto e tabelas públicas
AS $$
DECLARE
    new_user_id UUID;
    encrypted_pw TEXT;
BEGIN
    -- Validação: Apenas Admin/Super Admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    ) THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem criar novos usuários.';
    END IF;

    -- Validação: Email duplicado
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = email_input) THEN
        RAISE EXCEPTION 'Este email já está cadastrado.';
    END IF;

    -- Criptografia
    encrypted_pw := crypt(password_input, gen_salt('bf'::text));

    -- Inserir Usuário (Auth)
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

    -- Inserir Perfil (Public)
    INSERT INTO public.profiles (id, full_name, role, created_at)
    VALUES (new_user_id, full_name_input, role_input, NOW())
    ON CONFLICT (id) DO UPDATE
    SET role = EXCLUDED.role, full_name = EXCLUDED.full_name;

    RETURN jsonb_build_object('id', new_user_id, 'email', email_input, 'role', role_input);
END;
$$;

-- 5. RECRIAR FUNÇÃO DE LISTAGEM SEGURA (RPC)
CREATE OR REPLACE FUNCTION public.get_all_profiles_secure()
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    ) THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem ver a lista completa.';
    END IF;
    RETURN QUERY SELECT * FROM public.profiles ORDER BY created_at DESC;
END;
$$;

-- 6. POLÍTICAS RLS (Apenas O Básico Seguro)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING ( auth.uid() = id );

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING ( auth.uid() = id );

-- 7. CORREÇÃO ESPECIAL: RESETAR SENHA DA FERNANDA (Se ela existir)
-- Isso garante que, se ela foi criada incorretamente antes, agora consiga logar com '123456' para teste
UPDATE auth.users
SET encrypted_password = crypt('123456', gen_salt('bf'::text))
WHERE email = 'm.cfer03@gmail.com';

-- 8. APLICAR E ATUALIZAR CACHE
GRANT EXECUTE ON FUNCTION public.create_user_by_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_by_admin TO service_role;
GRANT EXECUTE ON FUNCTION public.get_all_profiles_secure TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_profiles_secure TO service_role;

NOTIFY pgrst, 'reload config';
