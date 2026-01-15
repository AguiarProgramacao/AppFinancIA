# FinancIA Backend

Backend em Node.js/TypeScript para um sistema de controle financeiro pessoal, com autenticacao, gestao de transacoes, categorias, objetivos, dashboards, exportacoes e notificacoes.

## Visao geral do sistema
API REST que atende um cliente (ex.: app mobile) para registro e gerenciamento de dados financeiros pessoais. O foco esta em usuarios finais que precisam organizar receitas, despesas e metas, com recursos de seguranca, insights e exportacao de dados.

## Tecnologias utilizadas
- Linguagem: TypeScript (Node.js)
- Framework HTTP: Express
- ORM/DB: Prisma + PostgreSQL (pg + @prisma/adapter-pg)
- Autenticacao: JWT
- Criptografia: bcryptjs
- Emails: nodemailer (SMTP)
- Relatorios: PDFKit
- Datas: date-fns
- Push: Expo Push API (fetch)
- IA (opcional): Gemini API

## Funcionalidades
- Cadastro, login e logout com JWT
- Autenticacao em duas etapas (2FA) via email
- Recuperacao de senha via token temporario
- Controle de sessoes (listar e revogar)
- CRUD de transacoes financeiras
- CRUD de categorias por usuario
- CRUD de objetivos e aportes
- Dashboard com resumo financeiro e insights
- Grafico de despesas por categoria
- Perfil do usuario (nome, remuneracao, foto)
- Preferencias de notificacao e registro de push token
- Exportacao de dados em JSON, CSV e PDF
- Agendamentos internos para insights e notificacoes de inatividade

## Fluxo principal da aplicacao
1. Usuario se registra e faz login.
2. API cria sessao e emite JWT.
3. Cliente consome endpoints protegidos para transacoes, categorias e objetivos.
4. Dashboard consolida receitas, despesas, saldo e insights.
5. Agendadores geram insights e notificam inatividade.
6. Usuario pode exportar dados em JSON/CSV/PDF.

## Arquitetura / estrutura do projeto
- `src/server.ts`: bootstrap do servidor Express e registro de rotas
- `src/routes`: definicao de endpoints REST
- `src/controllers`: camada HTTP (validacoes simples e resposta)
- `src/services`: regras de negocio e acesso a dados
- `src/prisma`: client Prisma com adapter pg
- `src/middlewares`: autenticacao JWT e validacao de sessao
- `src/utils`: emails, push, 2FA e tratamento de erros
- `src/jobs`: agendadores (insights e inatividade)
- `prisma/schema.prisma`: modelos do banco
- `prisma/migrations`: historico de migrations
- `dist`: build do TypeScript

## Como rodar o projeto localmente
1. Instale dependencias:
   ```bash
   npm install
   ```
2. Configure as variaveis de ambiente (veja a secao abaixo).
3. Aplique as migrations do Prisma (pasta `prisma/migrations`):
   ```bash
   npx prisma migrate deploy
   ```
4. Inicie em desenvolvimento:
   ```bash
   npm run dev
   ```
5. Build e execucao em producao:
   ```bash
   npm run build
   npm start
   ```

## Variaveis de ambiente
Obrigatorias:
- `DATABASE_URL`
- `JWT_SECRET`

Opcionais (habilitam recursos especificos):
- `PORT` (default 3333)
- `GEMINI_API_KEY` (insights com IA; sem isso usa fallback local)
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

## Decisoes tecnicas relevantes
- Prisma com adapter `pg` para conexao direta via pool do PostgreSQL.
- JWT carrega `userId` e `sessionId`; sessoes sao persistidas e revogaveis.
- 2FA e reset de senha usam tokens com hash e expiracao.
- Exportacao inclui JSON, CSV e PDF gerados no servidor.
- Insights podem vir do Gemini; fallback local garante funcionamento sem IA.
- Agendadores rodam no mesmo processo via `setInterval`.

## Pontos fortes tecnicos
- Separacao clara entre rotas, controllers e services.
- Modelo de seguranca com JWT + sessao revogavel + 2FA.
- Exportacao de dados em multiplos formatos.
- Notificacoes push e email com preferencia por usuario.
- Agendamentos internos para rotina de insights e engajamento.

## Possiveis melhorias futuras
- Validacao de entrada com schema (ex.: zod) e padronizacao de DTOs.
- Rate limiting e protecao contra brute force.
- Observabilidade (logs estruturados, tracing e metrics).
- Job queue externa (ex.: Bull/Redis) para notificacoes e insights.
- Testes automatizados (unitarios e integracao).

## Autor
Aguiar Programacao | programacaoaguiar@gmail.com  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Perfil-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/dev-rafael-aguiar/)
[![Instagram](https://img.shields.io/badge/Instagram-Perfil-E4405F?logo=instagram&logoColor=white)](https://instagram.com/aguiar.programador)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Contato-25D366?logo=whatsapp&logoColor=white)](https://wa.me/5521974633634)