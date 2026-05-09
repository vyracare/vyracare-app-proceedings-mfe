# vyracare-app-proceedings-mfe

Micro-front-end Angular responsável pelo cadastro e pela consulta do catálogo de procedimentos estéticos da clínica. O projeto foi estruturado para ser consumido pelo `vyracare-app-shell` via Module Federation e seguir o mesmo padrão arquitetural do `vyracare-app-profile-mfe`.

## Objetivo

O MFE centraliza o gerenciamento de procedimentos que podem ser ofertados por uma empresa de estética, permitindo:

- cadastrar procedimentos com categoria, código e preço por sessão;
- agrupar o catálogo por categoria;
- destacar indicadores operacionais do catálogo;
- manter a experiência visual alinhada ao `@vyracare/design-system`.

## Arquitetura

### Camadas

- `pages`: compõem a experiência da tela e orquestram estado, carregamento e mensagens.
- `components`: concentram blocos reutilizáveis de interface, como o formulário de cadastro.
- `services`: encapsulam leitura e escrita do catálogo.
- `models`: definem o contrato tipado dos dados usados no fluxo.

### Estrutura principal

```text
src/app
|-- app.routes.ts
|-- components
|   `-- proceeding-form
|-- models
|   `-- proceeding.model.ts
|-- pages
|   `-- proceeding-registration
`-- services
    `-- proceeding.service.ts
```

### Responsabilidades por arquivo

- `app.routes.ts`: expõe a rota raiz do MFE.
- `proceeding-registration.component.ts`: página principal; agrega indicadores, catálogo e formulário.
- `proceeding-form.component.ts`: formulário reativo de cadastro.
- `proceeding.service.ts`: simula persistência local e fornece o catálogo inicial.
- `proceeding.model.ts`: tipa payloads e entidades de procedimento.

## Fluxo de dados

1. A página principal carrega o catálogo via `ProceedingService`.
2. O service lê os dados do `localStorage`.
3. Se não houver dados persistidos, retorna o catálogo inicial em memória.
4. O formulário emite `formSubmit` com o payload tipado.
5. A página recebe o evento, chama `registerProcedure` e recarrega a listagem.

Hoje o projeto trabalha com persistência local para acelerar a montagem do fluxo. Quando houver API dedicada, a troca deve acontecer apenas na camada de `services`.

## Interface e design system

O layout usa os componentes da versão mais recente do `@vyracare/design-system`, com foco em consistência visual com os demais produtos Vyracare.

Componentes utilizados:

- `vc-heading`
- `vc-text`
- `vc-card`
- `vc-list`
- `vc-button`
- `vc-input`
- `vc-select`

Também utiliza o grid do design system com `vc-row` e `vc-col-*` para montar a página e manter alinhamento com o shell.

## Module Federation

O projeto é publicado como remoto pelo arquivo `webpack.config.js`.

Configuração atual:

- `name`: `proceedings`
- `filename`: `remoteEntry.js`
- módulos expostos:
  - `./App`
  - `./Routes`

O `vyracare-app-shell` consome o remoto pela exposição `./Routes`, o que permite carregar o MFE diretamente na rota `/cadastro/procedimentos`.

## Integração com o shell

O shell espera:

- um `remoteEntry.js` publicado pelo MFE;
- uma rota principal exposta por `./Routes`;
- compatibilidade de versões Angular e do `@vyracare/design-system`.

Em desenvolvimento local, o remoto roda na porta `4204`.

## Execução local

```bash
npm install
npm start
```

Comando auxiliar para desenvolvimento federado:

```bash
npm run run:all
```

## Próximos passos esperados

- substituir o `localStorage` por integração com API de procedimentos;
- incluir filtros por categoria, status e faixa de preço;
- adicionar paginação ou virtualização se o catálogo crescer;
- evoluir testes do service para contemplar cenários de API remota.
