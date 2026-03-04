-- ==============================================================================
-- SCRIPT DE CORREÇÃO TOTAL (STORAGE + PERFIS)
-- Execute este script no SQL Editor do Supabase para corrigir todos os erros de permissão
-- ==============================================================================

-- PARTE 1: CORREÇÃO DA TABELA PROFILES (RLS)
-- Garante que você possa salvar os dados do seu perfil (foto, nome)

-- 1. Habilitar Segurança (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Limpar políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 3. Criar Políticas de Segurança Corretas
-- SELECT: Ver o próprio perfil
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING ( auth.uid() = id );

-- UPDATE: Atualizar o próprio perfil
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING ( auth.uid() = id );

-- INSERT: Criar o próprio perfil (Essencial para novos usuários ou primeira edição)
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK ( auth.uid() = id );

-- 4. Garantir permissões de acesso à tabela
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;


-- PARTE 2: CORREÇÃO DO STORAGE (UPLOAD DE FOTOS)
-- Garante que o bucket 'avatars' exista e que você possa enviar fotos

-- 1. Garantir que o Bucket 'avatars' existe e é público
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Limpar políticas antigas de storage
DROP POLICY IF EXISTS "Avatar Upload" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Update" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Select Buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Public Select Buckets" ON storage.buckets;

-- 3. Permitir listagem de buckets (Evita erro 'Bucket not found')
CREATE POLICY "Authenticated Select Buckets"
ON storage.buckets FOR SELECT
TO authenticated
USING ( true );

CREATE POLICY "Public Select Buckets"
ON storage.buckets FOR SELECT
TO public
USING ( true );

-- 4. Políticas de Arquivos (Upload, Atualização, Leitura)
CREATE POLICY "Avatar Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' );

CREATE POLICY "Avatar Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' );

CREATE POLICY "Avatar Public Read"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'avatars' );
