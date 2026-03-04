-- ==============================================================================
-- SCRIPT DE CONFIGURAÇÃO DE STORAGE (BUCKET AVATARS)
-- Execute no SQL Editor do Supabase se o upload não funcionar
-- ==============================================================================

-- 1. Criação do Bucket 'avatars'
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política: Upload de avatar (Apenas Usuários Autenticados)
CREATE POLICY "Avatar Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' );

-- 3. Política: Atualização de avatar (Próprio Usuário) - Opcional, geralmente INSERT com nome único resolve
CREATE POLICY "Avatar Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' );

-- 4. Política: Leitura (Público)
CREATE POLICY "Avatar Public Read"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'avatars' );
