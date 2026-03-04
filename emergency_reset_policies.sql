-- ==============================================================================
-- SCRIPT DE EMERGÊNCIA V2: RESET TOTAL DE RLS E PERMISSÕES
-- Resolve "Database error querying schema" e "Policy already exists"
-- ==============================================================================

-- 1. DESTRAVAR O SCHEMA PUBLIC (Permissões básicas)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 2. REMOVER TODAS AS POLÍTICAS DE SEGURANÇA DA TABELA PROFILES (Limpeza Total)
-- (Incluindo as que deram erro na última tentativa)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Visibility: Own Profile or Admin View" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

-- 3. RECRIAR APENAS AS POLÍTICAS SEGURAS E ESSENCIAIS
-- Política 1: Usuário vê seu próprio perfil (Fim da recursão)
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING ( auth.uid() = id );

-- Política 2: Usuário pode atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING ( auth.uid() = id );

-- Política 3: Usuário pode inserir seu próprio perfil (Auto-cadastro/Trigger)
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK ( auth.uid() = id );

-- 4. HABILITAR RLS NOVAMENTE (Segurança ativa)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. GARANTIR QUE A FUNÇÃO RPC DE LISTAGEM ADMIN EXISTA E SEJA ACESSÍVEL
-- (Isso garante que o painel de admin funcione mesmo sem RLS permissivo)
CREATE OR REPLACE FUNCTION public.get_all_profiles_secure()
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    -- Verificar se é Admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    ) THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem ver a lista completa.';
    END IF;

    -- Retornar todos os perfis ordenados
    RETURN QUERY SELECT * FROM public.profiles ORDER BY created_at DESC;
END;
$$;

-- 6. CONCEDER PERMISSÃO DE EXECUÇÃO NA FUNÇÃO
GRANT EXECUTE ON FUNCTION public.get_all_profiles_secure TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_profiles_secure TO service_role;

-- 7. FORÇAR APLICAÇÃO DAS MUDANÇAS (Notificar API)
NOTIFY pgrst, 'reload config';
