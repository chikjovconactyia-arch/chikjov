-- ==============================================================================
-- SCRIPT DE RECRIAR TABELA PROFILES (SERIA AUSENTE)
-- Execute este script para restaurar a tabela essential para o sistema
-- ==============================================================================

-- 1. Criar a tabela se não existir
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Limpar políticas antigas (caso resquícios existam)
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 4. Criar Políticas de Segurança (RLS)

-- SELECT: Usuário vê seu próprio perfil
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING ( auth.uid() = id );

-- UPDATE: Usuário edita seu próprio perfil
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING ( auth.uid() = id );

-- INSERT: Usuário pode criar seu perfil (Upsert precisa disso)
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK ( auth.uid() = id );

-- 5. Conceder Permissões
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 6. AUTO-REPARO: Criar perfil para o usuário atual (e outros) se não existir
-- Isso pega todos os usuarios da auth.users e insere na profiles se faltar
INSERT INTO public.profiles (id, full_name, role)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', 'Usuário'),
    'user' -- Papel padrão
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 7. Garantir que o admin seja super_admin (opcional, mas bom pra garantir)
UPDATE public.profiles
SET role = 'super_admin'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'sinvaldo.p.oliveira@gmail.com');
