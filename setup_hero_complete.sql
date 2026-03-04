-- =======================================================
-- SETUP COMPLETO DO CARROSSEL HERO (PERMISSIVO)
-- Execute este script no SQL Editor do Supabase para corrigir o erro "Erro ao salvar"
-- =======================================================

-- 1. Criação das Tabelas (se não existirem)
-- =======================================================

-- Tabela de Slides
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    headline TEXT,
    description TEXT,
    button_text TEXT,
    button_link TEXT,
    second_button_text TEXT,
    second_button_link TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Configurações
CREATE TABLE IF NOT EXISTS public.hero_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    speed INT DEFAULT 6000,
    effect TEXT DEFAULT 'slide',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Segurança)
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;


-- 2. Limpeza de Políticas Antigas (Evitar conflitos)
-- =======================================================
DROP POLICY IF EXISTS "Permitir tudo para autenticados em slides" ON public.hero_slides;
DROP POLICY IF EXISTS "Acesso público para leitura de slides" ON public.hero_slides;
DROP POLICY IF EXISTS "Permitir tudo para PUBLICO em slides" ON public.hero_slides; -- Garantir limpeza
DROP POLICY IF EXISTS "Permitir tudo para autenticados em settings" ON public.hero_settings;
DROP POLICY IF EXISTS "Acesso público para leitura de settings" ON public.hero_settings;
DROP POLICY IF EXISTS "Permitir tudo para PUBLICO em settings" ON public.hero_settings; -- Garantir limpeza


-- 3. Criação de Políticas de Segurança (Permissões - MODO DESENVOLVIMENTO)
-- =======================================================

-- SLIDES: Permite QUALQUER UM (incluindo não logado) fazer TUDO (Criar, Editar, Excluir, Ler)
-- Isso resolve o erro 42501 se você estiver desenvolvendo localmente sem login
CREATE POLICY "Permitir tudo para PUBLICO em slides"
ON public.hero_slides
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- SETTINGS: Permite QUALQUER UM (incluindo não logado) fazer TUDO
CREATE POLICY "Permitir tudo para PUBLICO em settings"
ON public.hero_settings
FOR ALL
TO public
USING (true)
WITH CHECK (true);


-- 4. Dados Iniciais (Seed Data)
-- =======================================================

-- Inserir configuração padrão apenas se a tabela estiver vazia
INSERT INTO public.hero_settings (speed, effect)
SELECT 6000, 'slide'
WHERE NOT EXISTS (SELECT 1 FROM public.hero_settings);

-- Inserir slides padrão apenas se a tabela estiver vazia
INSERT INTO public.hero_slides (title, headline, description, button_text, button_link, image_url, sort_order, is_active)
SELECT 'Programas de Indicação', 'Ganhe para usar!', 'Indique amigos e ganhe dinheiro no ChikJov! Participe de um ou mais programas e ganhe recompensas incríveis.', 'Cadastrar-se', '#', 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1920&q=80', 0, true
WHERE NOT EXISTS (SELECT 1 FROM public.hero_slides);

INSERT INTO public.hero_slides (title, headline, description, button_text, button_link, image_url, sort_order, is_active)
SELECT 'Cinema e Lazer', 'Encontre seu filme', 'Compre ingressos com descontos exclusivos. Assista aos melhores lançamentos nas redes parceiras.', 'Ver filmes', '#', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1920&q=80', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.hero_slides WHERE sort_order = 1);
