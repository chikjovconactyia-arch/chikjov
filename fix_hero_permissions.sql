-- =======================================================
-- CORREÇÃO DE PERMISSÕES DO CARROSSEL HERO
-- Execute este script no SQL Editor do Supabase
-- =======================================================

-- 1. Políticas para HERO SLIDES (Permitir edição para autenticados)
DROP POLICY IF EXISTS "Permitir tudo para autenticados em slides" ON public.hero_slides;

CREATE POLICY "Permitir tudo para autenticados em slides"
ON public.hero_slides
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Garantir leitura pública (já existente, mas reforçando)
DROP POLICY IF EXISTS "Acesso público para leitura de slides" ON public.hero_slides;
CREATE POLICY "Acesso público para leitura de slides"
ON public.hero_slides FOR SELECT USING (true);


-- 2. Políticas para HERO SETTINGS (Permitir edição para autenticados)
DROP POLICY IF EXISTS "Permitir tudo para autenticados em settings" ON public.hero_settings;

CREATE POLICY "Permitir tudo para autenticados em settings"
ON public.hero_settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Garantir leitura pública
DROP POLICY IF EXISTS "Acesso público para leitura de settings" ON public.hero_settings;
CREATE POLICY "Acesso público para leitura de settings"
ON public.hero_settings FOR SELECT USING (true);


-- 3. DADOS INICIAIS (Seed Data)
-- Insere apenas se as tabelas estiverem vazias

INSERT INTO public.hero_settings (speed, effect)
SELECT 6000, 'slide'
WHERE NOT EXISTS (SELECT 1 FROM public.hero_settings);

INSERT INTO public.hero_slides (title, headline, description, button_text, button_link, image_url, sort_order, is_active)
SELECT 'Programas de Indicação', 'Ganhe para usar!', 'Indique amigos e ganhe dinheiro no ChikJov! Participe de um ou mais programas e ganhe recompensas incríveis.', 'Cadastrar-se', '#', 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1920&q=80', 0, true
WHERE NOT EXISTS (SELECT 1 FROM public.hero_slides);

INSERT INTO public.hero_slides (title, headline, description, button_text, button_link, image_url, sort_order, is_active)
SELECT 'Cinema e Lazer', 'Encontre seu filme', 'Compre ingressos com descontos exclusivos. Assista aos melhores lançamentos nas redes parceiras.', 'Ver filmes', '#', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1920&q=80', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.hero_slides WHERE sort_order = 1);
