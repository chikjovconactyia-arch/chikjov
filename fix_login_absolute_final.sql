-- ==============================================================================
-- SCRIPT DE DEBUGGING AVANÇADO (ABSOLUTE FINAL)
-- Se este script falhar, há um problema maior de conexão/infraestrutura.
-- ==============================================================================

-- 1. CONFIGURAR O AMBIENTE (Crucial: Define onde buscar as funções)
SET search_path TO public, extensions;

-- 2. GARANTIR EXTENSÕES
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- 3. REMOVER RLS TEMPORARIAMENTE (Para isolar o problema)
-- Se o login funcionar agora, sabemos que era uma regra de segurança bloqueando.
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 4. GARANTIR PERMISSÕES GERAIS E IRRESTRITAS (Para Debug)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO anon, authenticated, service_role;

-- 5. RECRIAR FUNÇÕES RPC COM CAMINHOS EXPLÍCITOS (Sem ambiguidade)
CREATE OR REPLACE FUNCTION public.create_user_by_admin(
    email_input TEXT,
    password_input TEXT,
    full_name_input TEXT,
    role_input TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    new_user_id UUID;
    encrypted_pw TEXT;
BEGIN
    -- Validação Admin (Simplificada para Debug: Qualquer um consegue se não tiver RLS, mas mantemos check lógico)
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    ) THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem criar novos usuários.';
    END IF;

    IF EXISTS (SELECT 1 FROM auth.users WHERE email = email_input) THEN
        RAISE EXCEPTION 'Este email já está cadastrado.';
    END IF;

    -- Uso explícito de extensions.crypt e extensions.gen_salt
    encrypted_pw := extensions.crypt(password_input, extensions.gen_salt('bf'));

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

    INSERT INTO public.profiles (id, full_name, role, created_at)
    VALUES (new_user_id, full_name_input, role_input, NOW())
    ON CONFLICT (id) DO UPDATE
    SET role = EXCLUDED.role, full_name = EXCLUDED.full_name;

    RETURN jsonb_build_object('id', new_user_id, 'email', email_input, 'role', role_input);
END;
$$;

-- Recriar get_all_profiles_secure
CREATE OR REPLACE FUNCTION public.get_all_profiles_secure()
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    -- Permitir acesso livre para debug se for admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    ) THEN
        RAISE EXCEPTION 'Acesso negado.';
    END IF;
    RETURN QUERY SELECT * FROM public.profiles ORDER BY created_at DESC;
END;
$$;

-- 6. RESETAR SENHA DA FERNANDA (Usando caminhos explícitos)
UPDATE auth.users
SET encrypted_password = extensions.crypt('123456', extensions.gen_salt('bf'))
WHERE email = 'm.cfer03@gmail.com';

-- 7. RECARREGAR CONFIGURAÇÃO
NOTIFY pgrst, 'reload config';
