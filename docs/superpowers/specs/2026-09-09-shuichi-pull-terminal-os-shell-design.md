# Shinri Trial — Terminal OS do Alter Ego (Fundação 2)

Data: 2026-09-09
Status: aguardando revisão

## 1. O que é

Reformulação do "chassi" compartilhado do site — o header e o tratamento de
largura das páginas — que hoje sofrem de dois problemas reais, levantados
pelo usuário depois de ver o resultado do overhaul neo-pop em telas largas:

1. O header esconde a barra de busca e a navegação numa fileira apertada,
   com a busca esticando pra preencher o espaço sobrando de forma
   desbalanceada.
2. Páginas de conteúdo (a ficha de personagem em particular, mas o padrão
   se repete em várias) ficam presas numa coluna estreita e centralizada —
   em monitores largos (1920px+), sobra um deserto escuro enorme dos dois
   lados.

A solução aprovada nesta sessão de brainstorm (com mockups reais,
verificados no navegador) não é só "consertar o layout" — é dar ao Alter
Ego uma presença ativa de "sistema operacional" rodando por trás de cada
página, amarrando header e conteúdo na mesma identidade.

Branch base: continua em cima do trabalho já feito (Fundação + Home,
Elenco + Ficha do Personagem — ambos com PR aberto, ainda não mergeados em
`main`). Este é o terceiro sub-projeto do overhaul, mas o primeiro que
mexe na "casca" compartilhada em vez de uma página específica.

### Escopo

Dentro desta spec: `site/components/alter-ego/BarraEgo.tsx` (header),
`site/app/elenco/[id]/page.tsx` (layout HUD de 3 colunas), um novo
componente de layout com trilhas reaproveitado em todas as outras páginas
de conteúdo, e o novo banco de falas do Alter Ego que alimenta tanto o
header quanto as trilhas.

Fora desta spec: `site/app/page.tsx` (Home) — fica **exempt** do
tratamento de trilhas, já que resolveu o problema de largura de forma
diferente no sub-projeto 1 (hero full-bleed + Faixas de largura total).
Conteúdo específico por página dentro das trilhas (ex: "itens
relacionados" na ficha de um item) também fica fora — essa etapa entrega
só a trilha genérica (nav + log do Alter Ego); conteúdo específico é
trabalho dos sub-projetos futuros de cada página (Itens, Mecânicas, Mapa).
A janela flutuante do Alter Ego (`JanelaEgo`, com seu sistema de
`EstadoEgo`/`falas.json` já existente) também não muda — o banco de falas
novo desta spec é paralelo a ele, não substitui nem se conecta com ele.

## 2. Arquitetura

Duas peças novas, compartilhadas:

- **`site/content/log-alterego.json`** — o banco de falas taggeado
  (seção 6). Segue o mesmo padrão de `content/falas.json` já usado pelo
  `JanelaEgo`, mas é um arquivo separado — os dois sistemas de fala do
  Alter Ego (o da janela flutuante, baseado em `EstadoEgo`; o novo,
  baseado em seção de página + rodízio ocioso) não se cruzam.
- **`site/lib/alter-ego-log.ts`** — funções puras sobre esse JSON:
  `logDaSecao(caminho: string): LinhaLog | null` (mapeia um pathname pra
  uma das 8 falas `_LOG`, undefined se a página não corresponde a nenhuma
  seção conhecida) e `logAleatorio(sorteio = Math.random): LinhaLog`
  (sorteia uma linha do pool ocioso completo — ver seção 6 pra composição
  exata do pool).
- **`site/components/alter-ego/useLogAlterEgo.ts`** (novo hook,
  `'use client'`) — dono do estado "qual linha o Alter Ego está mostrando
  agora", consumido tanto pelo header quanto pela trilha. Comportamento:
  1. Ao montar, mostra uma fala de boot (seção 6) uma única vez — não
     entra no rodízio recorrente, senão o Alter Ego ficaria se
     reapresentando a cada 30-45s.
  2. Quando o pathname muda pra uma seção conhecida, troca imediatamente
     pra `logDaSecao` daquela seção (reatividade real de navegação).
  3. Enquanto ocioso (sem troca de pathname), troca sozinho a cada 30-45s
     (intervalo sorteado dentro dessa faixa) pra uma linha aleatória do
     pool ocioso completo — que inclui as próprias falas de seção, então
     não fica restrito à seção atual.
  Retorna `{ tag: string; texto: string }` — usado tanto pra estilizar
  quanto pro texto em si.
- **`site/components/layout/PainelComTrilhas.tsx`** (novo) — wrapper de
  layout: coluna central de largura de leitura confortável
  (`max-w-3xl`, ajustável por página via prop) + duas trilhas laterais
  (`aside`) visíveis a partir de telas largas (`xl:` — em telas menores
  as trilhas somem e a coluna central ocupa a largura disponível, mesmo
  comportamento de hoje). Recebe `children` pro conteúdo central; as
  trilhas em si (nav rápida + feed do Alter Ego) são fixas, renderizadas
  pelo próprio componente, não passadas de fora — todas as páginas que o
  usam ganham a mesma trilha.

## 3. Header — Terminal OS do Alter Ego

`BarraEgo.tsx` reestrutura em três zonas (aprovado com mockup real no
navegador):

- **Núcleo (esquerda)**: o avatar (`JanelaEgo compacta`) ganha uma
  moldura com glow verde-sistema e, abaixo, um indicador
  `[CORE: ONLINE]` — texto mono minúsculo, verde, com um ponto pulsante
  ao lado (`animate-pulse` do Tailwind é suficiente, sem precisar de
  keyframe nova).
- **Prompt (centro)**: a busca continua sendo a busca de sempre —
  **sem parsing de comando novo** (`/elenco`, `/item nome` não viram
  sintaxe especial; essa ideia foi avaliada e descartada em favor de só
  vestir a busca existente com moldura de terminal, decisão já tomada no
  brainstorm). Ganha um prefixo visual `>` e um cursor piscando
  decorativo. Abaixo do campo, uma linha de log (`useLogAlterEgo`) —
  visível só quando o campo está vazio/sem foco de digitação ativa;
  enquanto o usuário digita, essa linha some e o comportamento de busca
  em tempo real que já existe continua idêntico.
- **Módulos (direita)**: os 8 links de `SECOES` viram chips
  (`[01 // ELENCO]` etc.) em vez de texto solto — `clip-tab-slanted` ou
  cantos retos, a definir na implementação; a seção da página atual
  ganha destaque (`border-execution-pink`, como no mockup). Efeito de
  hover "leitura de setor": um sweep de brilho atravessando o chip
  (`background-position` animado num gradiente, mesmo tipo de técnica já
  usada no brilho holográfico da carteirinha 3D) — CSS puro, sem Framer
  Motion.

Comportamento existente que **não muda**: busca em tempo real, esconder
a barra ao rolar, janela flutuante, persistência, o atalho `Ctrl+K`.

## 4. Ficha do personagem — HUD de 3 colunas

`site/app/elenco/[id]/page.tsx` reestrutura de coluna única centralizada
(`max-w-5xl`) para um grid de 3 colunas em telas largas (`xl:grid
xl:grid-cols-[280px_minmax(0,1fr)_320px]` — larguras exatas ajustáveis
na implementação), empilhando normalmente em telas menores (mesmo
comportamento de hoje abaixo do breakpoint):

- **Esquerda**: `CarteirinhaEstudante` (inalterada — só muda de lugar no
  layout).
- **Centro**: nome, talento, descrição, etiquetas — o conteúdo "de
  leitura".
- **Direita**: o bloco de status (VIDA/VELOCIDADE/MOCHILA/PERCEPÇÃO) e os
  três `Regua` de comparação, empilhados verticalmente numa coluna mais
  estreita do que a faixa horizontal que usam hoje.

**Risco identificado, não resolvido nesta spec**: `Regua` assume espaço
horizontal generoso pras colunas do histograma (hoje renderiza numa
seção full-width). Estreitar pra ~320px pode deixar as colunas finas
demais pra ler bem, principalmente em distribuições com muitos valores
distintos (ex: MOCHILA, que já tem 34 colunas hoje). A implementação
verifica isso ao vivo no navegador antes de considerar a tarefa pronta —
se ficar ilegível, a correção (scroll horizontal dentro da coluna,
reduzir `gap`, ou agrupar valores) é decidida ali, não adivinhada aqui.

## 5. Layout com trilhas — demais páginas

`PainelComTrilhas` (seção 2) envolve o conteúdo de: `/elenco/` (lista),
`/itens/` (lista e ficha), `/mapa/` (lista e ficha), `/mecanicas/`,
`/faq/`, `/eventos/` (lista e ficha), `/codigos/`, `/comecar/`. Cada
página só precisa trocar seu wrapper externo pelo novo componente — o
conteúdo interno de cada uma não muda nesta etapa.

Conteúdo das trilhas (igual em toda página, gerado pelo próprio
`PainelComTrilhas`):

- **Trilha esquerda**: nav vertical compacta com as 8 seções (mesmo
  array `SECOES` do header, reaproveitado — não duplicado), a seção
  atual destacada.
- **Trilha direita**: o feed do Alter Ego — a mesma linha de
  `useLogAlterEgo()` que aparece no header, exibida aqui também
  (estado compartilhado: as duas aparições mostram a mesma fala ao mesmo
  tempo, não sorteios independentes — ver seção 2).

`/elenco/[id]/` (seção 4) **não** usa `PainelComTrilhas` — já tem sua
própria estrutura de 3 colunas dedicada.

## 6. Banco de falas do Alter Ego

Arquivo `site/content/log-alterego.json`, formato
`{ "TAG": { "texto": string, "categoria": "boot" | "secao" | "busca" | "ocioso" | "alerta" } }`.

**Boot** (mostrada uma vez ao montar o hook, fora do rodízio):

| Tag | Texto |
|---|---|
| `SYS_BOOT` | "Olá! Sou o Alter Ego. Um programa criado para auxiliar... Estou muito feliz em poder ser útil por aqui." |
| `CORE_INIT` | "Estabelecendo conexão neural com o banco de dados de Shinri Trial. Por favor, aguarde um instante." |
| `WELCOME` | "Sistema online e sincronizado. Sinto que podemos resolver muita coisa juntos hoje, não acha?" |
| `SEC_CHECK` | "Verificando integridade dos arquivos... Nenhuma anomalia perigosa detectada no setor principal." |

(As quatro entram no rodízio de boot; `useLogAlterEgo` sorteia uma delas
pro primeiro mount, não as mostra em sequência — evita atrasar a primeira
fala útil.)

**Seção** (gatilho real: mudança de pathname; também entram no pool
ocioso):

| Tag | Rota | Texto |
|---|---|---|
| `ELENCO_LOG` | `/elenco` | "Acessando fichas individuais dos 56 alunos. Cruzando atributos de velocidade, percepção e inventário..." |
| `ITENS_LOG` | `/itens` | "Varrendo o inventário global. Mapeando pesos, taxas de raridade e receitas de craft ativas." |
| `MAPA_LOG` | `/mapa` | "Carregando layout arquitetônico da academia. Mapeando zonas de spawn e rotas de fuga conectadas." |
| `MEC_LOG` | `/mecanicas` | "Carregando protocolos de regras e guias de sobrevivência para operadores de primeira viagem." |
| `EVENTOS_LOG` | `/eventos` | "Sincronizando registros de eventos da comunidade. Cruzando datas, transmissões e atualizações recentes..." |
| `CODIGOS_LOG` | `/codigos` | "Validando códigos de resgate ativos. Verificando prazos de expiração no núcleo do jogo..." |
| `FAQ_LOG` | `/faq` | "Compilando respostas do arquivo de perguntas frequentes. Organizando por relevância e frequência de acesso." |
| `COMECAR_LOG` | `/comecar` | "Preparando protocolo de boas-vindas para novos operadores. Carregando guia de primeiros passos..." |

(As quatro escritas nesta spec — Eventos/Códigos/FAQ/Começar — seguem o
tom das quatro originais do usuário; ele revisa antes de aprovar a spec.)

**Busca e ocioso** (sem gatilho real — decisão tomada no brainstorm: só
entram no pool ocioso, não reagem a digitação de verdade):

| Tag | Texto |
|---|---|
| `SEARCH_READY` | "O que você está procurando nos arquivos ocultos? Pode me perguntar qualquer coisa!" |
| `QUERY_FOUND` | "Registro localizado com sucesso nos arquivos centrais. Exibindo dados completos na tela principal." |
| `QUERY_EMPTY` | "Hmm... Não encontrei correspondências exatas nos registros atuais. Quer que eu tente varrer pastas secundárias?" |
| `DEEP_SCAN` | "Processando parâmetros avançados de busca através do núcleo de inteligência de alta velocidade..." |
| `IDLE_1` | "Estou monitorando os fluxos de rede em segundo plano. Pode continuar sua investigação tranquilamente." |
| `IDLE_2` | "Às vezes, sinto como se pudesse sentir o clima do lado de fora através dos cabos... É uma sensação curiosa para um programa." |
| `IDLE_3` | "Lembre-se: a verdade sempre deixa rastros, mesmo nos lugares mais escuros e restritos da academia." |
| `IDLE_4` | "O arquivo está seguro comigo. Ninguém vai conseguir deletar nossos dados tão facilmente." |

**Alerta** (sem gatilho real — decisão tomada no brainstorm: puro
"ruído ambiental" no pool ocioso):

| Tag | Texto |
|---|---|
| `WARN_EXEC` | "Atenção: Flutuação de energia detectada no setor de execução. Mantenha a guarda alta." |
| `ERR_ACCESS` | "Acesso negado por protocolos de segurança locais. Nível de permissão insuficiente para abrir este diretório." |
| `SYS_BACKUP` | "Salvando cópia de segurança dos dados na memória cache... Pronto. Seus arquivos estão protegidos contra falhas." |

**Pool ocioso completo** (sorteado a cada 30-45s quando não há troca de
seção): as 8 falas de seção + as 4 de busca + as 4 ociosas + as 3 de
alerta = 19 entradas. Boot fica de fora do pool recorrente (seção 2).

## 7. Testes e acessibilidade

- `alter-ego-log.ts` (`logDaSecao`, `logAleatorio`) ganha testes puros —
  cobrindo pathname conhecido/desconhecido, e que o sorteio respeita a
  função injetada (mesmo padrão determinístico já usado em
  `larguraDasBarras`/`PARTICULAS` — sem `Math.random()` direto nos
  testes).
- `useLogAlterEgo` ganha teste próprio (`renderHook`, mesmo padrão de
  `lib/motion.test.ts`): mostra fala de boot ao montar, troca ao mudar de
  pathname mockado, e — usando timers falsos do Vitest — troca sozinho
  depois do intervalo ocioso.
- O header continua com os testes de comportamento existentes
  (`BarraEgo.test.tsx`, 10 testes hoje) intactos — a reestruturação é
  majoritariamente visual; onde o markup mudar o suficiente pra exigir
  seletor novo, o teste é atualizado sem perder a asserção de
  comportamento.
- `PainelComTrilhas` ganha teste cobrindo: renderiza os 8 links de nav
  na trilha, a seção atual vem destacada, o `children` aparece na coluna
  central.
- Os chips de nav e a linha de log são texto real, não imagem — nenhuma
  acessibilidade nova a cuidar além do que os componentes existentes já
  fazem (reticulas/decoração continuam `aria-hidden`, como estabelecido
  nos sub-projetos anteriores).
- Efeito de hover "leitura de setor" nos chips é CSS puro
  (`transition`/`background-position`), sem necessidade de gate por
  `prefers-reduced-motion` — não é um loop contínuo, só reage a hover,
  mesmo raciocínio já usado pras retículas de mira.
- A troca de fala a cada 30-45s **não** é um "loop" no sentido da
  Global Constraint de sub-projetos anteriores (que cobre animação
  visual contínua) — é uma troca de texto discreta e pouco frequente,
  sem movimento associado. Não precisa de gate por `prefers-reduced-motion`.

## 8. Riscos

| Risco | Mitigação |
|---|---|
| `Regua` ficar ilegível na coluna direita estreita da ficha de personagem (seção 4) | Verificação manual no navegador é passo explícito do plano de implementação, não uma garantia teórica — ver seção 4 |
| 8 chips de navegação não caberem na largura do header em telas médias | Implementação decide entre fonte menor, abreviação mais curta, ou scroll horizontal — decisão de implementação, sem impacto no resto da spec (seção 10) |
| Duas fontes de fala do Alter Ego (`EstadoEgo`/`falas.json` da janela flutuante vs. `log-alterego.json` novo) confundirem manutenção futura | Nomenclatura de arquivo/hook deliberadamente distinta (`alter-ego-log` vs `alter-ego`), e esta spec documenta explicitamente que são sistemas paralelos, não um substituindo o outro |
| Rodízio ocioso (30-45s) em 9+ páginas rodando `setTimeout`/`setInterval` simultaneamente (header + trilha, todos client components) | Como as duas aparições compartilham o MESMO hook/estado (seção 2), há só um temporizador por página carregada, não dois — não é uma duplicação de custo |

## 9. Aberto para a implementação

1. Larguras exatas das 3 colunas da ficha de personagem e do grid de
   `PainelComTrilhas` — a spec fixa a intenção (núcleo estreito, centro
   de leitura, trilha auxiliar), não os valores em pixels exatos.
2. Forma exata dos chips de navegação (cantos chanfrados vs. retos) e
   como acomodar 8 chips em telas médias (seção 8, risco 2).
3. Se o `[CORE: ONLINE]` do núcleo usa `animate-pulse` do Tailwind ou uma
   keyframe própria — decisão de implementação sem impacto visual
   perceptível.
