# Outros Créditos/Débitos

Aplicação Angular para o desafio prático de modernização de telas Flex para Angular no módulo contábil de Outros Créditos/Débitos.

## Stack

- Angular 17.3
- TypeScript
- Standalone Components
- Reactive Forms
- RxJS com serviços mockados em memória
- Jasmine/Karma para testes unitários
- CSS/SCSS próprio para aproximar o visual das telas de referência

## Como executar

```bash
npm install
npm start
```

A aplicação ficará disponível em `http://localhost:4200/`.

## Testes

```bash
npm test -- --watch=false --browsers=ChromeHeadlessNoSandbox
```

O projeto inclui um launcher Karma customizado para execução headless estável no Windows.

## Build

```bash
npm run build
```

## Funcionalidades implementadas

- Tela de consulta de lotes com breadcrumb, painel de filtros recolhível e tabela paginada.
- Filtros reativos por instituição, situação, faixa de lote, faixa de valor e faixa de data.
- Serviço separado (`LoteService`) simulando API com `Observable`, `of`, `throwError` e `delay`.
- Seleção individual e selecionar todos.
- Habilitação de ações dependente da seleção: alterar, excluir e visualizar exigem exatamente um lote selecionado.
- Modal de inclusão de lançamento com formulário reativo.
- Busca mockada de conta corrente.
- Validações obrigatórias e validador customizado para valor monetário maior que zero.
- Inclusão de lançamento em memória, atualizando a grade do lote.
- Formatação pt-BR para números e datas.

## Decisões técnicas

Usei CSS próprio em vez de Angular Material ou PrimeNG para manter o layout mais próximo das imagens do desafio, que têm aparência corporativa densa e semelhante a sistemas legados. A aplicação foi separada em componentes de filtro, tabela e modal para manter responsabilidades claras e facilitar explicação durante a entrevista técnica.

Os dados ficam em memória porque o desafio é exclusivamente front-end. O serviço retorna clones dos objetos para reduzir acoplamento entre componentes e simular melhor o contrato de uma API.
