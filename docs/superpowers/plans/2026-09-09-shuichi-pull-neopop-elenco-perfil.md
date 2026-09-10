# Shuichi Pull — Overhaul Neo-Pop: Elenco + Ficha do Personagem Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesenhar a lista de Elenco (cards estilo dossiê confidencial) e a ficha individual de cada personagem (carteirinha 3D com scanner a laser + HUD de análise comparativa) na linguagem visual neo-pop já estabelecida.

**Architecture:** Card do grid continua Server Component (todo efeito é CSS `group-hover`); a carteirinha da ficha e o histograma comparativo (`Regua`) viram Client Components para Framer Motion (tilt 3D com spring, entrada animada por coluna). Um hook de `prefers-reduced-motion` hoje privado à camada de ambiência é extraído para uso compartilhado, já que este plano introduz o segundo efeito em loop contínuo do site (o scanner a laser).

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Vitest + Testing Library.

**Spec:** docs/superpowers/specs/2026-09-09-shuichi-pull-neopop-elenco-perfil-design.md

## Global Constraints

- Português (pt-BR) para todo identificador novo, texto de teste, texto de UI e comentário.
- Toda função/componente novo ganha teste Vitest; nenhum teste existente pode regredir sem justificativa explícita.
- `npx vitest run`, `npx eslint .`, `npx tsc --noEmit` e `npm run build` ficam limpos ao final de **cada** tarefa — não só na verificação final. Em sub-projetos anteriores, 2 bugs reais (um componente recriado a cada render, um hook com nome inválido) só foram achados porque o `eslint` rodou pela primeira vez na última tarefa; este plano roda `eslint` desde a primeira tarefa para pegar esse tipo de problema cedo.
- Toda animação em loop nova respeita `prefers-reduced-motion: reduce` — para elementos JS/Framer Motion, via não-renderização condicional (mesmo padrão das partículas da camada de ambiência), não apenas ocultação visual.
- Nenhum placeholder, TODO ou implementação parcial.

---

### Task 1: Extrair hook compartilhado de movimento reduzido

**Files:**
- Create: `site/lib/motion.ts`
- Create: `site/lib/motion.test.ts`
- Modify: `site/components/ambiente/CamadaAmbiente.tsx:1-29`

**Interfaces:**
- Produces: `useMovimentoReduzido(): boolean`, exportado de `@/lib/motion` — consumido pela Task 5 (`CarteirinhaEstudante`).
- Consumes: nada de outra tarefa.

- [ ] **Step 1: Escrever o teste que falha**

Criar `site/lib/motion.test.ts`:

```ts
import { describe, it, expect, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMovimentoReduzido } from './motion';

function mockarMovimentoReduzido(reduzido: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduzido && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

describe('useMovimentoReduzido', () => {
  afterEach(() => {
    mockarMovimentoReduzido(false);
  });

  it('fica em true quando o usuário pediu menos movimento', () => {
    mockarMovimentoReduzido(true);
    const { result } = renderHook(() => useMovimentoReduzido());
    expect(result.current).toBe(true);
  });

  it('fica em false quando o usuário não pediu menos movimento', () => {
    mockarMovimentoReduzido(false);
    const { result } = renderHook(() => useMovimentoReduzido());
    expect(result.current).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npx vitest run lib/motion.test.ts`
Expected: FALHA — `./motion` não existe ainda.

- [ ] **Step 3: Implementar o hook**

Criar `site/lib/motion.ts`:

```ts
'use client';

import { useEffect, useState } from 'react';

// Não usamos o `useReducedMotion` do framer-motion: ele lê `window.matchMedia`
// uma única vez, em um singleton de módulo (`motion-dom`), e não reavalia em
// montagens seguintes — isso quebra qualquer teste que mocka `matchMedia` por
// caso de teste. Também não podemos ler a preferência direto num inicializador
// de `useState`: o servidor sempre renderiza como se o movimento não fosse
// reduzido, e se o cliente decidisse diferente já no primeiro render, o React
// acharia um mismatch de hidratação. Por isso começamos sempre em `false`
// (igual ao servidor) e só ajustamos para o valor real dentro de um
// `useEffect`, depois que a hidratação já terminou.
export function useMovimentoReduzido() {
  const [reduzido, setReduzido] = useState(false);
  useEffect(() => {
    // A preferencia so pode ser lida no cliente; comeca em `false` (linha
    // acima) para bater com o servidor e evitar mismatch de hidratacao.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduzido(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);
  return reduzido;
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npx vitest run lib/motion.test.ts`
Expected: PASS (2 testes).

- [ ] **Step 5: Atualizar `CamadaAmbiente.tsx` para usar o hook compartilhado**

Editar `site/components/ambiente/CamadaAmbiente.tsx`. Remover completamente o
bloco do hook local (linhas 11-23 do arquivo atual — o comentário e a função
`useMovimentoReduzido`) e trocar os imports do topo. De:

```tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
```

Para:

```tsx
import { motion } from 'framer-motion';
import { useMovimentoReduzido } from '@/lib/motion';
```

O resto do arquivo (o array `PARTICULAS`, o componente `CamadaAmbiente`,
o JSX) não muda — só a origem do hook.

- [ ] **Step 6: Confirmar que os testes existentes de `CamadaAmbiente` continuam passando sem alteração**

Run: `npx vitest run components/ambiente/CamadaAmbiente.test.tsx`
Expected: PASS (4 testes, arquivo de teste **não modificado**).

- [ ] **Step 7: Rodar a suíte completa, eslint, tsc e build**

```bash
npx vitest run
npx eslint .
npx tsc --noEmit
npm run build
```

Expected: suíte completa passa; eslint sem erros novos; tsc limpo; build ok.

- [ ] **Step 8: Commit**

```bash
git add lib/motion.ts lib/motion.test.ts components/ambiente/CamadaAmbiente.tsx
git commit -m "refactor: extrai hook de movimento reduzido pra lib/motion, compartilhado entre camada de ambiencia e ficha do personagem"
```

---

### Task 2: `CartaoPersonagem` — card do grid em formato de dossiê

**Files:**
- Modify: `site/components/ficha/CartaoPersonagem.tsx`
- Modify: `site/components/ficha/CartaoPersonagem.test.tsx`

**Interfaces:**
- Consumes: nada de outra tarefa.
- Produces: `CartaoPersonagem({ personagem, numero }: { personagem: Personagem; numero: number })` —
  `numero` é um prop novo e obrigatório. Consumido pela Task 3
  (`app/elenco/page.tsx`).

- [ ] **Step 1: Escrever os testes que falham**

Substituir `site/components/ficha/CartaoPersonagem.test.tsx` por:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CartaoPersonagem } from './CartaoPersonagem';
import type { Personagem } from '@/lib/schema';

const chihiro: Personagem = {
  id: 'chihiro-fujisaki',
  nome: 'Chihiro Fujisaki',
  talento: { pt: 'Programação Suprema', en: 'Ultimate Programmer' },
  descricao: { pt: 'Frágil e tímida.', en: 'Fragile and shy.' },
  jogo: 'Danganronpa: Trigger Happy Havoc',
  velocidade: 180, mochila: 13, percepcao: 9, vida: 100,
  etiquetas: [], sprite: '/sprites/chihiro.webp', traducaoRevisada: false,
};

describe('CartaoPersonagem', () => {
  it('mostra nome e talento em português', () => {
    render(<CartaoPersonagem personagem={chihiro} numero={1} />);
    expect(screen.getByText('Chihiro Fujisaki')).toBeInTheDocument();
    expect(screen.getByText('Programação Suprema')).toBeInTheDocument();
  });

  it('mostra o talento em inglês junto, como manda a spec', () => {
    render(<CartaoPersonagem personagem={chihiro} numero={1} />);
    expect(screen.getByText('Ultimate Programmer')).toBeInTheDocument();
  });

  // Fora do build o next/link normaliza a barra final: o trailingSlash do
  // next.config.ts nao vale no jsdom. No site exportado a barra esta la.
  it('leva para a ficha do personagem', () => {
    render(<CartaoPersonagem personagem={chihiro} numero={1} />);
    expect(screen.getByRole('link').getAttribute('href')).toMatch(
      /^\/elenco\/chihiro-fujisaki\/?$/
    );
  });

  it('marca a tradução não revisada', () => {
    render(<CartaoPersonagem personagem={chihiro} numero={1} />);
    expect(screen.getByTitle(/tradução não revisada/i)).toHaveTextContent('PENDENTE');
  });

  it('mostra o Student ID com zero-padding de 3 dígitos', () => {
    render(<CartaoPersonagem personagem={chihiro} numero={7} />);
    expect(screen.getByText('[ STUDENT ID: #007 ]')).toBeInTheDocument();
  });

  it('não corta o Student ID quando o número já tem 3 dígitos', () => {
    render(<CartaoPersonagem personagem={chihiro} numero={56} />);
    expect(screen.getByText('[ STUDENT ID: #056 ]')).toBeInTheDocument();
  });

  it('sempre mostra o carimbo ULTIMATE FILE', () => {
    render(<CartaoPersonagem personagem={chihiro} numero={1} />);
    expect(screen.getByText('ULTIMATE FILE')).toBeInTheDocument();
  });

  it('a retícula de mira do hover é escondida do leitor de tela', () => {
    render(<CartaoPersonagem personagem={chihiro} numero={1} />);
    expect(screen.getByTestId('reticula-cartao')).toHaveAttribute('aria-hidden', 'true');
  });
});
```

- [ ] **Step 2: Rodar os testes e confirmar que falham**

Run: `npx vitest run components/ficha/CartaoPersonagem.test.tsx`
Expected: FALHA — `numero` não existe no componente ainda; textos novos (Student ID, ULTIMATE FILE, PENDENTE, retícula) não existem.

- [ ] **Step 3: Implementar**

Substituir `site/components/ficha/CartaoPersonagem.tsx`:

```tsx
import Link from 'next/link';
import type { Personagem } from '@/lib/schema';

export function CartaoPersonagem(
  { personagem: p, numero }: { personagem: Personagem; numero: number }
) {
  const studentId = String(numero).padStart(3, '0');

  return (
    <Link
      href={`/elenco/${p.id}/`}
      className="group relative block overflow-hidden rounded-[4px] border border-line bg-sur transition-colors hover:border-alter-green"
    >
      <span aria-hidden className="pointer-events-none absolute left-1 top-0.5 font-mono text-[9px] leading-none text-line">+</span>
      <span aria-hidden className="pointer-events-none absolute right-1 top-0.5 font-mono text-[9px] leading-none text-line">+</span>
      <span aria-hidden className="pointer-events-none absolute bottom-0.5 left-1 font-mono text-[9px] leading-none text-line">+</span>
      <span aria-hidden className="pointer-events-none absolute bottom-0.5 right-1 font-mono text-[9px] leading-none text-line">+</span>

      <span className="absolute right-1.5 top-1.5 z-10 -rotate-6 rounded-[2px] border border-execution-pink px-1 py-px font-mono text-[6px] font-bold tracking-[.08em] text-execution-pink">
        ULTIMATE FILE
      </span>

      <p className="px-2 pt-2 font-mono text-[7px] tracking-[.1em] text-dim">
        [ STUDENT ID: #{studentId} ]
      </p>

      <div className="relative mt-1 flex h-32 items-end justify-center overflow-hidden bg-bg bg-halftone-pattern">
        <svg data-testid="reticula-cartao" aria-hidden viewBox="0 0 24 24"
          className="pointer-events-none absolute right-2 top-2 z-10 h-4 w-4 opacity-0 text-execution-pink transition-opacity group-hover:opacity-100 group-hover:animate-spin-slow">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1" />
          <line x1="12" y1="0" x2="12" y2="6" stroke="currentColor" strokeWidth="1" />
          <line x1="12" y1="18" x2="12" y2="24" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1" />
          <line x1="18" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="1" />
        </svg>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.sprite}
          alt=""
          className="h-full object-contain object-bottom grayscale transition-all duration-300 group-hover:scale-[1.02] group-hover:grayscale-0 group-hover:saturate-150 group-hover:drop-shadow-[0_0_15px_rgba(255,0,127,0.6)]"
        />
      </div>

      <div className="p-2">
        <p className="text-[12px] font-bold leading-tight text-[#D6D6E0]">{p.nome}</p>
        <p className="clip-tab-slanted mt-1 inline-block bg-ego-escuro px-1.5 py-px text-[10px] text-alter-green">
          {p.talento.pt}
        </p>
        <p className="mt-0.5 font-mono text-[8px] text-dim">{p.talento.en}</p>
      </div>

      {!p.traducaoRevisada && (
        <span
          title="Tradução não revisada por um ADM"
          className="absolute left-1.5 top-1.5 z-10 rounded-[2px] border border-amber/40 px-1 font-mono text-[7px] text-amber"
        >
          PENDENTE
        </span>
      )}
    </Link>
  );
}
```

- [ ] **Step 4: Rodar os testes e confirmar que passam**

Run: `npx vitest run components/ficha/CartaoPersonagem.test.tsx`
Expected: PASS (8 testes).

- [ ] **Step 5: Rodar a suíte completa, eslint, tsc e build**

```bash
npx vitest run
npx eslint .
npx tsc --noEmit
npm run build
```

Expected: `app/elenco/page.tsx` (Task 3, ainda não feita) falha o tsc/build
porque chama `<CartaoPersonagem personagem={p} />` sem `numero` — esperado e
corrigido na Task 3. Confirme que o **único** lugar que quebra é
`app/elenco/page.tsx`; qualquer outra falha é um problema real, pare e
investigue.

- [ ] **Step 6: Commit**

```bash
git add components/ficha/CartaoPersonagem.tsx components/ficha/CartaoPersonagem.test.tsx
git commit -m "feat: CartaoPersonagem vira ficha de dossie confidencial, com student id e carimbo"
```

---

### Task 3: `app/elenco/page.tsx` — numeração global do Student ID

**Files:**
- Modify: `site/app/elenco/page.tsx`
- Create: `site/app/elenco/page.test.tsx`

**Interfaces:**
- Consumes: `CartaoPersonagem({ personagem, numero })` (Task 2).
- Produces: nada consumido por tarefas futuras.

- [ ] **Step 1: Escrever o teste que falha**

Criar `site/app/elenco/page.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/dados', () => ({
  listarPersonagens: vi.fn().mockReturnValue([
    {
      id: 'aaa', nome: 'Aaa', talento: { pt: 'X', en: 'X' },
      descricao: { pt: 'd', en: 'd' }, jogo: 'Jogo B',
      velocidade: 100, mochila: 1, percepcao: 1, vida: 1,
      etiquetas: [], sprite: '/s.webp', traducaoRevisada: true,
    },
    {
      id: 'bbb', nome: 'Bbb', talento: { pt: 'Y', en: 'Y' },
      descricao: { pt: 'd', en: 'd' }, jogo: 'Jogo A',
      velocidade: 100, mochila: 1, percepcao: 1, vida: 1,
      etiquetas: [], sprite: '/s.webp', traducaoRevisada: true,
    },
  ]),
}));

import PaginaElenco from './page';

describe('Página de Elenco', () => {
  it('numera cada personagem pela ordem global de listarPersonagens, não pelo agrupamento por jogo', () => {
    render(<PaginaElenco />);
    // "Aaa" é o primeiro no array (Jogo B) e "Bbb" é o segundo (Jogo A) —
    // se a numeração seguisse o agrupamento por jogo (que reordena "Jogo A"
    // antes de "Jogo B" na exibição), a numeração bateria errado.
    expect(screen.getByText('[ STUDENT ID: #001 ]')).toBeInTheDocument();
    expect(screen.getByText('[ STUDENT ID: #002 ]')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npx vitest run app/elenco/page.test.tsx`
Expected: FALHA — `app/elenco/page.tsx` ainda não passa `numero` para `CartaoPersonagem` (erro de tipo/prop faltando).

- [ ] **Step 3: Implementar**

Substituir `site/app/elenco/page.tsx`:

```tsx
import { listarPersonagens } from '@/lib/dados';
import { CartaoPersonagem } from '@/components/ficha/CartaoPersonagem';

export const metadata = { title: 'Elenco — Shuichi Pull' };

export default function PaginaElenco() {
  const personagens = listarPersonagens();

  // O "Student ID" reflete a ordem global do elenco, não o agrupamento por
  // jogo abaixo — a ficha individual (app/elenco/[id]/page.tsx) calcula o
  // mesmo número a partir da mesma ordem, então os dois lugares sempre
  // concordam (ver spec, seção 3 e 5).
  const numeroPorId = new Map(personagens.map((p, i) => [p.id, i + 1]));

  const porJogo = new Map<string, typeof personagens>();
  for (const p of personagens) {
    porJogo.set(p.jogo, [...(porJogo.get(p.jogo) ?? []), p]);
  }

  return (
    <div className="px-4 py-8">
      <p className="font-mono text-[8px] tracking-[.2em] text-dim">ARQUIVO 01</p>
      <h1 className="mb-1 text-4xl font-black tracking-tight text-[#F2F2F5]">ELENCO</h1>
      <p className="mb-8 text-[11px] text-dim">
        {personagens.length} alunos, de {porJogo.size} jogos.
      </p>

      {[...porJogo.entries()].map(([jogo, lista]) => (
        <section key={jogo} className="mb-10">
          <h2 className="mb-3 flex items-center gap-2 font-serif text-[13px] tracking-[.16em] text-[#B9B9C6]">
            <span className="h-px flex-1 bg-line" />
            {jogo}
            <span className="h-px flex-1 bg-line" />
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {lista.map((p) => (
              <CartaoPersonagem key={p.id} personagem={p} numero={numeroPorId.get(p.id)!} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npx vitest run app/elenco/page.test.tsx`
Expected: PASS (1 teste).

- [ ] **Step 5: Rodar a suíte completa, eslint, tsc e build**

```bash
npx vitest run
npx eslint .
npx tsc --noEmit
npm run build
```

Expected: tudo limpo — `app/elenco/page.tsx` agora passa `numero`
corretamente, o erro esperado da Task 2 (Step 5) está resolvido.

- [ ] **Step 6: Commit**

```bash
git add app/elenco/page.tsx app/elenco/page.test.tsx
git commit -m "feat: pagina de elenco numera cada card pela ordem global do elenco"
```

---

### Task 4: `Regua` — entrada animada em mola + estilo HUD

**Files:**
- Modify: `site/components/dados/Regua.tsx`

**Interfaces:**
- Consumes: nada de outra tarefa.
- Produces: mesma assinatura de props de hoje — `Regua({ nome, valor, unidade, valores, passo, maiorEhMelhor, sentido })`, sem mudança. Consumido pela Task 6 (`app/elenco/[id]/page.tsx`, já consumia antes, continua igual).

Este componente não ganha teste novo: o comportamento e as asserções de
`Regua.test.tsx` (7 testes) não mudam — é puramente uma migração de
apresentação por cima de uma lógica já testada (ver spec, seção 6). Os
próprios 7 testes existentes são a verificação de que nada quebrou.

- [ ] **Step 1: Confirmar que os testes atuais passam antes de mexer**

Run: `npx vitest run components/dados/Regua.test.tsx`
Expected: PASS (7 testes) — ponto de partida confirmado antes da mudança.

- [ ] **Step 2: Implementar**

Substituir `site/components/dados/Regua.tsx`:

```tsx
'use client';

import { motion } from 'framer-motion';
import { calcularDistribuicao, frasePosicao } from '@/lib/distribuicao';

type Props = {
  nome: string;
  valor: number;
  unidade: string;
  valores: number[];
  passo?: number;
  maiorEhMelhor: boolean;
  sentido: string;
};

export function Regua({ nome, valor, unidade, valores, passo, maiorEhMelhor, sentido }: Props) {
  const d = calcularDistribuicao(valores, valor, passo);
  const frase = frasePosicao(d, maiorEhMelhor);
  const pico = Math.max(...d.colunas.map((c) => c.quantidade), 1);

  // Verde quando é bom estar onde está, vermelho quando não é.
  const bom = maiorEhMelhor ? d.acima <= d.abaixo : d.abaixo <= d.acima;
  const cor = bom ? 'var(--color-alter-green)' : 'var(--color-alerta)';

  const posMedia = ((d.media - d.min) / Math.max(d.max - d.min, 1)) * 100;
  const resumo =
    `${nome}: ${valor} ${unidade}. ${frase}. Média do elenco: ${Math.round(d.media)}. ` +
    `Escala de ${d.min} a ${d.max}.`;

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-baseline gap-2">
        <span className="font-mono text-[10px] font-bold tracking-[.09em] text-[#D6D6E0]">{nome}</span>
        <span className="valor-grande text-[19px] font-black leading-none" style={{ color: cor }}>{valor}</span>
        <span className="font-mono text-[8px] text-dim">{unidade}</span>
        <span className="ml-auto font-mono text-[8px] text-dim">{frase}</span>
      </div>

      <div className="relative" role="img" aria-label={resumo}>
        <div className="flex h-[38px] items-end gap-[3px] overflow-x-auto" aria-hidden>
          {d.colunas.map((c, i) => (
            <motion.div
              key={c.valor}
              data-testid="coluna"
              data-ativa={c.ehOValor}
              title={`${c.valor} ${unidade}: ${c.quantidade} aluno(s)`}
              className="relative min-h-px flex-1 origin-bottom rounded-t-[1px]"
              style={{
                height: `${Math.max((c.quantidade / pico) * 100, 1)}%`,
                background: c.ehOValor ? cor : '#22222C',
                boxShadow: c.ehOValor ? `0 0 8px ${cor}` : undefined,
              }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ type: 'spring', stiffness: 120, delay: i * 0.02 }}
            >
              {c.ehOValor && (
                <span
                  className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-[2px] px-1.5 py-px font-mono text-[7.5px] font-bold"
                  style={{ background: cor, color: '#0A0A0D' }}
                >
                  {c.valor} ← aqui
                </span>
              )}
            </motion.div>
          ))}
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute -top-1 bottom-0 w-px bg-white/25"
          style={{ left: `${posMedia}%` }}
        >
          <span className="absolute -top-3 left-1 whitespace-nowrap rounded-[2px] border border-line bg-[#0A0A0D] px-1 font-mono text-[7px] text-white/60">
            média {Math.round(d.media)}
          </span>
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between border-t border-line pt-1 font-mono text-[7.5px] text-dim">
        <span className="ponta-min">{d.min}</span>
        <span className="text-[#4E4E5C]">{sentido} →</span>
        <span className="ponta-max">{d.max}</span>
      </div>
    </div>
  );
}
```

Só três mudanças em relação ao arquivo atual: `'use client'` + import do
`motion` no topo; a coluna (`div` → `motion.div`) ganha `origin-bottom`,
`boxShadow` na coluna ativa, e as props `initial`/`animate`/`transition` da
mola; a pílula de "média" ganha borda e fundo (`border border-line
bg-[#0A0A0D]`). Nome/valor/unidade/frase/pontas/`data-testid`/`aria-label`
são idênticos ao arquivo atual — nenhum texto ou atributo consultado pelos
testes muda.

- [ ] **Step 3: Rodar os testes e confirmar que continuam passando sem alteração**

Run: `npx vitest run components/dados/Regua.test.tsx`
Expected: PASS (7 testes, arquivo de teste **não modificado**).

- [ ] **Step 4: Rodar a suíte completa, eslint, tsc e build**

```bash
npx vitest run
npx eslint .
npx tsc --noEmit
npm run build
```

Expected: tudo limpo.

- [ ] **Step 5: Commit**

```bash
git add components/dados/Regua.tsx
git commit -m "feat: Regua ganha entrada animada em mola e estilo de medidor HUD"
```

---

### Task 5: `CarteirinhaEstudante` — carteirinha 3D com scanner a laser

**Files:**
- Create: `site/components/ficha/CarteirinhaEstudante.tsx`
- Create: `site/components/ficha/CarteirinhaEstudante.test.tsx`
- Modify: `site/app/globals.css:36-53` (novo utilitário CSS)

**Interfaces:**
- Consumes: `useMovimentoReduzido()` de `@/lib/motion` (Task 1).
- Produces: `CarteirinhaEstudante({ personagem, numero }: { personagem: Personagem; numero: number })`, `default` **não** — export nomeado. Consumido pela Task 6 (`app/elenco/[id]/page.tsx`).

- [ ] **Step 1: Adicionar a keyframe do laser ao CSS**

Editar `site/app/globals.css`. Dentro do bloco `@theme` que já define
`--animate-ambient-glow`, `--animate-spin-slow`, etc. (linhas 55-78 do
arquivo atual), adicionar a nova animação e sua keyframe:

```diff
 @theme {
   --animate-ambient-glow: ambient-glow 10s ease-in-out infinite;
   --animate-spin-slow: spin-slow 12s linear infinite;
   --animate-marquee-slow: marquee-slow 35s linear infinite;
   --animate-crt-flicker: crt-flicker 8s ease-in-out infinite;
+  --animate-laser: laser-scan 3s ease-in-out infinite;

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
   @keyframes crt-flicker {
     0%, 92%, 100% { opacity: 1; }
     94% { opacity: 0.85; }
     96% { opacity: 1; }
   }
+  @keyframes laser-scan {
+    0% { top: 0%; opacity: 0; }
+    15% { opacity: 1; }
+    85% { opacity: 1; }
+    100% { top: 100%; opacity: 0; }
+  }
 }
```

**Não** adicionar `.animate-laser` ao bloco `@media (prefers-reduced-motion:
reduce)` existente (linhas 80-84) — diferente das outras animações desse
bloco, o elemento do laser só é renderizado quando `useMovimentoReduzido()`
já diz que o movimento não está reduzido (Step 3 abaixo). Não-renderizar é
mais robusto que só ocultar visualmente uma animação que continuaria rodando
escondida — mesmo padrão das partículas da camada de ambiência.

- [ ] **Step 2: Escrever os testes que falham**

Criar `site/components/ficha/CarteirinhaEstudante.test.tsx`:

```tsx
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CarteirinhaEstudante } from './CarteirinhaEstudante';
import type { Personagem } from '@/lib/schema';

const chihiro: Personagem = {
  id: 'chihiro-fujisaki',
  nome: 'Chihiro Fujisaki',
  talento: { pt: 'Programação Suprema', en: 'Ultimate Programmer' },
  descricao: { pt: 'Frágil e tímida.', en: 'Fragile and shy.' },
  jogo: 'Danganronpa: Trigger Happy Havoc',
  velocidade: 180, mochila: 13, percepcao: 9, vida: 100,
  etiquetas: [], sprite: '/sprites/chihiro.webp', traducaoRevisada: true,
};

function mockarMovimentoReduzido(reduzido: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduzido && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

describe('CarteirinhaEstudante', () => {
  afterEach(() => {
    mockarMovimentoReduzido(false);
  });

  it('mostra o sprite do personagem', () => {
    mockarMovimentoReduzido(false);
    render(<CarteirinhaEstudante personagem={chihiro} numero={1} />);
    expect(screen.getByAltText('Sprite de Chihiro Fujisaki')).toHaveAttribute(
      'src', '/sprites/chihiro.webp'
    );
  });

  it('mostra o Student ID com zero-padding de 3 dígitos', () => {
    mockarMovimentoReduzido(false);
    render(<CarteirinhaEstudante personagem={chihiro} numero={7} />);
    expect(screen.getByText('[ STUDENT ID: #007 ]')).toBeInTheDocument();
  });

  it('mostra o laser quando o usuário não pediu menos movimento', () => {
    mockarMovimentoReduzido(false);
    render(<CarteirinhaEstudante personagem={chihiro} numero={1} />);
    expect(screen.getByTestId('laser')).toBeInTheDocument();
  });

  it('não mostra o laser quando o usuário pediu menos movimento', () => {
    mockarMovimentoReduzido(true);
    render(<CarteirinhaEstudante personagem={chihiro} numero={1} />);
    expect(screen.queryByTestId('laser')).not.toBeInTheDocument();
  });

  it('gera o mesmo código de barras em duas montagens (seed estável a partir do id)', () => {
    mockarMovimentoReduzido(false);
    const { container: c1 } = render(<CarteirinhaEstudante personagem={chihiro} numero={1} />);
    const larguras1 = [...c1.querySelectorAll('[data-testid="codigo-barras"] rect')]
      .map((r) => r.getAttribute('width'));

    const { container: c2 } = render(<CarteirinhaEstudante personagem={chihiro} numero={1} />);
    const larguras2 = [...c2.querySelectorAll('[data-testid="codigo-barras"] rect')]
      .map((r) => r.getAttribute('width'));

    expect(larguras1.length).toBeGreaterThan(0);
    expect(larguras1).toEqual(larguras2);
  });
});
```

- [ ] **Step 3: Rodar os testes e confirmar que falham**

Run: `npx vitest run components/ficha/CarteirinhaEstudante.test.tsx`
Expected: FALHA — o arquivo `./CarteirinhaEstudante` não existe ainda.

- [ ] **Step 4: Implementar**

Criar `site/components/ficha/CarteirinhaEstudante.tsx`:

```tsx
'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useMovimentoReduzido } from '@/lib/motion';
import type { Personagem } from '@/lib/schema';

// Larguras determinísticas de barra a partir do id do personagem — mesmo id
// sempre produz o mesmo código de barras, sem Math.random() (evitaria
// divergência entre o HTML do servidor e a primeira renderização do
// cliente, o mesmo tipo de problema já corrigido no hook de movimento
// reduzido). Gerador congruente linear simples, seed inicial derivada da
// soma dos códigos de caractere do id.
function larguraDasBarras(id: string): number[] {
  let seed = 0;
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) % 1000;
  const larguras: number[] = [];
  for (let i = 0; i < 24; i++) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    larguras.push(1 + (Math.abs(seed) % 3));
  }
  return larguras;
}

export function CarteirinhaEstudante(
  { personagem: p, numero }: { personagem: Personagem; numero: number }
) {
  const movimentoReduzido = useMovimentoReduzido();
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });
  const brilhoX = useTransform(mouseX, [-0.5, 0.5], ['20%', '80%']);
  const brilhoY = useTransform(mouseY, [-0.5, 0.5], ['20%', '80%']);

  function aoMoverMouse(e: React.MouseEvent<HTMLDivElement>) {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds || bounds.width === 0 || bounds.height === 0) return;
    mouseX.set((e.clientX - bounds.left) / bounds.width - 0.5);
    mouseY.set((e.clientY - bounds.top) / bounds.height - 0.5);
  }

  function aoSairComMouse() {
    mouseX.set(0);
    mouseY.set(0);
  }

  const studentId = String(numero).padStart(3, '0');
  const barras = larguraDasBarras(p.id);
  let x = 0;

  return (
    <div style={{ perspective: '1000px' }}>
      <motion.div
        ref={ref}
        onMouseMove={aoMoverMouse}
        onMouseLeave={aoSairComMouse}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative overflow-hidden rounded-[4px] border border-line bg-gradient-to-b from-[#1B1B22] to-[#101014] p-3"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(115deg, transparent 40%, rgba(255,255,255,.08) 50%, transparent 60%)',
            backgroundPositionX: brilhoX,
            backgroundPositionY: brilhoY,
          }}
        />

        <p className="relative font-mono text-[7px] tracking-[.1em] text-dim">
          [ STUDENT ID: #{studentId} ]
        </p>

        <div className="relative mt-2 overflow-hidden rounded-[3px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.sprite}
            alt={`Sprite de ${p.nome}`}
            className="mx-auto block max-h-[260px] w-auto object-contain"
          />
          {!movimentoReduzido && (
            <div
              data-testid="laser"
              aria-hidden
              className="animate-laser pointer-events-none absolute left-0 right-0 h-px"
              style={{ background: 'var(--color-alter-green)', boxShadow: '0 0 6px var(--color-alter-green)' }}
            />
          )}
        </div>

        <svg data-testid="codigo-barras" aria-hidden viewBox="0 0 72 20" className="relative mt-3 h-4 w-full">
          {barras.map((largura, i) => {
            const rect = <rect key={i} x={x} y={0} width={largura} height={20} fill="#4E4E5C" />;
            x += largura + 1;
            return rect;
          })}
        </svg>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 5: Rodar os testes e confirmar que passam**

Run: `npx vitest run components/ficha/CarteirinhaEstudante.test.tsx`
Expected: PASS (5 testes).

- [ ] **Step 6: Rodar a suíte completa, eslint, tsc e build**

```bash
npx vitest run
npx eslint .
npx tsc --noEmit
npm run build
```

Expected: tudo limpo — `CarteirinhaEstudante` ainda não é usada em nenhuma
página (isso é a Task 6), então nada mais deveria mudar de comportamento.

- [ ] **Step 7: Commit**

```bash
git add app/globals.css components/ficha/CarteirinhaEstudante.tsx components/ficha/CarteirinhaEstudante.test.tsx
git commit -m "feat: carteirinha 3D do estudante com scanner a laser e codigo de barras"
```

---

### Task 6: `app/elenco/[id]/page.tsx` — troca o retrato pela carteirinha e retitula o HUD

**Files:**
- Modify: `site/app/elenco/[id]/page.tsx`
- Create: `site/app/elenco/[id]/page.test.tsx`

**Interfaces:**
- Consumes: `CarteirinhaEstudante({ personagem, numero })` (Task 5).
- Produces: nada consumido por tarefas futuras.

- [ ] **Step 1: Escrever o teste que falha**

Criar `site/app/elenco/[id]/page.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const aaa = {
  id: 'aaa', nome: 'Aaa', talento: { pt: 'X', en: 'X' },
  descricao: { pt: 'd', en: 'd' }, jogo: 'Jogo A',
  velocidade: 100, mochila: 1, percepcao: 1, vida: 1,
  etiquetas: [], sprite: '/s.webp', traducaoRevisada: true,
};
const bbb = {
  id: 'bbb', nome: 'Bbb', talento: { pt: 'Y', en: 'Y' },
  descricao: { pt: 'd', en: 'd' }, jogo: 'Jogo A',
  velocidade: 100, mochila: 1, percepcao: 1, vida: 1,
  etiquetas: [], sprite: '/s.webp', traducaoRevisada: true,
};

vi.mock('@/lib/dados', () => ({
  listarPersonagens: vi.fn().mockReturnValue([aaa, bbb]),
  buscarPersonagem: vi.fn((id: string) => (id === 'bbb' ? bbb : id === 'aaa' ? aaa : null)),
  valoresDoElenco: vi.fn().mockReturnValue([100, 100]),
}));

import FichaPersonagem from './page';

describe('Ficha do personagem', () => {
  it('numera o personagem pela mesma ordem global que a página de elenco usa', async () => {
    const jsx = await FichaPersonagem({ params: Promise.resolve({ id: 'bbb' }) });
    render(jsx);
    // "bbb" é o segundo no array mockado (índice 1) → Student ID #002.
    expect(screen.getByText('[ STUDENT ID: #002 ]')).toBeInTheDocument();
  });

  it('troca o título da seção comparativa pelo texto do HUD', async () => {
    const jsx = await FichaPersonagem({ params: Promise.resolve({ id: 'bbb' }) });
    render(jsx);
    expect(screen.getByText('— // ANÁLISE DE DADOS DO ALUNO // —')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npx vitest run "app/elenco/[id]/page.test.tsx"`
Expected: FALHA — a página ainda não calcula/mostra o Student ID, e o
título ainda é "Como se compara".

- [ ] **Step 3: Implementar**

Editar `site/app/elenco/[id]/page.tsx`. Adicionar o import de
`CarteirinhaEstudante` junto aos outros:

```diff
 import { notFound } from 'next/navigation';
 import Link from 'next/link';
 import { buscarPersonagem, listarPersonagens, valoresDoElenco } from '@/lib/dados';
 import { Regua } from '@/components/dados/Regua';
+import { CarteirinhaEstudante } from '@/components/ficha/CarteirinhaEstudante';
```

Trocar o cálculo de `total` (linha 25 do arquivo atual) para também derivar
`numero`, reaproveitando a mesma chamada a `listarPersonagens()`:

```diff
   const { id } = await params;
   const p = buscarPersonagem(id);
   if (!p) notFound();

-  const total = listarPersonagens().length;
+  const todos = listarPersonagens();
+  const total = todos.length;
+  const numero = todos.findIndex((x) => x.id === id) + 1;
```

Trocar o bloco do retrato (dentro do `<div className="mx-auto w-40
sm:mx-0 sm:w-full">`) de:

```tsx
        <div className="mx-auto w-40 sm:mx-0 sm:w-full">
          <div className="overflow-hidden rounded-[4px] border border-line bg-gradient-to-b from-[#1B1B22] to-[#101014]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.sprite}
              alt={`Sprite de ${p.nome}`}
              className="mx-auto block max-h-[260px] w-auto object-contain"
            />
          </div>
        </div>
```

para:

```tsx
        <div className="mx-auto w-40 sm:mx-0 sm:w-full">
          <CarteirinhaEstudante personagem={p} numero={numero} />
        </div>
```

Trocar o título da seção comparativa de:

```tsx
          Como se compara
```

para:

```tsx
          — // ANÁLISE DE DADOS DO ALUNO // —
```

Nenhuma outra parte do arquivo muda — o cabeçalho de identificação
(nome/talento/descrição/etiquetas/`dl` de status), a lista de três `Regua`,
e o aviso de tradução pendente continuam exatamente como estão.

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npx vitest run "app/elenco/[id]/page.test.tsx"`
Expected: PASS (2 testes).

- [ ] **Step 5: Rodar a suíte completa, eslint, tsc e build**

```bash
npx vitest run
npx eslint .
npx tsc --noEmit
npm run build
```

Expected: suíte completa passa; eslint sem erros novos; tsc limpo; build
gera as 56 páginas estáticas de `/elenco/[id]/` sem erro.

- [ ] **Step 6: Commit**

```bash
git add "app/elenco/[id]/page.tsx" "app/elenco/[id]/page.test.tsx"
git commit -m "feat: ficha do personagem usa a carteirinha 3D e retitula a secao comparativa pro HUD"
```

---

### Task 7: Verificação end-to-end

**Files:** nenhum criado — esta tarefa verifica as Tasks 1-6 juntas.

- [ ] **Step 1: Suíte automatizada completa, lint, build**

```bash
cd site
npx vitest run
npx eslint .
npx tsc --noEmit
npm run build
```

Expected: suíte completa passa; lint sem erros novos (avisos pré-existentes
de antes deste plano são aceitáveis, nenhum novo nos arquivos que este plano
tocou); tsc limpo; build com o mesmo total de páginas de antes (309) — este
plano não adiciona nem remove rotas.

- [ ] **Step 2: Passagem manual pelo navegador**

Com `npm run dev` rodando, usando as ferramentas do claude-in-chrome:

1. Visite `/elenco/` — confirme: cada card mostra `[ STUDENT ID: #0XX ]`
   numerado sequencialmente (não reiniciando a cada grupo de jogo), o
   carimbo `ULTIMATE FILE` rosa aparece rotacionado em todo card, o sprite
   está em preto-e-branco (grayscale) em repouso.
2. Passe o mouse sobre um card — confirme: o sprite ganha cor + glow rosa, a
   retícula de mira gira, o card cresce sutilmente (`scale-[1.02]`).
3. Abra a ficha de um personagem qualquer (`/elenco/<id>/`) — confirme: a
   carteirinha aparece no lugar do retrato antigo, com o mesmo `Student ID`
   do card dele na lista.
4. Mova o mouse sobre a carteirinha — confirme: ela inclina em 3D seguindo o
   cursor, o brilho holográfico se desloca junto.
5. Observe o retrato dentro da carteirinha por alguns segundos — confirme:
   uma linha verde varre de cima a baixo em loop.
6. Role até "— // ANÁLISE DE DADOS DO ALUNO // —" — confirme: as três barras
   (`Regua`) crescem com efeito de mola ao carregar a página (recarregue
   para ver de novo), a coluna ativa tem um leve glow.
7. Em DevTools, ative a emulação de `prefers-reduced-motion: reduce` e
   recarregue a ficha de um personagem — confirme: a linha do laser não
   aparece mais; recarregue a `/elenco/` — confirme que o resto do site
   (camada de ambiência, retículas) continua respeitando a preferência como
   já confirmado no sub-projeto anterior.
8. Visite `/itens/`, `/comecar/`, `/mapa/` — confirme que continuam intactas
   (este plano não deveria ter tocado nelas).

- [ ] **Step 3: Relatório**

Resumir para o usuário: o que está no ar, lembrar que esta é a sub-etapa 2
de 6 (Itens, Mecânicas, Mapa continuam por vir, cada uma com sua própria
spec → plano → implementação), e — se algo do Step 2 não bater com o
esperado — descrever exatamente o que foi visto em vez de assumir que está
certo.
