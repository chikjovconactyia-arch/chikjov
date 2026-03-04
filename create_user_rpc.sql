-- ==============================================================================
-- FUNÇÃO RPC PARA CRIAR USUÁRIOS (ADMIN)
-- Permite que administradores criem usuários diretamente pelo Dashboard
-- ==============================================================================

-- 1. Habilitar extensão pgcrypto para criptografar senhas
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Criar a função RPC
CREATE OR REPLACE FUNCTION public.create_user_by_admin(
    email TEXT,
    password TEXT,
    full_name TEXT,
    role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com permissões de Superuser (necessário para auth.users)
SET search_path = public -- Segurança: evita injeção de search_path
AS $$
DECLARE
    new_user_id UUID;
    encrypted_pw TEXT;
BEGIN
    -- 1. Verificar se quem está chamando é ADMIN
    -- (auth.uid() pega o ID do usuário logado que chamou a função)
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    ) THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem criar novos usuários.';
    END IF;

    -- 2. Verificar se email já existe
    IF EXISTS (SELECT 1 FROM auth.users WHERE auth.users.email = create_user_by_admin.email) THEN
        RAISE EXCEPTION 'Este email já está cadastrado.';
    END IF;

    -- 3. Criptografar Senha (Bcrypt padrão do Supabase/GoTrue)
    encrypted_pw := crypt(password, gen_salt('bf'));

    -- 4. Inserir na tabela de autenticação (auth.users)
    INSERT INTO auth.users (
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
        '00000000-0000-0000-0000-000000000000', -- Default instance_id
        gen_random_uuid(), -- Gerar novo UUID
        'authenticated', -- Audience
        'authenticated', -- Role (interno do Auth)
        email,
        encrypted_pw,
        NOW(), -- Email confirmado automaticamente
        NULL,
        NULL,
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object('full_name', full_name), -- Salva nome no metadata
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ) RETURNING id INTO new_user_id;

    -- 5. Inserir na tabela de perfis (public.profiles)
    -- O trigger padrão pode falhar ou demorar, então forçamos a inserção aqui para garantir o Role correto
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (new_user_id, full_name, role)
    ON CONFLICT (id) DO UPDATE
    SET role = EXCLUDED.role, full_name = EXCLUDED.full_name;

    RETURN jsonb_build_object(
        'id', new_user_id,
        'email', email,
        'role', role
    );
END;
$$;

-- 3. Permitir que usuários autenticados chamem a função
-- (A própria função verifica se é admin lá dentro, então o GRANT é safe)
GRANT EXECUTE ON FUNCTION public.create_user_by_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_by_admin TO service_role;
