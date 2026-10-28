# Hub Editorial Web — ICR Florianópolis
**Plataforma Unificada de Gestão, Planejamento e Pipeline Editorial da Igreja Cristã Reformada (ICR) Florianópolis**

---

## 🏛️ Sobre o Projeto
O **Hub Editorial Web** é a central de comando da comunicação e mídia da **ICR Florianópolis**, integrando:
* **Planejamento & Pautas Litúrgicas:** Pipeline com visualização em Tabela e Kanban.
* **Módulo de Reels & Biblioteca de Conteúdos:** Roteirização completa e arquivamento com métricas.
* **Calendário Editorial & Busca Google:** Grade mensal com consulta direta de feriados municipais em Florianópolis.
* **Escala de Equipe & Voluntários:** Gestão de nomes, funções e datas (cultos fixos semanais de terça e domingo + eventos específicos).
* **Identidade Visual Oficial ICR:** Paleta institucional (`#0D695D`, `#062E31`, `#FAF9F6`, `#C4B270`) com alternador de Modo Noturno / Modo Claro.
* **Banco de Dados em Planilha Excel:** Sincronização direta e bidirecional com `Database Controle Editorial.xlsx`.
* **Segurança Integrada:** Tela de bloqueio com PIN oficial da equipe (`icr2026`) para proteção do ambiente online.

---

## 🚀 Como Rodar Online (Grátis e Seguro)

O sistema foi preparado para rodar **100% online, seguro com SSL/HTTPS e sem custos ($0/mês)**, sem depender do seu computador ligado.

### Opção Recomendada: Deploy no Render.com (3 Minutos)

1. **Crie um repositório no seu GitHub:**
   * Acesse [github.com/new](https://github.com/new) e crie um repositório chamado `hub-editorial-web`.
   * Envie o código do seu computador executando no terminal:
     ```bash
     git remote add origin https://github.com/SEU_USUARIO/hub-editorial-web.git
     git add .
     git commit -m "feat: Hub Editorial Web v1.6"
     git push -u origin main
     ```

2. **Conecte ao Render (100% Gratuito):**
   * Acesse [render.com](https://render.com) e crie uma conta gratuita (com login via GitHub).
   * Clique em **"New +"** no canto superior direito e selecione **"Web Service"**.
   * Escolha o repositório `hub-editorial-web` que você acabou de criar.

3. **Configuração Automática:**
   * O Render detectará automaticamente o arquivo `render.yaml` já incluso no projeto!
   * Caso prefira configurar manualmente:
     * **Name:** `hub-editorial-icr`
     * **Region:** Ohio (ou a mais próxima)
     * **Branch:** `main`
     * **Runtime:** `Node`
     * **Build Command:** `npm run build`
     * **Start Command:** `npm start`
     * **Plan Instance:** `Free` ($0/month)
   * Clique em **"Create Web Service"**.

4. **Pronto! 🎉**
   * Em menos de 2 minutos, o Render fornecerá uma URL pública segura com cadeado verde (ex: `https://hub-editorial-icr.onrender.com`).
   * A aplicação roda 24 horas por dia, 7 dias por semana, acessível pelo computador ou celular de toda a equipe.

---

## 🔒 Segurança e Credenciais
* **Criptografia HTTPS / TLS:** Certificado SSL automático fornecido pelo Render / Let's Encrypt.
* **PIN de Acesso da Equipe:** Ao abrir a página pela primeira vez, o sistema solicita a senha de acesso (padrão: `icr2026`), impedindo alterações não autorizadas. O acesso fica memorizado com segurança no navegador.
* **Variáveis de Ambiente (.env):** As credenciais de API do Instagram e tokens permanecem protegidas no servidor, sem exposição pública.

---

## 💻 Desenvolvimento Local

Para rodar localmente no seu computador:
```bash
# Instalar dependências
npm install

# Modo desenvolvimento (Vite com Hot Reload)
npm run dev

# Servidor de Produção local
npm run build
npm start
```
Acesse: `http://localhost:5173`
