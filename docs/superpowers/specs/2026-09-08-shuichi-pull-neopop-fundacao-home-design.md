# Shuichi Pull — Overhaul Neo-Pop: Fundação + Home (design)

Data: 2026-09-08
Status: aguardando revisão

## 1. O que é

O site tem hoje uma identidade visual deliberada, documentada na Fase 1
(`docs/superpowers/specs/2026-09-04-shuichi-pull-fase1-design.md`): "o site é
papel, o Alter Ego é a única coisa digital dentro dele" — creme, tinta preta,
teal, carimbo vermelho, trama de pontos; o verde fósforo CRT existia
exclusivamente dentro da janela do Alter Ego, de propósito, para não combinar
com o resto.

Esta spec substitui essa direção por outra, igualmente deliberada: um sistema
visual "neo-pop Danganronpa" — fundo escuro, rosa/ciano/verde neon, scanlines,
halftone, motion contínuo em loop, e uma identidade própria por aba. É uma
troca de direção consciente e confirmada, não um acidente — o bege/creme
desaparece por completo, sem sobreviver nem como metáfora.

### Escopo — decomposição do projeto inteiro

O overhaul cobre seis abas, grande demais para uma spec só. Esta é a
**primeira** de seis, cobrindo a fundação compartilhada (tokens, camada de
ambiência, header) e a Home — a página onde a nova linguagem visual é provada
em escala pequena antes de se espalhar. As outras cinco (Elenco+Perfil, Itens,
Mecânicas, Mapa) são sub-projetos futuros, cada um com sua própria spec.

Dentro desta spec: tokens de cor, utilitários CSS (clip-paths, scanlines,
halftone, keyframes), a camada de ambiência global, o header/navegação, e a
Home (hero + faixas numeradas + CTA).

Fora desta spec: qualquer outra página (Elenco, Perfil, Itens, Mecânicas,
Mapa, FAQ, Eventos, Códigos, `/adm/*`) — essas continuam com o visual atual
até seus próprios sub-projetos.

## 2. Abordagem técnica: CSS puro vs. Framer Motion

Duas categorias de animação, duas ferramentas:

- **CSS puro (keyframes + Tailwind)** para loops fixos e determinísticos:
  scanlines, pulso da vinheta, halftone respirando, o marquee de fundo, o giro
  da retícula, o sweep do laser (quando aparecer em sub-projetos futuros). Sem
  JS, roda fora da main thread, é o padrão que o tremor do Alter Ego já usa
  hoje (`app/globals.css`).
- **Framer Motion** (nova dependência) só onde spring physics ou aleatoriedade
  por instância compensam o peso: as partículas flutuantes (posição/atraso
  sorteados por partícula), o pop-in do título da Home, e — em sub-projetos
  futuros — as barras de status com spring e o tilt 3D do crachá.

Ao implementar qualquer componente Framer Motion, seguir a skill
`framer-motion` deste projeto para os padrões de performance da biblioteca.

## 3. Tokens de design

Novo bloco `@theme` em `site/app/globals.css`, substituindo os tokens de cor
atuais (`--color-bg`, `--color-sur`, `--color-line`, `--color-papel`,
`--color-tinta`, `--color-teal`, `--color-teal-escuro`, `--color-red`,
`--color-dim`) — `--color-ego-claro`/`--color-ego-escuro` continuam existindo
sem alteração de valor, já que o verde do Alter Ego passa a ser reutilizado
como cor de sistema:

```css
@theme {
  --color-bg: #08090D;
  --color-sur: #101019;
  --color-line: #22222E;
  --color-execution-pink: #FF007F;
  --color-cyber-cyan: #00F0FF;
  --color-alter-green: #00FF66;
  --color-amber: #F59E0B;
  --color-dim: #8A8A9A;
  --color-ego-claro: #4FA030;
  --color-ego-escuro: #256512;
}
```

Duas decisões confirmadas:

1. **O verde do Alter Ego (`--color-alter-green: #00FF66`) vira cor do
   sistema geral**, não mais exclusiva da janela dele — a Mecânicas (sub-projeto
   futuro) herda a mesma linguagem CRT.
2. **Rosa (Execution Pink) e ciano (Cyber Cyan) são as duas cores de destaque
   globais** — CTAs, hover, bordas ativas — no lugar do teal de hoje. Cada aba
   pode pesar mais para um lado (Elenco mais rosa, Mapa mais ciano) sem que
   isso vire uma regra rígida nesta spec — os sub-projetos futuros decidem o
   peso exato por aba.

`--color-papel`, `--color-tinta`, `--color-teal`, `--color-teal-escuro`,
`--color-red` são removidos do tema. Qualquer classe Tailwind que os referencie
(`bg-papel`, `text-teal`, etc.) deixa de compilar — isso é o mecanismo que
força a atualização de todo componente que ainda usa a paleta antiga, dentro
do escopo desta spec (Header, Home, Faixa). Componentes fora do escopo (Elenco,
Itens, Mecânicas, Mapa, `/adm/*`, FAQ, Eventos, Códigos) ainda referenciam a
paleta antiga e **vão quebrar o build** até seus próprios sub-projetos
migrarem — ver seção 9 (riscos) para como isso é tratado nesta primeira etapa.

## 4. Camada de ambiência global

Novo componente `site/components/ambiente/CamadaAmbiente.tsx`, renderizado uma
vez em `site/app/layout.tsx`, `fixed inset-0 pointer-events-none z-50` — acima
de todo o conteúdo visualmente, mas nunca capturando clique ou foco de
teclado (`pointer-events-none` cobre isso; não precisa de `inert` porque não
tem nenhum elemento focável dentro).

Camadas, de trás para frente:

1. **Vinheta radial** — `radial-gradient(circle at center, transparent 60%, rgba(0,0,0,0.8) 100%)`, estática.
2. **Scanlines** — `repeating-linear-gradient` horizontal sutil, com um pulso
   de opacidade a cada 8s (`crt-flicker`, CSS puro).
3. **Halftone respirando** — grid de pontos radiais com a keyframe
   `ambient-glow` (opacidade 0.15↔0.28, escala 1↔1.03, 10s, CSS puro).
4. **Marquee de fundo** — faixa de texto `NON-STOP DEBATE // TRUTH BULLET //
   SHINRI TRIAL // CLASS TRIAL PROTOCOL //` em `text-white/[0.02]`,
   `font-black uppercase text-8xl tracking-widest whitespace-nowrap`,
   deslizando via `animate-marquee-slow` (35s linear infinite, CSS puro,
   texto duplicado para loop sem costura).
5. **Partículas flutuantes** — 12 a 16 elementos (losango, `+`, ponto),
   renderizados via Framer Motion: posição inicial, atraso e duração
   sorteados uma vez no `useEffect` do mount (não a cada render), subindo
   lentamente com `repeat: Infinity`.

Todas as camadas com animação (2-5) desligam sob `prefers-reduced-motion:
reduce` — mesmo padrão já usado para o tremor do Alter Ego
(`[data-tremendo='sim'] { animation: none !important; }`) — a vinheta estática
(1) não é afetada, por não ter animação.

**Cuidado de legibilidade**: o site tem bastante texto pequeno (`9px`/`10px`
mono). A opacidade de cada camada fica baixa por design (halftone 15-28%,
scanline sutil, vinheta só nas bordas), e antes de considerar este sub-projeto
concluído, uma verificação manual no navegador confirma contraste de texto
real numa página com bastante texto pequeno — não é uma garantia teórica,
é um passo de verificação explícito no plano de implementação.

## 5. Header / navegação

`site/components/alter-ego/BarraEgo.tsx` — muda de aparência, a lógica
existente (busca em tempo real, esconder ao rolar, janela flutuante,
persistência) fica intacta:

- Links de seção renumerados: `01. ELENCO`, `02. ITENS`, `03. MAPA`, etc. —
  mesma numeração que as Faixas da Home já usam, agora também no header.
- Hover num link: uma retícula de mira SVG pequena gira atrás do texto
  (`animate-spin-slow`, 12s linear infinite, CSS puro).
- Busca ganha moldura visual de terminal militar (borda, fonte mono,
  cores do novo tema) — o comportamento de filtro em tempo real não muda.
- **Atalho `Ctrl+K`/`Cmd+K` (novo comportamento, não só visual)**: foca o
  campo de busca em qualquer página, mesmo com a barra escondida — se a
  janela flutuante do Alter Ego estiver fechada, o atalho a abre (mesmo
  mecanismo do clique na bolinha) e foca o campo dentro dela. Se já estiver
  aberta ou a barra do topo estiver visível, só foca o campo existente.

## 6. Home — Hero e Faixas

**Hero** (`site/app/page.tsx`): título "O caso está aberto." ganha peso
extra-black, rotação leve (`-rotate-1`), e a palavra "ABERTO." em
`text-execution-pink` com `text-shadow: 4px 4px 0 var(--color-cyber-cyan)`.
Entrada em pop-in via Framer Motion (`scale` de 0.8→1.05→1, sem rotação de
entrada adicional além da rotação estática do título) — roda uma vez ao
montar, não em loop.

**Faixas numeradas** (`site/components/layout/Faixa.tsx`, usado hoje só pela
Home — confirmado, nenhuma outra página o importa): o corte reto atual vira
diagonal via `clip-path: polygon(0 0, 100% 0, 88% 100%, 0% 100%)`. As três
variantes (`teal`/`papel`/`escura`) são substituídas por variantes do novo
tema (pink, cyan, escura-com-borda-verde — nomes exatos definidos na
implementação). Hover: a faixa desliza lateralmente (`translateX(8px)`) e uma
retícula de mira gira no canto, mesmo padrão do header.

**CTA "NUNCA JOGUEI — COMEÇAR AQUI"**: borda branca grossa, sombra sólida
deslocada em pink (`shadow-[5px_5px_0px_var(--color-execution-pink)]`), e
feedback tátil de clique (`active:translate-x-1 active:translate-y-1
active:shadow-none`) — tudo CSS/Tailwind, sem Framer Motion.

## 7. Utilitários CSS novos

Adicionados a `site/app/globals.css`, dentro de `@layer utilities` e blocos
`@theme`/`@keyframes` conforme o padrão já usado pelo tremor:

```css
@layer utilities {
  .clip-tab-slanted {
    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
  }
  .clip-hero-diagonal {
    clip-path: polygon(0 0, 100% 0, 92% 100%, 0% 100%);
  }
  .crt-lines {
    background: repeating-linear-gradient(
      to bottom, transparent 0px, transparent 2px,
      rgba(0, 0, 0, 0.45) 2px, rgba(0, 0, 0, 0.45) 4px
    );
  }
  .bg-halftone-pattern {
    background-image: radial-gradient(rgba(255, 255, 255, 0.12) 1.5px, transparent 1.5px);
    background-size: 12px 12px;
  }
}

@theme {
  --animate-ambient-glow: ambient-glow 10s ease-in-out infinite;
  --animate-spin-slow: spin-slow 12s linear infinite;
  --animate-marquee-slow: marquee-slow 35s linear infinite;

  @keyframes ambient-glow {
    0%, 100% { opacity: 0.15; transform: scale(1); }
    50% { opacity: 0.28; transform: scale(1.03); }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes marquee-slow {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }
}

@media (prefers-reduced-motion: reduce) {
  .animate-ambient-glow, .animate-spin-slow, .animate-marquee-slow {
    animation: none !important;
  }
}
```

(`clip-dossier-card`, o sweep do laser e as keyframes específicas de outras
abas do prompt original ficam fora desta spec — entram no sub-projeto que
efetivamente os usa, para não acumular CSS morto aqui.)

## 8. Testes e acessibilidade

- Testes existentes que verificam **comportamento** (`BarraEgo.test.tsx` — 8
  testes hoje: busca, esconder ao rolar, janela flutuante, persistência) não
  podem regredir. Onde o markup mudar o suficiente para exigir um seletor
  novo, o teste é atualizado, mas a asserção de comportamento continua a
  mesma.
- `Faixa.test.tsx` e os testes da Home são atualizados para o novo markup,
  mesma regra.
- O atalho `Ctrl+K` é comportamento novo → TDD normal, teste escrito antes da
  implementação.
- Toda animação em loop (`ambient-glow`, `spin-slow`, `marquee-slow`, o pulso
  de scanline, as partículas) desliga sob `prefers-reduced-motion: reduce`.
- Verificação manual de contraste no navegador antes de considerar o
  sub-projeto pronto (ver seção 4).

## 9. Riscos

| Risco | Mitigação |
|---|---|
| Remover os tokens antigos (`papel`, `teal`, etc.) quebra o build, já que páginas fora do escopo desta spec ainda os referenciam | Aceito conscientemente: o plano de implementação inclui, como último passo, uma varredura de todo o código-fonte por classes `*-papel`/`*-teal`/`*-tinta`/`*-red` fora dos arquivos já migrados (Header, Home, Faixa) e as substitui por um equivalente neutro do novo tema (ex.: `dim`/`line`) — não uma migração visual completa dessas páginas (isso é trabalho dos sub-projetos futuros), só o suficiente para o build voltar a compilar. Alternativa descartada: manter os tokens antigos como alias temporário — rejeitada por deixar duas paletas competindo no mesmo arquivo de tema, o que era exatamente o estado confuso que este overhaul busca eliminar. |
| Camada de ambiência prejudicar legibilidade de texto pequeno | Opacidades baixas por design + verificação manual de contraste antes de fechar o sub-projeto (seção 4, 8) |
| Framer Motion aumentar o peso do bundle do cliente | Uso restrito a partículas + pop-in do hero nesta spec; tudo que é loop fixo fica em CSS puro (seção 2) |
| `Ctrl+K` conflitar com atalhos nativos do navegador em algum SO/navegador | `preventDefault()` no handler, testado manualmente em pelo menos Chrome antes de fechar |

## 10. Aberto para a implementação

1. Nomes exatos das três variantes de `Faixa` no novo tema (pink/cyan/escura
   é a intenção; a implementação escolhe os nomes de prop).
2. Se a retícula de mira é um único SVG reutilizado (header + Faixa) ou dois
   componentes separados — decisão de implementação, sem impacto visual.
3. Lista exata de classes `*-papel`/`*-teal`/etc. a substituir fora do
   escopo desta spec (seção 9) — levantada no início da implementação via
   busca no código, não adivinhada aqui.
