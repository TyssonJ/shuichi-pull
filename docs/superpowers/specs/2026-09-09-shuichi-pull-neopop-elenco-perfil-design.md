# Shuichi Pull — Overhaul Neo-Pop: Elenco + Ficha do Personagem (design)

Data: 2026-09-09
Status: aguardando revisão

## 1. O que é

Segunda de seis sub-etapas do overhaul neo-pop Danganronpa (a primeira,
Fundação + Home, está em
`docs/superpowers/specs/2026-09-08-shuichi-pull-neopop-fundacao-home-design.md`
e em revisão — PR aberto, ainda não mergeado em `main`). Esta spec assume que
a fundação já existe: tokens de cor (`execution-pink`, `cyber-cyan`,
`alter-green`, `amber`, `alerta`), a camada de ambiência global
(`CamadaAmbiente`), o header renumerado, e os utilitários CSS
(`clip-tab-slanted`, `bg-halftone-pattern`, `crt-lines`, `animate-spin-slow`
etc.) já descritos naquela spec.

O prompt mestre original do usuário (`prompt_redesign_shinri_trial.txt`, raiz
do repo) define duas identidades visuais distintas que esta spec cobre juntas,
por serem a mesma jornada do usuário (ver um aluno na lista → abrir a ficha
dele):

- **Aba 2 — Elenco de Alunos**: "Forensic Police Dossier & Student ID
  Archive" — grid de personagens como fichas criminais confidenciais.
- **Aba 3 — Perfil Detalhado do Personagem**: "Interactive Student ID &
  Courtroom HUD" — split-screen entre uma carteirinha 3D e um painel de
  análise pericial.

("Perfil" aqui é a ficha de cada personagem — `/elenco/[id]/` — não uma conta
de usuário. A funcionalidade de conta/login/Discord/Steam, mencionada em
conversas anteriores, não existe no código hoje e está fora do escopo de
qualquer um dos seis sub-projetos deste overhaul visual.)

### Escopo

Dentro desta spec: `site/app/elenco/page.tsx`, `site/app/elenco/[id]/page.tsx`,
`site/components/ficha/CartaoPersonagem.tsx`, `site/components/dados/Regua.tsx`,
mais um novo componente de carteirinha e um hook compartilhado extraído da
Fundação.

Fora desta spec: qualquer outra página (Itens, Mecânicas, Mapa, FAQ, Eventos,
Códigos, `/adm/*`) — continuam com o visual herdado da varredura mecânica do
sub-projeto 1 até seus próprios sub-projetos.

## 2. Arquitetura

Mesma divisão CSS-puro vs. Framer Motion da spec da Fundação (seção 2 dela):
loops fixos e determinísticos em CSS puro, Framer Motion só onde spring
physics ou variação por instância compensam o peso.

Esta sub-etapa introduz o **segundo** efeito em loop contínuo do site (depois
das partículas da camada de ambiência): o sweep do laser sobre a carteirinha.
Isso significa que o hook `useMovimentoReduzido` — hoje privado a
`site/components/ambiente/CamadaAmbiente.tsx` — passa a ter dois
consumidores. Ele é extraído para `site/lib/motion.ts`, com a mesma
implementação e o mesmo comentário explicativo que já tem hoje (por que não
usar o `useReducedMotion` do framer-motion; por que começar em `false` e
corrigir num `useEffect`), e `CamadaAmbiente.tsx` passa a importá-lo de lá.
Comportamento idêntico, mesmos 4 testes de `CamadaAmbiente.test.tsx`
continuam passando sem alteração.

Dois componentes novos precisam de `'use client'`:

- `site/components/ficha/CarteirinhaEstudante.tsx` (novo) — o tilt 3D segue o
  mouse em tempo real, precisa de `onMouseMove`/`useMotionValue`.
- `site/components/dados/Regua.tsx` (existente, migra para Client Component)
  — a animação de entrada em mola precisa de Framer Motion.

`site/components/ficha/CartaoPersonagem.tsx` (o card do grid) **permanece
Server Component** — todo efeito nele (saturação, glow, giro da retícula) é
CSS puro via `group-hover`, sem necessidade de JS no cliente. Isso importa:
a página `/elenco/` lista os 56 personagens de uma vez, então manter o card
sem JS evita inflar o bundle dessa página.

Ao implementar qualquer trecho com Framer Motion, seguir a skill
`framer-motion` deste projeto.

## 3. Elenco — card do grid ("Dossiê Confidencial")

`site/components/ficha/CartaoPersonagem.tsx` ganha um prop novo,
`numero: number` — o "Student ID" do personagem, um inteiro sequencial de 1 a
56 baseado na ordem de `listarPersonagens()` (a mesma ordem que já define a
ordem de renderização hoje; não é uma numeração por jogo). `numero` é
obrigatório porque toda instância do card precisa dele — não há um valor
"sem numeração" que faça sentido visualmente.

`site/app/elenco/page.tsx` calcula um `Map<string, number>` uma vez, a partir
do array plano `listarPersonagens()` (`id → índice + 1`), antes de agrupar por
jogo — o agrupamento por jogo continua existindo para a exibição, mas a
numeração do Student ID ignora esse agrupamento e reflete só a ordem global.
Isso garante que o mesmo personagem tenha o mesmo número no grid e na ficha
individual (seção 5 usa o mesmo cálculo).

Markup e estilo do card:

- **4 marcas de canto**: pequenos `+` em cada vértice do card (SVG ou
  pseudo-elemento, `aria-hidden`, cor `text-line` em repouso).
- **Topo**: `[ STUDENT ID: #0XX ]` — `numero` formatado com zero-padding de 3
  dígitos (`#001`…`#056`), fonte mono, tracking largo.
- **Imagem do personagem**: fundo com `bg-halftone-pattern` (utilitário já
  existente); o sprite em si fica com `filter: grayscale(100%)` em repouso,
  transicionando para saturação total (`grayscale-0 saturate-150`) mais um
  glow rosa (`drop-shadow(0 0 15px rgba(255,0,127,0.6))`) no hover do card
  inteiro (`group-hover`), junto com um leve `scale-[1.02]` no wrapper da
  imagem — sutil de propósito, porque o grid é denso (até 5 colunas).
- **Retícula de mira**: mesmo SVG de crosshair já usado no header e na Faixa
  (`animate-spin-slow` só ativado no hover, igual ao padrão já corrigido na
  revisão final do sub-projeto 1 — nunca gira enquanto invisível), posicionada
  sobre o canto onde o rosto do personagem normalmente está.
- **Badge de talento**: reaproveita `clip-tab-slanted` para o corte chanfrado,
  mostrando `talento.pt` (o texto em inglês continua visível abaixo, menor,
  como já é hoje).
- **Carimbo `[ ULTIMATE FILE ]`**: badge sempre visível (não depende de
  hover), rotacionado (`-rotate-6`), borda `execution-pink`, fonte mono,
  posicionado no canto superior direito, sobrepondo levemente a borda do
  card. Todo personagem recebe o mesmo carimbo — não existe no schema de
  dados nenhum campo que diferencie "Ultimate File" de "Classified" de
  "Suspect", e inventar essa categorização não é este sub-projeto.
- **Marcador de tradução pendente**: a badge `?` atual vira uma tag pequena
  `PENDENTE` em `text-amber border-amber/40`, mesma posição (canto superior
  esquerdo) e mesmo comportamento (só aparece quando `!traducaoRevisada`).

## 4. Elenco — página de listagem

Toque leve: o cabeçalho da página (`ARQUIVO 01`, `ELENCO`, contagem de
alunos/jogos) já lê como rótulo de arquivo confidencial e não muda. O peso
visual desta sub-etapa está inteiramente no card (seção 3). O agrupamento por
jogo (`porJogo`) e os divisores de seção entre jogos continuam exatamente
como estão.

## 5. Ficha do personagem — painel esquerdo (carteirinha 3D)

Novo componente `site/components/ficha/CarteirinhaEstudante.tsx`, recebendo
`personagem: Personagem` e `numero: number` (mesmo cálculo da seção 3, via
`listarPersonagens().findIndex((p) => p.id === id) + 1` em
`site/app/elenco/[id]/page.tsx`).

- **Wrapper com perspectiva**: `style={{ perspective: '1000px' }}` no
  container externo; o card interno tem `rotateX`/`rotateY` amarrados à
  posição do mouse dentro do card via `onMouseMove` computando a posição
  relativa ao centro, passado por `useMotionValue` + `useSpring` (suaviza o
  movimento, evita tremor). Ao sair do card (`onMouseLeave`), os valores
  voltam a 0 com a mesma mola. Faixa de rotação: ±8 graus, suficiente para
  ler como "cartão físico inclinando", sem distorcer o conteúdo a ponto de
  ficar ilegível.
- **Brilho holográfico**: uma camada de gradiente diagonal
  (`background: linear-gradient(115deg, transparent 40%, rgba(255,255,255,.08)
  50%, transparent 60%)`) cuja posição (`background-position`) é derivada dos
  mesmos valores de tilt — desloca junto com a inclinação, dando a sensação de
  reflexo de superfície holográfica. `pointer-events-none`, `aria-hidden`.
- **Scanner a laser contínuo**: uma linha horizontal fina (`h-px`,
  `bg-alter-green`, com um glow leve via `box-shadow`) varrendo o retrato de
  cima para baixo em loop (`animate-laser`, nova keyframe — ver seção 7),
  gated pelo hook `useMovimentoReduzido` (seção 2): quando movimento reduzido
  está ativo, a linha **não é renderizada** (mesmo padrão das partículas da
  Fundação — não é só ocultar visualmente, é não montar o elemento).
- **Código de barras decorativo**: um SVG de barras verticais na base do
  card, larguras derivadas deterministicamente do `id` do personagem (mesma
  técnica das partículas do sub-projeto 1 — sorteado uma vez a partir de uma
  seed estável, não de `Math.random()`, para não haver divergência entre
  servidor e cliente). Puramente decorativo, não codifica dado real.
- **Selo de talento**: mantém o estilo itálico serifado já existente
  (`font-serif italic text-alter-green`) — já combina com "selo Ultimate" sem
  precisar mudar.
- **Retrato**: o sprite atual (com fundo gradiente `from-[#1B1B22]
  to-[#101014]`) continua, sem alteração — o scanner e o holográfico já dão
  o efeito "carteirinha de segurança" sem precisar redesenhar a imagem em si.

## 6. Ficha do personagem — painel direito (HUD de análise)

Uma decisão de tradução do prompt mestre: ele descreve "medidores digitais"
(barra de progresso de valor único), mas o que existe hoje
(`site/components/dados/Regua.tsx`) é um **histograma comparando o
personagem contra a distribuição de todo o elenco** — mais informativo, já
teste tado, já com o cálculo (`calcularDistribuicao`) já pronto e testado. Esta spec
mantém o mecanismo do histograma e aplica o tratamento visual do prompt por
cima, em vez de substituir por uma barra simples:

- **Título da seção**: troca "Como se compara" pelo texto exato do prompt
  mestre — `— // ANÁLISE DE DADOS DO ALUNO // —`.
- **Entrada animada por coluna**: cada coluna do histograma nasce com altura
  zero e cresce até o valor final via Framer Motion (`initial={{ scaleY: 0 }}
  animate={{ scaleY: 1 }}`, `transition={{ type: 'spring', stiffness: 120 }}`,
  origem inferior — `transformOrigin: 'bottom'`), com um pequeno atraso
  escalonado por índice de coluna (`delay: i * 0.02`) para o efeito de
  "preenchimento" ler como uma varredura da esquerda pra direita, não tudo de
  uma vez.
- **Cor continua semântica, não decorativa**: a lógica atual (`bom ? verde :
  vermelho`, dependendo se o valor do personagem é bom ou ruim dentro da
  distribuição) **não muda** — um gradiente rosa/ciano decorativo, como o
  prompt mestre sugere genericamente, apagaria a informação real que a cor
  carrega hoje (se aquele atributo é uma vantagem ou desvantagem para aquele
  personagem). A coluna ativa ganha só um glow sutil (`box-shadow` na mesma
  cor) para ler como "medidor digital iluminado", sem trocar o significado da
  cor.
- **Marcador de média**: a tag flutuante que já existe (`média {valor}`) vira
  uma pílula estilo HUD — fundo escuro, borda fina na cor do tema, fonte mono
  — mantendo o texto/posicionamento atual (linha vertical pontilhada na
  posição da média), sem mudar a semântica.
- Nenhuma mudança na assinatura de props de `Regua` nem no cálculo de
  `calcularDistribuicao`/`frasePosicao` — é puramente uma migração de
  apresentação por cima de uma lógica que já está correta e testada.

## 7. Utilitários CSS novos

Adicionados a `site/app/globals.css`, seguindo o padrão já estabelecido
(`@layer utilities` para clip-paths/backgrounds estáticos, bloco `@theme`
para animações, `@media (prefers-reduced-motion: reduce)` cobrindo toda
animação nova):

```css
@layer utilities {
  .clip-dossier-card {
    clip-path: polygon(
      0 0, calc(100% - 14px) 0, 100% 14px,
      100% 100%, 14px 100%, 0 calc(100% - 14px)
    );
  }
}

@theme {
  --animate-laser: laser-scan 3s ease-in-out infinite;

  @keyframes laser-scan {
    0% { top: 0%; opacity: 0; }
    15% { opacity: 1; }
    85% { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }
}
```

(`.clip-dossier-card` é usado no card do grid — seção 3 — como uma opção de
recorte de canto; se na implementação o efeito de 4 marcas `+` já cobrir a
identidade "dossiê" sem precisar do clip-path adicional, tudo bem descartar
esta classe — decisão de implementação, sem impacto no restante da spec.)

A `--animate-laser` não entra no `useMovimentoReduzido`/`prefers-reduced-motion`
via CSS puro, porque o elemento em si só é renderizado quando o hook
compartilhado (seção 2, seção 5) diz que o movimento não está reduzido —
mesmo padrão das partículas da Fundação (não renderizar, em vez de ocultar
uma animação que continuaria rodando escondida).

## 8. Testes e acessibilidade

- `CartaoPersonagem.test.tsx` (4 testes hoje) — as asserções de
  nome/talento/link/tradução-pendente continuam válidas; o teste existente
  precisa passar a fornecer `numero` na renderização (prop nova obrigatória),
  e ganha um teste novo confirmando que `#0XX` aparece formatado com
  zero-padding.
- `Regua.test.tsx` (7 testes hoje) — nenhuma asserção de comportamento muda
  (mesmo texto, mesmo `data-testid="coluna"`, mesma contagem, mesmo
  `role="img"` com o resumo para leitor de tela). Onde a migração para Client
  Component ou a animação de entrada exigir ajuste de setup de teste (ex.:
  `@testing-library/react` já flush a Framer Motion como flush qualquer
  effect — a ser confirmado na implementação), o teste é ajustado sem perder
  cobertura.
- `CamadaAmbiente.test.tsx` (4 testes hoje) — continuam passando sem
  alteração após a extração do hook para `lib/motion.ts` (mesmo
  comportamento, só muda de onde vem o import).
- Hook compartilhado (`lib/motion.ts`) — ganha seus próprios testes,
  migrados dos 2 casos relevantes que hoje vivem implicitamente dentro de
  `CamadaAmbiente.test.tsx` (renderiza/não renderiza baseado na preferência).
- `CarteirinhaEstudante.tsx` (novo) — testes cobrindo: renderização básica
  (nome, talento, sprite), o laser não aparece com `prefers-reduced-motion:
  reduce` mockado, o código de barras é estável entre duas montagens (mesma
  seed).
- Toda animação em loop nova (`laser-scan`) desliga sob `prefers-reduced-motion:
  reduce` — via não-renderização (seção 7), igual às partículas.
- Verificação manual no navegador antes de fechar o sub-projeto: tilt 3D não
  quebra em telas pequenas/touch (sem `mousemove`, o card simplesmente fica
  na posição de repouso — sem efeito, não com erro), contraste de texto do
  HUD sobre o histograma continua legível.

## 9. Riscos

| Risco | Mitigação |
|---|---|
| Tilt 3D em tempo real rodando `onMouseMove` em 56 páginas estáticas de personagem pode custar performance se implementado ingenuamente (recalculando em cada pixel de movimento sem throttle) | `useSpring` do Framer Motion já suaviza/anima os valores sem precisar de throttle manual — é o padrão recomendado pela skill `framer-motion` deste projeto para este exato cenário |
| Código de barras decorativo, se gerado com `Math.random()` em vez de seed estável, causa divergência servidor/cliente (mesmo erro de hidratação já corrigido na revisão final do sub-projeto 1) | Seed determinística a partir do `id` do personagem, mesma técnica já usada para as partículas da Fundação |
| Migrar `Regua` para Client Component pode mudar o momento em que o texto para leitor de tela (`role="img"`, `aria-label`) fica disponível, se a animação atrasar a montagem do atributo | O `aria-label` é estático (calculado no render, não depende da animação terminar) — a spring anima só a apresentação visual (altura da coluna), não a disponibilidade do texto de acessibilidade |
| Numeração "Student ID" divergir entre o grid e a ficha se calculada de formas diferentes nos dois lugares | Ambos calculam a partir da mesma função de ordem (`listarPersonagens()`), documentado explicitamente nas seções 3 e 5 |

## 10. Aberto para a implementação

1. Se `.clip-dossier-card` (seção 7) é realmente usado no card do grid ou se
   as 4 marcas de canto sozinhas já entregam a leitura "dossiê" — decisão
   visual de implementação, sem impacto no resto da spec.
2. Exata curva de mola (`stiffness`/`damping`) do tilt 3D e da entrada das
   colunas do histograma — a spec fixa a *categoria* de animação (spring) e a
   faixa de rotação (±8°), não os parâmetros exatos, que se ajustam olhando o
   resultado no navegador.
3. Se o SVG de código de barras é um componente próprio reutilizável ou
   inline dentro de `CarteirinhaEstudante` — decisão de implementação, sem
   impacto visual.
