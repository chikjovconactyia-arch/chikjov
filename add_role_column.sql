-- ==============================================================================
-- SCRIPT DE CORREÇÃO DE SCHEMA (ADICIONAR COLUNA ROLE)
-- Execute este script para corrigir a estrutura da tabela e seus dados
-- ==============================================================================

-- 1. Adicionar a coluna 'role' na tabela profiles se ela não existir
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Garantir que a coluna avatar_url também exista (por precaução)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Sincronizar usuários da autenticação com a tabela de perfis
-- Se o perfil já existir, mantemos os dados, mas garantimos que tenha um role
INSERT INTO public.profiles (id, full_name, role, updated_at)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', email),
    'user',
    NOW()
FROM auth.users
ON CONFLICT (id) DO UPDATE 
SET role = COALESCE(public.profiles.role, 'user');

-- 4. Promover seu usuário a SUPER ADMIN
UPDATE public.profiles
SET role = 'super_admin'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'sinvaldo.p.oliveira@gmail.com');

-- 5. Conferência final
SELECT full_name, role, avatar_url FROM public.profiles;
