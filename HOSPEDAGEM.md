# Como hospedar o eLoger NFC e instalar no celular

O app precisa de **HTTPS** para funcionar como PWA e para a leitura NFC no Android.

---

## 1. Preparar o projeto para produção

Na raiz do projeto:

```bash
npm run build:deploy
```

Isso gera o build do frontend e copia para `server/public`. O servidor passa a servir o site e a API juntos.

---

## 2. Opções de hospedagem

### Opção: Vercel (front + API na mesma URL)

O projeto está pronto para rodar **tudo na Vercel**: o site (PWA) e a API em um único domínio. O banco é o **Turso** (SQLite na nuvem, free tier).

**Passo 1 – Criar o banco Turso**

1. Acesse [turso.tech](https://turso.tech) e crie uma conta.
2. Instale o CLI: `curl -sSfL https://get.tur.so/install.sh | bash` (ou veja a doc no site).
3. Crie um banco: `turso db create eloger-nfc --region sao`.
4. Pegue a URL e o token:
   - `turso db show eloger-nfc --url`
   - `turso db tokens create eloger-nfc`

**Passo 2 – Deploy na Vercel**

1. Acesse [vercel.com](https://vercel.com), faça login e **Add New** → **Project**.
2. Importe o repositório do GitHub (ex.: **PedroVazN/Efix**).
3. Deixe **Build Command** e **Output Directory** como no projeto (já configurados no `vercel.json`).
4. Em **Settings** → **Environment Variables** adicione:
   - `TURSO_DATABASE_URL` = a URL do passo 1 (ex.: `libsql://eloger-nfc-seu-user.turso.io`)
   - `TURSO_AUTH_TOKEN` = o token gerado no passo 1
5. Faça o **Deploy**. A Vercel vai gerar uma URL tipo `https://efix-xxx.vercel.app`.

**Passo 3 – Usar no celular**

Abra essa URL no Chrome (Android) e use **Instalar app** / **Adicionar à tela inicial**. O PWA e a API usam a mesma origem, então não é preciso configurar `VITE_API_URL`.

**Injetar os 20 registros de teste:** depois do deploy, faça um POST para `https://sua-url.vercel.app/api/seed` (por exemplo com Postman ou `curl -X POST https://sua-url.vercel.app/api/seed`).

---

### Opção A: Railway (recomendado – mais simples)

1. Crie uma conta em [railway.app](https://railway.app).
2. **New Project** → **Deploy from GitHub repo** e conecte o repositório do projeto.
3. **Configuração do serviço:**
   - **Root Directory:** deixe em branco (raiz do repositório).
   - **Build Command:** `npm install && cd client && npm install && npm run build && cd .. && node -e "require('fs').cpSync('client/dist','server/public',{recursive:true})" && cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Variáveis:** não é obrigatório; a porta vem de `process.env.PORT`.
4. Railway gera uma URL tipo `https://seu-app.up.railway.app`. Use essa URL no celular.

**Alternativa (deploy manual):** Rode `npm run build:deploy` no seu PC, depois suba só a pasta **server** (com a pasta `public` dentro) para o Railway, com **Root Directory** = `server`, **Build** em branco e **Start** = `npm start`.

---

### Opção B: Render

1. Conta em [render.com](https://render.com).
2. **New** → **Web Service**.
3. Conecte o repositório.
4. **Configuração:**
   - **Root Directory:** (vazio se a raiz for o projeto).
   - **Build Command:**  
     `npm install && cd client && npm install && npm run build && cd ../server && npm install`  
     Depois copie `client/dist` para `server/public` (pode usar no build: `node -e "require('fs').cpSync('client/dist','server/public',{recursive:true})"`).
   - **Start Command:** `cd server && node server.js`
   - **Instance Type:** Free (o serviço “dorme” após 15 min de inatividade; ao abrir de novo, pode demorar ~30 s).
5. Render gera uma URL `https://seu-app.onrender.com`. Use no celular.

---

### Opção C: VPS (ex.: DigitalOcean, Contabo, etc.)

1. No seu PC, depois de rodar `npm run build:deploy`, envie a pasta **server** (com a pasta `public` dentro) para o servidor (por exemplo com SCP, SFTP ou Git).
2. No servidor: `cd server && npm install --production && npm start`. Use **PM2** ou **systemd** para manter o processo rodando e um proxy reverso (Nginx/Caddy) com HTTPS (Let’s Encrypt).
3. Aponte seu domínio (ou IP com certificado) para esse servidor. A URL final (ex.: `https://eloger.seudominio.com`) é a que você usa no celular.

---

## 3. Variável de ambiente (se front e back estiverem separados)

Se você hospedar o **frontend** em um lugar (ex.: Vercel/Netlify) e o **backend** em outro:

1. No build do frontend, defina a URL da API, por exemplo:  
   `VITE_API_URL=https://sua-api.railway.app/api`
2. No backend, configure **CORS** para aceitar a origem do frontend (no código já existe `cors()`; em produção você pode restringir com `origin: 'https://seu-front.vercel.app'`).

Quando o **front e o back estão no mesmo domínio** (servidor servindo a pasta `public` + API), **não** é preciso definir `VITE_API_URL`; o app usa `/api` na mesma origem.

---

## 4. Instalar no celular (PWA)

1. No **celular Android**, abra o **Chrome** e acesse a URL do app em **HTTPS** (ex.: `https://seu-app.up.railway.app`).
2. Toque no menu (três pontinhos) → **“Instalar app”** ou **“Adicionar à tela inicial”**.
3. Confirme. O ícone do **eLoger NFC** aparecerá na tela inicial; ao abrir, o app roda em tela cheia como app.
4. **NFC:** a leitura de NFC só funciona no **Chrome no Android**, na mesma URL HTTPS do app instalado.

---

## 5. Resumo rápido (Railway)

1. `npm run build:deploy` na raiz.
2. Subir só a pasta **server** (com `public` dentro) para o Railway, com **Start** = `npm start`.
3. Usar a URL HTTPS que o Railway fornece.
4. No celular: abrir essa URL no Chrome → Menu → Instalar app.

Depois disso você consegue “baixar” o app no celular instalando o PWA pela URL.
