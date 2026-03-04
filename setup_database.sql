-- ==========================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS CHIKJOV
-- Tabelas, Relacionamentos e Políticas (RLS)
-- ==========================================

-- 1. EXTENSÕES (Opcional, mas útil)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE PERFIS DE USUÁRIOS
-- Relacionada com a auth.users do Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seu próprio perfil" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. FUNIS DE VENDAS (Funnels)
CREATE TABLE IF NOT EXISTS public.funnels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.funnels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar seus próprios funis" 
ON public.funnels FOR ALL USING (auth.uid() = user_id);

-- 4. COLUNAS DO FUNIL (Columns)
CREATE TABLE IF NOT EXISTS public.funnel_columns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funnel_id UUID REFERENCES public.funnels(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    color TEXT DEFAULT '#8B5CF6',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.funnel_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar colunas de seus funis" 
ON public.funnel_columns FOR ALL USING (
    EXISTS (SELECT 1 FROM public.funnels WHERE id = funnel_id AND user_id = auth.uid())
);

-- 5. CARTÕES/LEADS (Cards)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    column_id UUID REFERENCES public.funnel_columns(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    value TEXT,
    labels TEXT[], -- Array de strings para etiquetas como ['hot', 'cold']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sort_order INT NOT NULL DEFAULT 0
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar leads de suas colunas" 
ON public.leads FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.funnel_columns c
        JOIN public.funnels f ON f.id = c.funnel_id
        WHERE c.id = column_id AND f.user_id = auth.uid()
    )
);

-- 6. CONFIGURAÇÕES DO INDIQUE E GANHE (Refer & Earn)
CREATE TABLE IF NOT EXISTS public.refer_earn_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

ALTER TABLE public.refer_earn_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar sua configuração de indicação" 
ON public.refer_earn_config FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Acesso público para leitura da configuração" 
ON public.refer_earn_config FOR SELECT USING (true);

-- 7. FEATURES DO INDIQUE E GANHE
CREATE TABLE IF NOT EXISTS public.refer_earn_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id UUID REFERENCES public.refer_earn_config(id) ON DELETE CASCADE,
    step TEXT,
    title TEXT,
    content TEXT,
    image_url TEXT,
    sort_order INT DEFAULT 0
);

ALTER TABLE public.refer_earn_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso público para leitura de features" 
ON public.refer_earn_features FOR SELECT USING (true);

-- 8. SLIDES DO HERO (Hero Slides)
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso público para leitura de slides" 
ON public.hero_slides FOR SELECT USING (true);

-- 9. CONFIGURAÇÕES DO CAROUSEL
CREATE TABLE IF NOT EXISTS public.hero_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    speed INT DEFAULT 6000,
    effect TEXT DEFAULT 'slide',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso público para leitura de settings" 
ON public.hero_settings FOR SELECT USING (true);

-- 10. INDEXES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_funnels_user_id ON public.funnels(user_id);
CREATE INDEX IF NOT EXISTS idx_columns_funnel_id ON public.funnel_columns(funnel_id);
CREATE INDEX IF NOT EXISTS idx_leads_column_id ON public.leads(column_id);

-- 11. DADOS INICIAIS (SEED DATA)
-- Inserir configurações padrão se não existirem
INSERT INTO public.hero_settings (speed, effect)
VALUES (6000, 'slide')
ON CONFLICT DO NOTHING;

INSERT INTO public.hero_slides (title, headline, description, button_text, button_link, image_url, sort_order)
VALUES 
('Programas de Indicação', 'Ganhe para usar!', 'Indique amigos e ganhe dinheiro no ChikJov! Participe de um ou mais programas e ganhe recompensas incríveis.', 'Cadastrar-se', '#', 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1920&q=80', 0),
('Cinema e Lazer', 'Encontre seu filme', 'Compre ingressos com descontos exclusivos. Assista aos melhores lançamentos nas redes parceiras.', 'Ver filmes', '#', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1920&q=80', 1)
ON CONFLICT DO NOTHING;

INSERT INTO public.refer_earn_config (badge_text, headline, subheadline, description, highlight_title, highlight_text, cta_button_text, cta_button_link)
VALUES 
('Indique e Ganhe', 'Use, economize e ainda ganhe dinheiro com a ChikJov', 'Aproveite descontos exclusivos, benefícios completos e transforme suas indicações em renda extra todos os meses.', 'A ChikJov é o app ideal para quem quer economizar em serviços de beleza, cuidar da saúde com telemedicina 24h e ainda ganhar dinheiro indicando amigos.', 'Por apenas R$ 39,90 por mês', 'Você pode economizar, usar benefícios exclusivos e ainda gerar renda extra.', 'Quero economizar e ganhar dinheiro', '#')
ON CONFLICT DO NOTHING;
