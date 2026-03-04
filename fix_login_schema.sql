-- ==============================================================================
-- SCRIPT DE CORREÇÃO FINALISSIMA: PERMISSÕES E CACHE DO ESQUEMA
-- Resolve: "Erro de banco de dados ao consultar o esquema" (Schema not found/Stale)
-- ==============================================================================

-- 1. Garantir permissões básicas no Schema Public
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Garantir permissões em TODAS as tabelas do Public para usuários autenticados
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Forçar atualização do cache do PostgREST (API do Supabase)
-- Isso é crucial após adicionar colunas como 'created_at'
NOTIFY pgrst, 'reload config';

-- 4. Reafirmar política de leitura (SELECT) na tabela profiles
-- Para garantir que NINGUÉM fique bloqueado de ler seu próprio perfil no login
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING ( auth.uid() = id );

-- 5. Garantir que a coluna created_at existe (redundância de segurança)
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
