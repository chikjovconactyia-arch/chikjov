-- ==============================================================================
-- SCRIPT DE LIMPEZA E SEGURANÇA: REMOVER USUÁRIO CORROMPIDO
-- ==============================================================================

-- 1. Remover o usuário "m.cfer03@gmail.com" do sistema de autenticação
--    Isso automaticamente remove o perfil dele da tabela public.profiles (CASCADE)
DELETE FROM auth.users 
WHERE email = 'm.cfer03@gmail.com';

-- 2. Garantir permissões globais para evitar erro de schema
--    (Incluindo permissões para o sistema de Auth funcionar corretamente)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
-- Importante: Garantir acesso à extensão pgcrypto para todos
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- 3. Recarregar configuração do banco de dados (Cache Schema)
NOTIFY pgrst, 'reload config';
