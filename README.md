# PWA NFC Fluxo

App em React que vira PWA: escolher pessoa, operação (Pegar/Entregar), fluxo e ler NFC; tudo é salvo em banco SQLite no backend.

## O que o app faz

1. **Pessoa** – Campo de texto para nome (ou lista).
2. **Operação** – Pegar ou Entregar.
3. **Fluxo** – Um dos fluxos:
   - Produção para Central  
   - Decoração para Central  
   - Central para Armazém  
   - Produção para Decoração  
   - Armazém para Estoque  
   - Estoque para Armazém  
   - Armazém para Central  
   - Central para Decoração  
4. **NFC** – Botão “Ativar e ler NFC”: ao tocar, o app usa a Web NFC API; você encosta o celular na tag e o valor lido é exibido e salvo no registro.
5. **Salvar** – Envia pessoa, operação, fluxo, NFC (se leu) e data/hora para o backend, que grava no SQLite.
6. **Histórico** – Aba que lista os últimos registros salvos.
7. **Dashboard** – Aba com visualizações: totais, por operação, por fluxo, por pessoa, NFC e por dia.

### Popular com 20 registros de teste

Com o servidor já tendo rodado ao menos uma vez (para criar o banco):

```bash
cd server
npm run seed
```

## Pré-requisitos

- Node.js 18+
- Chrome no **Android** para NFC (Web NFC não funciona no desktop)

## Como rodar

### 1. Instalar dependências

Na raiz do projeto:

```bash
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

### 2. Subir backend e frontend

**Opção A – Tudo de uma vez (se tiver `concurrently`):**

```bash
npm run dev
```

**Opção B – Em dois terminais:**

Terminal 1 (servidor API + banco):

```bash
cd server
npm run dev
```

Terminal 2 (React PWA):

```bash
cd client
npm run dev
```

- Frontend: `http://localhost:5173`  
- API: `http://localhost:3001`  
O Vite está configurado para fazer proxy de `/api` para o servidor.

### 3. Testar NFC (Android)

- Use **HTTPS** ou **localhost** (ex.: acessar pelo IP da máquina na rede com HTTPS ou um túnel como ngrok).
- Abra o app no **Chrome para Android** e toque em “Ativar e ler NFC”; aproxime o celular da tag.

### 4. Build para produção / PWA

```bash
cd client
npm run build
```

Os arquivos do PWA ficam em `client/dist`. Para servir:

```bash
cd client && npm run preview
```

Ou sirva a pasta `client/dist` com qualquer servidor (e configure o backend na mesma origem ou CORS).

## Estrutura

- `client/` – React + Vite + PWA (manifest + service worker via `vite-plugin-pwa`).
- `server/` – Express + SQLite; rotas `GET/POST /api/registros`.
- Banco: `server/nfc_fluxo.db` (criado automaticamente).

## Ícones do PWA

Se quiser ícones próprios, coloque em `client/public/`:

- `icon-192.png` (192×192)
- `icon-512.png` (512×512)

O `vite.config.js` já referencia esses nomes no manifest.
