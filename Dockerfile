# Estágio de Build
FROM node:20-alpine AS build

# Declara as variáveis que o Vite precisa em tempo de build (Build Args)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Passa esses ARGs para o ambiente interno do build (Vite lê de ENV)
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o resto dos arquivos
COPY . .

# Faz o build da aplicação (gera a pasta dist/)
RUN npm run build

# Estágio de Produção (Nginx para servir os arquivos estáticos)
FROM nginx:stable-alpine

# Copia o arquivo de configuração do Nginx (para evitar erro 404 em rotas do React)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o build para o diretório de servidor do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expõe a porta 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
