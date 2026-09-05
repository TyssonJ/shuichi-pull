# Shuichi Pull

Arquivo da comunidade brasileira e portuguesa de Shinri Trial.

## Rodar

    npm install
    npm run dados            # gera data/personagens.json
    npm run dados:itens      # gera data/itens.json e data/locais.json
    npm run sprites          # converte os sprites para WebP em public/sprites
    npm run dev

O `npm run sprites:baixar` busca um sprite por personagem na Danganronpa
Fandom wiki e grava em `assets/sprites/elenco/`. Só precisa rodar quando
entrar personagem novo — os arquivos já estão versionados.

## De onde vêm os dados

- `kirigiris-guidebook/_raw/data/en/data.json` — elenco, itens e locais
- `kirigiris-guidebook/_raw/data/drop-rates.json` — 179 fontes de loot
- `kirigiris-guidebook/06-drop-rates.md` — nomes de contêiner em inglês
- `kirigiris-guidebook/_raw/data/i18n/glossary.ru-en.json` — glossário RU→EN
- `data/traducoes/*.pt.json` — traduções PT, editáveis sem mexer em código

Nenhum componente lê arquivo direto: tudo passa por `lib/`.

## Testes

    npm test
    npm run lint

## Publicar

Site estático (`output: 'export'`). O build sai em `out/`.

    npm run build
