# Kirigiri's Press - Shinri Trial Guidebook
## Extracao completa de https://kirigiris.press/guidebook?lang=en

Idioma extraido: EN (o site tambem tem RU e ES).
Fonte: SPA em Vite. O conteudo NAO esta no HTML - foi extraido dos bundles
JavaScript e dos arquivos JSON de dados carregados pela pagina, o que inclui
todo o texto que so aparece ao clicar (accordions, 'Details', 'OPEN FILE',
'SHOW SCREENSHOT', lightboxes, tooltips e mensagens de erro).

### Arquivos

- **01-ui-strings-completo.md** - Todas as strings de interface (i18n EN) - rotulos, botoes, tooltips, avisos, aria-labels
- **02-introducao.md** - Secao 00 - Introducao / recado da equipe
- **03-game-loop.md** - Secao 01 - Game loop: 4 fases, capitulos, finais, tempo in-game
- **04-controles-e-mecanicas.md** - Secao 02 - Teclas + texto integral de todos os cards de mecanica
- **05-itens.md** - Secao 05 - 162 itens (spawns, raridade, peso, efeitos, precos de loja), efeitos de status, locais
- **06-drop-rates.md** - Secao 05 - 179 fontes de loot com chances de drop por container
- **07-armas-e-forense.md** - Secao 06 - 11 armas com dano por zona + Monokuma File completo, armadilhas, venenos, temperatura, forense
- **08-crafting.md** - Secao 07 - Todas as receitas por bancada
- **09-reparos.md** - Secao 08 - Etapas de reparo, presets, dicas, tabela de capsulas
- **10-detetive.md** - Secao 09 - Protocolo do detetive (6 fases), evidencias, eventos do Monokuma, modelo de caderno
- **11-personagens.md** - Secao 10 - Elenco dos 5 jogos com atributos
- **12-conquistas.md** - Secao 11 - Conquistas por categoria
- **13-faq.md** - Secao 12 - FAQ
- **14-legal-e-creditos.md** - Paginas legais / creditos / politica
- **15-mapas-e-midia.md** - Secao 04 - Mapa da academia: panoramas e imagens por local
- **16-videos.md** - Video guias do canal
- **17-comandos-de-chat.md** - Secao 03 - Comandos de chat
- **18-glossario-ru-en.md** - Glossario canonico RU -> EN
- **19-landing-e-shell.md** - Textos da capa, navegacao, busca, codigo promocional

### Dados brutos

A pasta `_raw/` guarda os arquivos originais baixados do site:
- `_raw/data/*.json` - dados em russo (fonte canonica)
- `_raw/data/en/*.json` - dados em ingles
- `_raw/data/i18n/glossary.ru-en.json` - mapa de nomes proprios
- `_raw/assets/*.js` e `*.json` - modulos de conteudo (intro, gameloop, faq, controles, legal, i18n)
- `_raw/index.html`, `_raw/bundle.js`, `_raw/bundle.css` - a aplicacao

### Links do site

- Discord: https://discord.gg/yKhYkZd5Xy
- Telegram: https://t.me/+ypmRFGw3X_5mOTky
- YouTube: https://www.youtube.com/@kirigirispressglobal
- Regras oficiais do projeto: https://blog.shinri-trial.ru/docs/rules

Codigo promocional do site: **KPRESS** (usar antes do nivel 5 no Shinri Trial).