-- ==============================================================================
-- SCRIPT DE CORREÇÃO DE DADOS (POPULAR PERFIS E DEFINIR ADMIN)
-- Execute este script para garantir que seu usuário tenha um perfil e seja Admin
-- ==============================================================================

-- 1. Sincronizar usuários da autenticação (auth.users) com a tabela de perfis (public.profiles)
-- Isso cria o perfil se ele ainda não existir
INSERT INTO public.profiles (id, full_name, role, updated_at)
SELECT 
    id, 
    -- Tenta pegar o nome dos metadados, ou usa um padrão
    COALESCE(raw_user_meta_data->>'full_name', email),
    'user', -- Todo mundo começa como usuário comum
    NOW()
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 2. Promover seu usuário a SUPER ADMIN
-- Substitua o email abaixo se necessário, mas já configurei para o seu
UPDATE public.profiles
SET role = 'super_admin'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'sinvaldo.p.oliveira@gmail.com');

-- 3. Verificação (Opcional - mostra os dados para você conferir)
SELECT full_name, role, avatar_url FROM public.profiles;
