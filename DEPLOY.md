# Instruções de Deploy - ChikJov (Hostinger)

Este projeto foi preparado para ser hospedado na Hostinger. Siga os passos abaixo para colocar o site no ar:

## 1. Gerar os arquivos de produção
Você deve rodar o comando abaixo no seu terminal local para gerar a pasta `dist`:
```bash
npm run build
```
*(Eu já executei este comando e a pasta `dist` foi criada com sucesso).*

## 2. O que enviar para a Hostinger
Você deve abrir o **Gerenciador de Arquivos** da Hostinger (ou usar um cliente FTP como o FileZilla) e enviar **todo o conteúdo** que está dentro da pasta `dist/` para a pasta `public_html/` da sua hospedagem.

**Arquivos importantes que já incluí para você:**
- `.htaccess`: Localizado na pasta `public/` (e agora na `dist/`), ele garante que as rotas do React (como o dashboard) funcionem corretamente na Hostinger sem dar erro 404 ao atualizar a página.

## 3. Variáveis de Ambiente
Como este é um projeto Vite, as chaves do Supabase são "compiladas" dentro do arquivo JavaScript no momento do build. 
- As chaves atuais já estão configuradas corretamente com base no seu arquivo `.env`.
- Caso você mude de banco de dados, você precisará alterar o `.env` e rodar o `npm run build` novamente antes de subir os arquivos.

## 4. Banco de Dados (Supabase)
O projeto já está conectado ao seu Supabase. Certifique-se de que as permissões (RLS) e as funções SQL que criamos anteriormente no banco de dados estão ativas conforme discutimos nas sessões passadas.

---
**Dica:** Se o site carregar uma página em branco na Hostinger, verifique se todos os arquivos (incluindo a pasta `assets`) foram enviados corretamente para dentro da `public_html`.
