-- ==============================================================================
-- SCRIPT DE CORREÇÃO: VISIBILIDADE DA LISTA DE USUÁRIOS
-- Resolve: Admins não conseguem ver outros usuários na lista
-- ==============================================================================

-- 1. Função Helper para verificar se é Admin (Bypassing RLS)
--    Usamos SECURITY DEFINER para ler a tabela profiles sem ser bloqueado pelas políticas
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'super_admin')
  );
$$;

-- 2. Conceder permissão para executar a função
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO service_role;

-- 3. Atualizar Políticas de Leitura (SELECT)
--    Primeiro removemos a política restritiva anterior
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

--    Criamos uma nova política: 
--    "Ou o usuário é dono do perfil, OU o usuário é um Administrador"
CREATE POLICY "Visibility: Own Profile or Admin View"
ON public.profiles FOR SELECT
USING ( 
    auth.uid() = id 
    OR 
    public.is_admin() 
);

-- 4. Recarregar Configurações (Garante que a API note a mudança)
NOTIFY pgrst, 'reload config';
