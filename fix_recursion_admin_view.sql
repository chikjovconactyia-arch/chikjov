-- ==============================================================================
-- SCRIPT DE CORREÇÃO DE EMERGÊNCIA: REMOVER RECURSÃO E CRIAR RPC DE ADMIN
-- ==============================================================================

-- 1. REMOVER A POLÍTICA RECURSIVA QUE ESTÁ BLOQUEANDO O LOGIN
DROP POLICY IF EXISTS "Visibility: Own Profile or Admin View" ON public.profiles;

-- 2. RESTAURAR A POLÍTICA PADRÃO (CADA UM VÊ O SEU)
-- Isso libera o acesso da Fernanda e de outros usuários imediatamente
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING ( auth.uid() = id );

-- 3. CRIAR FUNÇÃO SEGURA PARA LISTAR TODOS OS PERFIS (APENAS PARA ADMINS)
-- Em vez de abrir a tabela via RLS, usamos essa "porta dos fundos" segura
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

-- 4. CONCEDER PERMISSÃO
GRANT EXECUTE ON FUNCTION public.get_all_profiles_secure TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_profiles_secure TO service_role;

-- 5. ATUALIZAR CACHE
NOTIFY pgrst, 'reload config';
