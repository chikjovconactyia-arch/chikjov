-- =======================================================
-- SETUP COMPLETO DO INDIQUE E GANHE (PERMISSIVO)
-- Execute este script no SQL Editor do Supabase para corrigir a exibição na Landing Page
-- =======================================================

-- 1. Criação das Tabelas (se não existirem)
-- =======================================================

-- Configurações Gerais da Seção
CREATE TABLE IF NOT EXISTS public.refer_earn_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Opcional neste modo permissivo
    badge_text TEXT DEFAULT 'Indique e Ganhe',
    headline TEXT,
    subheadline TEXT,
    description TEXT,
    highlight_title TEXT,
    highlight_text TEXT,
    cta_button_text TEXT,
    cta_button_link TEXT,
    secondary_button_text TEXT,
    secondary_button_link TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Features (Slides/Passos)
CREATE TABLE IF NOT EXISTS public.refer_earn_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID REFERENCES public.refer_earn_config(id) ON DELETE CASCADE,
    step TEXT,
    title TEXT,
    content TEXT,
    image_url TEXT,
    sort_order INT DEFAULT 0
);

-- Habilitar RLS (Segurança)
ALTER TABLE public.refer_earn_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refer_earn_features ENABLE ROW LEVEL SECURITY;


-- 2. Limpeza de Políticas Antigas
-- =======================================================
DROP POLICY IF EXISTS "Usuários podem gerenciar sua configuração de indicação" ON public.refer_earn_config;
DROP POLICY IF EXISTS "Acesso público para leitura da configuração" ON public.refer_earn_config;
DROP POLICY IF EXISTS "Permitir tudo para PUBLICO em config" ON public.refer_earn_config;

DROP POLICY IF EXISTS "Acesso público para leitura de features" ON public.refer_earn_features;
DROP POLICY IF EXISTS "Permitir tudo para PUBLICO em features" ON public.refer_earn_features;


-- 3. Criação de Políticas de Segurança (Permissões - MODO DESENVOLVIMENTO)
-- =======================================================

-- CONFIG: Permite QUALQUER UM (incluindo não logado) fazer TUDO (Ler, Editar)
-- Necessário para o Admin salvar (se estiver sem login persistente) e para a Landing Page ler
CREATE POLICY "Permitir tudo para PUBLICO em config"
ON public.refer_earn_config
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- FEATURES: Permite QUALQUER UM (incluindo não logado) fazer TUDO
CREATE POLICY "Permitir tudo para PUBLICO em features"
ON public.refer_earn_features
FOR ALL
TO public
USING (true)
WITH CHECK (true);


-- 4. Dados Iniciais (Seed Data)
-- =======================================================

-- Inserir configuração padrão se não existir
INSERT INTO public.refer_earn_config (badge_text, headline, subheadline, description, highlight_title, highlight_text, cta_button_text, cta_button_link)
SELECT 
    'Indique e Ganhe', 
    'Use, economize e ainda ganhe dinheiro com a ChikJov', 
    'Aproveite descontos exclusivos, benefícios completos e transforme suas indicações em renda extra todos os meses.', 
    'A ChikJov é o app ideal para quem quer economizar em serviços de beleza, cuidar da saúde com telemedicina 24h e ainda ganhar dinheiro indicando amigos.', 
    'Por apenas R$ 39,90 por mês', 
    'Você pode economizar, usar benefícios exclusivos e ainda gerar renda extra.', 
    'Quero economizar e ganhar dinheiro', 
    '#'
WHERE NOT EXISTS (SELECT 1 FROM public.refer_earn_config);
