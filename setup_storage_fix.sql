-- ==============================================================================
-- SCRIPT CORRIGIDO DE STORAGE (BUCKET AVATARS)
-- Execute no SQL Editor do Supabase para corrigir o erro "Balde não encontrado"
-- ==============================================================================

-- 1. Garantir que o Bucket 'avatars' existe e é público
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Remover políticas antigas para evitar duplicidade/conflito
DROP POLICY IF EXISTS "Avatar Upload" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Update" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Select Buckets" ON storage.buckets;

-- 3. POLÍTICA: Permitir que usuários vejam os buckets (Crucial para evitar 'Bucket not found')
CREATE POLICY "Authenticated Select Buckets"
ON storage.buckets FOR SELECT
TO authenticated
USING ( true );

CREATE POLICY "Public Select Buckets"
ON storage.buckets FOR SELECT
TO public
USING ( true ); -- Ou ( public = true )

-- 4. POLÍTICAS DE OBJETOS (Arquivos)

-- 4.1 Upload (INSERT): Usuários autenticados podem fazer upload para 'avatars'
CREATE POLICY "Avatar Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' );

-- 4.2 Atualização (UPDATE): Usuários autenticados podem atualizar seus arquivos em 'avatars'
CREATE POLICY "Avatar Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' );

-- 4.3 Leitura (SELECT): Qualquer pessoa pode ver os arquivos (Avatar Público)
CREATE POLICY "Avatar Public Read"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'avatars' );

-- 4.4 Deleção (DELETE): Usuários podem deletar seus próprios arquivos (Opcional, mas útil)
CREATE POLICY "Avatar Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'avatars' AND auth.uid() = owner );
