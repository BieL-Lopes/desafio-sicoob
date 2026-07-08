# Outros Créditos/Débitos

Aplicação Angular para o desafio prático de modernização de telas Flex para Angular no módulo contábil de Outros Créditos/Débitos, agora com backend simples em FastAPI e SQLite.

## Stack

- Angular 17.3
- TypeScript
- Standalone Components
- Reactive Forms
- FastAPI
- SQLite
- Jasmine/Karma para testes do frontend
- Pytest para testes do backend
- CSS/SCSS próprio com tokens globais de design

## Credenciais

- Usuário: `admin`
- Senha: `admin`

## Backend

Instale as dependências Python:

```bash
npm run python -- -m pip install -r backend/requirements.txt
```

Execute a API:

```bash
npm run start:backend
```

A API ficará disponível em `http://127.0.0.1:8000`.

Endpoints principais:

- `GET /health`
- `POST /auth/login`
- `GET /lotes`
- `GET /contas-correntes/{numero}`
- `POST /lotes/{id_lote}/lancamentos`

O SQLite é criado automaticamente em `backend/data/outros_creditos.db` com dados iniciais equivalentes aos mocks originais.

## Frontend

Em outro terminal:

```bash
npm install
npm start
```

A aplicação ficará disponível em `http://localhost:4200/`.

## Testes

Frontend:

```bash
npm test -- --watch=false --browsers=ChromeHeadlessNoSandbox
```

Backend:

```bash
npm run test:backend
```

## Build

```bash
npm run build
```

## Funcionalidades Implementadas

- Página de login com validação reativa.
- Tela de consulta de lotes com breadcrumb, painel de filtros recolhível e tabela paginada.
- Filtros reativos por instituição, situação, faixa de lote, faixa de valor e faixa de data.
- Serviço Angular consumindo API FastAPI via `HttpClient`.
- Backend FastAPI com SQLite, seed inicial e CORS para o Angular.
- Seleção individual e selecionar todos.
- Habilitação de ações dependente da seleção: alterar, excluir e visualizar exigem exatamente um lote selecionado.
- Modal de inclusão de lançamento com formulário reativo.
- Busca de conta corrente no backend.
- Validações obrigatórias e validador customizado para valor monetário maior que zero.
- Inclusão de lançamento persistida no SQLite, atualizando valor e quantidade do lote.
- Formatação pt-BR para números e datas.
- Debounce na pesquisa.

## Decisões Técnicas

Usei FastAPI com `sqlite3` da biblioteca padrão para manter o backend pequeno, local e fácil de executar. O frontend mantém os componentes originais de filtros, tabela e modal, mas agora consome endpoints HTTP em vez de mocks em memória.
