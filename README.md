# Vyracare App Proceedings MFE

Micro-frontend Angular responsavel pelo cadastro e pela consulta do catalogo de procedimentos esteticos da clinica.

## Objetivo

O `vyracare-app-proceedings-mfe` centraliza o gerenciamento de procedimentos ofertados pela clinica, mantendo a experiencia alinhada ao shell e ao `@vyracare/design-system`.

## Integracao com o shell

O shell espera:

- um `remoteEntry.js` publicado pelo MFE;
- uma rota principal exposta por `./Routes`;
- compatibilidade de versoes Angular e do `@vyracare/design-system`.

Em desenvolvimento local, o remoto roda na porta `4204`.

## Execucao local

```bash
npm install
npm start
```

Comando auxiliar para desenvolvimento federado:

```bash
npm run run:all
```

## Convencao de commits

Os commits deste repositorio devem ser escritos em portugues.

Padrao recomendado:

- `feat: adiciona cadastro de procedimento`
- `fix: corrige consulta de procedimentos no catalogo`
- `docs: atualiza explicacao do mfe de procedimentos`
