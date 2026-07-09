# Outros Créditos/Débitos

Aplicação desenvolvida para o desafio prático de modernização da tela de Outros Créditos/Débitos do módulo contábil. O projeto usa Angular no frontend e uma API simples em FastAPI com SQLite para simular a persistência dos dados.

## Stack

- Angular 17.3 com standalone components
- TypeScript
- Reactive Forms
- RxJS
- SCSS com variáveis globais de design
- FastAPI
- SQLite
- Jasmine/Karma para testes do frontend
- Pytest para testes do backend

## Credenciais

Use as credenciais abaixo para acessar a aplicação:

```text
Usuário: admin
Senha: admin
```

## Requisitos

- Node.js e npm
- Python disponível pelo runtime configurado no projeto
- Google Chrome ou Chromium para os testes em `ChromeHeadlessNoSandbox`

## Instalação

Instale as dependências do frontend:

```bash
npm install
```

Instale as dependências do backend:

```bash
npm run python -- -m pip install -r backend/requirements.txt
```

## Executando o Backend

Inicie a API FastAPI:

```bash
npm run start:backend
```

A API ficará disponível em:

```text
http://127.0.0.1:8000
```

O banco SQLite é criado automaticamente em:

```text
backend/data/outros_creditos.db
```

## Executando o Frontend

Em outro terminal, inicie o Angular:

```bash
npm start
```

A aplicação ficará disponível em:

```text
http://localhost:4200/
```

## Endpoints

- `GET /health`
- `POST /auth/login`
- `GET /lotes`
- `GET /contas-correntes/{numero}`
- `POST /lotes/{id_lote}/lancamentos`

## Funcionalidades

- Login com formulário reativo e armazenamento de sessão em `localStorage`.
- Tela principal com título, breadcrumb e menu lateral responsivo.
- Botão de logout com ícone.
- Painel de filtros recolhível com animação.
- Filtros por instituição responsável, instituição, situação do lote, faixa de ID, faixa de valor e faixa de data.
- Pesquisa com `debounceTime`.
- Tabela de lotes com seleção individual e selecionar todos.
- Paginação com primeira, anterior, página atual, próxima e última.
- Ações de lote: Confirmar, Enviar, Visualizar Justificativa, Incluir, Alterar, Excluir e Visualizar.
- Habilitação de Alterar, Excluir e Visualizar apenas quando exatamente um lote está selecionado.
- Modal de sucesso para Enviar e Confirmar.
- Modal de visualização do lote com dados do lote e lançamentos.
- Modal de inclusão de lançamento com Reactive Forms.
- Busca de conta corrente no backend e exibição do titular ao lado da lupa.
- Validação de campos obrigatórios no modal.
- Validador customizado para valor monetário maior que zero.
- Máscara monetária pt-BR no campo Valor do lançamento, por exemplo `1.500,02`.
- Inclusão de lançamento persistida no SQLite.
- Atualização do valor e da quantidade de lançamentos do lote após inclusão.
- Formatação de datas e valores em pt-BR.
- Responsividade básica para telas menores.

## Estrutura

```text
backend/
  app/
    database.py
    main.py
  data/
    outros_creditos.db
  scripts/
    python-runner.cjs
  tests/
    test_api.py

src/app/
  features/
    auth/
    lotes/
  shared/
    validators/
  app.component.*
```

## Testes

Execute a suíte do frontend:

```bash
npx ng test --watch=false --browsers=ChromeHeadlessNoSandbox --progress=false --source-map=false
```

Execute a suíte do backend:

```bash
npm run test:backend
```

## Build

Gere o build de produção:

```bash
npm run build
```

O resultado será gerado em:

```text
dist/outros-creditos-debitos
```

## Decisões Técnicas

- O frontend foi componentizado em login, filtros, tabela de resultados e modal de lançamento.
- A comunicação com a API fica isolada nos services Angular.
- O backend usa FastAPI e `sqlite3` da biblioteca padrão para manter o desafio simples, local e fácil de executar.
- Os dados iniciais são carregados no SQLite durante a inicialização do backend.
- A paleta visual segue tons de verde-petróleo, com tokens globais em `src/styles.scss`.
