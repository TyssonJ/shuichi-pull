# Shuichi Pull — Design da Fase 1

Data: 2026-09-04
Status: aguardando revisão

## 1. O que é

Site da comunidade brasileira e portuguesa de **Shinri Trial**, o Danganronpa Online
do Garry's Mod. Nome definitivo: **Shuichi Pull**.

A Fase 1 entrega o **guia**: um site estático, sem login e sem banco de dados, que
responde as perguntas que a comunidade faz todo dia — quem é cada personagem, o que
cada item faz, onde ele spawna, o que dá pra craftar, como o jogo funciona, e por
onde um iniciante começa.

### O que a Fase 1 NÃO tem

Fora de escopo, decidido: contas de usuário, painel de ADM, perfis públicos, badges,
conquistas, organização de partidas, fórum, integração com Junko Bot ou Steam,
eventos/notícias, códigos promocionais. Tudo isso vem nas fases seguintes, e a
arquitetura escolhida não precisa ser reescrita para recebê-las (ver seção 9).

## 2. A diferenciação do Kirigiri Press

O risco declarado do projeto é parecer cópia. A separação não é cosmética, é
estrutural:

| | Kirigiri Press | Shuichi Pull |
|---|---|---|
| Metáfora | um *guidebook* — livro de referência | um **arquivo de investigação** — documentos numa mesa |
| Idioma | RU / EN / ES | PT-BR (com o termo em inglês ao lado) |
| Fundo | escuro uniforme, cartões neutros | mesa escura com fichas de papel creme por cima, sombra pesada |
| Dados | tabelas | distribuição do elenco inteiro, receita como fórmula visual, spawn com probabilidade |
| Voz | neutra | o Alter Ego, presente em todas as páginas |
| Público | global | comunidade BR/PT |

O princípio que amarra o visual, e que deve ser respeitado em toda tela nova:

> **O site é papel. O Alter Ego é a única coisa digital dentro dele.**

Todo conteúdo é documento impresso — creme, tinta preta, teal, carimbo vermelho,
trama de pontos. O verde de fósforo existe *exclusivamente* dentro da janela dela.
Ela não combina com o resto do site de propósito: é um programa aberto por cima do
arquivo, como no jogo.

## 3. O Alter Ego

### Comportamento (decidido)

1. **Entrada:** boot — tela preta, linhas de inicialização, o monitor liga com flash
   horizontal, ela cumprimenta, a janela encolhe e se encaixa como barra do topo. A
   animação *é* a transição para o site, não um enfeite antes dele. Botão de pular
   sempre visível; quem já visitou vê uma versão curta.
2. **No topo da página:** a janela é a barra de navegação — tela dela à esquerda,
   busca global no meio, seções à direita.
3. **Ao rolar:** a barra sai de cena e deixa um ícone circular no canto inferior direito.
4. **Ao clicar no ícone:** a janela reabre flutuante ali mesmo, com a busca junto.
5. **A janela flutuante persiste entre páginas.** Se o usuário abriu, continua aberta
   na próxima página; só fecha se ele fechar.
6. **Ela pode chamar sozinha:** em momentos específicos, o ícone pisca com um balão de
   dica. Sempre discreto, com um botão de desligar que também persiste.

A moldura da janela nunca desaparece nem recarrega — ela só troca de forma. É o que
sustenta a ilusão de programa rodando.

### Expressões: sprite + kaomoji

São 9 sprites oficiais para muito mais estados. Regra:

- Se o estado tem sprite mapeado, mostra o sprite.
- Se não tem, a janela continua e **a tela vira um kaomoji gigante**, no mesmo verde,
  com a mesma scanline e a mesma moldura branca do sprite.

Isso dá estados ilimitados sem arte nova. Mapeamento inicial:

| Estado | Face | Exemplo de fala |
|---|---|---|
| Ocioso / busca | sprite 1 | — |
| Busca com resultado | sprite 3 | "Achei 12 receitas com esse item!" |
| Nenhum resultado | sprite 6 | "Não achei nada... tenta outro nome?" |
| Item raro/lendário | kaomoji `(・o・)` | "Esse é LENDÁRIO! Só spawna em 3 lugares." |
| Primeira visita | kaomoji `(๑•̀ㅂ•́)و` | "Primeira vez aqui? Vem que eu te explico!" |
| Carregando | kaomoji `(－ω－) zZ` | "Carregando os 162 itens..." |
| Erro 404 | kaomoji `(╥﹏╥)` | "Essa página não existe..." |

As falas ficam num arquivo de conteúdo separado do código, para virarem editáveis por
ADM na Fase 2 sem refatoração.

## 4. Sistema de design

### Cores

```
--bg      #0E0E11   mesa (fundo de tudo)
--sur     #17171D   painéis sobre a mesa
--line    #2A2A33   divisórias
--papel   #E8E2D2   fichas de papel (só como objeto, nunca como fundo de página)
--tinta   #14141A   texto sobre papel
--teal    #63C4BC   destaque / valores bons
--teal-d  #1E6E73   faixas cheias
--red     #D9534A   valores ruins / carimbo
--dim     #7A7A88   texto secundário
```

Verde do Alter Ego (`#4FA030`–`#256512`) é reservado: **só dentro da janela dela**.

### Tipografia

- Display (títulos de faixa, nomes): sans muito pesada, negativa no tracking
- Serifada: cabeçalhos de seção entre linhas ("FICHA DO ALUNO — 05/16"), talentos
- Monoespaçada: rótulos, valores, eixos, kaomoji, tudo que é "dado"

A fonte display definitiva ainda não foi escolhida — é a maior alavanca visual que
resta e deve ser decidida no início da implementação.

### Elementos recorrentes

- **Ficha de papel:** fundo creme, trama de pontos, sombra pesada, rotação de ~0.5°
- **Faixa de seção:** cor cheia, título gigante, número vertical na lateral, personagem
  sangrando na borda direita
- **Carteirinha:** campos rotulados em mono + assinatura serifada
- **Rótulo com seta:** aponta um ponto da arte do personagem
- **Nome fantasma:** tipografia gigante translúcida atrás do conteúdo
- **Carimbo:** borda vermelha, texto mono, rotação de −5°

### Visualização de dados (decidido)

**Régua de distribuição.** Para cada atributo: nome, valor grande colorido, frase em
português com a colocação, e abaixo um histograma onde **cada coluna é quantos dos 56
alunos têm aquele valor exato**. A coluna do personagem fica acesa com etiqueta
apontando. Linha tracejada na média, com o número. Mínimo e máximo escritos nas pontas
e o sentido explicado ("mais rápido →").

Regra de leitura: quem não quiser ler gráfico entende só pelo valor grande e pela
frase. O gráfico é a camada de profundidade, não o único caminho.

Outras visualizações confirmadas:
- **Receita de craft:** fórmula visual — ingredientes com quantidade em bolinha, seta,
  resultado destacado; bancada e chance no cabeçalho
- **Efeitos:** coluna de duração (IMEDIATO / 300 s) + descrição
- **Spawn:** barra de probabilidade por local

## 5. Páginas da Fase 1

1. **Início** — capa escura com nome fantasma e personagem sangrando, depois faixas
   numeradas por seção
2. **Elenco** (listagem) — grade de fichas, filtro por jogo/turma e por atributo
3. **Personagem** (ficha) — cabeçalho, arte com rótulos-seta, carteirinha, régua de
   distribuição, ficha de papel "Como jogar", itens iniciais
4. **Itens** (listagem) — grade/tabela com filtro por categoria, ramo, raridade, peso
5. **Item** (ficha) — cabeçalho com raridade, receita como fórmula, efeitos, spawn
6. **Mapa** (listagem de locais) — cada local, o que spawna lá, para onde conecta
7. **Local** (ficha) — descrição, itens que spawnam, conexões
8. **Mecânicas e Controles** — teclas, fases, combate, inventário
9. **FAQ**
10. **Área de Iniciantes** — o que é Danganronpa, o que é Shinri Trial, como pegar o
    UUID, como entrar, dicas dos ADMs, link para o jogo. Tom acolhedor (é a única
    página que puxa a referência do dashboard rosa)
11. **404** — o Alter Ego com `(╥﹏╥)`

Ligações cruzadas obrigatórias: item ↔ local de spawn, item ↔ receita ↔ ingredientes,
personagem ↔ itens iniciais.

Rodapé em todas: linha de créditos a Spike Chunsoft (sprites), à equipe do Shinri
Trial e ao Kirigiri Press (dados-base), mais o aviso de que é site comunitário e não
fonte oficial.

## 6. Arquitetura técnica

**Next.js (App Router) + TypeScript + Tailwind, exportado estático, hospedado na Vercel.**

Justificativa: a Fase 1 não precisa de servidor, e assim ela é gratuita e rápida.
Mas quando chegarem login, painel de ADM e fórum, é só acrescentar rotas de API e um
Supabase — sem trocar de framework nem reescrever as páginas. Um site estático puro
(Astro, HTML) forçaria migração; um app com servidor desde já pagaria complexidade
sem uso.

```
app/                    rotas e páginas
components/
  alter-ego/            janela, estados, busca, falas
  ficha/                papel, carteirinha, rótulo-seta, carimbo
  dados/                régua de distribuição, fórmula de craft, barra de spawn
  layout/               faixa, nome fantasma, rodapé
content/                textos autorais em MDX (iniciantes, dicas, falas dela)
data/                   dados normalizados em JSON tipado (gerado, versionado)
lib/
  schema.ts             tipos + validação dos dados
  busca.ts              índice de busca
scripts/
  ingest.ts             kirigiris-guidebook/_raw → data/
  otimizar-sprites.ts   PNG → WebP redimensionado
public/sprites/         sprites otimizados
```

**Regra de arquitetura:** componente não lê arquivo de dados direto. Tudo passa por
`lib/` com tipos declarados, para que a Fase 2 possa trocar a fonte (arquivo → banco)
sem tocar em componente nenhum.

## 7. Dados

### Origem e tratamento

Fonte: `kirigiris-guidebook/_raw/data/*.json`. Os números de jogo são fatos do jogo,
não propriedade do Kirigiri Press; a apresentação, organização e textos são próprios,
e o crédito à extração deles fica no rodapé.

Um script de ingestão (`scripts/ingest.ts`) converte os JSONs brutos no formato do
site. Ele é reexecutável: se os dados forem atualizados, roda de novo. O resultado é
versionado, para que o site nunca dependa da pasta original em build.

### Idioma nos dados

Decidido: **traduzir nome e descrição para PT-BR e manter o termo original em inglês
junto**, porque o jogo está em inglês e o usuário precisa encontrar o item lá dentro.

```ts
type Texto = { pt: string; en: string };

type Item = {
  id: string;
  nome: Texto;
  descricao: Texto;
  categoria: string; ramo: string;
  raridade: 'comum'|'incomum'|'raro'|'muito-raro'|'lendario';
  peso: number;
  efeitos: { duracaoSeg: number | 'imediato'; texto: Texto }[];
  receita?: { bancada: string; chance: number; ingredientes: { itemId: string; qtd: number }[] };
  spawns: { localId: string; peso: number }[];
  traducaoRevisada: boolean;
};
```

O campo `traducaoRevisada` permite o selo "tradução não revisada" e, na Fase 2, vira a
fila de revisão do painel de ADM.

No layout, o nome em inglês aparece em cinza menor sob o nome em português; nas
listagens, a busca casa com os dois.

### Escala do trabalho

162 itens, 179 fontes de loot, 56 fichas de personagem, 11 armas, receitas por bancada.
A tradução é o maior custo da Fase 1 — maior que o código — e deve ser tratada como um
passo próprio do plano de implementação, não como detalhe.

## 8. Decisões transversais

**Busca.** Índice montado em build e carregado no cliente; casa nome PT, nome EN e
categoria. É a busca da janela do Alter Ego. Sem dependência de serviço externo.

**Celular.** A barra do topo vira ícone + busca. As faixas empilham. A régua de
distribuição mantém valor e frase, e o histograma rola horizontal dentro do próprio
bloco — a página nunca rola de lado.

**Acessibilidade.** A animação de boot respeita `prefers-reduced-motion` (corta para o
estado final). Toda informação passada por cor tem também texto: o valor colorido
sempre vem com a frase. Contraste conferido em papel e em mesa.

**Peso dos sprites.** Os 210 PNGs baixados somam ~12,5 MB. Um script converte para
WebP redimensionado antes de entrar em `public/`. Nenhuma página carrega mais que os
sprites que mostra.

**Testes.** Validação dos dados contra o schema (falha o build se um item referencia
ingrediente inexistente ou local que não existe), testes dos cálculos da régua
(posição, média, contagem por valor), e testes dos estados do Alter Ego.

## 9. Preparado para as fases seguintes

| Fase | O que entra | O que a Fase 1 já deixa pronto |
|---|---|---|
| 2 | Login Discord/Steam, painel de ADM, eventos, códigos | dados atrás de `lib/`, textos fora do código, `traducaoRevisada` |
| 3 | Perfis, UUID, mains, badges, conquistas, histórico | ficha de personagem e carteirinha já são o molde do perfil |
| 4 | Organização de partidas | — |
| 5 | Fórum, Junko Bot, Steam | Next.js já suporta rotas de API |

## 10. Riscos

| Risco | Mitigação |
|---|---|
| Atrito com o Kirigiri Press | visual e estrutura próprios, crédito no rodapé, dados são fatos do jogo |
| Tradução errada gerar informação falsa | selo "não revisada" até um ADM confirmar; termo em inglês sempre visível |
| Dados desatualizarem quando o jogo mudar | script de ingestão reexecutável |
| Animação de entrada irritar quem volta sempre | versão curta a partir da segunda visita, pular sempre visível |
| Escopo crescer para dentro da Fase 2 | lista do "NÃO tem" na seção 1 é o contrato |

## 11. Aberto para a implementação

1. Fonte display definitiva — maior alavanca visual restante
2. Ícones dos itens — extrair do jogo ou desenhar (hoje são quadrados vazios)
3. Domínio
4. Nomes em português dos locais do mapa — precisam de alguém que jogue
