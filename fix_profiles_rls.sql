-- ==============================================================================
-- SCRIPT DE CORREÇÃO DE RLS (TABELA PROFILES)
-- Execute este script para permitir que usuários se cadastrem/editem perfis
-- ==============================================================================

-- 1. Habilitar RLS (caso não esteja, mas o erro indica que está)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 3. POLÍTICA: SELECT (Ver o próprio perfil)
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING ( auth.uid() = id );

-- 4. POLÍTICA: UPDATE (Atualizar o próprio perfil)
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING ( auth.uid() = id );

-- 5. POLÍTICA: INSERT (Criar o próprio perfil - CRUCIAL PARA O ERRO)
-- O 'WITH CHECK' garante que o usuário só pode criar um perfil com seu próprio ID
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK ( auth.uid() = id );

-- Configuração adicional: Grant permissions para autenticados
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
