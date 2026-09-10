# Shuichi Pull — Overhaul Neo-Pop: Fundação + Home — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the site's "papel + Alter Ego isolado" visual identity with a
neo-pop Danganronpa system (dark, neon pink/cyan/green, continuous ambient
motion), proven at the scale of the shared foundation + the Home page —
the first of six sub-projects in the full overhaul.

**Architecture:** New design tokens and CSS utilities in `globals.css`
(additive at first, old tokens removed only in the final sweep task once
everything in scope has migrated). A `CamadaAmbiente` client component
renders fixed, non-interactive background layers (scanlines, vignette,
halftone, marquee — CSS-only loops) plus Framer-Motion-driven floating
particles, mounted once in the root layout. `BarraEgo` (header) and `Faixa`
(Home's numbered banners) get a visual pass; `BarraEgo` also gains a new
`Ctrl+K`/`Cmd+K` shortcut. The Home hero gets a Framer Motion pop-in entrance.
A final task removes the old tokens and mechanically fixes every other
page's now-broken class references to the closest new-token equivalent —
not a redesign of those pages (out of scope, future sub-projects), just
enough to keep them visually intact.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4 (`@theme` tokens),
Framer Motion (new dependency), Vitest + Testing Library (existing pattern).

**Spec:** [`docs/superpowers/specs/2026-09-08-shuichi-pull-neopop-fundacao-home-design.md`](../specs/2026-09-08-shuichi-pull-neopop-fundacao-home-design.md)

## Global Constraints

- Portuguese (pt-BR) names for functions/files/vars/comments, matching the
  rest of this codebase.
- Every new function/component gets a Vitest test, following TDD.
- `npx tsc --noEmit` and `npm run build` must stay clean after every task —
  run both before committing, not just the focused test.
- All new looping animations (scanline flicker, halftone breathing, marquee,
  spin, particles) must disable under `prefers-reduced-motion: reduce`,
  matching the existing pattern for the Alter Ego tremor in `app/globals.css`.
- **Resolved implementation detail — how `prefers-reduced-motion` actually
  disables things here:** the CSS-only layers (scanline flicker, halftone
  breathing, marquee, spin) need no JavaScript at all — a
  `@media (prefers-reduced-motion: reduce) { .animate-X { animation: none !important; } }`
  block handles them, exactly like the existing tremor. Only the Framer
  Motion particle layer needs a JS check, via Framer's own `useReducedMotion()`
  hook (which reads the same media query) — when it returns `true`, the
  particles simply don't render.
- **Resolved implementation detail — removing old tokens does not fail the
  build.** Verified empirically (temporarily stripped `--color-papel`,
  `--color-teal`, `--color-teal-escuro`, `--color-tinta`, `--color-red` from
  `app/globals.css` and ran `npm run build`): Tailwind v4 does **not** error
  on a `className` referencing an unknown theme-based utility (e.g.
  `bg-papel` with no `--color-papel` token) — it silently generates no CSS
  for that class, and inline `var(--color-teal)` references silently resolve
  to nothing. This means removing the old tokens **silently breaks styling
  on ~17 files across most of the site** (every page except Home) rather
  than failing the build. This is *worse* than a compile error, not better —
  it ships invisible regressions. Task 6 (the sweep) is therefore not
  optional cleanup; it is required for this plan to be considered done, and
  its own verification step is a real visual check, not just "the build
  succeeded."
- **Resolved implementation detail — the sweep's exact mapping.** The old
  tokens don't map 1:1 to new ones by name; the mapping is by *role*
  (worked out below in Task 6, verified against every actual usage in the
  codebase, not guessed).
- **Resolved implementation detail — one token the spec's palette didn't
  cover.** Four out-of-scope files use `red`/`var(--color-red)` for a
  genuine semantic "negative/expired/bad" meaning (a code's expired status,
  a character trait marked "ruim"). The spec's new palette (pink/cyan/green/
  amber) has no color for this — pink is a positive accent, amber is
  reserved for future legendary-item glow. Adding one small token,
  `--color-alerta: #FF3B3B`, is the minimal fix that keeps those four files'
  meaning intact through the sweep without inventing a new design direction
  for pages outside this plan's scope. This is a one-line, mechanical
  addition, not a creative decision — flagged here for visibility, not
  seeking approval mid-plan.

---

## Task 1: Ambient background layer (`CamadaAmbiente`)

**Files:**
- Create: `site/components/ambiente/CamadaAmbiente.tsx`
- Create: `site/components/ambiente/CamadaAmbiente.test.tsx`
- Modify: `site/app/globals.css` (new tokens, additive; new utilities; new keyframes)
- Modify: `site/app/layout.tsx` (mount `<CamadaAmbiente />`)
- Modify: `site/package.json` (add `framer-motion` dependency)

**Interfaces:**
- Produces: `CamadaAmbiente` (default export, no props) — a client component
  mounted once in the root layout. No other task imports it directly, but
  every later task's visual work sits underneath it in the stacking order.
- Produces new `@theme` tokens (`--color-execution-pink`, `--color-cyber-cyan`,
  `--color-alter-green`, `--color-amber`, `--color-alerta`) and new CSS
  utility classes (`.clip-tab-slanted`, `.clip-hero-diagonal`, `.crt-lines`,
  `.bg-halftone-pattern`) and animation names (`animate-ambient-glow`,
  `animate-spin-slow`, `animate-marquee-slow`, `animate-crt-flicker`) that
  Tasks 2-5 consume.

- [ ] **Step 1: Add the new tokens and utilities to `globals.css` (additive)**

Edit `site/app/globals.css`. Add a **second** `@theme` block right after the
existing one (Tailwind v4 merges multiple `@theme` blocks) — do not touch or
remove the existing `--color-bg`, `--color-sur`, `--color-line`, `--color-papel`,
`--color-tinta`, `--color-teal`, `--color-teal-escuro`, `--color-red`,
`--color-dim` tokens yet (Task 6 removes them, once every consumer in this
plan's scope has migrated):

```css
@theme {
  --color-execution-pink: #FF007F;
  --color-cyber-cyan: #00F0FF;
  --color-alter-green: #00FF66;
  --color-amber: #F59E0B;
  --color-alerta: #FF3B3B;
}

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
  --animate-crt-flicker: crt-flicker 8s ease-in-out infinite;

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
}

@media (prefers-reduced-motion: reduce) {
  .animate-ambient-glow, .animate-spin-slow, .animate-marquee-slow, .animate-crt-flicker {
    animation: none !important;
  }
}
```

- [ ] **Step 2: Install Framer Motion**

```bash
cd site
npm install framer-motion
```

- [ ] **Step 3: Write the failing tests**

Create `site/components/ambiente/CamadaAmbiente.test.tsx`:

```tsx
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CamadaAmbiente } from './CamadaAmbiente';

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

describe('CamadaAmbiente', () => {
  afterEach(() => {
    mockarMovimentoReduzido(false);
  });

  it('mostra o texto do marquee de fundo', () => {
    mockarMovimentoReduzido(false);
    render(<CamadaAmbiente />);
    expect(screen.getAllByText(/NON-STOP DEBATE/i).length).toBeGreaterThan(0);
  });

  it('renderiza partículas quando o usuário não pediu menos movimento', () => {
    mockarMovimentoReduzido(false);
    const { container } = render(<CamadaAmbiente />);
    expect(container.querySelectorAll('[data-testid="particula"]').length).toBeGreaterThan(0);
  });

  it('não renderiza partículas quando o usuário pediu menos movimento', () => {
    mockarMovimentoReduzido(true);
    const { container } = render(<CamadaAmbiente />);
    expect(container.querySelectorAll('[data-testid="particula"]').length).toBe(0);
  });

  it('nunca captura clique — a camada inteira é pointer-events-none', () => {
    mockarMovimentoReduzido(false);
    const { container } = render(<CamadaAmbiente />);
    expect(container.firstChild).toHaveClass('pointer-events-none');
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npx vitest run components/ambiente/CamadaAmbiente.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 5: Implement `CamadaAmbiente`**

Create `site/components/ambiente/CamadaAmbiente.tsx`:

```tsx
'use client';

import { motion, useReducedMotion } from 'framer-motion';

const TEXTO_MARQUEE =
  'NON-STOP DEBATE // TRUTH BULLET // SHINRI TRIAL // CLASS TRIAL PROTOCOL // ';

type Particula = { forma: string; esquerda: number; atraso: number; duracao: number };

// Sorteadas uma vez, no módulo — não a cada render, senão as partículas
// "pulariam" de posição a cada re-render do layout.
const PARTICULAS: Particula[] = Array.from({ length: 14 }, (_, i) => ({
  forma: i % 3 === 0 ? 'rotate-45' : i % 3 === 1 ? '' : 'rounded-full',
  esquerda: (i * 7.3) % 100,
  atraso: (i * 1.7) % 8,
  duracao: 14 + (i % 5) * 3,
}));

export function CamadaAmbiente() {
  const movimentoReduzido = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Vinheta radial — estática, sem custo de animação. */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 60%, rgba(0,0,0,0.8) 100%)',
        }}
      />

      {/* Scanlines com flicker sutil a cada 8s. */}
      <div className="absolute inset-0 crt-lines animate-crt-flicker" />

      {/* Halftone respirando. */}
      <div className="absolute inset-0 bg-halftone-pattern animate-ambient-glow" />

      {/* Marquee de fundo — texto duplicado para o loop não ter costura. */}
      <div className="absolute bottom-8 left-0 flex w-full overflow-hidden">
        <div className="flex animate-marquee-slow whitespace-nowrap text-8xl font-black uppercase tracking-widest text-white/[0.02]">
          <span className="pr-8">{TEXTO_MARQUEE}</span>
          <span className="pr-8">{TEXTO_MARQUEE}</span>
        </div>
      </div>

      {/* Partículas flutuantes — só com movimento não-reduzido. */}
      {!movimentoReduzido && PARTICULAS.map((p, i) => (
        <motion.div
          key={i}
          data-testid="particula"
          className={`absolute h-1.5 w-1.5 bg-white/10 ${p.forma}`}
          style={{ left: `${p.esquerda}%`, bottom: '-5%' }}
          animate={{ y: ['0vh', '-110vh'], opacity: [0, 0.3, 0.3, 0] }}
          transition={{ duration: p.duracao, delay: p.atraso, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run components/ambiente/CamadaAmbiente.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 7: Mount in the root layout**

Edit `site/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import './globals.css';
import { BarraEgo } from '@/components/alter-ego/BarraEgo';
import { Rodape } from '@/components/layout/Rodape';
import { CamadaAmbiente } from '@/components/ambiente/CamadaAmbiente';

export const metadata: Metadata = {
  title: 'Shuichi Pull — o arquivo da comunidade BR/PT de Shinri Trial',
  description:
    'Tudo sobre o Shinri Trial, o Danganronpa Online do Garry\'s Mod: personagens, itens, mapa e mecânicas, em português.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg">
        <CamadaAmbiente />
        <BarraEgo />
        <main>{children}</main>
        <Rodape />
      </body>
    </html>
  );
}
```

- [ ] **Step 8: Run the full suite, tsc, and build**

```bash
npx vitest run
npx tsc --noEmit
npm run build
```

Expected: full suite passes (no regressions — `CamadaAmbiente` is new,
nothing existing imports it yet besides `layout.tsx`); tsc clean; build
succeeds (adding tokens/utilities additively cannot break anything that
compiled before, since nothing was removed).

- [ ] **Step 9: Commit**

```bash
git add app/globals.css app/layout.tsx package.json package-lock.json components/ambiente
git commit -m "feat: camada de ambiencia global (scanlines, halftone, marquee, particulas)"
```

---

## Task 2: Header — visual redesign (numbered links, crosshair hover)

**Files:**
- Modify: `site/components/alter-ego/BarraEgo.tsx`
- Modify: `site/components/alter-ego/BarraEgo.test.tsx`

**Interfaces:**
- Consumes: `animate-spin-slow` (Task 1), new color tokens (Task 1).
- Produces: no new exports — `BarraEgo`'s existing export and all existing
  behavior (search-as-you-type, hide-on-scroll, floating window persistence)
  stay exactly as they are; only markup/classes change. Task 3 (Ctrl+K)
  builds directly on top of this task's markup.

This task is a visual pass on an already-well-tested component (8 existing
tests) — the goal is zero behavior regression, verified by those same 8
tests still passing, plus new coverage for the two purely-visual additions
(numbered labels, crosshair-on-hover) that are cheap to assert on.

- [ ] **Step 1: Write the failing tests for the new markup**

Add to `site/components/alter-ego/BarraEgo.test.tsx` (the existing 5 tests
in the top `describe('BarraEgo', ...)` block stay untouched — add a new
block below them):

```tsx
describe('BarraEgo — numeração e retícula', () => {
  beforeEach(() => localStorage.clear());

  it('numera os links de seção', () => {
    render(<BarraEgo />);
    expect(screen.getByRole('link', { name: /01\.\s*ELENCO/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /02\.\s*ITENS/i })).toBeInTheDocument();
  });

  it('cada link de seção tem uma retícula decorativa escondida do leitor de tela', () => {
    render(<BarraEgo />);
    const link = screen.getByRole('link', { name: /01\.\s*ELENCO/i });
    expect(link.querySelector('[data-testid="reticula"]')).toHaveAttribute('aria-hidden', 'true');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run components/alter-ego/BarraEgo.test.tsx`
Expected: 2 new tests FAIL (numbering/reticle not present yet); the 5
existing tests still PASS (nothing touched yet).

- [ ] **Step 3: Update the section list and link markup**

Edit `site/components/alter-ego/BarraEgo.tsx`. Change the `SECOES` constant
and the nav's `.map(...)`:

```tsx
const SECOES = [
  { numero: '01', nome: 'Elenco', url: '/elenco/' },
  { numero: '02', nome: 'Itens', url: '/itens/' },
  { numero: '03', nome: 'Mapa', url: '/mapa/' },
  { numero: '04', nome: 'Mecânicas', url: '/mecanicas/' },
  { numero: '05', nome: 'Eventos', url: '/eventos/' },
  { numero: '06', nome: 'Códigos', url: '/codigos/' },
  { numero: '07', nome: 'FAQ', url: '/faq/' },
  { numero: '08', nome: 'Começar', url: '/comecar/' },
];
```

(Reordered/renumbered to match the Home's Faixa numbering convention where
they overlap — 01 Elenco, 02 Itens, 03 Mapa — and continued sequentially for
the rest; "Começar" moves last since it's the odd one out, an onboarding
link rather than a data section.)

Replace the `<nav>` block:

```tsx
<nav className="hidden gap-3 sm:flex">
  {SECOES.map((s) => (
    <Link key={s.url} href={s.url}
      className="group relative font-mono text-[9px] tracking-[.12em] text-dim hover:text-cyber-cyan">
      {s.numero}. {s.nome.toUpperCase()}
      <svg data-testid="reticula" aria-hidden viewBox="0 0 24 24"
        className="pointer-events-none absolute -right-3 -top-2 h-3 w-3 animate-spin-slow opacity-0 text-execution-pink group-hover:opacity-100">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1" />
        <line x1="12" y1="0" x2="12" y2="6" stroke="currentColor" strokeWidth="1" />
        <line x1="12" y1="18" x2="12" y2="24" stroke="currentColor" strokeWidth="1" />
        <line x1="0" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1" />
        <line x1="18" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="1" />
      </svg>
    </Link>
  ))}
</nav>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run components/alter-ego/BarraEgo.test.tsx`
Expected: PASS (7 tests — the 5 original plus the 2 new).

- [ ] **Step 5: Restyle the search input, header border, and floating window frame**

Edit `site/components/alter-ego/BarraEgo.tsx` — replace every remaining
`teal`-referencing class in this file with the new tokens (this component
is in scope for this plan, so it migrates now rather than waiting for
Task 6's sweep — Task 6's file list deliberately excludes `BarraEgo.tsx`
because this step is what fully migrates it). There are three spots, not
just the search input:

1. The `<header>` element's own `border-b-2 border-teal-escuro` becomes
   `border-b-2 border-cyber-cyan/40` — this is the header's bottom edge,
   visible on every page, and easy to miss since neither Step 3 (nav links)
   nor the input restyle below touches it.
2. The search `<input>`:

```tsx
<input
  type="search"
  role="searchbox"
  aria-label="Buscar no Shuichi Pull"
  placeholder="buscar item, local, personagem…"
  value={termo}
  onChange={(e) => setTermo(e.target.value)}
  className="w-full rounded-[3px] border border-cyber-cyan/40 bg-[#0A0A10] px-2 py-1.5 font-mono text-[10px] uppercase tracking-[.08em] text-[#D6D6E0] placeholder:text-dim focus:border-cyber-cyan focus:outline-none"
/>
```

3. The results-list rendering logic stays untouched — only its container's
   border/hover classes swap `border-line`/`hover:bg-[#22222C]` for
   `border-cyber-cyan/20`/`hover:bg-cyber-cyan/10`.

After this step, run `grep -n "teal" components/alter-ego/BarraEgo.tsx` and
confirm it returns nothing — that's the check that all three spots were
caught, not just the ones called out above.

- [ ] **Step 6: Run the full suite, tsc, and build**

```bash
npx vitest run
npx tsc --noEmit
npm run build
```

Expected: full suite passes; tsc clean; build succeeds.

- [ ] **Step 7: Commit**

```bash
git add components/alter-ego/BarraEgo.tsx components/alter-ego/BarraEgo.test.tsx
git commit -m "feat: header ganha numeracao de secoes e reticula de mira no hover"
```

---

## Task 3: Header — `Ctrl+K`/`Cmd+K` shortcut

**Files:**
- Modify: `site/components/alter-ego/BarraEgo.tsx`
- Modify: `site/components/alter-ego/BarraEgo.test.tsx`

**Interfaces:**
- Consumes: Task 2's restyled `BarraEgo` markup.
- Produces: no new exports — purely new interactive behavior on the
  existing component.

This is genuinely new behavior (not a visual change), so it gets full TDD
from a failing test, unlike Task 2's mostly-visual pass.

- [ ] **Step 1: Give both search inputs stable, distinct ids**

The component renders its search `<div>` (the `busca` variable) in two
places — inside the sticky header, and inside the floating window when it's
open — meaning up to two `<input>` elements can exist in the DOM
simultaneously. A single `ref` can't cleanly track "whichever one is
currently the right one to focus," so give each instance an id instead.
Change `busca` from a plain JSX constant into a small local function that
takes an `id`:

```tsx
function Busca({ id }: { id: string }) {
  return (
    <div className="relative flex-1">
      <input
        id={id}
        type="search"
        role="searchbox"
        aria-label="Buscar no Shuichi Pull"
        placeholder="buscar item, local, personagem…"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        className="w-full rounded-[3px] border border-cyber-cyan/40 bg-[#0A0A10] px-2 py-1.5 font-mono text-[10px] uppercase tracking-[.08em] text-[#D6D6E0] placeholder:text-dim focus:border-cyber-cyan focus:outline-none"
      />
      {termo.length >= 2 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-[3px] border border-cyber-cyan/20 bg-sur">
          {resultados.length === 0 ? (
            <li className="px-2 py-2 text-[10px] text-dim">Não achei nada... tenta outro nome?</li>
          ) : (
            resultados.map((r) => (
              <li key={r.id}>
                <Link href={r.url} className="block px-2 py-1.5 hover:bg-cyber-cyan/10">
                  <span className="block text-[11px] text-[#D6D6E0]">{r.titulo}</span>
                  <span className="block font-mono text-[8px] text-dim">{r.subtitulo}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
```

(Note: `Busca` is defined *inside* `BarraEgo`'s function body, same as the
current `busca` constant, so it closes over `termo`/`resultados`/`setTermo`
without needing props for them — only `id` is a prop, since that's the one
thing that differs between the two call sites.)

Update the two render sites: `<Busca id="busca-header" />` inside the
`<header>`, and `<Busca id="busca-flutuante" />` inside the floating window
div.

- [ ] **Step 2: Write the failing tests**

Add to `site/components/alter-ego/BarraEgo.test.tsx`:

```tsx
describe('BarraEgo — atalho Ctrl+K', () => {
  beforeEach(() => localStorage.clear());

  it('Ctrl+K foca a busca do cabeçalho quando ela está visível', () => {
    render(<BarraEgo />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(document.getElementById('busca-header')).toHaveFocus();
  });

  it('Ctrl+K abre a janela flutuante e foca a busca dela quando o cabeçalho está escondido', () => {
    // Simula "já rolou a página": a barra visível some quando o
    // IntersectionObserver do topo reporta isIntersecting: false. Os
    // testes existentes de scroll já mockam isso — replicando o mesmo
    // espião aqui.
    class ObservadorFalso {
      constructor(cb: (e: { isIntersecting: boolean }[]) => void) {
        setTimeout(() => cb([{ isIntersecting: false }]), 0);
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('IntersectionObserver', ObservadorFalso);

    render(<BarraEgo />);
    return new Promise<void>((resolve) => {
      setTimeout(async () => {
        fireEvent.keyDown(window, { key: 'k', metaKey: true });
        await waitFor(() => expect(document.getElementById('busca-flutuante')).toHaveFocus());
        vi.unstubAllGlobals();
        resolve();
      }, 10);
    });
  });

  it('previne o comportamento padrão do navegador para Ctrl+K', () => {
    render(<BarraEgo />);
    const evento = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true });
    window.dispatchEvent(evento);
    expect(evento.defaultPrevented).toBe(true);
  });
});
```

Add `vi`, `waitFor` to the existing `vitest`/`@testing-library/react`
imports at the top of the file if not already present.

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run components/alter-ego/BarraEgo.test.tsx`
Expected: 3 new tests FAIL (no keydown listener exists yet).

- [ ] **Step 4: Implement the shortcut**

Add inside `BarraEgo`'s function body, alongside the other `useEffect`s:

```tsx
useEffect(() => {
  function aoTeclar(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (barraVisivel) {
        document.getElementById('busca-header')?.focus();
        return;
      }
      if (!flutuanteAberta) setFlutuanteAberta(true);
      // A janela flutuante só existe no DOM depois do próximo render —
      // requestAnimationFrame garante que já montou antes de focar.
      requestAnimationFrame(() => document.getElementById('busca-flutuante')?.focus());
    }
  }
  window.addEventListener('keydown', aoTeclar);
  return () => window.removeEventListener('keydown', aoTeclar);
}, [barraVisivel, flutuanteAberta, setFlutuanteAberta]);
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run components/alter-ego/BarraEgo.test.tsx`
Expected: PASS (10 tests — the 7 from Task 2 plus these 3).

- [ ] **Step 6: Run the full suite, tsc, and build**

```bash
npx vitest run
npx tsc --noEmit
npm run build
```

Expected: full suite passes; tsc clean; build succeeds.

- [ ] **Step 7: Commit**

```bash
git add components/alter-ego/BarraEgo.tsx components/alter-ego/BarraEgo.test.tsx
git commit -m "feat: atalho Ctrl+K/Cmd+K foca a busca em qualquer pagina"
```

---

## Task 4: `Faixa` component redesign

**Files:**
- Modify: `site/components/layout/Faixa.tsx`
- Modify: `site/components/layout/Faixa.test.tsx`

**Interfaces:**
- Consumes: `clip-hero-diagonal` is for the hero, not Faixa — Faixa gets its
  own diagonal cut inline (see Step 3). Consumes `animate-spin-slow`, new
  color tokens (Task 1).
- Produces: `Faixa` — same props shape except `variante`'s allowed values
  change from `'teal' | 'papel' | 'escura'` to `'pink' | 'cyan' | 'escura'`.
  Task 5 (Home) is the only consumer and is updated in this same plan to
  match.

`Faixa` is used only by `app/page.tsx` (confirmed — no other file imports
it), so this rename doesn't ripple beyond Task 5.

- [ ] **Step 1: Write the failing tests**

Replace `site/components/layout/Faixa.test.tsx`'s `props` fixture and add a
reticle test:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Faixa } from './Faixa';

describe('Faixa', () => {
  const props = {
    numero: '01', titulo: 'ELENCO', descricao: '56 alunos.',
    url: '/elenco/', variante: 'pink' as const,
  };

  it('mostra número, título e descrição', () => {
    render(<Faixa {...props} />);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ELENCO' })).toBeInTheDocument();
    expect(screen.getByText('56 alunos.')).toBeInTheDocument();
  });

  it('a faixa inteira é o link', () => {
    render(<Faixa {...props} />);
    expect(screen.getByRole('link', { name: /elenco/i }).getAttribute('href'))
      .toMatch(/^\/elenco\/?$/);
  });

  it('marca o sprite decorativo como escondido para leitor de tela', () => {
    render(<Faixa {...props} sprite="/sprites/junko.webp" />);
    expect(screen.getByTestId('sprite-faixa')).toHaveAttribute('aria-hidden', 'true');
  });

  it('tem uma retícula decorativa escondida do leitor de tela', () => {
    render(<Faixa {...props} />);
    expect(screen.getByTestId('reticula-faixa')).toHaveAttribute('aria-hidden', 'true');
  });

  it.each(['pink', 'cyan', 'escura'] as const)('aceita a variante %s', (variante) => {
    render(<Faixa {...props} variante={variante} />);
    expect(screen.getByRole('link', { name: /elenco/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run components/layout/Faixa.test.tsx`
Expected: FAIL — `variante="pink"` isn't a valid prop yet (TS error surfaces
as a test failure since `ESTILOS['pink']` is `undefined`, producing no
`className` for that branch — either way, the reticle test fails outright
since it doesn't exist).

- [ ] **Step 3: Implement**

Replace `site/components/layout/Faixa.tsx`:

```tsx
import Link from 'next/link';

type Props = {
  numero: string; titulo: string; descricao: string; url: string;
  sprite?: string; variante: 'pink' | 'cyan' | 'escura';
};

const ESTILOS = {
  pink: 'bg-execution-pink text-[#08090D]',
  cyan: 'bg-cyber-cyan text-[#08090D]',
  escura: 'border border-alter-green/40 bg-bg text-[#D6D6E0]',
} as const;

export function Faixa({ numero, titulo, descricao, url, sprite, variante }: Props) {
  return (
    <Link
      href={url}
      className={`clip-tab-slanted group relative flex min-h-[110px] items-center overflow-hidden border-t-2 border-[#08090D] px-4 py-4 transition-transform hover:translate-x-2 ${ESTILOS[variante]}`}
    >
      <span className="mr-3 font-mono text-[9px] tracking-[.24em] opacity-60 [writing-mode:vertical-rl] rotate-180">
        {numero}
      </span>
      <div className="relative z-10 max-w-[60%]">
        <h2 className="text-3xl font-black leading-none tracking-tight sm:text-4xl">{titulo}</h2>
        <p className="mt-1 text-[11px] leading-relaxed opacity-80">{descricao}</p>
      </div>
      {sprite && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          data-testid="sprite-faixa" aria-hidden alt=""
          src={sprite}
          className="pointer-events-none absolute -top-2 right-2 h-[190%] w-auto max-w-[40%] object-contain object-top sm:right-6"
        />
      )}
      <svg data-testid="reticula-faixa" aria-hidden viewBox="0 0 24 24"
        className="pointer-events-none absolute right-3 top-3 h-4 w-4 animate-spin-slow opacity-0 group-hover:opacity-60">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1" />
        <line x1="12" y1="0" x2="12" y2="6" stroke="currentColor" strokeWidth="1" />
        <line x1="12" y1="18" x2="12" y2="24" stroke="currentColor" strokeWidth="1" />
        <line x1="0" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1" />
        <line x1="18" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="1" />
      </svg>
    </Link>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run components/layout/Faixa.test.tsx`
Expected: PASS (7 tests — the original 3, updated, plus 4 new/parametrized).

- [ ] **Step 5: Run the full suite, tsc, and build**

```bash
npx vitest run
npx tsc --noEmit
npm run build
```

Expected: `app/page.tsx` (Home) now fails to build/type-check, since it
still passes `variante="teal"`/`"papel"`/`"escura"` — this is expected and
fixed in Task 5, which touches Home directly next. Confirm the *only*
failures are in `app/page.tsx`; if anything else fails, stop and
investigate before proceeding.

- [ ] **Step 6: Commit**

```bash
git add components/layout/Faixa.tsx components/layout/Faixa.test.tsx
git commit -m "feat: Faixa ganha corte diagonal, reticula no hover e variantes pink/cyan"
```

---

## Task 5: Home — Hero pop-in and CTA

**Files:**
- Modify: `site/app/page.tsx`
- Create: `site/app/page.test.tsx`
- Create: `site/components/layout/HeroTitulo.tsx`

**Interfaces:**
- Consumes: `Faixa` with `variante: 'pink' | 'cyan' | 'escura'` (Task 4),
  `clip-hero-diagonal` utility (Task 1).
- Produces: `HeroTitulo` (default export from its own file) — used only by
  `app/page.tsx`, not consumed by any later task. This task fixes
  `app/page.tsx` itself, which Task 4's `Faixa` prop-type narrowing broke;
  Task 6 fixes every *other* page still using the old color tokens.

`app/page.tsx` has no test file today — this task creates the first one,
since the hero's new pop-in behavior and the Faixa wiring are worth
covering.

- [ ] **Step 1: Write the failing test**

Create `site/app/page.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/dados', () => ({
  listarPersonagens: vi.fn().mockReturnValue(
    Array.from({ length: 56 }, (_, i) => ({ id: `p${i}` }))
  ),
}));
vi.mock('@/lib/sprites', () => ({ spriteDoPersonagem: () => '/sprites/shuichi.webp' }));

import Inicio from './page';

describe('Página inicial', () => {
  it('mostra o título com a palavra em destaque', () => {
    render(Inicio());
    expect(screen.getByRole('heading', { name: /o caso está aberto/i })).toBeInTheDocument();
  });

  it('mostra as três faixas numeradas com os totais certos', () => {
    render(Inicio());
    expect(screen.getByRole('link', { name: /elenco/i })).toBeInTheDocument();
    expect(screen.getByText(/56 alunos/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /itens/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /mapa/i })).toBeInTheDocument();
  });

  it('o botão de começar tem o feedback tátil de clique', () => {
    render(Inicio());
    const cta = screen.getByRole('link', { name: /nunca joguei/i });
    expect(cta.className).toMatch(/active:translate-x-1/);
  });
});
```

**Note on `listarPersonagens`:** this branch (`overhaul-neopop-visual`, off
`main`) predates the Fase 2 admin-panel work — `Inicio` here reads
personagens via the plain synchronous `listarPersonagens()` from
`@/lib/dados`, not any async "com correções" variant. Use exactly this API;
do not introduce an async data layer as part of this plan.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/page.test.tsx`
Expected: FAIL — the markup doesn't have `active:translate-x-1` yet and
`Faixa` doesn't accept `variante="teal"`/`"papel"` any more (Task 4 already
narrowed the type), so `Inicio()` throws or renders with missing styling.
Confirms RED before implementing.

- [ ] **Step 3: Implement the new Home**

`Inicio` stays a plain Server Component (unaffected either way by adding
Framer Motion elsewhere), but the hero title needs `motion.h1`, which
requires a Client Component boundary — Server Components can't use
client-only libraries directly. Split the animated title into its own
small Client Component file rather than making the whole page client-side
(which would lose `Inicio`'s ability to read `listarPersonagens()` at
render time the way a Server Component does).

Create `site/components/layout/HeroTitulo.tsx`:

```tsx
'use client';

import { motion } from 'framer-motion';

export function HeroTitulo() {
  return (
    <motion.h1
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: [0.8, 1.05, 1], opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative mt-2 -rotate-1 text-5xl font-black leading-[.9] tracking-tight text-[#F2F2F5] sm:text-6xl"
    >
      O caso está<br />
      <span
        className="text-execution-pink"
        style={{ textShadow: '4px 4px 0px var(--color-cyber-cyan)' }}
      >
        aberto.
      </span>
    </motion.h1>
  );
}
```

Replace `site/app/page.tsx` (no `'use client'`, `Inicio` stays a Server
Component, imports `HeroTitulo`, keeps the plain synchronous
`listarPersonagens()` call this branch already uses — no `await`):

```tsx
import Link from 'next/link';
import { Faixa } from '@/components/layout/Faixa';
import { HeroTitulo } from '@/components/layout/HeroTitulo';
import { Boot } from '@/components/alter-ego/Boot';
import { listarPersonagens } from '@/lib/dados';
import { spriteDoPersonagem } from '@/lib/sprites';

export default function Inicio() {
  const total = listarPersonagens().length;

  return (
    <>
      <Boot />

      <section className="relative overflow-hidden bg-bg px-4 py-12 clip-hero-diagonal">
        <span
          aria-hidden
          className="pointer-events-none absolute -left-3 top-2 select-none text-7xl font-black leading-none tracking-tighter text-white/5 sm:text-9xl"
        >
          SHUICHI
        </span>
        <p className="relative font-mono text-[9px] tracking-[.2em] text-cyber-cyan">
          ARQUIVO DA COMUNIDADE BR/PT
        </p>
        <HeroTitulo />
        <p className="relative mt-3 max-w-md text-[12px] leading-relaxed text-dim">
          Tudo sobre o Shinri Trial, o Danganronpa Online do Garry&apos;s Mod, em português.
        </p>
        <Link
          href="/comecar/"
          className="active:translate-x-1 active:translate-y-1 active:shadow-none relative mt-5 inline-block border-2 border-white bg-[#08090D] px-3 py-1.5 font-mono text-[10px] tracking-[.14em] text-white shadow-[5px_5px_0px_var(--color-execution-pink)] transition-shadow hover:bg-execution-pink hover:text-[#08090D]"
        >
          NUNCA JOGUEI — COMEÇAR AQUI
        </Link>
      </section>

      <Faixa numero="01" titulo="ELENCO" variante="pink" url="/elenco/"
        sprite={spriteDoPersonagem('shuichi-saihara')}
        descricao={`${total} alunos: atributos, velocidade, itens iniciais e dicas de RP.`} />
      <Faixa numero="02" titulo="ITENS" variante="cyan" url="/itens/"
        descricao="162 itens: peso, raridade, onde spawnam e o que craftam." />
      <Faixa numero="03" titulo="MAPA" variante="escura" url="/mapa/"
        descricao="Cada local da academia, o que spawna lá e para onde conecta." />
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/page.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Run the full suite, tsc, and build**

```bash
npx vitest run
npx tsc --noEmit
npm run build
```

Expected: full suite passes; tsc clean; build succeeds — `app/page.tsx` no
longer references old `Faixa` variants. Every *other* page still references
the old color tokens and is still fine (tokens not removed yet) — Task 6
handles that.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/page.test.tsx components/layout/HeroTitulo.tsx
git commit -m "feat: Home ganha hero com pop-in e faixas no novo tema"
```

---

## Task 6: Sweep — remove old tokens, fix every other page's references

**Files:**
- Modify: `site/app/globals.css` (remove the 5 old color tokens)
- Modify: `site/components/conteudo/Prosa.tsx`
- Modify: `site/components/conteudo/StatusCodigo.tsx`
- Modify: `site/components/ficha/Papel.tsx`
- Modify: `site/components/itens/Receita.tsx`
- Modify: `site/components/itens/Selo.tsx`
- Modify: `site/components/dados/Regua.tsx`
- Modify: `site/components/ficha/CartaoPersonagem.tsx`
- Modify: `site/components/itens/BarraSpawn.tsx`
- Modify: `site/components/itens/CartaoItem.tsx`
- Modify: `site/app/codigos/page.tsx`
- Modify: `site/app/comecar/page.tsx`
- Modify: `site/app/elenco/[id]/page.tsx`
- Modify: `site/app/eventos/page.tsx`
- Modify: `site/app/eventos/[id]/page.tsx`
- Modify: `site/app/faq/page.tsx`
- Modify: `site/app/itens/[id]/page.tsx`
- Modify: `site/app/mapa/page.tsx`
- Modify: `site/app/mapa/[id]/page.tsx`
- Modify: `site/app/mecanicas/page.tsx`

**Interfaces:** none — this task changes no function signatures or exports,
only CSS class strings and one inline-style token reference. No new tests
(existing tests for these files assert on text/roles/behavior, not on exact
class names, so they continue to pass unchanged — confirmed by running the
full suite as this task's own verification).

This is **not** a redesign of these 17 files — it's the minimal, mechanical
fix that keeps them visually intact once the old tokens are gone. Their real
redesign happens in their own future sub-projects (Elenco, Itens, Mecânicas,
Mapa). The mapping below is exhaustive — every single occurrence in the
codebase as of this plan, found via `grep -rn "papel\|tinta\|\bteal\b\|teal-escuro\|\bred\b"`
across `app/` and `components/` and checked individually for whether it's a
real token reference (a few `red` matches are inside URL-pattern regexes,
unrelated to color, and are explicitly excluded below).

**Exact mapping** (apply every row — old string → new string, exact
substring match, case-sensitive):

| Old | New | Role |
|---|---|---|
| `text-teal` | `text-alter-green` | link/accent text |
| `hover:text-teal` | `hover:text-alter-green` | link/accent text on hover |
| `border-teal` | `border-alter-green` | accent border |
| `hover:border-teal` | `hover:border-alter-green` | accent border on hover |
| `bg-teal` | `bg-alter-green` | accent fill (progress bars) |
| `text-teal-escuro` | `text-ego-escuro` | dark accent text |
| `border-teal-escuro` | `border-ego-escuro` | dark accent border |
| `bg-teal-escuro` | `bg-ego-escuro` | dark accent fill |
| `open:border-teal-escuro` | `open:border-ego-escuro` | `<details>` open-state border |
| `'border-teal-escuro text-teal'` | `'border-ego-escuro text-alter-green'` | Selo.tsx tier object literal |
| `'border-teal bg-teal-escuro text-papel'` | `'border-alter-green bg-ego-escuro text-dim'` | Selo.tsx tier object literal |
| `'border-papel bg-papel text-tinta'` | `'border-line bg-sur text-dim'` | Selo.tsx tier object literal |
| `text-papel` | `text-dim` | light text on colored/dark background |
| `hover:text-papel` | `hover:text-dim` | light text on hover |
| `bg-papel` | `bg-sur` | card/panel background |
| `border-papel` | `border-line` | card/panel border |
| `text-tinta` (standalone, paired with a `bg-papel`→`bg-sur` in the same className string) | `text-dim` | readable text on a card |
| `bg-tinta/40` | `bg-line/40` | thin divider line |
| `text-tinta/40` | `text-dim/40` | faint decorative dash |
| `text-tinta/50` | `text-dim/50` | faint footnote text |
| `border-red` | `border-alerta` | negative/expired status border |
| `text-red` | `text-alerta` | negative/expired status text |
| `var(--color-red)` | `var(--color-alerta)` | inline-style negative color |
| `var(--color-teal)` | `var(--color-alter-green)` | inline-style positive color |

- [ ] **Step 1: Apply the mapping file by file**

Go through each file in the **Files** list above and apply every row of the
mapping table that appears in it (most files need 1-4 substitutions; use
the exact grep output below as your checklist per file — every line shown
is a real, current occurrence to fix):

```
components/conteudo/Prosa.tsx:19:        <code ... text-teal">
components/conteudo/Prosa.tsx:28:           className="text-teal underline underline-offset-2 hover:text-papel">
components/conteudo/StatusCodigo.tsx:37:    <span className="rounded-[2px] border border-red ... text-red">
components/conteudo/StatusCodigo.tsx:41:    <span className="rounded-[2px] border border-teal bg-teal-escuro ... text-papel">
components/ficha/Papel.tsx:6:      className="relative rounded-[2px] bg-papel p-4 text-tinta shadow-...
components/ficha/Papel.tsx:19:          <span className="h-px flex-1 bg-tinta/40" />
components/ficha/Papel.tsx:21:          <span className="h-px flex-1 bg-tinta/40" />
components/itens/Receita.tsx:30:              <span className="... bg-teal-escuro ... text-papel">
components/itens/Receita.tsx:35:                <Link ... className="text-[11px] text-[#D6D6E0] hover:text-teal">
components/itens/Receita.tsx:45:        <span aria-hidden className="font-mono text-[13px] text-teal">→</span>
components/itens/Receita.tsx:49:          className="flex items-center gap-1.5 rounded-[3px] border border-teal bg-teal-escuro ... text-papel"
components/itens/Selo.tsx:12:  3: 'border-teal-escuro text-teal',
components/itens/Selo.tsx:13:  4: 'border-teal bg-teal-escuro text-papel',
components/itens/Selo.tsx:14:  5: 'border-papel bg-papel text-tinta',
components/dados/Regua.tsx:20:  const cor = bom ? 'var(--color-teal)' : 'var(--color-red)';
components/ficha/CartaoPersonagem.tsx:8:      className="... hover:border-teal"
components/ficha/CartaoPersonagem.tsx:16:        <p className="text-[10px] text-teal">{p.talento.pt}</p>
components/itens/BarraSpawn.tsx:24:            <Link ... className="text-teal hover:underline">
components/itens/BarraSpawn.tsx:40:            <div className="h-full bg-teal" ...
components/itens/CartaoItem.tsx:10:      className="... hover:border-teal"
components/itens/CartaoItem.tsx:20:            className="font-mono text-[9px] text-teal"
app/codigos/page.tsx:26:            ... className="rounded-[2px] bg-[#22222C] px-1 font-mono text-teal">
app/codigos/page.tsx:37:                estaExpirado(c) ? 'border-line opacity-60' : 'border-teal-escuro'
app/codigos/page.tsx:46:              <p className="text-[12px] font-bold text-teal">{c.recompensa}</p>
app/codigos/page.tsx:53:                  className="... text-dim underline hover:text-teal"
app/comecar/page.tsx:61:                    className="font-mono text-[18px] font-black leading-none text-teal-escuro"
app/comecar/page.tsx:66:                    <p className="... text-teal">
app/comecar/page.tsx:85:                    className="... border-teal-escuro ... text-teal"
app/comecar/page.tsx:104:                  <span aria-hidden className="text-tinta/40">—</span>
app/comecar/page.tsx:122:                    className="text-[12px] font-bold text-teal hover:underline"
app/comecar/page.tsx:132:          <section className="rounded-[4px] border border-teal-escuro bg-[#12201F] p-3">
app/comecar/page.tsx:133:            <h2 className="... text-teal">
app/comecar/page.tsx:138,143,148,153,158: <Link ... className="text-[#D6D6E0] hover:text-teal">
app/elenco/[id]/page.tsx:29:      <Link ... className="font-mono text-[9px] text-dim hover:text-teal">
app/elenco/[id]/page.tsx:52:          <p className="... text-teal">
app/elenco/[id]/page.tsx:69:                    color: e.bom ? 'var(--color-teal)' : 'var(--color-red)',
app/eventos/page.tsx:36:                className={`... hover:border-teal ${
app/eventos/page.tsx:37:                  e.destaque ? 'border-teal-escuro' : 'border-line'
app/eventos/page.tsx:49:                    <span className="font-mono text-[8px] tracking-[.1em] text-teal">EM DESTAQUE</span>
app/eventos/[id]/page.tsx:21:      <Link ... className="font-mono text-[9px] text-dim hover:text-teal">
app/faq/page.tsx:22:            className="... hover:border-teal hover:text-teal"
app/faq/page.tsx:42:                className="... open:border-teal-escuro"
app/faq/page.tsx:44:                <summary className="... group-open:text-teal">
app/faq/page.tsx:45:                  <span className="... group-open:text-teal">?</span>
app/itens/[id]/page.tsx:54:            <span className="font-mono text-[9px] text-teal">
app/itens/[id]/page.tsx:103:                      className="... hover:border-teal hover:text-teal"
app/itens/[id]/page.tsx:127:              <p className="mt-3 font-mono text-[8px] text-tinta/50">
app/mapa/page.tsx:38:                className="... hover:border-teal"
app/mapa/page.tsx:42:                <p className="mt-2 font-mono text-[8px] text-teal">
app/mapa/page.tsx:67:                  className="... hover:border-teal hover:text-teal"
app/mapa/[id]/page.tsx:46:                    <Link ... className="text-teal hover:underline">
app/mapa/[id]/page.tsx:61:                    <div className="h-full bg-teal" ...
app/mecanicas/page.tsx:31:              <h3 className="... text-teal">
app/mecanicas/page.tsx:57:            className="... hover:border-teal hover:text-teal"
```

(`components/conteudo/Prosa.tsx` lines 8-9 contain the literal substring
`red` only as part of a URL-TLD regex alternation `(?:ru|com|gg|be|red|me)`
— this is matching domain endings like `.red`, unrelated to the color
token. Do **not** touch these two lines.)

- [ ] **Step 2: Remove the old tokens from `globals.css`**

Edit `site/app/globals.css`'s first `@theme` block — remove these five
lines (leave `--color-bg`, `--color-sur`, `--color-line`, `--color-dim`,
`--color-ego-claro`, `--color-ego-escuro` exactly as they are):

```diff
   --color-line: #2A2A33;
-  --color-papel: #E8E2D2;
-  --color-tinta: #14141A;
-  --color-teal: #63C4BC;
-  --color-teal-escuro: #1E6E73;
-  --color-red: #D9534A;
   --color-dim: #7A7A88;
```

- [ ] **Step 3: Run the full suite, tsc, and build**

```bash
npx vitest run
npx tsc --noEmit
npm run build
```

Expected: full suite passes (no test in this codebase asserts on the exact
old class names, only on visible text/roles/behavior — if any test does
fail here, it means Step 1 missed an occurrence; find it with
`grep -rn "papel\|tinta\|\bteal\b\|teal-escuro" app/ components/` and fix
it before proceeding); tsc clean; build succeeds with no "Module not
found"-style errors (there won't be any — this is a pure CSS/class-name
change, not a module dependency change).

- [ ] **Step 4: Visual verification — this is the real test for this task**

Per the Global Constraints note above, a clean build does **not** prove
these 17 files still look right (Tailwind silently drops unknown-token
classes rather than erroring). Start the dev server and visually check at
least three of the migrated pages:

```bash
npm run dev
```

Using the claude-in-chrome tools (same pattern as prior verification work
in this project): open `/itens/` (uses `Selo.tsx`'s rarity tiers and
`BarraSpawn.tsx`), `/comecar/` (heaviest single page in the mapping table),
and `/elenco/<qualquer-id>/` (uses `Regua.tsx`'s good/bad coloring and the
inline `var(--color-...)` fix). Confirm: no invisible text (text color
matching its background), no missing borders where one was clearly
intended, the "good" trait color (was teal, now `alter-green`) and "bad"
trait color (was red, now `alerta`) are visually distinct from each other.
Fix anything that looks wrong before considering this task done.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css components/conteudo/Prosa.tsx components/conteudo/StatusCodigo.tsx components/ficha/Papel.tsx components/itens/Receita.tsx components/itens/Selo.tsx components/dados/Regua.tsx components/ficha/CartaoPersonagem.tsx components/itens/BarraSpawn.tsx components/itens/CartaoItem.tsx app/codigos/page.tsx app/comecar/page.tsx "app/elenco/[id]/page.tsx" app/eventos/page.tsx "app/eventos/[id]/page.tsx" app/faq/page.tsx "app/itens/[id]/page.tsx" app/mapa/page.tsx "app/mapa/[id]/page.tsx" app/mecanicas/page.tsx
git commit -m "chore: remove tokens antigos da paleta e migra as paginas fora de escopo pro equivalente novo"
```

---

## Task 7: End-to-end verification

**Files:** none created — this task verifies Tasks 1-6 together.

- [ ] **Step 1: Full automated suite, lint, build**

```bash
cd site
npx vitest run
npx eslint .
npx tsc --noEmit
npm run build
```

Expected: full suite passes; lint has no new errors (pre-existing warnings
from before this plan are acceptable, no new ones from files this plan
touched); tsc clean; build succeeds with the same route list as before this
plan (no routes added or removed by this plan).

- [ ] **Step 2: Manual browser walkthrough**

Using the claude-in-chrome tools, with `npm run dev` running:

1. Visit `/` — confirm the ambient layer is visible but subtle (scanlines,
   halftone, marquee text barely visible in the background, particles
   drifting upward), the hero title pops in once on load, "ABERTO." is pink
   with a cyan shadow, the three Faixas are diagonally cut and in the new
   colors, and the CTA button visibly "presses in" on click.
2. Scroll down — confirm the header hides (existing behavior, unaffected by
   this plan) and the ambient layer keeps running underneath the content
   the whole time.
3. Press `Ctrl+K` (or `Cmd+K` on Mac) — confirm the search field focuses
   immediately, whether the header is visible or the page has been
   scrolled past it.
4. Hover a header nav link and a Faixa — confirm the crosshair reticle
   spins in on hover.
5. In OS/browser settings, enable "reduce motion" (or use Chrome DevTools'
   `prefers-reduced-motion` emulation) and reload `/` — confirm the
   scanline flicker, halftone breathing, marquee scroll, and particles all
   stop; the vignette (which was never animated) is unaffected.
6. Visit `/itens/`, `/comecar/`, and one `/elenco/<id>/` page — confirm they
   still look intact (Task 6's own verification already checked this; this
   is a final confirmation pass, not a new investigation).

- [ ] **Step 3: Report**

Summarize for the user: what's live, a reminder that this is sub-project 1
of 6 (Elenco+Perfil, Itens, Mecânicas, Mapa remain, each its own future
spec → plan → implementation cycle), and that the "seven" old-color-token
files migrated by Task 6 are functionally intact but not redesigned — their
real neo-pop treatment is each one's own future sub-project.
