# Shuichi Pull — Plano 1: Fundação + vertical do Elenco

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar o Shuichi Pull no ar com a landing, a janela do Alter Ego funcionando com busca, e a seção Elenco completa (listagem + ficha de personagem com a régua de distribuição), provando a pilha inteira de ponta a ponta.

**Architecture:** Next.js App Router exportado como site estático. Os dados de jogo vêm de um script de ingestão que lê os JSONs russos do Kirigiri Press, aplica o glossário RU→EN e um arquivo de traduções PT, e grava JSON tipado em `data/`. Nenhum componente lê arquivo direto: tudo passa por `lib/`, para que a Fase 2 troque arquivo por banco sem tocar em tela.

**Tech Stack:** Next.js 15 (App Router, `output: 'export'`), TypeScript, Tailwind CSS v4, Zod (validação de dados), Vitest + Testing Library (testes), sharp (otimização de sprites), tsx (rodar scripts).

**Spec:** `docs/superpowers/specs/2026-09-04-shuichi-pull-fase1-design.md`

## Global Constraints

- **Idioma da interface e do conteúdo:** PT-BR. Nomes de itens, locais e talentos mostram o termo em inglês junto, em cinza menor.
- **Princípio visual, vale para toda tela:** o site é papel, o Alter Ego é a única coisa digital nele. O verde de fósforo (`#4FA030`–`#256512`) só aparece dentro da janela dela. O creme `--papel` é objeto com sombra, nunca fundo de página.
- **Cores exatas:** `--bg #0E0E11`, `--sur #17171D`, `--line #2A2A33`, `--papel #E8E2D2`, `--tinta #14141A`, `--teal #63C4BC`, `--teal-d #1E6E73`, `--red #D9534A`, `--dim #7A7A88`.
- **Nenhum componente lê arquivo de dados direto.** Sempre via `lib/`.
- **Toda informação passada por cor tem também texto.** Valor colorido sempre acompanhado da frase em português.
- **`prefers-reduced-motion`** respeitado em toda animação; a de boot corta direto para o estado final.
- **A página nunca rola na horizontal.** Conteúdo largo rola dentro do próprio bloco.
- **Rodapé em todas as páginas:** crédito a Spike Chunsoft (sprites), à equipe do Shinri Trial e ao Kirigiri Press (dados-base), mais o aviso de que é site comunitário e não fonte oficial.
- **Fonte dos dados:** `kirigiris-guidebook/_raw/data/en/data.json` (nomes em russo, descrições em inglês) + `kirigiris-guidebook/_raw/data/i18n/glossary.ru-en.json`.
- **Commits em português**, no formato `tipo: descrição`.

---

### Task 1: Esqueleto do projeto e tokens de design

Cria o projeto Next.js, configura Tailwind com os tokens da spec, e deixa um teste rodando. Sem isso nada mais pode ser testado.

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `lib/tokens.ts`
- Test: `lib/tokens.test.ts`

**Interfaces:**
- Consumes: nada
- Produces: `lib/tokens.ts` exportando `export const cores: Record<string,string>` com as chaves `bg, sur, line, papel, tinta, teal, tealEscuro, red, dim, egoVerdeClaro, egoVerdeEscuro`. As classes Tailwind `bg-bg`, `text-papel`, `border-line` etc. ficam disponíveis para todas as tasks.

- [ ] **Step 1: Criar o projeto**

```bash
cd "C:/Users/cauer/Downloads/shuichi-pull"
npx create-next-app@latest site --typescript --tailwind --app --eslint --src-dir=false --import-alias="@/*" --no-turbopack --use-npm
```

Responda "No" se perguntar sobre customizar. O projeto nasce em `site/`.

- [ ] **Step 2: Instalar as dependências restantes**

```bash
cd site
npm install zod
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom tsx sharp
```

- [ ] **Step 3: Configurar export estático**

Substitua `site/next.config.ts` por:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
```

- [ ] **Step 4: Configurar o Vitest**

Crie `site/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

Crie `site/vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

Adicione ao `scripts` do `site/package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Escrever o teste dos tokens (vai falhar)**

Crie `site/lib/tokens.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { cores } from './tokens';

describe('tokens de cor', () => {
  it('expõe todas as cores da spec com os valores exatos', () => {
    expect(cores.bg).toBe('#0E0E11');
    expect(cores.sur).toBe('#17171D');
    expect(cores.line).toBe('#2A2A33');
    expect(cores.papel).toBe('#E8E2D2');
    expect(cores.tinta).toBe('#14141A');
    expect(cores.teal).toBe('#63C4BC');
    expect(cores.tealEscuro).toBe('#1E6E73');
    expect(cores.red).toBe('#D9534A');
    expect(cores.dim).toBe('#7A7A88');
  });

  it('reserva o verde do Alter Ego separado das cores do site', () => {
    expect(cores.egoVerdeClaro).toBe('#4FA030');
    expect(cores.egoVerdeEscuro).toBe('#256512');
  });
});
```

- [ ] **Step 6: Rodar o teste e confirmar que falha**

Run: `cd site && npm test`
Expected: FAIL — `Failed to resolve import "./tokens"`

- [ ] **Step 7: Escrever os tokens**

Crie `site/lib/tokens.ts`:

```ts
export const cores = {
  bg: '#0E0E11',
  sur: '#17171D',
  line: '#2A2A33',
  papel: '#E8E2D2',
  tinta: '#14141A',
  teal: '#63C4BC',
  tealEscuro: '#1E6E73',
  red: '#D9534A',
  dim: '#7A7A88',
  egoVerdeClaro: '#4FA030',
  egoVerdeEscuro: '#256512',
} as const;

export type Cor = keyof typeof cores;
```

- [ ] **Step 8: Registrar os tokens no Tailwind**

Substitua o conteúdo de `site/app/globals.css` por:

```css
@import "tailwindcss";

@theme {
  --color-bg: #0E0E11;
  --color-sur: #17171D;
  --color-line: #2A2A33;
  --color-papel: #E8E2D2;
  --color-tinta: #14141A;
  --color-teal: #63C4BC;
  --color-teal-escuro: #1E6E73;
  --color-red: #D9534A;
  --color-dim: #7A7A88;
  --color-ego-claro: #4FA030;
  --color-ego-escuro: #256512;
}

html, body {
  background: var(--color-bg);
  color: #D6D6E0;
}

/* A página nunca rola na horizontal. */
body { overflow-x: hidden; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 9: Rodar o teste e confirmar que passa**

Run: `cd site && npm test`
Expected: PASS — 2 testes

- [ ] **Step 10: Confirmar que o build estático funciona**

Run: `cd site && npm run build`
Expected: build conclui e cria `site/out/`

- [ ] **Step 11: Commit**

```bash
cd "C:/Users/cauer/Downloads/shuichi-pull"
git add site/ .gitignore
git commit -m "feat: esqueleto do projeto Next.js com tokens de design"
```

---

### Task 2: Glossário RU→EN

Os dados canônicos têm nomes em russo. Esta task expõe a tradução para inglês, que é a ponte para o português.

**Files:**
- Create: `site/lib/glossario.ts`
- Test: `site/lib/glossario.test.ts`

**Interfaces:**
- Consumes: `lib/tokens.ts` (nada em runtime)
- Produces:
  - `type CategoriaGlossario = 'items' | 'locations' | 'statusEffects' | 'characters' | 'talents'`
  - `function traduzirRuEn(termo: string, categoria: CategoriaGlossario): string` — devolve o inglês, ou o próprio termo se não houver entrada
  - `function carregarGlossario(): Record<CategoriaGlossario, Record<string, string>>`

- [ ] **Step 1: Escrever o teste (vai falhar)**

Crie `site/lib/glossario.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { traduzirRuEn, carregarGlossario } from './glossario';

describe('glossário RU→EN', () => {
  it('traduz nome de item conhecido', () => {
    expect(traduzirRuEn('Мелкие детали', 'items')).toBe('Small Parts');
  });

  it('traduz nome de local conhecido', () => {
    expect(traduzirRuEn('1 этаж', 'locations')).toBe('1F');
  });

  it('devolve o termo original quando não há entrada no glossário', () => {
    expect(traduzirRuEn('термин-inexistente', 'items')).toBe('термин-inexistente');
  });

  it('carrega as cinco categorias esperadas', () => {
    const g = carregarGlossario();
    expect(Object.keys(g).sort()).toEqual(
      ['characters', 'items', 'locations', 'statusEffects', 'talents'].sort()
    );
    expect(Object.keys(g.items).length).toBeGreaterThan(150);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- glossario`
Expected: FAIL — módulo não encontrado

- [ ] **Step 3: Implementar**

Crie `site/lib/glossario.ts`:

```ts
import fs from 'node:fs';
import path from 'node:path';

export type CategoriaGlossario =
  | 'items' | 'locations' | 'statusEffects' | 'characters' | 'talents';

const CAMINHO = path.join(
  process.cwd(), '..', 'kirigiris-guidebook', '_raw', 'data', 'i18n', 'glossary.ru-en.json'
);

type Glossario = Record<CategoriaGlossario, Record<string, string>>;

let cache: Glossario | null = null;

export function carregarGlossario(): Glossario {
  if (cache) return cache;
  const bruto = JSON.parse(fs.readFileSync(CAMINHO, 'utf-8')) as Record<string, unknown>;
  cache = {
    items: (bruto.items ?? {}) as Record<string, string>,
    locations: (bruto.locations ?? {}) as Record<string, string>,
    statusEffects: (bruto.statusEffects ?? {}) as Record<string, string>,
    characters: (bruto.characters ?? {}) as Record<string, string>,
    talents: (bruto.talents ?? {}) as Record<string, string>,
  };
  return cache;
}

export function traduzirRuEn(termo: string, categoria: CategoriaGlossario): string {
  return carregarGlossario()[categoria][termo] ?? termo;
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `cd site && npm test -- glossario`
Expected: PASS — 4 testes

- [ ] **Step 5: Commit**

```bash
git add site/lib/glossario.ts site/lib/glossario.test.ts
git commit -m "feat: glossario RU para EN dos dados do jogo"
```

---

### Task 3: Parser dos atributos de personagem

Os atributos vêm como frases (`"Run speed 190 units"`). Esta task extrai o número, que é o que a régua precisa.

**Files:**
- Create: `site/lib/atributos.ts`
- Test: `site/lib/atributos.test.ts`

**Interfaces:**
- Consumes: nada
- Produces:
  - `type TipoAtributo = 'speed' | 'capacity' | 'attention'`
  - `function extrairValor(valor: string, tipo: TipoAtributo): number | null`

- [ ] **Step 1: Escrever o teste (vai falhar)**

Crie `site/lib/atributos.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { extrairValor } from './atributos';

describe('extrairValor', () => {
  it('lê a velocidade', () => {
    expect(extrairValor('Run speed 190 units', 'speed')).toBe(190);
    expect(extrairValor('Run speed 180 units', 'speed')).toBe(180);
  });

  it('lê a capacidade', () => {
    expect(extrairValor('Capacity 14 units', 'capacity')).toBe(14);
    expect(extrairValor('Capacity 45 units', 'capacity')).toBe(45);
  });

  it('lê a percepção, inclusive com o sufixo de máximo', () => {
    expect(extrairValor('Perception 7', 'attention')).toBe(7);
    expect(extrairValor('Perception 10 (max.)', 'attention')).toBe(10);
  });

  it('devolve null quando a frase não bate com o tipo', () => {
    expect(extrairValor('Hunger 20% less often', 'speed')).toBeNull();
    expect(extrairValor('', 'capacity')).toBeNull();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- atributos`
Expected: FAIL — módulo não encontrado

- [ ] **Step 3: Implementar**

Crie `site/lib/atributos.ts`:

```ts
export type TipoAtributo = 'speed' | 'capacity' | 'attention';

const PADROES: Record<TipoAtributo, RegExp> = {
  speed: /Run speed (\d+)/i,
  capacity: /Capacity (\d+)/i,
  attention: /Perception (\d+)/i,
};

export function extrairValor(valor: string, tipo: TipoAtributo): number | null {
  const achado = PADROES[tipo].exec(valor);
  return achado ? Number(achado[1]) : null;
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `cd site && npm test -- atributos`
Expected: PASS — 4 testes

- [ ] **Step 5: Commit**

```bash
git add site/lib/atributos.ts site/lib/atributos.test.ts
git commit -m "feat: parser dos atributos numericos dos personagens"
```

---

### Task 4: Schema e tipos dos personagens

Define o formato que o site consome e falha o build se o dado estiver quebrado.

**Files:**
- Create: `site/lib/schema.ts`
- Test: `site/lib/schema.test.ts`

**Interfaces:**
- Consumes: nada
- Produces:
  - `type Texto = { pt: string; en: string }`
  - `type Personagem` com os campos abaixo
  - `const PersonagemSchema` (Zod) e `function validarPersonagens(dados: unknown): Personagem[]`

- [ ] **Step 1: Escrever o teste (vai falhar)**

Crie `site/lib/schema.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { validarPersonagens } from './schema';

const valido = {
  id: 'chihiro-fujisaki',
  nome: 'Chihiro Fujisaki',
  talento: { pt: 'Programação Suprema', en: 'Ultimate Programmer' },
  descricao: { pt: 'Uma pessoa frágil e tímida.', en: 'A fragile and shy youth.' },
  jogo: 'Danganronpa: Trigger Happy Havoc',
  velocidade: 180,
  mochila: 13,
  percepcao: 9,
  vida: 100,
  etiquetas: [{ pt: 'Fome 20% menos frequente', en: 'Hunger 20% less often', bom: true }],
  sprite: '/sprites/chihiro/halfbody-01.webp',
  traducaoRevisada: false,
};

describe('validarPersonagens', () => {
  it('aceita um personagem completo', () => {
    const r = validarPersonagens([valido]);
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe('chihiro-fujisaki');
    expect(r[0].percepcao).toBe(9);
  });

  it('rejeita quando falta um atributo obrigatório', () => {
    const { velocidade, ...semVelocidade } = valido;
    expect(() => validarPersonagens([semVelocidade])).toThrow();
  });

  it('rejeita percepção fora da faixa de 1 a 10', () => {
    expect(() => validarPersonagens([{ ...valido, percepcao: 11 }])).toThrow();
  });

  it('rejeita id que não seja kebab-case', () => {
    expect(() => validarPersonagens([{ ...valido, id: 'Chihiro Fujisaki' }])).toThrow();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- schema`
Expected: FAIL — módulo não encontrado

- [ ] **Step 3: Implementar**

Crie `site/lib/schema.ts`:

```ts
import { z } from 'zod';

export const TextoSchema = z.object({ pt: z.string().min(1), en: z.string().min(1) });
export type Texto = z.infer<typeof TextoSchema>;

export const EtiquetaSchema = z.object({
  pt: z.string().min(1),
  en: z.string().min(1),
  bom: z.boolean(),
});
export type Etiqueta = z.infer<typeof EtiquetaSchema>;

export const PersonagemSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id deve ser kebab-case'),
  nome: z.string().min(1),
  talento: TextoSchema,
  descricao: TextoSchema,
  jogo: z.string().min(1),
  velocidade: z.number().int().min(100).max(400),
  mochila: z.number().int().min(1).max(200),
  percepcao: z.number().int().min(1).max(10),
  vida: z.number().int().min(1),
  etiquetas: z.array(EtiquetaSchema),
  sprite: z.string().min(1),
  traducaoRevisada: z.boolean(),
});
export type Personagem = z.infer<typeof PersonagemSchema>;

export function validarPersonagens(dados: unknown): Personagem[] {
  return z.array(PersonagemSchema).parse(dados);
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `cd site && npm test -- schema`
Expected: PASS — 4 testes

- [ ] **Step 5: Commit**

```bash
git add site/lib/schema.ts site/lib/schema.test.ts
git commit -m "feat: schema e validacao dos personagens"
```

---

### Task 5: Traduções PT do elenco

Arquivo de tradução separado do código, editável por ADM na Fase 2. Contém talentos e descrições em português.

**Files:**
- Create: `site/data/traducoes/elenco.pt.json`, `site/lib/traducoes.ts`
- Test: `site/lib/traducoes.test.ts`

**Interfaces:**
- Consumes: nada
- Produces: `function traduzirPt(chave: string): string | null` — busca por chave em inglês e devolve o português, ou `null` se ainda não traduzido.

- [ ] **Step 1: Escrever o teste (vai falhar)**

Crie `site/lib/traducoes.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { traduzirPt } from './traducoes';

describe('traduzirPt', () => {
  it('traduz um talento conhecido', () => {
    expect(traduzirPt('Ultimate Programmer')).toBe('Programação Suprema');
  });

  it('traduz outro talento conhecido', () => {
    expect(traduzirPt('Ultimate Lucky Student')).toBe('Sortudo Supremo');
  });

  it('devolve null para chave sem tradução', () => {
    expect(traduzirPt('Ultimate Nonexistent Thing')).toBeNull();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- traducoes`
Expected: FAIL — módulo não encontrado

- [ ] **Step 3: Criar o arquivo de traduções**

Crie `site/data/traducoes/elenco.pt.json`. Comece com os talentos abaixo; o restante entra no Step 6.

```json
{
  "Ultimate Programmer": "Programação Suprema",
  "Ultimate Lucky Student": "Sortudo Supremo",
  "Ultimate Detective": "Detetive Supremo",
  "Ultimate Affluent Progeny": "Herdeiro Supremo",
  "Ultimate Biker Gang Leader": "Líder de Gangue Supremo",
  "Ultimate Fashionista": "Fashionista Suprema",
  "Ultimate Swimmer": "Nadadora Suprema",
  "Ultimate Writing Prodigy": "Escritora Suprema",
  "Ultimate Moral Compass": "Bússola Moral Suprema",
  "Ultimate Clairvoyant": "Vidente Suprema",
  "Ultimate Martial Artist": "Artista Marcial Suprema",
  "Ultimate Baseball Star": "Astro do Beisebol Supremo",
  "Ultimate Pop Sensation": "Ídolo Pop Suprema",
  "Ultimate Gambler": "Apostadora Suprema"
}
```

- [ ] **Step 4: Implementar o carregador**

Crie `site/lib/traducoes.ts`:

```ts
import elenco from '@/data/traducoes/elenco.pt.json';

const mapa = elenco as Record<string, string>;

export function traduzirPt(chave: string): string | null {
  return mapa[chave] ?? null;
}
```

Garanta que `site/tsconfig.json` tem `"resolveJsonModule": true` em `compilerOptions`.

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `cd site && npm test -- traducoes`
Expected: PASS — 3 testes

- [ ] **Step 6: Completar as traduções do elenco**

Rode este comando para listar todos os talentos em inglês que ainda faltam:

```bash
cd "C:/Users/cauer/Downloads/shuichi-pull"
PYTHONIOENCODING=utf-8 python -c "
import json
d=json.load(open('kirigiris-guidebook/_raw/data/en/data.json',encoding='utf-8'))
g=json.load(open('kirigiris-guidebook/_raw/data/i18n/glossary.ru-en.json',encoding='utf-8'))
pt=json.load(open('site/data/traducoes/elenco.pt.json',encoding='utf-8'))
falta=[]
for jogo in d['cast']:
    for c in jogo['characters']:
        t=g['talents'].get(c['talent'],c['talent'])
        if t not in pt and t not in falta: falta.append(t)
print(json.dumps({t:'' for t in falta},ensure_ascii=False,indent=2))
"
```

Traduza cada um e adicione ao `elenco.pt.json`. Regra de tradução: o padrão "Ultimate X" vira "X Supremo/Suprema", concordando com o substantivo em português.

- [ ] **Step 7: Commit**

```bash
git add site/data/traducoes/ site/lib/traducoes.ts site/lib/traducoes.test.ts site/tsconfig.json
git commit -m "feat: traducoes PT dos talentos do elenco"
```

---

### Task 6: Script de ingestão do elenco

Converte os dados brutos no `data/personagens.json` que o site consome. Reexecutável.

**Files:**
- Create: `site/scripts/ingerir-elenco.ts`
- Create (gerado): `site/data/personagens.json`
- Test: `site/scripts/ingerir-elenco.test.ts`

**Interfaces:**
- Consumes: `traduzirRuEn` (Task 2), `extrairValor` (Task 3), `validarPersonagens` (Task 4), `traduzirPt` (Task 5)
- Produces:
  - `function gerarId(nome: string): string` — "Chihiro Fujisaki" → "chihiro-fujisaki"
  - `function ingerirElenco(): Personagem[]`

- [ ] **Step 1: Escrever o teste (vai falhar)**

Crie `site/scripts/ingerir-elenco.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { gerarId, ingerirElenco } from './ingerir-elenco';

describe('gerarId', () => {
  it('transforma nome em kebab-case', () => {
    expect(gerarId('Chihiro Fujisaki')).toBe('chihiro-fujisaki');
    expect(gerarId('Makoto Naegi')).toBe('makoto-naegi');
  });

  it('remove acentos e pontuação', () => {
    expect(gerarId('K1-B0')).toBe('k1-b0');
  });
});

describe('ingerirElenco', () => {
  const elenco = ingerirElenco();

  it('traz os 56 personagens', () => {
    expect(elenco).toHaveLength(56);
  });

  it('traz a Chihiro com os atributos corretos', () => {
    const c = elenco.find((p) => p.id === 'chihiro-fujisaki');
    expect(c).toBeDefined();
    expect(c!.velocidade).toBe(180);
    expect(c!.mochila).toBe(13);
    expect(c!.percepcao).toBe(9);
    expect(c!.talento.en).toBe('Ultimate Programmer');
    expect(c!.talento.pt).toBe('Programação Suprema');
  });

  it('não deixa nenhum id repetido', () => {
    const ids = elenco.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todo personagem tem os três atributos da régua', () => {
    for (const p of elenco) {
      expect(p.velocidade).toBeGreaterThan(0);
      expect(p.mochila).toBeGreaterThan(0);
      expect(p.percepcao).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- ingerir-elenco`
Expected: FAIL — módulo não encontrado

- [ ] **Step 3: Implementar**

Crie `site/scripts/ingerir-elenco.ts`:

```ts
import fs from 'node:fs';
import path from 'node:path';
import { traduzirRuEn } from '../lib/glossario';
import { extrairValor } from '../lib/atributos';
import { traduzirPt } from '../lib/traducoes';
import { validarPersonagens, type Personagem, type Etiqueta } from '../lib/schema';

const BRUTO = path.join(
  process.cwd(), '..', 'kirigiris-guidebook', '_raw', 'data', 'en', 'data.json'
);

type FeatureBruta = { label: string; value: string; kind: string };
type PersonagemBruto = {
  name: string; talent: string; description: string; features: FeatureBruta[];
};
type JogoBruto = { game: string; characters: PersonagemBruto[] };

export function gerarId(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Atributos que pioram quando sobem (fome mais rápida, sono mais frequente).
const ETIQUETA_RUIM = /(faster|more often)/i;

export function ingerirElenco(): Personagem[] {
  const bruto = JSON.parse(fs.readFileSync(BRUTO, 'utf-8')) as { cast: JogoBruto[] };
  const saida: Personagem[] = [];

  for (const jogo of bruto.cast) {
    for (const p of jogo.characters) {
      const nome = traduzirRuEn(p.name, 'characters');
      const talentoEn = traduzirRuEn(p.talent, 'talents');

      let velocidade = 0, mochila = 0, percepcao = 0, vida = 100;
      const etiquetas: Etiqueta[] = [];

      for (const f of p.features) {
        const v = f.value;
        if (f.kind === 'speed') velocidade = extrairValor(v, 'speed') ?? velocidade;
        else if (f.kind === 'capacity') mochila = extrairValor(v, 'capacity') ?? mochila;
        else if (f.kind === 'attention') percepcao = extrairValor(v, 'attention') ?? percepcao;
        else if (f.kind === 'needs' && /HP/.test(v)) vida = Number(/(\d+)\s*HP/.exec(v)?.[1] ?? vida);
        else {
          etiquetas.push({
            en: v,
            pt: traduzirPt(v) ?? v,
            bom: !ETIQUETA_RUIM.test(v),
          });
        }
      }

      const id = gerarId(nome);
      saida.push({
        id,
        nome,
        talento: { en: talentoEn, pt: traduzirPt(talentoEn) ?? talentoEn },
        descricao: { en: p.description, pt: traduzirPt(p.description) ?? p.description },
        jogo: jogo.game,
        velocidade, mochila, percepcao, vida,
        etiquetas,
        sprite: `/sprites/${id}.webp`,
        traducaoRevisada: false,
      });
    }
  }

  return validarPersonagens(saida);
}

// Execução direta: `npx tsx scripts/ingerir-elenco.ts`
if (process.argv[1]?.endsWith('ingerir-elenco.ts')) {
  const elenco = ingerirElenco();
  const destino = path.join(process.cwd(), 'data', 'personagens.json');
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, JSON.stringify(elenco, null, 2), 'utf-8');
  console.log(`${elenco.length} personagens gravados em ${destino}`);
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `cd site && npm test -- ingerir-elenco`
Expected: PASS — 6 testes

Se o teste da Chihiro falhar dizendo que o talento veio em russo, o glossário não tem a entrada. Confira com:
```bash
cd "C:/Users/cauer/Downloads/shuichi-pull"
PYTHONIOENCODING=utf-8 python -c "
import json; g=json.load(open('kirigiris-guidebook/_raw/data/i18n/glossary.ru-en.json',encoding='utf-8'))
print([k for k,v in g['talents'].items() if 'Programmer' in v])"
```

- [ ] **Step 5: Gerar o arquivo de dados**

```bash
cd site && npx tsx scripts/ingerir-elenco.ts
```
Expected: `56 personagens gravados em .../data/personagens.json`

- [ ] **Step 6: Adicionar o script ao package.json**

Em `site/package.json`, dentro de `scripts`:
```json
"dados": "tsx scripts/ingerir-elenco.ts"
```

- [ ] **Step 7: Commit**

```bash
git add site/scripts/ site/data/personagens.json site/package.json
git commit -m "feat: ingestao do elenco a partir dos dados brutos"
```

---

### Task 7: Cálculo da distribuição

O miolo da régua: dado o valor de um personagem e os valores de todos, calcula colunas, média e colocação.

**Files:**
- Create: `site/lib/distribuicao.ts`
- Test: `site/lib/distribuicao.test.ts`

**Interfaces:**
- Consumes: nada
- Produces:
```ts
type Coluna = { valor: number; quantidade: number; ehOValor: boolean };
type Distribuicao = {
  colunas: Coluna[]; min: number; max: number; media: number;
  abaixo: number; iguais: number; acima: number; total: number;
};
function calcularDistribuicao(valores: number[], valor: number, passo?: number): Distribuicao;
function frasePosicao(d: Distribuicao, maiorEhMelhor: boolean): string;
```

- [ ] **Step 1: Escrever o teste (vai falhar)**

Crie `site/lib/distribuicao.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { calcularDistribuicao, frasePosicao } from './distribuicao';

describe('calcularDistribuicao', () => {
  const valores = [1, 2, 2, 3, 3, 3, 4];

  it('conta quantos há em cada valor', () => {
    const d = calcularDistribuicao(valores, 3);
    expect(d.colunas).toEqual([
      { valor: 1, quantidade: 1, ehOValor: false },
      { valor: 2, quantidade: 2, ehOValor: false },
      { valor: 3, quantidade: 3, ehOValor: true },
      { valor: 4, quantidade: 1, ehOValor: false },
    ]);
  });

  it('calcula min, max, média e total', () => {
    const d = calcularDistribuicao(valores, 3);
    expect(d.min).toBe(1);
    expect(d.max).toBe(4);
    expect(d.total).toBe(7);
    expect(d.media).toBeCloseTo(2.57, 1);
  });

  it('conta quantos estão abaixo, iguais e acima', () => {
    const d = calcularDistribuicao(valores, 3);
    expect(d.abaixo).toBe(3);
    expect(d.iguais).toBe(3);
    expect(d.acima).toBe(1);
  });

  it('cria colunas vazias nos buracos quando recebe passo', () => {
    const d = calcularDistribuicao([10, 20], 10, 5);
    expect(d.colunas.map((c) => c.valor)).toEqual([10, 15, 20]);
    expect(d.colunas[1].quantidade).toBe(0);
  });

  it('reproduz a velocidade real da Chihiro', () => {
    const velocidades = [
      ...Array(7).fill(180), ...Array(3).fill(185), ...Array(10).fill(190),
      ...Array(7).fill(195), ...Array(10).fill(200), ...Array(6).fill(205),
      ...Array(4).fill(210), ...Array(4).fill(215), ...Array(3).fill(220),
      225, 230,
    ];
    const d = calcularDistribuicao(velocidades, 180, 5);
    expect(d.total).toBe(56);
    expect(d.abaixo).toBe(0);
    expect(d.iguais).toBe(7);
    expect(Math.round(d.media)).toBe(198);
  });
});

describe('frasePosicao', () => {
  it('descreve o grupo mais baixo quando maior é melhor', () => {
    const d = calcularDistribuicao([...Array(7).fill(180), ...Array(49).fill(200)], 180, 5);
    expect(frasePosicao(d, true)).toBe('no grupo mais baixo · 7 de 56 empatam');
  });

  it('descreve quantos estão acima quando maior é melhor', () => {
    const d = calcularDistribuicao([...Array(51).fill(5), ...Array(5).fill(10)], 5);
    expect(frasePosicao(d, true)).toBe('5 de 56 estão acima');
  });

  it('inverte a leitura quando menor é melhor', () => {
    const d = calcularDistribuicao([...Array(51).fill(5), ...Array(5).fill(10)], 10);
    expect(frasePosicao(d, false)).toBe('51 de 56 estão melhor');
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- distribuicao`
Expected: FAIL — módulo não encontrado

- [ ] **Step 3: Implementar**

Crie `site/lib/distribuicao.ts`:

```ts
export type Coluna = { valor: number; quantidade: number; ehOValor: boolean };

export type Distribuicao = {
  colunas: Coluna[];
  min: number; max: number; media: number;
  abaixo: number; iguais: number; acima: number; total: number;
};

export function calcularDistribuicao(
  valores: number[], valor: number, passo?: number
): Distribuicao {
  if (valores.length === 0) throw new Error('calcularDistribuicao precisa de ao menos um valor');

  const contagem = new Map<number, number>();
  for (const v of valores) contagem.set(v, (contagem.get(v) ?? 0) + 1);

  const min = Math.min(...valores);
  const max = Math.max(...valores);

  const chaves: number[] = passo
    ? Array.from({ length: Math.floor((max - min) / passo) + 1 }, (_, i) => min + i * passo)
    : [...contagem.keys()].sort((a, b) => a - b);

  const colunas: Coluna[] = chaves.map((v) => ({
    valor: v,
    quantidade: contagem.get(v) ?? 0,
    ehOValor: v === valor,
  }));

  const soma = valores.reduce((a, b) => a + b, 0);

  return {
    colunas, min, max,
    media: soma / valores.length,
    abaixo: valores.filter((v) => v < valor).length,
    iguais: valores.filter((v) => v === valor).length,
    acima: valores.filter((v) => v > valor).length,
    total: valores.length,
  };
}

export function frasePosicao(d: Distribuicao, maiorEhMelhor: boolean): string {
  if (d.abaixo === 0) return `no grupo mais baixo · ${d.iguais} de ${d.total} empatam`;
  if (d.acima === 0) return `no grupo mais alto · ${d.iguais} de ${d.total} empatam`;
  return maiorEhMelhor
    ? `${d.acima} de ${d.total} estão acima`
    : `${d.abaixo} de ${d.total} estão melhor`;
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `cd site && npm test -- distribuicao`
Expected: PASS — 8 testes

- [ ] **Step 5: Commit**

```bash
git add site/lib/distribuicao.ts site/lib/distribuicao.test.ts
git commit -m "feat: calculo da distribuicao de atributos do elenco"
```

---

### Task 8: Otimização dos sprites

Os 237 PNGs somam ~12,5 MB. Este passo converte para WebP redimensionado antes de entrarem no site.

**Files:**
- Create: `site/scripts/otimizar-sprites.ts`
- Create (gerado): `site/public/sprites/*.webp`

**Interfaces:**
- Consumes: nada
- Produces: `function otimizar(origem: string, destino: string, largura: number): Promise<void>`; arquivos em `site/public/sprites/`

- [ ] **Step 1: Escrever o script**

Crie `site/scripts/otimizar-sprites.ts`:

```ts
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ORIGEM = path.join(process.cwd(), '..', 'assets', 'sprites');
const DESTINO = path.join(process.cwd(), 'public', 'sprites');

export async function otimizar(origem: string, destino: string, largura: number) {
  await sharp(origem).resize({ width: largura, withoutEnlargement: true })
    .webp({ quality: 82 }).toFile(destino);
}

async function main() {
  fs.mkdirSync(DESTINO, { recursive: true });
  let n = 0;
  for (const pasta of fs.readdirSync(ORIGEM)) {
    const dirOrigem = path.join(ORIGEM, pasta);
    if (!fs.statSync(dirOrigem).isDirectory()) continue;
    const dirDestino = path.join(DESTINO, pasta);
    fs.mkdirSync(dirDestino, { recursive: true });

    for (const arquivo of fs.readdirSync(dirOrigem)) {
      if (!/\.png$/i.test(arquivo)) continue;
      // Alter Ego é tela deitada e aparece pequeno; o resto é personagem de corpo.
      const largura = pasta === 'alterego' ? 480 : 700;
      const saida = path.join(dirDestino, arquivo.replace(/\.png$/i, '.webp'));
      await otimizar(path.join(dirOrigem, arquivo), saida, largura);
      n++;
    }
  }
  console.log(`${n} sprites otimizados em ${DESTINO}`);
}

if (process.argv[1]?.endsWith('otimizar-sprites.ts')) main();
```

- [ ] **Step 2: Rodar**

```bash
cd site && npx tsx scripts/otimizar-sprites.ts
```
Expected: `237 sprites otimizados em .../public/sprites`

- [ ] **Step 3: Verificar que o peso caiu**

```bash
du -sh ../assets/sprites public/sprites
```
Expected: `public/sprites` bem menor que `assets/sprites` (esperado abaixo de 4 MB).

- [ ] **Step 4: Adicionar o script ao package.json**

```json
"sprites": "tsx scripts/otimizar-sprites.ts"
```

- [ ] **Step 5: Commit**

```bash
git add site/scripts/otimizar-sprites.ts site/public/sprites site/package.json
git commit -m "feat: otimizacao dos sprites para WebP"
```

---

### Task 9: Estados do Alter Ego

A lógica que decide se ela mostra sprite ou kaomoji. Sem UI ainda.

**Files:**
- Create: `site/lib/alter-ego.ts`, `site/content/falas.json`
- Test: `site/lib/alter-ego.test.ts`

**Interfaces:**
- Consumes: nada
- Produces:
```ts
type EstadoEgo =
  | 'ocioso' | 'busca-com-resultado' | 'busca-sem-resultado'
  | 'item-raro' | 'primeira-visita' | 'carregando' | 'erro-404';
type Face = { tipo: 'sprite'; src: string } | { tipo: 'kaomoji'; texto: string };
function faceDoEstado(estado: EstadoEgo): Face;
function falaDoEstado(estado: EstadoEgo, variaveis?: Record<string, string|number>): string;
```

- [ ] **Step 1: Escrever o teste (vai falhar)**

Crie `site/lib/alter-ego.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { faceDoEstado, falaDoEstado } from './alter-ego';

describe('faceDoEstado', () => {
  it('usa sprite quando o estado tem arte própria', () => {
    const f = faceDoEstado('ocioso');
    expect(f.tipo).toBe('sprite');
    expect(f.tipo === 'sprite' && f.src).toMatch(/\.webp$/);
  });

  it('usa kaomoji quando o estado não tem sprite', () => {
    expect(faceDoEstado('item-raro')).toEqual({ tipo: 'kaomoji', texto: '(・o・)' });
    expect(faceDoEstado('carregando')).toEqual({ tipo: 'kaomoji', texto: '(－ω－) zZ' });
    expect(faceDoEstado('erro-404')).toEqual({ tipo: 'kaomoji', texto: '(╥﹏╥)' });
  });

  it('cobre todos os estados sem quebrar', () => {
    const estados = ['ocioso','busca-com-resultado','busca-sem-resultado',
      'item-raro','primeira-visita','carregando','erro-404'] as const;
    for (const e of estados) expect(faceDoEstado(e)).toBeDefined();
  });
});

describe('falaDoEstado', () => {
  it('devolve a fala do estado', () => {
    expect(falaDoEstado('erro-404')).toBe('Essa página não existe...');
  });

  it('substitui variáveis na fala', () => {
    expect(falaDoEstado('busca-com-resultado', { n: 12 })).toBe('Achei 12 resultados!');
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- alter-ego`
Expected: FAIL — módulo não encontrado

- [ ] **Step 3: Criar as falas**

Crie `site/content/falas.json`:

```json
{
  "ocioso": "Pode perguntar, eu procuro pra você!",
  "busca-com-resultado": "Achei {n} resultados!",
  "busca-sem-resultado": "Não achei nada... tenta outro nome?",
  "item-raro": "Esse é raro! Presta atenção onde ele spawna.",
  "primeira-visita": "Primeira vez aqui? Vem que eu te explico!",
  "carregando": "Só um segundinho...",
  "erro-404": "Essa página não existe..."
}
```

- [ ] **Step 4: Implementar**

Crie `site/lib/alter-ego.ts`:

```ts
import falas from '@/content/falas.json';

export type EstadoEgo =
  | 'ocioso' | 'busca-com-resultado' | 'busca-sem-resultado'
  | 'item-raro' | 'primeira-visita' | 'carregando' | 'erro-404';

export type Face =
  | { tipo: 'sprite'; src: string }
  | { tipo: 'kaomoji'; texto: string };

// Só estes estados têm sprite oficial. O resto usa kaomoji — é o que dá
// estados ilimitados sem precisar de arte nova.
const SPRITES: Partial<Record<EstadoEgo, string>> = {
  'ocioso': '/sprites/alterego/Alter_Ego_Sprite_Danganronpa_1_(1).webp',
  'busca-com-resultado': '/sprites/alterego/Alter_Ego_Sprite_Danganronpa_1_(3).webp',
  'busca-sem-resultado': '/sprites/alterego/Alter_Ego_Sprite_Danganronpa_1_(6).webp',
};

const KAOMOJIS: Record<EstadoEgo, string> = {
  'ocioso': '(・‿・)',
  'busca-com-resultado': '(◕‿◕)',
  'busca-sem-resultado': '(´･_･`)',
  'item-raro': '(・o・)',
  'primeira-visita': '(๑•̀ㅂ•́)و',
  'carregando': '(－ω－) zZ',
  'erro-404': '(╥﹏╥)',
};

export function faceDoEstado(estado: EstadoEgo): Face {
  const sprite = SPRITES[estado];
  return sprite
    ? { tipo: 'sprite', src: sprite }
    : { tipo: 'kaomoji', texto: KAOMOJIS[estado] };
}

export function falaDoEstado(
  estado: EstadoEgo, variaveis: Record<string, string | number> = {}
): string {
  const modelo = (falas as Record<string, string>)[estado] ?? '';
  return modelo.replace(/\{(\w+)\}/g, (_, chave) => String(variaveis[chave] ?? `{${chave}}`));
}
```

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `cd site && npm test -- alter-ego`
Expected: PASS — 5 testes

- [ ] **Step 6: Commit**

```bash
git add site/lib/alter-ego.ts site/content/falas.json site/lib/alter-ego.test.ts
git commit -m "feat: estados do Alter Ego com sprite e kaomoji"
```

---

### Task 10: Componente da janela do Alter Ego

A janela em si: barra de título, tela (sprite ou kaomoji), balão de fala.

**Files:**
- Create: `site/components/alter-ego/JanelaEgo.tsx`
- Test: `site/components/alter-ego/JanelaEgo.test.tsx`

**Interfaces:**
- Consumes: `faceDoEstado`, `falaDoEstado` (Task 9)
- Produces: `<JanelaEgo estado={EstadoEgo} variaveis?={Record<string,string|number>} compacta?={boolean} onFechar?={() => void} />`

- [ ] **Step 1: Escrever o teste (vai falhar)**

Crie `site/components/alter-ego/JanelaEgo.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JanelaEgo } from './JanelaEgo';

describe('JanelaEgo', () => {
  it('mostra o sprite quando o estado tem arte', () => {
    render(<JanelaEgo estado="ocioso" />);
    expect(screen.getByRole('img', { name: /alter ego/i })).toBeInTheDocument();
  });

  it('mostra o kaomoji quando o estado não tem sprite', () => {
    render(<JanelaEgo estado="erro-404" />);
    expect(screen.getByText('(╥﹏╥)')).toBeInTheDocument();
  });

  it('mostra a fala do estado', () => {
    render(<JanelaEgo estado="erro-404" />);
    expect(screen.getByText('Essa página não existe...')).toBeInTheDocument();
  });

  it('substitui variáveis na fala', () => {
    render(<JanelaEgo estado="busca-com-resultado" variaveis={{ n: 12 }} />);
    expect(screen.getByText('Achei 12 resultados!')).toBeInTheDocument();
  });

  it('esconde a fala no modo compacto', () => {
    render(<JanelaEgo estado="erro-404" compacta />);
    expect(screen.queryByText('Essa página não existe...')).not.toBeInTheDocument();
  });

  it('chama onFechar ao clicar no botão de fechar', async () => {
    const aoFechar = vi.fn();
    render(<JanelaEgo estado="ocioso" onFechar={aoFechar} />);
    screen.getByRole('button', { name: /fechar/i }).click();
    expect(aoFechar).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- JanelaEgo`
Expected: FAIL — módulo não encontrado

- [ ] **Step 3: Implementar**

Crie `site/components/alter-ego/JanelaEgo.tsx`:

```tsx
'use client';

import { faceDoEstado, falaDoEstado, type EstadoEgo } from '@/lib/alter-ego';

type Props = {
  estado: EstadoEgo;
  variaveis?: Record<string, string | number>;
  compacta?: boolean;
  onFechar?: () => void;
};

export function JanelaEgo({ estado, variaveis, compacta = false, onFechar }: Props) {
  const face = faceDoEstado(estado);
  const fala = falaDoEstado(estado, variaveis);

  return (
    <div className="overflow-hidden rounded-[3px] border border-[#3d5732] bg-[#0d100c]">
      <div className="flex items-center gap-1.5 bg-gradient-to-b from-[#3f5c33] to-[#294020] px-1.5 py-0.5 font-mono text-[8px] tracking-[.09em] text-[#dff5cf]">
        <span>ALTER_EGO</span>
        {onFechar && (
          <button
            type="button"
            aria-label="Fechar a janela do Alter Ego"
            onClick={onFechar}
            className="ml-auto opacity-80 hover:opacity-100"
          >
            ▭ ✕
          </button>
        )}
      </div>

      {face.tipo === 'sprite' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={face.src} alt="Alter Ego" className="block w-full" />
      ) : (
        <div
          className="relative flex items-center justify-center overflow-hidden border-[3px] border-[#E9F7DF] bg-gradient-to-b from-ego-claro to-ego-escuro"
          style={{ aspectRatio: '679 / 392' }}
        >
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(#00000000 0 2px, #0000004d 2px 4px)',
            }}
          />
          <b className="relative z-10 font-normal text-[#F2FFE8] [text-shadow:0_0_9px_#b6ff7e]"
             style={{ fontSize: 'clamp(14px, 4.5cqw, 30px)' }}>
            {face.texto}
          </b>
        </div>
      )}

      {!compacta && (
        <p className="bg-[#101609] px-1.5 py-1 text-[9px] leading-snug text-[#a9c898]">
          {fala}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `cd site && npm test -- JanelaEgo`
Expected: PASS — 6 testes

- [ ] **Step 5: Commit**

```bash
git add site/components/alter-ego/
git commit -m "feat: componente da janela do Alter Ego"
```

---

### Task 11: Componente da régua de distribuição

O gráfico aprovado: histograma da distribuição real, coluna do personagem acesa, média tracejada, eixo rotulado, e a frase em português.

**Files:**
- Create: `site/components/dados/Regua.tsx`
- Test: `site/components/dados/Regua.test.tsx`

**Interfaces:**
- Consumes: `calcularDistribuicao`, `frasePosicao` (Task 7)
- Produces: `<Regua nome={string} valor={number} unidade={string} valores={number[]} passo?={number} maiorEhMelhor={boolean} sentido={string} />`

- [ ] **Step 1: Escrever o teste (vai falhar)**

Crie `site/components/dados/Regua.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Regua } from './Regua';

const velocidades = [
  ...Array(7).fill(180), ...Array(3).fill(185), ...Array(10).fill(190),
  ...Array(7).fill(195), ...Array(10).fill(200), ...Array(6).fill(205),
  ...Array(4).fill(210), ...Array(4).fill(215), ...Array(3).fill(220), 225, 230,
];

describe('Regua', () => {
  const props = {
    nome: 'VELOCIDADE', valor: 180, unidade: 'u/s',
    valores: velocidades, passo: 5, maiorEhMelhor: true, sentido: 'mais rápido',
  };

  it('mostra o nome, o valor e a unidade', () => {
    render(<Regua {...props} />);
    expect(screen.getByText('VELOCIDADE')).toBeInTheDocument();
    expect(screen.getByText('180')).toBeInTheDocument();
    expect(screen.getByText('u/s')).toBeInTheDocument();
  });

  it('mostra a frase de posição em português', () => {
    render(<Regua {...props} />);
    expect(screen.getByText(/no grupo mais baixo · 7 de 56 empatam/)).toBeInTheDocument();
  });

  it('rotula as pontas da escala com mínimo e máximo', () => {
    render(<Regua {...props} />);
    expect(screen.getByText(/^180$/, { selector: '.ponta-min' })).toBeInTheDocument();
    expect(screen.getByText(/^230$/, { selector: '.ponta-max' })).toBeInTheDocument();
  });

  it('explica o sentido do eixo', () => {
    render(<Regua {...props} />);
    expect(screen.getByText('mais rápido →')).toBeInTheDocument();
  });

  it('desenha uma coluna por valor da escala', () => {
    render(<Regua {...props} />);
    expect(screen.getAllByTestId('coluna')).toHaveLength(11);
  });

  it('marca a coluna do personagem', () => {
    render(<Regua {...props} />);
    const marcadas = screen.getAllByTestId('coluna').filter(
      (c) => c.getAttribute('data-ativa') === 'true'
    );
    expect(marcadas).toHaveLength(1);
  });

  it('descreve o gráfico para leitor de tela', () => {
    render(<Regua {...props} />);
    expect(screen.getByRole('img', { name: /VELOCIDADE.*180.*média/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- Regua`
Expected: FAIL — módulo não encontrado

- [ ] **Step 3: Implementar**

Crie `site/components/dados/Regua.tsx`:

```tsx
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
  const cor = bom ? 'var(--color-teal)' : 'var(--color-red)';

  const posMedia = ((d.media - d.min) / Math.max(d.max - d.min, 1)) * 100;
  const resumo =
    `${nome}: ${valor} ${unidade}. ${frase}. Média do elenco: ${Math.round(d.media)}. ` +
    `Escala de ${d.min} a ${d.max}.`;

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-baseline gap-2">
        <span className="font-mono text-[10px] font-bold tracking-[.09em] text-[#D6D6E0]">{nome}</span>
        <span className="text-[19px] font-black leading-none" style={{ color: cor }}>{valor}</span>
        <span className="font-mono text-[8px] text-dim">{unidade}</span>
        <span className="ml-auto font-mono text-[8px] text-dim">{frase}</span>
      </div>

      <div className="relative" role="img" aria-label={resumo}>
        <div className="flex h-[38px] items-end gap-[3px] overflow-x-auto" aria-hidden>
          {d.colunas.map((c) => (
            <div
              key={c.valor}
              data-testid="coluna"
              data-ativa={c.ehOValor}
              title={`${c.valor} ${unidade}: ${c.quantidade} aluno(s)`}
              className="relative min-h-px flex-1 rounded-t-[1px]"
              style={{
                height: `${Math.max((c.quantidade / pico) * 100, 1)}%`,
                background: c.ehOValor ? cor : '#22222C',
              }}
            >
              {c.ehOValor && (
                <span
                  className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-[2px] px-1.5 py-px font-mono text-[7.5px] font-bold"
                  style={{ background: cor, color: '#0A0A0D' }}
                >
                  {c.valor} ← ela
                </span>
              )}
            </div>
          ))}
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute -top-1 bottom-0 w-px bg-white/25"
          style={{ left: `${posMedia}%` }}
        >
          <span className="absolute -top-3 left-1 whitespace-nowrap font-mono text-[7px] text-white/50">
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

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `cd site && npm test -- Regua`
Expected: PASS — 7 testes

- [ ] **Step 5: Commit**

```bash
git add site/components/dados/
git commit -m "feat: regua de distribuicao dos atributos"
```

---

### Task 12: Acesso aos dados e busca

A camada `lib/` que as páginas usam. Nenhum componente lê arquivo direto.

**Files:**
- Create: `site/lib/dados.ts`, `site/lib/busca.ts`
- Test: `site/lib/dados.test.ts`, `site/lib/busca.test.ts`

**Interfaces:**
- Consumes: `data/personagens.json` (Task 6), `Personagem` (Task 4)
- Produces:
  - `function listarPersonagens(): Personagem[]`
  - `function buscarPersonagem(id: string): Personagem | null`
  - `function valoresDoElenco(atributo: 'velocidade'|'mochila'|'percepcao'): number[]`
  - `type Resultado = { id: string; titulo: string; subtitulo: string; url: string }`
  - `function buscar(termo: string): Resultado[]`

- [ ] **Step 1: Escrever os testes (vão falhar)**

Crie `site/lib/dados.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { listarPersonagens, buscarPersonagem, valoresDoElenco } from './dados';

describe('acesso aos dados', () => {
  it('lista os 56 personagens', () => {
    expect(listarPersonagens()).toHaveLength(56);
  });

  it('acha um personagem pelo id', () => {
    const c = buscarPersonagem('chihiro-fujisaki');
    expect(c?.nome).toBe('Chihiro Fujisaki');
  });

  it('devolve null para id inexistente', () => {
    expect(buscarPersonagem('personagem-que-nao-existe')).toBeNull();
  });

  it('devolve os 56 valores de um atributo', () => {
    const v = valoresDoElenco('velocidade');
    expect(v).toHaveLength(56);
    expect(Math.min(...v)).toBe(180);
    expect(Math.max(...v)).toBe(230);
  });
});
```

Crie `site/lib/busca.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buscar } from './busca';

describe('buscar', () => {
  it('acha personagem pelo nome', () => {
    const r = buscar('chihiro');
    expect(r[0].titulo).toBe('Chihiro Fujisaki');
    expect(r[0].url).toBe('/elenco/chihiro-fujisaki/');
  });

  it('ignora acento e caixa', () => {
    expect(buscar('CHIHIRO').length).toBeGreaterThan(0);
    expect(buscar('programacao').length).toBeGreaterThan(0);
  });

  it('acha pelo talento em português e em inglês', () => {
    expect(buscar('Programação Suprema').length).toBeGreaterThan(0);
    expect(buscar('Ultimate Programmer').length).toBeGreaterThan(0);
  });

  it('devolve vazio para termo sem resultado', () => {
    expect(buscar('zzzzzzzz')).toEqual([]);
  });

  it('devolve vazio para termo muito curto', () => {
    expect(buscar('a')).toEqual([]);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falham**

Run: `cd site && npm test -- dados busca`
Expected: FAIL — módulos não encontrados

- [ ] **Step 3: Implementar o acesso aos dados**

Crie `site/lib/dados.ts`:

```ts
import bruto from '@/data/personagens.json';
import { validarPersonagens, type Personagem } from './schema';

// Valida uma vez no import: se o dado estiver quebrado, o build falha.
const personagens: Personagem[] = validarPersonagens(bruto);

export function listarPersonagens(): Personagem[] {
  return personagens;
}

export function buscarPersonagem(id: string): Personagem | null {
  return personagens.find((p) => p.id === id) ?? null;
}

export function valoresDoElenco(
  atributo: 'velocidade' | 'mochila' | 'percepcao'
): number[] {
  return personagens.map((p) => p[atributo]);
}
```

- [ ] **Step 4: Implementar a busca**

Crie `site/lib/busca.ts`:

```ts
import { listarPersonagens } from './dados';

export type Resultado = {
  id: string; titulo: string; subtitulo: string; url: string;
};

function normalizar(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

type Entrada = Resultado & { chaves: string };

let indice: Entrada[] | null = null;

function construirIndice(): Entrada[] {
  if (indice) return indice;
  indice = listarPersonagens().map((p) => ({
    id: p.id,
    titulo: p.nome,
    subtitulo: p.talento.pt,
    url: `/elenco/${p.id}/`,
    chaves: normalizar([p.nome, p.talento.pt, p.talento.en, p.jogo].join(' ')),
  }));
  return indice;
}

export function buscar(termo: string): Resultado[] {
  const t = normalizar(termo);
  if (t.length < 2) return [];
  return construirIndice()
    .filter((e) => e.chaves.includes(t))
    .map(({ chaves, ...r }) => r);
}
```

- [ ] **Step 5: Rodar e confirmar que passam**

Run: `cd site && npm test -- dados busca`
Expected: PASS — 9 testes

- [ ] **Step 6: Commit**

```bash
git add site/lib/dados.ts site/lib/dados.test.ts site/lib/busca.ts site/lib/busca.test.ts
git commit -m "feat: camada de acesso aos dados e busca"
```

---

### Task 13: Barra do topo com a janela do Alter Ego

A barra é a janela dela. Ao rolar, vira ícone; clicando no ícone, a janela reabre flutuante e persiste entre páginas.

**Files:**
- Create: `site/components/alter-ego/BarraEgo.tsx`, `site/components/alter-ego/usePersistencia.ts`
- Modify: `site/app/layout.tsx`
- Test: `site/components/alter-ego/BarraEgo.test.tsx`

**Interfaces:**
- Consumes: `<JanelaEgo>` (Task 10), `buscar` (Task 12)
- Produces: `<BarraEgo />` — usar uma vez no layout raiz.

- [ ] **Step 1: Escrever o teste (vai falhar)**

Crie `site/components/alter-ego/BarraEgo.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BarraEgo } from './BarraEgo';

describe('BarraEgo', () => {
  beforeEach(() => localStorage.clear());

  it('mostra a busca e os links de seção', () => {
    render(<BarraEgo />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /elenco/i })).toBeInTheDocument();
  });

  it('lista resultados ao digitar', () => {
    render(<BarraEgo />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'chihiro' } });
    expect(screen.getByText('Chihiro Fujisaki')).toBeInTheDocument();
  });

  it('avisa quando não acha nada', () => {
    render(<BarraEgo />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzzzzzz' } });
    expect(screen.getByText(/não achei nada/i)).toBeInTheDocument();
  });

  it('lembra que a janela flutuante ficou aberta', () => {
    localStorage.setItem('ego-flutuante-aberta', 'true');
    render(<BarraEgo />);
    expect(screen.getByTestId('ego-flutuante')).toBeInTheDocument();
  });

  it('guarda o fechamento da janela flutuante', () => {
    localStorage.setItem('ego-flutuante-aberta', 'true');
    render(<BarraEgo />);
    fireEvent.click(screen.getByRole('button', { name: /fechar a janela/i }));
    expect(localStorage.getItem('ego-flutuante-aberta')).toBe('false');
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- BarraEgo`
Expected: FAIL — módulo não encontrado

- [ ] **Step 3: Implementar a persistência**

Crie `site/components/alter-ego/usePersistencia.ts`:

```ts
'use client';

import { useEffect, useState } from 'react';

/** Estado booleano que sobrevive à navegação entre páginas. */
export function usePersistencia(chave: string, inicial: boolean) {
  const [valor, setValor] = useState(inicial);

  useEffect(() => {
    const guardado = localStorage.getItem(chave);
    if (guardado !== null) setValor(guardado === 'true');
  }, [chave]);

  function definir(novo: boolean) {
    setValor(novo);
    localStorage.setItem(chave, String(novo));
  }

  return [valor, definir] as const;
}
```

- [ ] **Step 4: Implementar a barra**

Crie `site/components/alter-ego/BarraEgo.tsx`:

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { JanelaEgo } from './JanelaEgo';
import { usePersistencia } from './usePersistencia';
import { buscar, type Resultado } from '@/lib/busca';
import type { EstadoEgo } from '@/lib/alter-ego';

const SECOES = [
  { nome: 'Elenco', url: '/elenco/' },
  { nome: 'Itens', url: '/itens/' },
  { nome: 'Mapa', url: '/mapa/' },
  { nome: 'FAQ', url: '/faq/' },
];

export function BarraEgo() {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [barraVisivel, setBarraVisivel] = useState(true);
  const [flutuanteAberta, setFlutuanteAberta] = usePersistencia('ego-flutuante-aberta', false);
  const alvo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResultados(buscar(termo));
  }, [termo]);

  // A barra "sai de cena" quando o topo da página some.
  useEffect(() => {
    const el = alvo.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(([e]) => setBarraVisivel(e.isIntersecting));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const estado: EstadoEgo =
    termo.length < 2 ? 'ocioso'
    : resultados.length > 0 ? 'busca-com-resultado'
    : 'busca-sem-resultado';

  const busca = (
    <div className="relative flex-1">
      <input
        type="search"
        role="searchbox"
        aria-label="Buscar no Shuichi Pull"
        placeholder="buscar item, local, personagem…"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        className="w-full rounded-[3px] border border-[#2E2E3A] bg-[#141419] px-2 py-1.5 font-mono text-[10px] text-[#D6D6E0] placeholder:text-[#6E6E7E]"
      />
      {termo.length >= 2 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-[3px] border border-line bg-sur">
          {resultados.length === 0 ? (
            <li className="px-2 py-2 text-[10px] text-dim">Não achei nada... tenta outro nome?</li>
          ) : (
            resultados.map((r) => (
              <li key={r.id}>
                <Link href={r.url} className="block px-2 py-1.5 hover:bg-[#22222C]">
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

  return (
    <>
      <div ref={alvo} aria-hidden className="h-px" />

      <header className="sticky top-0 z-40 flex items-center gap-2 border-b-2 border-teal-escuro bg-[#0A0A0D] px-2 py-1.5">
        <div className="w-[52px] shrink-0">
          <JanelaEgo estado={estado} variaveis={{ n: resultados.length }} compacta />
        </div>
        {busca}
        <nav className="hidden gap-3 sm:flex">
          {SECOES.map((s) => (
            <Link key={s.url} href={s.url}
              className="font-mono text-[9px] tracking-[.12em] text-[#B9C9C6] hover:text-teal">
              {s.nome.toUpperCase()}
            </Link>
          ))}
        </nav>
      </header>

      {!barraVisivel && !flutuanteAberta && (
        <button
          type="button"
          aria-label="Abrir a janela do Alter Ego"
          onClick={() => setFlutuanteAberta(true)}
          className="fixed bottom-5 right-5 z-50 h-11 w-11 overflow-hidden rounded-full border-2 border-[#6f9a58] shadow-lg"
        >
          <JanelaEgo estado="ocioso" compacta />
        </button>
      )}

      {flutuanteAberta && (
        <div data-testid="ego-flutuante" className="fixed bottom-5 right-5 z-50 w-40 shadow-2xl">
          <JanelaEgo
            estado={estado}
            variaveis={{ n: resultados.length }}
            onFechar={() => setFlutuanteAberta(false)}
          />
          <div className="mt-1">{busca}</div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 5: Colocar a barra no layout**

Substitua `site/app/layout.tsx` por:

```tsx
import type { Metadata } from 'next';
import './globals.css';
import { BarraEgo } from '@/components/alter-ego/BarraEgo';
import { Rodape } from '@/components/layout/Rodape';

export const metadata: Metadata = {
  title: 'Shuichi Pull — o arquivo da comunidade BR/PT de Shinri Trial',
  description:
    'Tudo sobre o Shinri Trial, o Danganronpa Online do Garry\'s Mod: personagens, itens, mapa e mecânicas, em português.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg">
        <BarraEgo />
        <main>{children}</main>
        <Rodape />
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Criar o rodapé de créditos**

Crie `site/components/layout/Rodape.tsx`:

```tsx
export function Rodape() {
  return (
    <footer className="mt-16 border-t border-line px-4 py-8 text-[9px] leading-relaxed text-dim">
      <p className="mb-2 font-mono tracking-[.12em] text-[#B9B9C6]">SHUICHI PULL</p>
      <p className="max-w-2xl">
        Site feito pela comunidade brasileira e portuguesa. Não é fonte oficial de
        notícias, anúncios ou informações sobre o Shinri Trial.
      </p>
      <p className="mt-2 max-w-2xl">
        Personagens e sprites são propriedade da Spike Chunsoft. Dados de jogo
        conferidos com a extração do Kirigiri Press. Obrigado à equipe do Shinri Trial.
      </p>
    </footer>
  );
}
```

- [ ] **Step 7: Rodar e confirmar que passa**

Run: `cd site && npm test -- BarraEgo`
Expected: PASS — 5 testes

- [ ] **Step 8: Commit**

```bash
git add site/components/ site/app/layout.tsx
git commit -m "feat: barra do topo com janela do Alter Ego, busca e rodape"
```

---

### Task 14: Listagem do Elenco

**Files:**
- Create: `site/app/elenco/page.tsx`, `site/components/ficha/CartaoPersonagem.tsx`
- Test: `site/components/ficha/CartaoPersonagem.test.tsx`

**Interfaces:**
- Consumes: `listarPersonagens` (Task 12), `Personagem` (Task 4)
- Produces: `<CartaoPersonagem personagem={Personagem} />`

- [ ] **Step 1: Escrever o teste (vai falhar)**

Crie `site/components/ficha/CartaoPersonagem.test.tsx`:

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
    render(<CartaoPersonagem personagem={chihiro} />);
    expect(screen.getByText('Chihiro Fujisaki')).toBeInTheDocument();
    expect(screen.getByText('Programação Suprema')).toBeInTheDocument();
  });

  it('mostra o talento em inglês junto, como manda a spec', () => {
    render(<CartaoPersonagem personagem={chihiro} />);
    expect(screen.getByText('Ultimate Programmer')).toBeInTheDocument();
  });

  it('leva para a ficha do personagem', () => {
    render(<CartaoPersonagem personagem={chihiro} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/elenco/chihiro-fujisaki/');
  });

  it('marca a tradução não revisada', () => {
    render(<CartaoPersonagem personagem={chihiro} />);
    expect(screen.getByTitle(/tradução não revisada/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- CartaoPersonagem`
Expected: FAIL — módulo não encontrado

- [ ] **Step 3: Implementar o cartão**

Crie `site/components/ficha/CartaoPersonagem.tsx`:

```tsx
import Link from 'next/link';
import type { Personagem } from '@/lib/schema';

export function CartaoPersonagem({ personagem: p }: { personagem: Personagem }) {
  return (
    <Link
      href={`/elenco/${p.id}/`}
      className="group relative block overflow-hidden rounded-[4px] border border-line bg-sur transition-colors hover:border-teal"
    >
      <div className="relative flex h-36 items-end justify-center overflow-hidden bg-bg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.sprite} alt="" className="h-full object-contain object-bottom" />
      </div>
      <div className="p-2">
        <p className="text-[12px] font-bold leading-tight text-[#D6D6E0]">{p.nome}</p>
        <p className="text-[10px] text-teal">{p.talento.pt}</p>
        <p className="font-mono text-[8px] text-dim">{p.talento.en}</p>
      </div>
      {!p.traducaoRevisada && (
        <span
          title="Tradução não revisada por um ADM"
          className="absolute right-1.5 top-1.5 rounded-[2px] border border-dim px-1 font-mono text-[7px] text-dim"
        >
          ?
        </span>
      )}
    </Link>
  );
}
```

- [ ] **Step 4: Criar a página de listagem**

Crie `site/app/elenco/page.tsx`:

```tsx
import { listarPersonagens } from '@/lib/dados';
import { CartaoPersonagem } from '@/components/ficha/CartaoPersonagem';

export const metadata = { title: 'Elenco — Shuichi Pull' };

export default function PaginaElenco() {
  const personagens = listarPersonagens();
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
            {lista.map((p) => <CartaoPersonagem key={p.id} personagem={p} />)}
          </div>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Rodar os testes e o build**

Run: `cd site && npm test -- CartaoPersonagem && npm run build`
Expected: testes PASS; build gera `/elenco/index.html`

- [ ] **Step 6: Commit**

```bash
git add site/app/elenco/ site/components/ficha/
git commit -m "feat: listagem do elenco"
```

---

### Task 15: Ficha de personagem

A página que junta tudo: cabeçalho com nome fantasma, arte, carteirinha de papel, régua de distribuição.

**Files:**
- Create: `site/app/elenco/[id]/page.tsx`, `site/components/ficha/Papel.tsx`
- Test: `site/components/ficha/Papel.test.tsx`

**Interfaces:**
- Consumes: `buscarPersonagem`, `listarPersonagens`, `valoresDoElenco` (Task 12), `<Regua>` (Task 11)
- Produces: `<Papel>{children}</Papel>` — ficha de papel creme com sombra

- [ ] **Step 1: Escrever o teste do papel (vai falhar)**

Crie `site/components/ficha/Papel.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Papel } from './Papel';

describe('Papel', () => {
  it('mostra o conteúdo dentro', () => {
    render(<Papel><p>conteúdo da ficha</p></Papel>);
    expect(screen.getByText('conteúdo da ficha')).toBeInTheDocument();
  });

  it('mostra o título quando recebe um', () => {
    render(<Papel titulo="COMO JOGAR"><p>x</p></Papel>);
    expect(screen.getByRole('heading', { name: 'COMO JOGAR' })).toBeInTheDocument();
  });

  it('usa o creme como fundo do papel, nunca da página', () => {
    const { container } = render(<Papel><p>x</p></Papel>);
    expect(container.firstChild).toHaveClass('bg-papel');
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- Papel`
Expected: FAIL — módulo não encontrado

- [ ] **Step 3: Implementar o papel**

Crie `site/components/ficha/Papel.tsx`:

```tsx
type Props = { titulo?: string; children: React.ReactNode };

export function Papel({ titulo, children }: Props) {
  return (
    <div
      className="relative rounded-[2px] bg-papel p-4 text-tinta shadow-[0_10px_26px_rgba(0,0,0,.7)]"
      style={{ transform: 'rotate(-0.4deg)' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(#14141a12 1px, transparent 1px)',
          backgroundSize: '4px 4px',
        }}
      />
      {titulo && (
        <h2 className="relative mb-2 flex items-center gap-2 font-serif text-[12px] tracking-[.18em]">
          <span className="h-px flex-1 bg-tinta/40" />
          {titulo}
          <span className="h-px flex-1 bg-tinta/40" />
        </h2>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: Criar a ficha de personagem**

Crie `site/app/elenco/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { buscarPersonagem, listarPersonagens, valoresDoElenco } from '@/lib/dados';
import { Regua } from '@/components/dados/Regua';
import { Papel } from '@/components/ficha/Papel';

export function generateStaticParams() {
  return listarPersonagens().map((p) => ({ id: p.id }));
}

export default async function FichaPersonagem({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = buscarPersonagem(id);
  if (!p) notFound();

  const sobrenome = p.nome.split(' ').slice(-1)[0].toUpperCase();

  return (
    <article className="px-4 py-8">
      <header className="relative overflow-hidden">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-3 -top-2 select-none text-6xl font-black leading-none tracking-tighter text-white/5 sm:text-8xl"
        >
          {sobrenome}
        </span>
        <p className="relative font-mono text-[8px] tracking-[.2em] text-dim">
          {p.jogo}
        </p>
        <h1 className="relative text-4xl font-black tracking-tight text-[#F2F2F5]">
          {p.nome}
        </h1>
        <p className="relative font-serif text-lg italic text-teal">{p.talento.pt}</p>
        <p className="relative font-mono text-[9px] text-dim">{p.talento.en}</p>
      </header>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="mx-auto w-40 shrink-0 sm:mx-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.sprite} alt={`Sprite de ${p.nome}`} className="w-full" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-4 font-mono text-[8px] tracking-[.14em] text-dim">
            ATRIBUTOS · comparado às {listarPersonagens().length} fichas do jogo
          </p>
          <Regua
            nome="VELOCIDADE" valor={p.velocidade} unidade="u/s"
            valores={valoresDoElenco('velocidade')} passo={5}
            maiorEhMelhor sentido="mais rápido"
          />
          <Regua
            nome="MOCHILA" valor={p.mochila} unidade="unid."
            valores={valoresDoElenco('mochila')} passo={1}
            maiorEhMelhor sentido="carrega mais"
          />
          <Regua
            nome="PERCEPÇÃO" valor={p.percepcao} unidade="de 10"
            valores={valoresDoElenco('percepcao')} passo={1}
            maiorEhMelhor sentido="enxerga mais"
          />

          {p.etiquetas.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {p.etiquetas.map((e) => (
                <li key={e.en}
                  className="rounded-[2px] border px-1.5 py-0.5 font-mono text-[8px]"
                  style={{ color: e.bom ? 'var(--color-teal)' : 'var(--color-red)',
                           borderColor: 'currentColor' }}>
                  {e.pt}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 max-w-2xl">
        <Papel titulo="SOBRE">
          <p className="text-[12px] leading-relaxed">{p.descricao.pt}</p>
          {!p.traducaoRevisada && (
            <p className="mt-3 font-mono text-[8px] text-tinta/50">
              Tradução ainda não revisada por um ADM.
            </p>
          )}
        </Papel>
      </div>
    </article>
  );
}
```

- [ ] **Step 5: Rodar os testes e o build**

Run: `cd site && npm test && npm run build`
Expected: todos os testes PASS; build gera 56 páginas em `out/elenco/`

- [ ] **Step 6: Conferir no navegador**

```bash
cd site && npm run dev
```
Abra `http://localhost:3000/elenco/chihiro-fujisaki/` e confirme:
- a régua da velocidade mostra "no grupo mais baixo · 7 de 56 empatam"
- a coluna dela está acesa em vermelho com a etiqueta "180 ← ela"
- a linha da média marca 198
- a página não rola na horizontal em tela estreita

- [ ] **Step 7: Commit**

```bash
git add site/app/elenco/ site/components/ficha/Papel.tsx site/components/ficha/Papel.test.tsx
git commit -m "feat: ficha de personagem com regua de distribuicao"
```

---

### Task 16: Landing e animação de boot

A capa em faixas e o boot do Alter Ego que termina virando a barra.

**Files:**
- Create: `site/app/page.tsx`, `site/components/layout/Faixa.tsx`, `site/components/alter-ego/Boot.tsx`
- Test: `site/components/layout/Faixa.test.tsx`, `site/components/alter-ego/Boot.test.tsx`

**Interfaces:**
- Consumes: `<JanelaEgo>` (Task 10)
- Produces: `<Faixa numero={string} titulo={string} descricao={string} url={string} sprite?={string} variante={'teal'|'papel'|'escura'} />`, `<Boot />`

- [ ] **Step 1: Escrever os testes (vão falhar)**

Crie `site/components/layout/Faixa.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Faixa } from './Faixa';

describe('Faixa', () => {
  const props = {
    numero: '01', titulo: 'ELENCO', descricao: '56 alunos.',
    url: '/elenco/', variante: 'teal' as const,
  };

  it('mostra número, título e descrição', () => {
    render(<Faixa {...props} />);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ELENCO' })).toBeInTheDocument();
    expect(screen.getByText('56 alunos.')).toBeInTheDocument();
  });

  it('a faixa inteira é o link', () => {
    render(<Faixa {...props} />);
    expect(screen.getByRole('link', { name: /elenco/i })).toHaveAttribute('href', '/elenco/');
  });

  it('marca o sprite decorativo como escondido para leitor de tela', () => {
    render(<Faixa {...props} sprite="/sprites/junko.webp" />);
    expect(screen.getByTestId('sprite-faixa')).toHaveAttribute('aria-hidden', 'true');
  });
});
```

Crie `site/components/alter-ego/Boot.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Boot } from './Boot';

describe('Boot', () => {
  beforeEach(() => localStorage.clear());

  it('aparece na primeira visita', () => {
    render(<Boot />);
    expect(screen.getByTestId('boot')).toBeInTheDocument();
  });

  it('oferece pular', () => {
    render(<Boot />);
    expect(screen.getByRole('button', { name: /pular/i })).toBeInTheDocument();
  });

  it('não aparece para quem já visitou', () => {
    localStorage.setItem('ego-ja-visitou', 'true');
    render(<Boot />);
    expect(screen.queryByTestId('boot')).not.toBeInTheDocument();
  });

  it('marca a visita ao pular', () => {
    render(<Boot />);
    screen.getByRole('button', { name: /pular/i }).click();
    expect(localStorage.getItem('ego-ja-visitou')).toBe('true');
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falham**

Run: `cd site && npm test -- Faixa Boot`
Expected: FAIL — módulos não encontrados

- [ ] **Step 3: Implementar a faixa**

Crie `site/components/layout/Faixa.tsx`:

```tsx
import Link from 'next/link';

type Props = {
  numero: string; titulo: string; descricao: string; url: string;
  sprite?: string; variante: 'teal' | 'papel' | 'escura';
};

const ESTILOS = {
  teal: 'bg-teal-escuro text-papel',
  papel: 'bg-papel text-tinta',
  escura: 'bg-bg text-papel',
} as const;

export function Faixa({ numero, titulo, descricao, url, sprite, variante }: Props) {
  return (
    <Link
      href={url}
      className={`relative flex min-h-[110px] items-center overflow-hidden border-t-2 border-tinta px-4 py-4 ${ESTILOS[variante]}`}
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
          className="absolute -bottom-3 right-0 h-[150%] object-contain"
        />
      )}
    </Link>
  );
}
```

- [ ] **Step 4: Implementar o boot**

Crie `site/components/alter-ego/Boot.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { JanelaEgo } from './JanelaEgo';

const LINHAS = [
  'HOPE\'S PEAK ACADEMY — TERMINAL',
  'carregando arquivo da comunidade BR/PT...',
  '56 fichas de aluno · 162 itens · 39 locais',
  'ALTER_EGO.exe iniciado',
];

export function Boot() {
  const [visivel, setVisivel] = useState(false);
  const [linha, setLinha] = useState(0);

  useEffect(() => {
    if (localStorage.getItem('ego-ja-visitou') === 'true') return;
    setVisivel(true);

    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduzido) { encerrar(); return; }

    const t = setInterval(() => {
      setLinha((n) => {
        if (n >= LINHAS.length - 1) { clearInterval(t); setTimeout(encerrar, 900); return n; }
        return n + 1;
      });
    }, 500);
    return () => clearInterval(t);
  }, []);

  function encerrar() {
    localStorage.setItem('ego-ja-visitou', 'true');
    setVisivel(false);
  }

  if (!visivel) return null;

  return (
    <div data-testid="boot" className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black">
      <div className="w-52">
        <JanelaEgo estado="primeira-visita" />
      </div>
      <ul className="mt-5 space-y-1 text-center font-mono text-[10px] text-[#7FD1C4]">
        {LINHAS.slice(0, linha + 1).map((l) => <li key={l}>{l}</li>)}
      </ul>
      <button
        type="button" onClick={encerrar}
        className="mt-7 border border-[#3d5732] px-3 py-1 font-mono text-[9px] tracking-[.14em] text-[#a9c898] hover:text-white"
      >
        PULAR
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Criar a landing**

Substitua `site/app/page.tsx` por:

```tsx
import { Faixa } from '@/components/layout/Faixa';
import { Boot } from '@/components/alter-ego/Boot';
import { listarPersonagens } from '@/lib/dados';

export default function Inicio() {
  const total = listarPersonagens().length;

  return (
    <>
      <Boot />

      <section className="relative overflow-hidden bg-bg px-4 py-12">
        <span
          aria-hidden
          className="pointer-events-none absolute -left-3 top-2 select-none text-7xl font-black leading-none tracking-tighter text-white/5 sm:text-9xl"
        >
          SHUICHI
        </span>
        <p className="relative font-mono text-[9px] tracking-[.2em] text-teal">
          ARQUIVO DA COMUNIDADE BR/PT
        </p>
        <h1 className="relative mt-2 text-5xl font-black leading-[.9] tracking-tight text-[#F2F2F5] sm:text-6xl">
          O caso está<br /><span className="text-teal">aberto.</span>
        </h1>
        <p className="relative mt-3 max-w-md text-[12px] leading-relaxed text-dim">
          Tudo sobre o Shinri Trial, o Danganronpa Online do Garry&apos;s Mod, em português.
        </p>
      </section>

      <Faixa numero="01" titulo="ELENCO" variante="teal" url="/elenco/"
        descricao={`${total} alunos: atributos, velocidade, itens iniciais e dicas de RP.`} />
      <Faixa numero="02" titulo="ITENS" variante="papel" url="/itens/"
        descricao="162 itens: peso, raridade, onde spawnam e o que craftam." />
      <Faixa numero="03" titulo="MAPA" variante="escura" url="/mapa/"
        descricao="Cada local da academia, o que spawna lá e para onde conecta." />
    </>
  );
}
```

- [ ] **Step 6: Rodar tudo**

Run: `cd site && npm test && npm run build`
Expected: todos PASS; build conclui

- [ ] **Step 7: Commit**

```bash
git add site/app/page.tsx site/components/layout/ site/components/alter-ego/Boot.tsx site/components/alter-ego/Boot.test.tsx
git commit -m "feat: landing em faixas com animacao de boot do Alter Ego"
```

---

### Task 17: Publicar na Vercel

**Files:**
- Create: `site/README.md`

- [ ] **Step 1: Escrever o README**

Crie `site/README.md`:

```markdown
# Shuichi Pull

Arquivo da comunidade brasileira e portuguesa de Shinri Trial.

## Rodar

    npm install
    npm run dados      # gera data/personagens.json a partir dos dados brutos
    npm run sprites    # converte os sprites para WebP em public/sprites
    npm run dev

## Testes

    npm test

## Publicar

Site estático (`output: 'export'`). O build sai em `out/`.

    npm run build
```

- [ ] **Step 2: Conferir que o build está limpo**

Run: `cd site && npm test && npm run build`
Expected: todos os testes PASS, build sem erro

- [ ] **Step 3: Publicar**

```bash
cd site && npx vercel --prod
```
Na primeira vez a Vercel pede login e confirmação do diretório. Aceite os padrões
detectados (framework Next.js). Guarde a URL que ela devolve.

- [ ] **Step 4: Conferir no ar**

Abra a URL e confirme: o boot roda, a barra do topo fica, a busca acha "chihiro",
a ficha dela abre com a régua, e o rodapé de créditos aparece.

- [ ] **Step 5: Commit**

```bash
git add site/README.md
git commit -m "docs: instrucoes de uso e publicacao"
```

---

## Auto-revisão

**Cobertura da spec:**

| Requisito da spec | Task |
|---|---|
| Tokens de cor e princípio papel/digital | 1 |
| Dados: RU→EN→PT, termo original junto | 2, 5, 6 |
| Schema com `traducaoRevisada` | 4 |
| Régua de distribuição com média e frase | 7, 11 |
| Sprites otimizados | 8 |
| Alter Ego: sprite + kaomoji, estados | 9, 10 |
| Barra do topo → ícone → janela flutuante persistente | 13 |
| Busca casando PT e EN | 12 |
| Landing em faixas | 16 |
| Animação de boot com pular e reduced-motion | 16 |
| Elenco: listagem e ficha | 14, 15 |
| Rodapé de créditos | 13 |
| Nenhum componente lê arquivo direto | 12 (regra aplicada em 14, 15, 16) |
| Sem rolagem horizontal | 1 (CSS global), conferido em 15 |
| Publicação | 17 |

**Fora deste plano, vai para o Plano 2:** Itens, Mapa/Locais, Mecânicas e Controles,
FAQ, Área de Iniciantes, página 404, e a dica proativa do Alter Ego (o balão que
aparece sozinho).

**Consistência de tipos conferida:** `Personagem` (Task 4) é usada com os mesmos
campos nas Tasks 6, 12, 14 e 15. `EstadoEgo` e `Face` (Task 9) batem com o uso nas
Tasks 10, 13 e 16. `Distribuicao` (Task 7) bate com o consumo na Task 11.
`Resultado` (Task 12) bate com o uso na Task 13.
