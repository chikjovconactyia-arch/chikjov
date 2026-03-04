# Estágio de Build
FROM node:20-alpine AS build

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

# Copia o build para o diretório de servidor do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expõe a porta 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
