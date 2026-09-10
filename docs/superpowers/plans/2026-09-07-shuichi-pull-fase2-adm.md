# Shuichi Pull — Fase 2: Área de ADM — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the Shuichi Pull team a `/adm` panel where administrators authenticated
via Discord can edit eventos, códigos, and text/translation fields on
personagens/itens/locais/faq/controles — without touching code — while public
pages stay statically pre-rendered.

**Architecture:** Next.js drops `output: 'export'` and gains a Postgres-backed
server (Vercel + Neon, both free tier). Auth.js (Discord provider, JWT
sessions) gates `/adm/*`. Editorial content (eventos, códigos) moves entirely
into Postgres. Content with a generated JSON base (personagens, itens, locais,
faq, controles) keeps that JSON as the source of truth in git; a `correcoes`
table holds only the fields an ADM overrode, applied on top of the JSON at
read time. Public pages stay statically cached; a save triggers
`revalidatePath` so the correction appears within seconds, not instantly.

**Tech Stack:** Next.js 16 (App Router, Server Actions), Auth.js v5
(`next-auth@beta`, Discord provider, JWT strategy), Drizzle ORM
(`drizzle-orm/postgres-js`) + `postgres` driver, Neon Postgres, Vitest +
Testing Library (existing repo pattern).

**Spec:** [`docs/superpowers/specs/2026-09-07-shuichi-pull-fase2-adm-design.md`](../specs/2026-09-07-shuichi-pull-fase2-adm-design.md)

## Global Constraints

- All UI copy, comments, commit messages, and identifiers follow the repo's
  existing convention: **Portuguese (pt-BR)** names for functions/files/vars,
  matching `lib/dados.ts`, `lib/itens.ts`, etc.
- `id`/kebab-case regex for any new slug-like field: `^[a-z0-9]+(-[a-z0-9]+)*$`
  (same as `PersonagemSchema`/`ItemSchema`/`LocalSchema` in `site/lib/schema*.ts`).
- Zod is the repo's validation tool (`site/lib/schema.ts`, `schema-itens.ts`,
  `eventos.ts`) — new server-side input (Server Action arguments, migration
  script rows) is validated with zod schemas, consistent with existing code.
- Every new function gets a Vitest test, following TDD as already practiced
  in this repo (see `site/lib/*.test.ts`, `site/components/**/*.test.tsx`).
- **Resolved ambiguities from spec §10** (decided here so no task carries a
  placeholder):
  1. **Correctable fields** — only string leaf fields (plain text or
     `TextoSchema.pt`/`.en` pairs). Never numeric/game-derived fields
     (velocidade, mochila, percepção, vida, peso, nivelRaridade) or structured
     fields (etiquetas, mecanicas, craft, spawns, conteineres). Exact field
     list per collection is in Task 13.
  2. **`correcoes.valor` format** — plain `text` column, no JSON encoding.
     Every correctable field (per #1) is a plain string, so no serialization
     is needed.
  3. **Rate limiting on Discord login** — not needed for v1: `/adm/*` is
     already gated by the `administradores` table lookup, and Discord OAuth
     itself rate-limits sign-in attempts. No task implements this.
  - The spec's separate `data/traducoes/*.json` files (a different shape:
    single-language, keyed by id, not `TextoSchema` pairs) are **out of scope**
    for this plan — only the five collections with a `TextoSchema`-shaped or
    plain-string leaf get the `correcoes` overlay. Extending to
    `data/traducoes/*` is a fast-follow, not blocked by anything built here.
  - The spec's header says "seis tabelas" but its own table-by-table section
    enumerates five (`administradores`, `eventos`, `codigos`, `correcoes`,
    `auditoria`). This plan builds those five; the "seis" appears to be a
    miscount in the spec, not a sixth table left undocumented.
- **Resolved implementation detail — sync vs. async reads:** `lib/dados.ts`,
  `lib/itens.ts`, `lib/faq.ts`, `lib/controles.ts` keep their existing
  synchronous functions **completely unchanged** (they read only the JSON,
  same as today). This matters because `lib/busca.ts` calls them
  synchronously on every keystroke from the client-side search box
  (`components/alter-ego/BarraEgo.tsx`) — making them DB-aware would break
  live search. Each file gains **new, separate, async** `...ComCorrecoes()`
  functions that merge in corrections; only the public page.tsx files that
  render full record content use them. The admin panel itself reads the base
  (sync) functions directly, because it needs to show both the base value and
  the correction side by side to detect the "the game changed this" conflict.
- **Resolved implementation detail — proxy runtime:** `proxy.ts` (Next 16
  renamed `middleware.ts` → `proxy.ts`, see
  `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`)
  does **not** query the database. The `papel` (adm/chefe) is embedded in the
  JWT at sign-in (looked up once, in the Node-runtime Auth.js route handler)
  and read back out of the session in `proxy.ts` for the coarse
  authenticated/not-authenticated redirect. Role changes take effect on the
  affected admin's next sign-in — an accepted trade-off for a small trusted
  group, not a bug to fix later.
- **Resolved implementation detail — DB-touching tests:** Postgres-specific
  schema (enums, multi-column unique constraints) doesn't map cleanly to
  SQLite, so introducing a parallel SQLite schema for tests would risk
  masking real bugs. Integration tests that touch the database run against a
  **real Postgres** pointed to by `DATABASE_URL_TEST` and are skipped
  (`describe.skipIf`) when that variable is unset, so the existing 245 tests
  (and CI, if none is configured yet) keep working without Postgres
  installed. `DATABASE_URL_TEST` should point at a second free Neon branch or
  a local Postgres — never the same database as `DATABASE_URL`.

---

## Task 1: Foundation — dependencies, server mode, environment template

**Files:**
- Modify: `site/next.config.ts`
- Modify: `site/package.json`
- Create: `site/.env.example`
- Modify: `site/.gitignore` project root (already ignores `.env*` — verify, no change expected)

**Interfaces:**
- Produces: `DATABASE_URL`, `DATABASE_URL_TEST`, `AUTH_SECRET`,
  `AUTH_DISCORD_ID`, `AUTH_DISCORD_SECRET`, `ADM_CHEFE_DISCORD_ID` as the
  documented environment variable names every later task relies on.

This task has no behavior to unit-test (it's config/dependency setup) — per
the plan's Task Right-Sizing rule, its "test" is the build succeeding.

- [ ] **Step 1: Remove static export mode**

Edit `site/next.config.ts`:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
```

(Only the `output: 'export'` line is removed. `images.unoptimized` and
`trailingSlash` are unrelated to export mode and stay as-is.)

- [ ] **Step 2: Install dependencies**

```bash
cd site
npm install drizzle-orm postgres next-auth@beta zod
npm install -D drizzle-kit
```

(`zod` is already a dependency — this is a no-op if already satisfied, safe
to include.)

- [ ] **Step 3: Add npm scripts**

Edit `site/package.json`, inside `"scripts"`, add:

```json
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:migrate:test": "dotenv -e .env.test -- drizzle-kit migrate",
    "dados:migrar-editorial": "tsx scripts/migrar-eventos-codigos.ts"
```

`db:migrate:test` needs `dotenv-cli` to point drizzle-kit at
`DATABASE_URL_TEST` without touching the shell's real `DATABASE_URL`:

```bash
npm install -D dotenv-cli
```

Create `site/.env.test`:

```
DATABASE_URL=${DATABASE_URL_TEST}
```

(This is a template `.env.test` — `dotenv-cli` resolves `${DATABASE_URL_TEST}`
from the already-exported shell env, so the real value never needs to be
duplicated in a file. If the developer's shell doesn't support `${VAR}`
expansion, they set `DATABASE_URL_TEST` directly in `.env.test` instead —
either works since `.env*` is gitignored.)

- [ ] **Step 4: Document required environment variables**

Create `site/.env.example`:

```
# Postgres connection string (Neon free tier). Never commit the real value.
DATABASE_URL=postgres://user:password@host/dbname?sslmode=require

# A second, separate Neon branch/database used only by integration tests
# (db-touching Vitest suites skip themselves when this is unset).
DATABASE_URL_TEST=postgres://user:password@host/dbname_test?sslmode=require

# Auth.js session encryption secret. Generate with: npx auth secret
AUTH_SECRET=

# Discord OAuth application (https://discord.com/developers/applications)
AUTH_DISCORD_ID=
AUTH_DISCORD_SECRET=

# Discord user ID of the first chefe — checked at login, not seeded in the DB.
ADM_CHEFE_DISCORD_ID=
```

- [ ] **Step 5: Verify the build still succeeds without a database**

```bash
npm run build
```

Expected: build completes. It will still succeed because nothing in the app
imports the database yet — this step only proves removing `output: 'export'`
didn't break anything on its own.

- [ ] **Step 6: Commit**

```bash
git add next.config.ts package.json package-lock.json .env.example .env.test .gitignore
git commit -m "chore: sai do site 100% estatico, prepara dependencias da Fase 2"
```

---

## Task 2: Database schema, client, and first migration

**Files:**
- Create: `site/db/schema.ts`
- Create: `site/db/client.ts`
- Create: `site/db/testes/ambiente.ts`
- Create: `site/db/testes/ambiente.test.ts`
- Create: `site/drizzle.config.ts`
- Create (generated by drizzle-kit): `site/db/migrations/*`

**Interfaces:**
- Produces: `administradores`, `eventos`, `codigos`, `correcoes`, `auditoria`
  (Drizzle table objects) and `papelAdm` (pg enum) from `db/schema.ts`; `db`
  (Drizzle client) from `db/client.ts`; `clienteTeste()`, `urlBancoTeste()`,
  `limparTabelas(db)` from `db/testes/ambiente.ts` — every later DB-touching
  task and test imports from these three files.

- [ ] **Step 1: Write the schema**

Create `site/db/schema.ts`:

```ts
import { pgTable, pgEnum, serial, text, boolean, timestamp, unique } from 'drizzle-orm/pg-core';

export const papelAdm = pgEnum('papel_adm', ['adm', 'chefe']);

export const administradores = pgTable('administradores', {
  discordId: text('discord_id').primaryKey(),
  nome: text('nome').notNull(),
  papel: papelAdm('papel').notNull(),
  promovidoPor: text('promovido_por'),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
});

export const eventos = pgTable('eventos', {
  id: text('id').primaryKey(),
  tipo: text('tipo').notNull(),
  titulo: text('titulo').notNull(),
  data: text('data').notNull(),
  ate: text('ate'),
  destaque: boolean('destaque').notNull().default(false),
  autor: text('autor').notNull(),
  resumo: text('resumo').notNull(),
  corpo: text('corpo').notNull(),
});

export const codigos = pgTable('codigos', {
  codigo: text('codigo').primaryKey(),
  recompensa: text('recompensa').notNull(),
  descricao: text('descricao').notNull(),
  expiraEm: text('expira_em'),
  fonte: text('fonte'),
});

export const correcoes = pgTable('correcoes', {
  id: serial('id').primaryKey(),
  colecao: text('colecao').notNull(),
  registroId: text('registro_id').notNull(),
  campo: text('campo').notNull(),
  valor: text('valor').notNull(),
  valorBase: text('valor_base').notNull(),
  autor: text('autor').notNull(),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ([
  unique('correcoes_alvo_unico').on(t.colecao, t.registroId, t.campo),
]));

export const auditoria = pgTable('auditoria', {
  id: serial('id').primaryKey(),
  autor: text('autor').notNull(),
  acao: text('acao').notNull(),
  alvo: text('alvo').notNull(),
  valorAntigo: text('valor_antigo'),
  valorNovo: text('valor_novo'),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
});
```

- [ ] **Step 2: Write the Drizzle client**

Create `site/db/client.ts`:

```ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL não configurada — veja .env.example');
}

const client = postgres(url);
export const db = drizzle({ client, schema });
```

- [ ] **Step 3: Write the drizzle-kit config**

Create `site/drizzle.config.ts`:

```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema.ts',
  out: './db/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Step 4: Generate and run the first migration**

Requires a real `DATABASE_URL` (Neon connection string) exported in the
shell — this is the point where the developer must already have created a
Neon project, per the "grátis com camada gratuita real" decision.

```bash
npm run db:generate
npm run db:migrate
```

Expected: a new SQL file appears under `db/migrations/`, and `db:migrate`
reports the migration applied with no errors.

- [ ] **Step 5: Write the test-environment helper**

Create `site/db/testes/ambiente.ts`:

```ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema';

/** `null` quando não há banco de teste configurado — os testes que
 * dependem dele se pulam sozinhos em vez de falhar no CI/máquina sem Postgres. */
export function urlBancoTeste(): string | null {
  return process.env.DATABASE_URL_TEST ?? null;
}

export function clienteTeste() {
  const url = urlBancoTeste();
  if (!url) throw new Error('DATABASE_URL_TEST não configurada');
  const client = postgres(url);
  return { db: drizzle({ client, schema }), client };
}

/** Limpa todas as tabelas entre testes, na ordem que respeita FKs
 * implícitas (nenhuma FK real existe hoje, mas a ordem documenta a intenção). */
export async function limparTabelas(db: ReturnType<typeof clienteTeste>['db']) {
  await db.delete(schema.auditoria);
  await db.delete(schema.correcoes);
  await db.delete(schema.codigos);
  await db.delete(schema.eventos);
  await db.delete(schema.administradores);
}
```

- [ ] **Step 6: Write the failing round-trip test**

Create `site/db/testes/ambiente.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { urlBancoTeste, clienteTeste, limparTabelas } from './ambiente';
import { administradores } from '../schema';

const rodar = urlBancoTeste() ? describe : describe.skip;

rodar('schema do banco (integração)', () => {
  const { db, client } = clienteTeste();

  beforeEach(async () => {
    await limparTabelas(db);
  });

  afterAll(async () => {
    await client.end();
  });

  it('grava e lê um administrador de volta', async () => {
    await db.insert(administradores).values({
      discordId: '123456789',
      nome: 'ADM de teste',
      papel: 'chefe',
    });

    const linhas = await db.select().from(administradores);

    expect(linhas).toHaveLength(1);
    expect(linhas[0]).toMatchObject({
      discordId: '123456789',
      nome: 'ADM de teste',
      papel: 'chefe',
      promovidoPor: null,
    });
  });
});
```

- [ ] **Step 7: Run the test to verify it fails or skips correctly**

Run: `npx vitest run db/testes/ambiente.test.ts`

Expected without `DATABASE_URL_TEST` set: all tests report **skipped**, zero
failures. Expected with `DATABASE_URL_TEST` pointed at a migrated test
database: the test **fails** before this step's schema file exists (module
not found) — if `db/schema.ts` already exists from Step 1, this step instead
confirms the test passes already, which is acceptable since Steps 1-4 are
themselves the "implementation" this test proves — note this task's TDD
cycle covers the *round-trip test*, not the schema declaration itself
(schema declarations aren't independently testable in isolation; the
round-trip is the real behavioral proof).

- [ ] **Step 8: Apply migrations to the test database and verify green**

```bash
npm run db:migrate:test
npx vitest run db/testes/ambiente.test.ts
```

Expected: PASS (or SKIP if `DATABASE_URL_TEST` is intentionally left unset on
this machine).

- [ ] **Step 9: Commit**

```bash
git add db/ drizzle.config.ts
git commit -m "feat: schema do banco (administradores, eventos, codigos, correcoes, auditoria)"
```

---

## Task 3: Discord authentication

**Files:**
- Create: `site/auth.ts`
- Create: `site/app/api/auth/[...nextauth]/route.ts`
- Create: `site/proxy.ts`
- Create: `site/types/next-auth.d.ts`
- Create: `site/db/repositorios/administradores.ts`
- Create: `site/db/repositorios/administradores.test.ts`

**Interfaces:**
- Consumes: `db` from `db/client.ts`, `administradores` from `db/schema.ts`.
- Produces: `auth()`, `signIn()`, `signOut()`, `handlers` from `auth.ts` —
  used by Task 4's session helpers and every Server Action in later tasks.
  `buscarAdm(discordId): Promise<{ papel: 'adm' | 'chefe'; nome: string } | null>`,
  `promoverAdm(...)`, `rebaixarAdm(...)`, `listarAdms()` from
  `db/repositorios/administradores.ts` — used by Task 3 itself (login lookup)
  and Task 15 (gerenciar ADMs).

- [ ] **Step 1: Write the failing test for the administradores repository**

Create `site/db/repositorios/administradores.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { urlBancoTeste, clienteTeste, limparTabelas } from '../testes/ambiente';
import { criarRepositorioAdms } from './administradores';

const rodar = urlBancoTeste() ? describe : describe.skip;

rodar('repositório de administradores (integração)', () => {
  const { db, client } = clienteTeste();
  const repo = criarRepositorioAdms(db);

  beforeEach(async () => {
    await limparTabelas(db);
  });

  afterAll(async () => {
    await client.end();
  });

  it('devolve null para quem não é administrador', async () => {
    expect(await repo.buscarAdm('000')).toBeNull();
  });

  it('promove alguém e depois consegue buscar', async () => {
    await repo.promoverAdm({ discordId: '111', nome: 'Fulano', papel: 'adm', promovidoPor: '999' });

    const encontrado = await repo.buscarAdm('111');

    expect(encontrado).toMatchObject({ nome: 'Fulano', papel: 'adm' });
  });

  it('rebaixar remove o acesso', async () => {
    await repo.promoverAdm({ discordId: '111', nome: 'Fulano', papel: 'adm', promovidoPor: '999' });
    await repo.rebaixarAdm('111');

    expect(await repo.buscarAdm('111')).toBeNull();
  });

  it('lista todos os administradores', async () => {
    await repo.promoverAdm({ discordId: '111', nome: 'A', papel: 'adm', promovidoPor: '999' });
    await repo.promoverAdm({ discordId: '222', nome: 'B', papel: 'chefe', promovidoPor: null });

    const lista = await repo.listarAdms();

    expect(lista.map((a) => a.discordId).sort()).toEqual(['111', '222']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run db/repositorios/administradores.test.ts`
Expected (with `DATABASE_URL_TEST` set): FAIL — `./administradores` module
not found.

- [ ] **Step 3: Implement the repository**

Create `site/db/repositorios/administradores.ts`:

```ts
import { eq } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { administradores } from '../schema';

type Papel = 'adm' | 'chefe';
type Banco = typeof DbClient;

export function criarRepositorioAdms(db: Banco) {
  return {
    async buscarAdm(discordId: string) {
      const linhas = await db.select().from(administradores)
        .where(eq(administradores.discordId, discordId));
      return linhas[0] ?? null;
    },

    async promoverAdm(args: { discordId: string; nome: string; papel: Papel; promovidoPor: string | null }) {
      await db.insert(administradores).values(args)
        .onConflictDoUpdate({
          target: administradores.discordId,
          set: { papel: args.papel, nome: args.nome },
        });
    },

    async rebaixarAdm(discordId: string) {
      await db.delete(administradores).where(eq(administradores.discordId, discordId));
    },

    async listarAdms() {
      return db.select().from(administradores);
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioAdms = criarRepositorioAdms(db);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run db/repositorios/administradores.test.ts`
Expected: PASS (4 tests), or SKIP if `DATABASE_URL_TEST` unset.

- [ ] **Step 5: Write the Auth.js config**

Create `site/auth.ts`:

```ts
import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';
import { repositorioAdms } from './db/repositorios/administradores';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Discord],
  callbacks: {
    async jwt({ token, account, profile }) {
      // account/profile só existem no login inicial — é o único momento em
      // que vale a pena consultar o banco; o resto da sessão lê do token.
      if (account && profile?.id) {
        const discordId = String(profile.id);
        const chefeFundador = process.env.ADM_CHEFE_DISCORD_ID;

        const adm = discordId === chefeFundador
          ? { papel: 'chefe' as const, nome: token.name ?? 'Chefe' }
          : await repositorioAdms.buscarAdm(discordId);

        token.discordId = discordId;
        token.papel = adm?.papel ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.discordId = token.discordId as string;
      session.user.papel = token.papel as 'adm' | 'chefe' | null;
      return session;
    },
  },
});
```

- [ ] **Step 6: Extend the session/JWT types**

Create `site/types/next-auth.d.ts`:

```ts
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      discordId: string;
      papel: 'adm' | 'chefe' | null;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    discordId?: string;
    papel?: 'adm' | 'chefe' | null;
  }
}
```

- [ ] **Step 7: Write the route handler**

Create `site/app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
```

- [ ] **Step 8: Write the proxy (route protection)**

Create `site/proxy.ts`:

```ts
export { auth as proxy } from './auth';

export const config = {
  matcher: ['/adm/:path*'],
};
```

The `auth` export from `auth.ts` already behaves as a proxy-compatible
function when used this way (it redirects unauthenticated requests to
sign-in for matched paths) — this is the pattern Auth.js v5 documents for
Next.js 16's `proxy.ts` (see
https://authjs.dev/getting-started/installation?framework=Next.js, which
explicitly shows `export { auth as proxy } from "@/auth"` for Next 16+).

- [ ] **Step 9: Manual verification (no automated test for OAuth redirect)**

This step has no Vitest coverage — Auth.js's OAuth handshake requires a real
Discord app and a browser. Verify manually once Task 5 (the `/adm` shell)
exists, by signing in and confirming `session.user.papel` is populated.
Record this as a TODO comment nowhere — it's verified end-to-end in Task 17.

- [ ] **Step 10: Commit**

```bash
git add auth.ts app/api/auth types/next-auth.d.ts proxy.ts db/repositorios/administradores.ts db/repositorios/administradores.test.ts
git commit -m "feat: login com Discord e protecao de /adm via Auth.js"
```

---

## Task 4: Admin session helpers

**Files:**
- Create: `site/lib/adm/sessao.ts`
- Create: `site/lib/adm/sessao.test.ts`

**Interfaces:**
- Consumes: `auth()` from `auth.ts` (mocked in tests via `vi.mock`).
- Produces: `sessaoAdm(): Promise<{ discordId: string; papel: 'adm' | 'chefe' } | null>`,
  `exigirAdm(): Promise<{ discordId: string; papel: 'adm' | 'chefe' }>`,
  `exigirChefe(): Promise<{ discordId: string; papel: 'chefe' }>` — every
  Server Action and every `/adm/*` page/layout from Task 5 onward calls one
  of these to gate its own logic (defense-in-depth alongside `proxy.ts`).

- [ ] **Step 1: Write the failing tests**

Create `site/lib/adm/sessao.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sessaoAdm, exigirAdm, exigirChefe } from './sessao';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
import { auth } from '@/auth';

describe('sessaoAdm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devolve null sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    expect(await sessaoAdm()).toBeNull();
  });

  it('devolve null para quem tem sessão mas não é administrador', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { discordId: '1', papel: null } } as never);
    expect(await sessaoAdm()).toBeNull();
  });

  it('devolve os dados de quem é adm', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { discordId: '1', papel: 'adm' } } as never);
    expect(await sessaoAdm()).toEqual({ discordId: '1', papel: 'adm' });
  });
});

describe('exigirAdm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lança erro sem sessão de adm', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    await expect(exigirAdm()).rejects.toThrow('Acesso negado');
  });

  it('devolve a sessão quando é adm', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { discordId: '1', papel: 'adm' } } as never);
    await expect(exigirAdm()).resolves.toEqual({ discordId: '1', papel: 'adm' });
  });

  it('aceita chefe também, porque chefe pode tudo que adm pode', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { discordId: '1', papel: 'chefe' } } as never);
    await expect(exigirAdm()).resolves.toEqual({ discordId: '1', papel: 'chefe' });
  });
});

describe('exigirChefe', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lança erro para adm comum', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { discordId: '1', papel: 'adm' } } as never);
    await expect(exigirChefe()).rejects.toThrow('Acesso negado');
  });

  it('devolve a sessão quando é chefe', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { discordId: '1', papel: 'chefe' } } as never);
    await expect(exigirChefe()).resolves.toEqual({ discordId: '1', papel: 'chefe' });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/adm/sessao.test.ts`
Expected: FAIL — `./sessao` module not found.

- [ ] **Step 3: Implement**

Create `site/lib/adm/sessao.ts`:

```ts
import { auth } from '@/auth';

export type SessaoAdm = { discordId: string; papel: 'adm' | 'chefe' };

export async function sessaoAdm(): Promise<SessaoAdm | null> {
  const sessao = await auth();
  if (!sessao?.user?.papel) return null;
  return { discordId: sessao.user.discordId, papel: sessao.user.papel };
}

export async function exigirAdm(): Promise<SessaoAdm> {
  const sessao = await sessaoAdm();
  if (!sessao) throw new Error('Acesso negado: faça login como administrador.');
  return sessao;
}

export async function exigirChefe(): Promise<SessaoAdm & { papel: 'chefe' }> {
  const sessao = await exigirAdm();
  if (sessao.papel !== 'chefe') throw new Error('Acesso negado: ação restrita a chefes.');
  return sessao as SessaoAdm & { papel: 'chefe' };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/adm/sessao.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/adm/sessao.ts lib/adm/sessao.test.ts
git commit -m "feat: helpers de sessao para o painel de ADM"
```

---

## Task 5: `/adm` shell — layout, access gate, sign-in

**Files:**
- Create: `site/app/adm/layout.tsx`
- Create: `site/app/adm/page.tsx`
- Create: `site/app/adm/sem-acesso/page.tsx`
- Create: `site/app/adm/layout.test.tsx`
- Create: `site/components/adm/BarraLateral.tsx`
- Create: `site/components/adm/BarraLateral.test.tsx`

**Interfaces:**
- Consumes: `sessaoAdm()` from `lib/adm/sessao.ts`, `signOut()` from `auth.ts`.
- Produces: the `/adm` route tree that every later task's pages nest under.

- [ ] **Step 1: Write the failing test for the sidebar's role-based items**

Create `site/components/adm/BarraLateral.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BarraLateral } from './BarraLateral';

describe('BarraLateral', () => {
  it('mostra os itens comuns para um adm', () => {
    render(<BarraLateral papel="adm" />);
    expect(screen.getByRole('link', { name: 'Eventos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Códigos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Itens' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Personagens' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mapa' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Textos' })).toBeInTheDocument();
  });

  it('esconde ADMs e Auditoria para quem não é chefe', () => {
    render(<BarraLateral papel="adm" />);
    expect(screen.queryByRole('link', { name: 'ADMs' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Auditoria' })).not.toBeInTheDocument();
  });

  it('mostra ADMs e Auditoria para chefe', () => {
    render(<BarraLateral papel="chefe" />);
    expect(screen.getByRole('link', { name: 'ADMs' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Auditoria' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/adm/BarraLateral.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the sidebar**

Create `site/components/adm/BarraLateral.tsx`:

```tsx
import Link from 'next/link';

const ITENS_COMUNS = [
  { rotulo: 'Eventos', url: '/adm/eventos' },
  { rotulo: 'Códigos', url: '/adm/codigos' },
  { rotulo: 'Itens', url: '/adm/itens' },
  { rotulo: 'Personagens', url: '/adm/personagens' },
  { rotulo: 'Mapa', url: '/adm/mapa' },
  { rotulo: 'Textos', url: '/adm/faq' },
];

const ITENS_CHEFE = [
  { rotulo: 'ADMs', url: '/adm/administradores' },
  { rotulo: 'Auditoria', url: '/adm/auditoria' },
];

export function BarraLateral({ papel }: { papel: 'adm' | 'chefe' }) {
  const itens = papel === 'chefe' ? [...ITENS_COMUNS, ...ITENS_CHEFE] : ITENS_COMUNS;
  return (
    <nav aria-label="Navegação do painel" className="flex flex-col gap-1 p-3">
      {itens.map((i) => (
        <Link key={i.url} href={i.url} className="rounded px-2 py-1.5 text-sm hover:bg-neutral-800">
          {i.rotulo}
        </Link>
      ))}
    </nav>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/adm/BarraLateral.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing test for the layout's access gate**

Create `site/app/adm/layout.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/adm/sessao', () => ({ sessaoAdm: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn(() => { throw new Error('REDIRECT'); }) }));
import { sessaoAdm } from '@/lib/adm/sessao';
import { redirect } from 'next/navigation';
import AdmLayout from './layout';

describe('AdmLayout', () => {
  beforeEach(() => vi.clearAllMocks());

  it('redireciona para sem-acesso quando não há sessão de adm', async () => {
    vi.mocked(sessaoAdm).mockResolvedValue(null);

    await expect(AdmLayout({ children: <p>oi</p> })).rejects.toThrow('REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/adm/sem-acesso');
  });

  it('renderiza o conteúdo quando há sessão de adm', async () => {
    vi.mocked(sessaoAdm).mockResolvedValue({ discordId: '1', papel: 'adm' });

    const elemento = await AdmLayout({ children: <p>painel aqui</p> });
    render(elemento);

    expect(screen.getByText('painel aqui')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Eventos' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run app/adm/layout.test.tsx`
Expected: FAIL — `./layout` module not found.

- [ ] **Step 7: Implement the layout**

Create `site/app/adm/layout.tsx`:

```tsx
import { redirect } from 'next/navigation';
import { sessaoAdm } from '@/lib/adm/sessao';
import { BarraLateral } from '@/components/adm/BarraLateral';

export default async function AdmLayout({ children }: { children: React.ReactNode }) {
  const sessao = await sessaoAdm();
  if (!sessao) redirect('/adm/sem-acesso');

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-100">
      <BarraLateral papel={sessao.papel} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
```

Note: `sem-acesso` itself must **not** be nested under this layout (it would
redirect-loop) — it lives at `app/adm/sem-acesso/page.tsx` with its own
minimal layout-free page, which Next.js allows since layouts apply per
segment and `sem-acesso`'s own `page.tsx` renders without re-entering this
`layout.tsx` only if we route it *outside* `/adm`. Since Next.js layouts
apply to every nested route including `sem-acesso` if placed under
`app/adm/`, resolve this by special-casing: check inside the layout for the
current path instead. Simpler and avoids route-group complexity — revise
Step 7 to:

```tsx
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { sessaoAdm } from '@/lib/adm/sessao';
import { BarraLateral } from '@/components/adm/BarraLateral';

export default async function AdmLayout({ children }: { children: React.ReactNode }) {
  const rota = (await headers()).get('x-invoke-path') ?? '';
  const sessao = await sessaoAdm();
  if (!sessao && !rota.startsWith('/adm/sem-acesso')) redirect('/adm/sem-acesso');

  if (!sessao) {
    // Estamos em /adm/sem-acesso sem sessão: mostra só o conteúdo, sem a barra lateral.
    return <div className="min-h-screen bg-neutral-950 text-neutral-100">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-100">
      <BarraLateral papel={sessao.papel} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
```

This relies on an internal header (`x-invoke-path`) that isn't guaranteed
public API across Next versions. **Use the simpler, documented approach
instead:** move `sem-acesso` outside the `/adm` segment entirely.

- [ ] **Step 7 (revised): Implement the layout without the header trick**

Create `site/app/adm/layout.tsx`:

```tsx
import { redirect } from 'next/navigation';
import { sessaoAdm } from '@/lib/adm/sessao';
import { BarraLateral } from '@/components/adm/BarraLateral';

export default async function AdmLayout({ children }: { children: React.ReactNode }) {
  const sessao = await sessaoAdm();
  if (!sessao) redirect('/sem-acesso');

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-100">
      <BarraLateral papel={sessao.papel} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
```

`sem-acesso` moves to `site/app/sem-acesso/page.tsx` (top-level, sibling of
`app/adm/`, not nested under it) — this sidesteps the redirect-loop entirely
because it's a different route segment with no layout gate at all.

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run app/adm/layout.test.tsx`

Update the test's `redirect` assertion to `'/sem-acesso'` (matching Step 7
revised) before running.

Expected: PASS (2 tests).

- [ ] **Step 9: Write the sem-acesso page**

Create `site/app/sem-acesso/page.tsx`:

```tsx
import Link from 'next/link';

export default function SemAcesso() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-neutral-950 text-neutral-100">
      <h1 className="text-xl font-bold">Sem acesso</h1>
      <p className="max-w-sm text-center text-sm text-neutral-400">
        Sua conta do Discord não está na lista de administradores do Shuichi Pull.
        Se acha que deveria estar, fale com quem já é ADM.
      </p>
      <Link href="/" className="text-sm text-teal-400 underline">Voltar para o site</Link>
    </main>
  );
}
```

- [ ] **Step 10: Write the `/adm` index redirect**

Create `site/app/adm/page.tsx`:

```tsx
import { redirect } from 'next/navigation';

export default function AdmIndex() {
  redirect('/adm/eventos');
}
```

- [ ] **Step 11: Commit**

```bash
git add app/adm/layout.tsx app/adm/layout.test.tsx app/adm/page.tsx app/sem-acesso components/adm/BarraLateral.tsx components/adm/BarraLateral.test.tsx
git commit -m "feat: shell do painel /adm com portao de acesso"
```

---

## Task 6: Migrate eventos/códigos JSON into Postgres

**Files:**
- Create: `site/scripts/migrar-eventos-codigos.ts`
- Create: `site/scripts/migrar-eventos-codigos.test.ts`

**Interfaces:**
- Consumes: `content/eventos.json`, `content/codigos.json` (existing),
  `EventoSchema`/`CodigoSchema` from `lib/eventos.ts`.
- Produces: `mapearEvento(evento: Evento)`, `mapearCodigo(codigo: Codigo)` —
  pure functions, unit-tested without a database; `migrar()` — the impure
  wrapper that writes to Postgres, exercised manually (Step 5), not by Vitest.

- [ ] **Step 1: Write the failing tests for the pure mapping functions**

Create `site/scripts/migrar-eventos-codigos.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { mapearEvento, mapearCodigo } from './migrar-eventos-codigos';
import type { Evento, Codigo } from '@/lib/eventos';

describe('mapearEvento', () => {
  it('converte um evento do JSON para o formato da tabela', () => {
    const evento: Evento = {
      id: 'shuichi-pull-no-ar',
      tipo: 'noticia',
      titulo: 'O site foi ao ar',
      data: '2026-09-01',
      ate: null,
      destaque: true,
      autor: 'admin',
      resumo: 'resumo curto',
      corpo: 'corpo completo',
    };

    expect(mapearEvento(evento)).toEqual({
      id: 'shuichi-pull-no-ar',
      tipo: 'noticia',
      titulo: 'O site foi ao ar',
      data: '2026-09-01',
      ate: null,
      destaque: true,
      autor: 'admin',
      resumo: 'resumo curto',
      corpo: 'corpo completo',
    });
  });
});

describe('mapearCodigo', () => {
  it('converte um código do JSON para o formato da tabela', () => {
    const codigo: Codigo = {
      codigo: 'BEMVINDO2026',
      recompensa: '500 moedas',
      descricao: 'código de lançamento',
      expiraEm: '2026-12-31',
      fonte: 'https://discord.gg/exemplo',
    };

    expect(mapearCodigo(codigo)).toEqual({
      codigo: 'BEMVINDO2026',
      recompensa: '500 moedas',
      descricao: 'código de lançamento',
      expiraEm: '2026-12-31',
      fonte: 'https://discord.gg/exemplo',
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run scripts/migrar-eventos-codigos.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `site/scripts/migrar-eventos-codigos.ts`:

```ts
import { db } from '../db/client';
import { eventos as tabelaEventos, codigos as tabelaCodigos } from '../db/schema';
import { listarEventos, listarCodigos, type Evento, type Codigo } from '../lib/eventos';

export function mapearEvento(evento: Evento) {
  return {
    id: evento.id,
    tipo: evento.tipo,
    titulo: evento.titulo,
    data: evento.data,
    ate: evento.ate,
    destaque: evento.destaque,
    autor: evento.autor,
    resumo: evento.resumo,
    corpo: evento.corpo,
  };
}

export function mapearCodigo(codigo: Codigo) {
  return {
    codigo: codigo.codigo,
    recompensa: codigo.recompensa,
    descricao: codigo.descricao,
    expiraEm: codigo.expiraEm,
    fonte: codigo.fonte,
  };
}

/** Roda uma vez, manualmente — não é chamado por nenhum código de produção.
 * Depois de rodar, content/eventos.json e content/codigos.json saem do repo. */
export async function migrar() {
  const eventos = listarEventos().map(mapearEvento);
  const codigos = listarCodigos().map(mapearCodigo);

  if (eventos.length > 0) await db.insert(tabelaEventos).values(eventos);
  if (codigos.length > 0) await db.insert(tabelaCodigos).values(codigos);

  console.log(`Migrados: ${eventos.length} eventos, ${codigos.length} códigos.`);
}

if (require.main === module) {
  migrar().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run scripts/migrar-eventos-codigos.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Run the real migration once, manually, against `DATABASE_URL`**

```bash
npm run dados:migrar-editorial
```

Expected: console output reporting the counts migrated, matching
`content/eventos.json`/`content/codigos.json`'s current entry counts. Verify
with a one-off query (`npx drizzle-kit studio` or a `SELECT count(*)`) before
proceeding — this step is irreversible in the sense that the next step
deletes the source files, so double-check the row counts first.

- [ ] **Step 6: Remove the now-migrated JSON files and their read path**

This step is deferred to **Task 7**, after the repository functions that
replace `lib/eventos.ts`'s `listarEventos`/`listarCodigos` exist — deleting
the JSON files now would break `app/eventos/page.tsx` and `app/codigos/page.tsx`
with nothing yet to replace them. Task 6 stops here.

- [ ] **Step 7: Commit**

```bash
git add scripts/migrar-eventos-codigos.ts scripts/migrar-eventos-codigos.test.ts
git commit -m "feat: script de migracao de eventos/codigos do JSON para o banco"
```

---

## Task 7: Eventos/Códigos repositories and public read-side cutover

**Files:**
- Create: `site/db/repositorios/eventos.ts`
- Create: `site/db/repositorios/eventos.test.ts`
- Create: `site/db/repositorios/codigos.ts`
- Create: `site/db/repositorios/codigos.test.ts`
- Modify: `site/lib/eventos.ts` (replace JSON-backed functions with DB-backed
  ones, keep the same exported names/shapes so `app/eventos/*` and
  `app/codigos/page.tsx` need minimal changes)
- Modify: `site/lib/eventos.test.ts` (existing tests move to the repository
  test files above; this file's leftover pure-logic tests — `estaExpirado`,
  `separarCodigos` — stay here since they're still pure functions)
- Modify: `site/app/eventos/page.tsx`, `site/app/eventos/[id]/page.tsx`,
  `site/app/codigos/page.tsx` (add `async`/`await` — these call
  `listarEventos()`/`buscarEvento()`/`listarCodigos()`/`separarCodigos()`,
  now async)
- Delete: `site/content/eventos.json`, `site/content/codigos.json`

**Interfaces:**
- Produces: `db/repositorios/eventos.ts` exports `listar()`, `buscar(id)`,
  `criar(dados)`, `atualizar(id, dados)`, `excluir(id)`; `db/repositorios/codigos.ts`
  mirrors with `codigo` as the key instead of `id`. `lib/eventos.ts` keeps
  exporting `listarEventos(): Promise<Evento[]>`,
  `buscarEvento(id): Promise<Evento | null>`, `listarCodigos(): Promise<Codigo[]>`,
  `separarCodigos(agora?): Promise<{ativos, expirados}>` — now async, same names.

- [ ] **Step 1: Write the failing repository tests**

Create `site/db/repositorios/eventos.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { urlBancoTeste, clienteTeste, limparTabelas } from '../testes/ambiente';
import { criarRepositorioEventos } from './eventos';

const rodar = urlBancoTeste() ? describe : describe.skip;

rodar('repositório de eventos (integração)', () => {
  const { db, client } = clienteTeste();
  const repo = criarRepositorioEventos(db);
  const exemplo = {
    id: 'evento-teste', tipo: 'noticia' as const, titulo: 'Título', data: '2026-01-01',
    ate: null, destaque: false, autor: 'admin', resumo: 'resumo', corpo: 'corpo',
  };

  beforeEach(async () => { await limparTabelas(db); });
  afterAll(async () => { await client.end(); });

  it('cria e lista', async () => {
    await repo.criar(exemplo);
    expect(await repo.listar()).toHaveLength(1);
  });

  it('busca por id', async () => {
    await repo.criar(exemplo);
    expect((await repo.buscar('evento-teste'))?.titulo).toBe('Título');
  });

  it('busca id inexistente devolve null', async () => {
    expect(await repo.buscar('nao-existe')).toBeNull();
  });

  it('atualiza', async () => {
    await repo.criar(exemplo);
    await repo.atualizar('evento-teste', { ...exemplo, titulo: 'Novo título' });
    expect((await repo.buscar('evento-teste'))?.titulo).toBe('Novo título');
  });

  it('exclui', async () => {
    await repo.criar(exemplo);
    await repo.excluir('evento-teste');
    expect(await repo.buscar('evento-teste')).toBeNull();
  });
});
```

Create `site/db/repositorios/codigos.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { urlBancoTeste, clienteTeste, limparTabelas } from '../testes/ambiente';
import { criarRepositorioCodigos } from './codigos';

const rodar = urlBancoTeste() ? describe : describe.skip;

rodar('repositório de códigos (integração)', () => {
  const { db, client } = clienteTeste();
  const repo = criarRepositorioCodigos(db);
  const exemplo = {
    codigo: 'TESTE2026', recompensa: '100 moedas', descricao: 'código de teste',
    expiraEm: null, fonte: null,
  };

  beforeEach(async () => { await limparTabelas(db); });
  afterAll(async () => { await client.end(); });

  it('cria e lista', async () => {
    await repo.criar(exemplo);
    expect(await repo.listar()).toHaveLength(1);
  });

  it('exclui', async () => {
    await repo.criar(exemplo);
    await repo.excluir('TESTE2026');
    expect(await repo.listar()).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run db/repositorios/eventos.test.ts db/repositorios/codigos.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement the repositories**

Create `site/db/repositorios/eventos.ts`:

```ts
import { eq } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { eventos } from '../schema';

type Banco = typeof DbClient;
export type NovoEvento = typeof eventos.$inferInsert;

export function criarRepositorioEventos(db: Banco) {
  return {
    async listar() {
      return db.select().from(eventos);
    },
    async buscar(id: string) {
      const linhas = await db.select().from(eventos).where(eq(eventos.id, id));
      return linhas[0] ?? null;
    },
    async criar(dados: NovoEvento) {
      await db.insert(eventos).values(dados);
    },
    async atualizar(id: string, dados: NovoEvento) {
      await db.update(eventos).set(dados).where(eq(eventos.id, id));
    },
    async excluir(id: string) {
      await db.delete(eventos).where(eq(eventos.id, id));
    },
  };
}

import { db } from '../client';
export const repositorioEventos = criarRepositorioEventos(db);
```

Create `site/db/repositorios/codigos.ts`:

```ts
import { eq } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { codigos } from '../schema';

type Banco = typeof DbClient;
export type NovoCodigo = typeof codigos.$inferInsert;

export function criarRepositorioCodigos(db: Banco) {
  return {
    async listar() {
      return db.select().from(codigos);
    },
    async buscar(codigo: string) {
      const linhas = await db.select().from(codigos).where(eq(codigos.codigo, codigo));
      return linhas[0] ?? null;
    },
    async criar(dados: NovoCodigo) {
      await db.insert(codigos).values(dados);
    },
    async atualizar(codigo: string, dados: NovoCodigo) {
      await db.update(codigos).set(dados).where(eq(codigos.codigo, codigo));
    },
    async excluir(codigo: string) {
      await db.delete(codigos).where(eq(codigos.codigo, codigo));
    },
  };
}

import { db } from '../client';
export const repositorioCodigos = criarRepositorioCodigos(db);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run db/repositorios/eventos.test.ts db/repositorios/codigos.test.ts`
Expected: PASS (5 + 2 tests), or SKIP without `DATABASE_URL_TEST`.

- [ ] **Step 5: Rewrite `lib/eventos.ts` to read from the repositories**

Replace `site/lib/eventos.ts` entirely:

```ts
import { z } from 'zod';
import { repositorioEventos } from '@/db/repositorios/eventos';
import { repositorioCodigos } from '@/db/repositorios/codigos';

const DATA = /^\d{4}-\d{2}-\d{2}$/;

export const EventoSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id deve ser kebab-case'),
  tipo: z.enum(['evento', 'noticia', 'atualizacao']),
  titulo: z.string().min(1),
  data: z.string().regex(DATA, 'data deve ser AAAA-MM-DD'),
  ate: z.string().regex(DATA).nullable(),
  destaque: z.boolean(),
  autor: z.string().min(1),
  resumo: z.string().min(1),
  corpo: z.string().min(1),
});
export type Evento = z.infer<typeof EventoSchema>;

export const CodigoSchema = z.object({
  codigo: z.string().min(1),
  recompensa: z.string().min(1),
  descricao: z.string().min(1),
  expiraEm: z.string().regex(DATA).nullable(),
  fonte: z.string().url().nullable(),
});
export type Codigo = z.infer<typeof CodigoSchema>;

/** Do mais recente para o mais antigo; destaque sobe. */
export async function listarEventos(): Promise<Evento[]> {
  const linhas = await repositorioEventos.listar();
  return [...linhas].sort(
    (a, b) => Number(b.destaque) - Number(a.destaque) || b.data.localeCompare(a.data)
  );
}

export async function buscarEvento(id: string): Promise<Evento | null> {
  return repositorioEventos.buscar(id);
}

export async function listarCodigos(): Promise<Codigo[]> {
  return repositorioCodigos.listar();
}

/**
 * Um código sem data de expiração nunca vence. A comparação é feita no fuso
 * local de quem lê, com o dia inteiro valendo — um código que expira dia 10
 * ainda funciona durante o dia 10.
 */
export function estaExpirado(codigo: Codigo, agora: Date = new Date()): boolean {
  if (!codigo.expiraEm) return false;
  const [ano, mes, dia] = codigo.expiraEm.split('-').map(Number);
  return agora.getTime() > new Date(ano, mes - 1, dia, 23, 59, 59, 999).getTime();
}

export async function separarCodigos(agora: Date = new Date()): Promise<{
  ativos: Codigo[]; expirados: Codigo[];
}> {
  const codigos = await listarCodigos();
  return {
    ativos: codigos.filter((c) => !estaExpirado(c, agora)),
    expirados: codigos.filter((c) => estaExpirado(c, agora)),
  };
}
```

Note: `estaExpirado` stays synchronous — it's pure and doesn't touch the
repository.

- [ ] **Step 6: Update `lib/eventos.test.ts`**

The existing tests that constructed in-memory `eventos`/`codigos` arrays
directly (reading from `content/*.json` via the old module-level constants)
no longer apply the same way. Keep only the tests for the still-pure
`estaExpirado` function; the `listarEventos`/`separarCodigos` async-behavior
tests move into the repository test files from Step 1 (already covering
list/create/read). Edit `site/lib/eventos.test.ts` to keep just:

```ts
import { describe, it, expect } from 'vitest';
import { estaExpirado, type Codigo } from './eventos';

describe('estaExpirado', () => {
  const base: Codigo = {
    codigo: 'X', recompensa: 'r', descricao: 'd', expiraEm: null, fonte: null,
  };

  it('nunca expira sem data', () => {
    expect(estaExpirado(base)).toBe(false);
  });

  it('ainda vale no próprio dia da expiração', () => {
    const c = { ...base, expiraEm: '2026-01-10' };
    expect(estaExpirado(c, new Date(2026, 0, 10, 23, 0))).toBe(false);
  });

  it('expira no dia seguinte', () => {
    const c = { ...base, expiraEm: '2026-01-10' };
    expect(estaExpirado(c, new Date(2026, 0, 11, 0, 0, 1))).toBe(true);
  });
});
```

- [ ] **Step 7: Update the public pages to await the now-async functions**

Edit `site/app/eventos/page.tsx` — change `export default function` to
`export default async function` and add `await` before `listarEventos()`.

Edit `site/app/eventos/[id]/page.tsx` — same: `async function`, `await buscarEvento(id)`.

Edit `site/app/codigos/page.tsx` — same: `async function`,
`await separarCodigos()` (check the current call site name/shape in the
existing file before editing — the exact variable destructuring must match
what's already there, only adding `await`).

- [ ] **Step 8: Run the full suite and build**

```bash
npx vitest run
npm run build
```

Expected: all tests pass (DB-touching ones pass or skip); build succeeds —
`generateStaticParams` for `/eventos/[id]` doesn't exist yet in the current
codebase per the earlier file listing (only elenco/itens/mapa have dynamic
`[id]` with `generateStaticParams`) — confirm this is still true; if
`app/eventos/[id]/page.tsx` has no `generateStaticParams`, it becomes a
fully dynamic route by default under App Router, which is fine (Vercel
handles it as an on-demand rendered route, not part of the "must stay static"
set — eventos/codigos are database-only content from Task 6 onward, so this
route was never a candidate for the "public pages stay static" guarantee,
which applies to the JSON-derived collections, not the DB-native ones).

- [ ] **Step 9: Delete the now-unused JSON files**

```bash
git rm content/eventos.json content/codigos.json
```

- [ ] **Step 10: Commit**

```bash
git add db/repositorios/eventos.ts db/repositorios/eventos.test.ts db/repositorios/codigos.ts db/repositorios/codigos.test.ts lib/eventos.ts lib/eventos.test.ts app/eventos app/codigos
git commit -m "feat: eventos e codigos migram do JSON para o banco"
```

---

## Task 8: Eventos/Códigos admin screens

**Files:**
- Create: `site/app/adm/eventos/page.tsx`
- Create: `site/app/adm/eventos/acoes.ts`
- Create: `site/app/adm/eventos/acoes.test.ts`
- Create: `site/components/adm/FormularioEvento.tsx`
- Create: `site/components/adm/FormularioEvento.test.tsx`
- Create: `site/app/adm/codigos/page.tsx`
- Create: `site/app/adm/codigos/acoes.ts`
- Create: `site/app/adm/codigos/acoes.test.ts`
- Create: `site/components/adm/FormularioCodigo.tsx`
- Create: `site/components/adm/FormularioCodigo.test.tsx`

**Interfaces:**
- Consumes: `exigirAdm()` (Task 4), `repositorioEventos`/`repositorioCodigos`
  (Task 7), `EventoSchema`/`CodigoSchema` (Task 7).
- Produces: working `/adm/eventos` and `/adm/codigos` CRUD screens.

- [ ] **Step 1: Write the failing tests for the eventos Server Actions**

Create `site/app/adm/eventos/acoes.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/adm/sessao', () => ({ exigirAdm: vi.fn() }));
vi.mock('@/db/repositorios/eventos', () => ({
  repositorioEventos: { criar: vi.fn(), atualizar: vi.fn(), excluir: vi.fn() },
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioEventos } from '@/db/repositorios/eventos';
import { revalidatePath } from 'next/cache';
import { salvarEvento, excluirEvento } from './acoes';

const eventoValido = {
  id: 'evento-teste', tipo: 'noticia' as const, titulo: 'Título', data: '2026-01-01',
  ate: null, destaque: false, autor: 'admin', resumo: 'resumo', corpo: 'corpo',
};

describe('salvarEvento', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejeita sem sessão de adm', async () => {
    vi.mocked(exigirAdm).mockRejectedValue(new Error('Acesso negado'));
    await expect(salvarEvento(eventoValido)).rejects.toThrow('Acesso negado');
  });

  it('rejeita dado inválido antes de tocar o banco', async () => {
    vi.mocked(exigirAdm).mockResolvedValue({ discordId: '1', papel: 'adm' });
    await expect(salvarEvento({ ...eventoValido, data: 'não é uma data' })).rejects.toThrow();
    expect(repositorioEventos.criar).not.toHaveBeenCalled();
  });

  it('cria o evento e revalida as páginas afetadas', async () => {
    vi.mocked(exigirAdm).mockResolvedValue({ discordId: '1', papel: 'adm' });

    await salvarEvento(eventoValido);

    expect(repositorioEventos.criar).toHaveBeenCalledWith(eventoValido);
    expect(revalidatePath).toHaveBeenCalledWith('/eventos');
    expect(revalidatePath).toHaveBeenCalledWith('/eventos/evento-teste');
  });
});

describe('excluirEvento', () => {
  beforeEach(() => vi.clearAllMocks());

  it('exclui e revalida a listagem', async () => {
    vi.mocked(exigirAdm).mockResolvedValue({ discordId: '1', papel: 'adm' });

    await excluirEvento('evento-teste');

    expect(repositorioEventos.excluir).toHaveBeenCalledWith('evento-teste');
    expect(revalidatePath).toHaveBeenCalledWith('/eventos');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/adm/eventos/acoes.test.ts`
Expected: FAIL — `./acoes` module not found.

- [ ] **Step 3: Implement the eventos Server Actions**

Create `site/app/adm/eventos/acoes.ts`:

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioEventos } from '@/db/repositorios/eventos';
import { EventoSchema, type Evento } from '@/lib/eventos';

export async function salvarEvento(dados: Evento) {
  await exigirAdm();
  const validado = EventoSchema.parse(dados);

  const existente = await repositorioEventos.buscar(validado.id);
  if (existente) await repositorioEventos.atualizar(validado.id, validado);
  else await repositorioEventos.criar(validado);

  revalidatePath('/eventos');
  revalidatePath(`/eventos/${validado.id}`);
}

export async function excluirEvento(id: string) {
  await exigirAdm();
  await repositorioEventos.excluir(id);
  revalidatePath('/eventos');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/adm/eventos/acoes.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Write the failing test for the form component**

Create `site/components/adm/FormularioEvento.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormularioEvento } from './FormularioEvento';

describe('FormularioEvento', () => {
  it('preenche os campos a partir de um evento existente', () => {
    render(<FormularioEvento
      evento={{ id: 'e1', tipo: 'noticia', titulo: 'Título', data: '2026-01-01', ate: null, destaque: false, autor: 'admin', resumo: 'resumo', corpo: 'corpo' }}
      aoSalvar={vi.fn()}
    />);
    expect(screen.getByDisplayValue('Título')).toBeInTheDocument();
  });

  it('chama aoSalvar com os dados preenchidos', () => {
    const aoSalvar = vi.fn();
    render(<FormularioEvento evento={null} aoSalvar={aoSalvar} />);

    fireEvent.change(screen.getByLabelText('Id'), { target: { value: 'novo-evento' } });
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Um título' } });
    fireEvent.change(screen.getByLabelText('Data'), { target: { value: '2026-02-01' } });
    fireEvent.change(screen.getByLabelText('Autor'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('Resumo'), { target: { value: 'r' } });
    fireEvent.change(screen.getByLabelText('Corpo'), { target: { value: 'c' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(aoSalvar).toHaveBeenCalledWith(expect.objectContaining({
      id: 'novo-evento', titulo: 'Um título', data: '2026-02-01', autor: 'admin', resumo: 'r', corpo: 'c',
    }));
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run components/adm/FormularioEvento.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 7: Implement the form**

Create `site/components/adm/FormularioEvento.tsx`:

```tsx
'use client';

import { useState } from 'react';
import type { Evento } from '@/lib/eventos';

const VAZIO: Evento = {
  id: '', tipo: 'noticia', titulo: '', data: '', ate: null, destaque: false,
  autor: '', resumo: '', corpo: '',
};

export function FormularioEvento({
  evento, aoSalvar,
}: { evento: Evento | null; aoSalvar: (dados: Evento) => void }) {
  const [dados, setDados] = useState<Evento>(evento ?? VAZIO);

  function campo<K extends keyof Evento>(chave: K, valor: Evento[K]) {
    setDados((d) => ({ ...d, [chave]: valor }));
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); aoSalvar(dados); }}>
      <label>Id
        <input value={dados.id} onChange={(e) => campo('id', e.target.value)} disabled={!!evento} />
      </label>
      <label>Tipo
        <select value={dados.tipo} onChange={(e) => campo('tipo', e.target.value as Evento['tipo'])}>
          <option value="evento">Evento</option>
          <option value="noticia">Notícia</option>
          <option value="atualizacao">Atualização</option>
        </select>
      </label>
      <label>Título
        <input value={dados.titulo} onChange={(e) => campo('titulo', e.target.value)} />
      </label>
      <label>Data
        <input type="date" value={dados.data} onChange={(e) => campo('data', e.target.value)} />
      </label>
      <label>Até (opcional)
        <input type="date" value={dados.ate ?? ''} onChange={(e) => campo('ate', e.target.value || null)} />
      </label>
      <label>
        <input type="checkbox" checked={dados.destaque} onChange={(e) => campo('destaque', e.target.checked)} />
        Destaque
      </label>
      <label>Autor
        <input value={dados.autor} onChange={(e) => campo('autor', e.target.value)} />
      </label>
      <label>Resumo
        <textarea value={dados.resumo} onChange={(e) => campo('resumo', e.target.value)} />
      </label>
      <label>Corpo
        <textarea value={dados.corpo} onChange={(e) => campo('corpo', e.target.value)} />
      </label>
      <button type="submit">Salvar</button>
    </form>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run components/adm/FormularioEvento.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 9: Wire the eventos admin page**

Create `site/app/adm/eventos/page.tsx`:

```tsx
import { listarEventos } from '@/lib/eventos';
import { salvarEvento, excluirEvento } from './acoes';
import { FormularioEvento } from '@/components/adm/FormularioEvento';

export default async function AdmEventos() {
  const eventos = await listarEventos();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-bold">Eventos</h1>
      <FormularioEvento evento={null} aoSalvar={salvarEvento} />
      <ul className="flex flex-col gap-2">
        {eventos.map((e) => (
          <li key={e.id} className="flex items-center justify-between rounded border border-neutral-800 p-2">
            <span>{e.titulo} — {e.data}</span>
            <form action={excluirEvento.bind(null, e.id)}>
              <button type="submit" className="text-red-400">Excluir</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Note: `FormularioEvento`'s `aoSalvar` prop is a client-side callback
(`'use client'` component), but `salvarEvento` is a Server Action — passing a
Server Action reference as a prop to a Client Component and calling it from
an event handler is exactly the supported pattern for invoking Server
Actions outside of a plain `<form action>` (React treats an imported
`'use server'` function as a callable reference across the boundary).

- [ ] **Step 10: Write the failing test for the códigos Server Actions**

Create `site/app/adm/codigos/acoes.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/adm/sessao', () => ({ exigirAdm: vi.fn() }));
vi.mock('@/db/repositorios/codigos', () => ({
  repositorioCodigos: { criar: vi.fn(), atualizar: vi.fn(), excluir: vi.fn(), buscar: vi.fn() },
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioCodigos } from '@/db/repositorios/codigos';
import { revalidatePath } from 'next/cache';
import { salvarCodigo, excluirCodigo } from './acoes';

const codigoValido = {
  codigo: 'BEMVINDO2026', recompensa: '500 moedas', descricao: 'código de teste',
  expiraEm: null, fonte: null,
};

describe('salvarCodigo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejeita sem sessão de adm', async () => {
    vi.mocked(exigirAdm).mockRejectedValue(new Error('Acesso negado'));
    await expect(salvarCodigo(codigoValido)).rejects.toThrow('Acesso negado');
  });

  it('rejeita dado inválido antes de tocar o banco', async () => {
    vi.mocked(exigirAdm).mockResolvedValue({ discordId: '1', papel: 'adm' });
    await expect(salvarCodigo({ ...codigoValido, codigo: '' })).rejects.toThrow();
    expect(repositorioCodigos.criar).not.toHaveBeenCalled();
  });

  it('cria o código e revalida a listagem', async () => {
    vi.mocked(exigirAdm).mockResolvedValue({ discordId: '1', papel: 'adm' });
    vi.mocked(repositorioCodigos.buscar).mockResolvedValue(null);

    await salvarCodigo(codigoValido);

    expect(repositorioCodigos.criar).toHaveBeenCalledWith(codigoValido);
    expect(revalidatePath).toHaveBeenCalledWith('/codigos');
  });

  it('atualiza em vez de criar quando o código já existe', async () => {
    vi.mocked(exigirAdm).mockResolvedValue({ discordId: '1', papel: 'adm' });
    vi.mocked(repositorioCodigos.buscar).mockResolvedValue(codigoValido);

    await salvarCodigo(codigoValido);

    expect(repositorioCodigos.atualizar).toHaveBeenCalledWith('BEMVINDO2026', codigoValido);
    expect(repositorioCodigos.criar).not.toHaveBeenCalled();
  });
});

describe('excluirCodigo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('exclui e revalida a listagem', async () => {
    vi.mocked(exigirAdm).mockResolvedValue({ discordId: '1', papel: 'adm' });

    await excluirCodigo('BEMVINDO2026');

    expect(repositorioCodigos.excluir).toHaveBeenCalledWith('BEMVINDO2026');
    expect(revalidatePath).toHaveBeenCalledWith('/codigos');
  });
});
```

- [ ] **Step 11: Run test to verify it fails**

Run: `npx vitest run app/adm/codigos/acoes.test.ts`
Expected: FAIL — `./acoes` module not found.

- [ ] **Step 12: Implement the códigos Server Actions**

Create `site/app/adm/codigos/acoes.ts`:

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioCodigos } from '@/db/repositorios/codigos';
import { CodigoSchema, type Codigo } from '@/lib/eventos';

export async function salvarCodigo(dados: Codigo) {
  await exigirAdm();
  const validado = CodigoSchema.parse(dados);

  const existente = await repositorioCodigos.buscar(validado.codigo);
  if (existente) await repositorioCodigos.atualizar(validado.codigo, validado);
  else await repositorioCodigos.criar(validado);

  revalidatePath('/codigos');
}

export async function excluirCodigo(codigo: string) {
  await exigirAdm();
  await repositorioCodigos.excluir(codigo);
  revalidatePath('/codigos');
}
```

- [ ] **Step 13: Write the failing test for the FormularioCodigo component**

Create `site/components/adm/FormularioCodigo.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormularioCodigo } from './FormularioCodigo';

describe('FormularioCodigo', () => {
  it('preenche os campos a partir de um código existente', () => {
    render(<FormularioCodigo
      codigo={{ codigo: 'X2026', recompensa: '100 moedas', descricao: 'd', expiraEm: null, fonte: null }}
      aoSalvar={vi.fn()}
    />);
    expect(screen.getByDisplayValue('X2026')).toBeInTheDocument();
  });

  it('chama aoSalvar com os dados preenchidos', () => {
    const aoSalvar = vi.fn();
    render(<FormularioCodigo codigo={null} aoSalvar={aoSalvar} />);

    fireEvent.change(screen.getByLabelText('Código'), { target: { value: 'NOVO2026' } });
    fireEvent.change(screen.getByLabelText('Recompensa'), { target: { value: '200 moedas' } });
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'd' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(aoSalvar).toHaveBeenCalledWith(expect.objectContaining({
      codigo: 'NOVO2026', recompensa: '200 moedas', descricao: 'd',
    }));
  });
});
```

- [ ] **Step 14: Run test to verify it fails**

Run: `npx vitest run components/adm/FormularioCodigo.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 15: Implement `FormularioCodigo`**

Create `site/components/adm/FormularioCodigo.tsx`:

```tsx
'use client';

import { useState } from 'react';
import type { Codigo } from '@/lib/eventos';

const VAZIO: Codigo = { codigo: '', recompensa: '', descricao: '', expiraEm: null, fonte: null };

export function FormularioCodigo({
  codigo, aoSalvar,
}: { codigo: Codigo | null; aoSalvar: (dados: Codigo) => void }) {
  const [dados, setDados] = useState<Codigo>(codigo ?? VAZIO);

  function campo<K extends keyof Codigo>(chave: K, valor: Codigo[K]) {
    setDados((d) => ({ ...d, [chave]: valor }));
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); aoSalvar(dados); }}>
      <label>Código
        <input value={dados.codigo} onChange={(e) => campo('codigo', e.target.value)} disabled={!!codigo} />
      </label>
      <label>Recompensa
        <input value={dados.recompensa} onChange={(e) => campo('recompensa', e.target.value)} />
      </label>
      <label>Descrição
        <textarea value={dados.descricao} onChange={(e) => campo('descricao', e.target.value)} />
      </label>
      <label>Expira em (opcional)
        <input type="date" value={dados.expiraEm ?? ''} onChange={(e) => campo('expiraEm', e.target.value || null)} />
      </label>
      <label>Fonte (opcional, URL)
        <input value={dados.fonte ?? ''} onChange={(e) => campo('fonte', e.target.value || null)} />
      </label>
      <button type="submit">Salvar</button>
    </form>
  );
}
```

- [ ] **Step 16: Run test to verify it passes**

Run: `npx vitest run components/adm/FormularioCodigo.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 17: Wire the códigos admin page**

Create `site/app/adm/codigos/page.tsx`:

```tsx
import { listarCodigos } from '@/lib/eventos';
import { salvarCodigo, excluirCodigo } from './acoes';
import { FormularioCodigo } from '@/components/adm/FormularioCodigo';

export default async function AdmCodigos() {
  const codigos = await listarCodigos();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-bold">Códigos</h1>
      <FormularioCodigo codigo={null} aoSalvar={salvarCodigo} />
      <ul className="flex flex-col gap-2">
        {codigos.map((c) => (
          <li key={c.codigo} className="flex items-center justify-between rounded border border-neutral-800 p-2">
            <span>{c.codigo} — {c.recompensa}</span>
            <form action={excluirCodigo.bind(null, c.codigo)}>
              <button type="submit" className="text-red-400">Excluir</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 18: Give both forms a visible error state that keeps the typed data**

Spec §6 ("Erros") requires that a failed save shows a message and keeps
whatever was typed — neither `FormularioEvento` nor `FormularioCodigo`
handles a rejected `aoSalvar` yet (an unawaited rejection would currently
just log an unhandled-promise-rejection warning with no UI feedback). Fix
both the same way: wrap the call in `try/catch`, keep `dados` as-is on
failure (already true — nothing here resets it), and render the caught
message.

Edit `site/components/adm/FormularioEvento.tsx`, replacing the `onSubmit`
line and adding an error state:

```tsx
  const [dados, setDados] = useState<Evento>(evento ?? VAZIO);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await aoSalvar(dados);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não deu para salvar. Tenta de novo?');
    }
  }
```

and change `<form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); aoSalvar(dados); }}>`
to `<form className="flex flex-col gap-2" onSubmit={enviar}>`, plus render
`{erro && <p role="alert" className="text-red-400">{erro}</p>}` right before
the closing `</form>`. The `aoSalvar` prop type changes from
`(dados: Evento) => void` to `(dados: Evento) => Promise<void>` (Server
Actions are already async, so callers don't change).

Apply the identical change to `site/components/adm/FormularioCodigo.tsx`
(same three edits: `erro` state, `enviar` wrapper, `role="alert"` paragraph).

- [ ] **Step 19: Write the failing tests for the error path, then re-verify green**

Append to `site/components/adm/FormularioEvento.test.tsx`:

```tsx
it('mostra uma mensagem e mantém os dados quando salvar falha', async () => {
  const aoSalvar = vi.fn().mockRejectedValue(new Error('Banco fora do ar'));
  render(<FormularioEvento evento={null} aoSalvar={aoSalvar} />);

  fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Um título' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Banco fora do ar');
  expect(screen.getByDisplayValue('Um título')).toBeInTheDocument();
});
```

Append the equivalent test to `site/components/adm/FormularioCodigo.test.tsx`,
substituting the `Recompensa` field for the "keeps what was typed" assertion.

Run: `npx vitest run components/adm/FormularioEvento.test.tsx components/adm/FormularioCodigo.test.tsx`

Expected: FAIL first (before Step 18's edit — reorder in practice: write
these two tests immediately after Steps 5/13's original tests, watch them
fail, then do Step 18's implementation, then confirm PASS). Since this plan
lists Step 18 before Step 19 for narrative clarity, when executing for real
follow strict TDD order: the failing test always precedes its implementation.

Expected after Step 18's implementation: PASS (3 tests in each file).

- [ ] **Step 20: Run the full suite**

```bash
npx vitest run
```

Expected: all pass.

- [ ] **Step 21: Commit**

```bash
git add app/adm/eventos app/adm/codigos components/adm/FormularioEvento.tsx components/adm/FormularioEvento.test.tsx components/adm/FormularioCodigo.tsx components/adm/FormularioCodigo.test.tsx
git commit -m "feat: telas de ADM para eventos e codigos, com erro visivel ao falhar salvar"
```

---

## Task 9: Correções — pure merge logic

**Files:**
- Create: `site/lib/correcoes-merge.ts`
- Create: `site/lib/correcoes-merge.test.ts`

**Interfaces:**
- Produces: `type Colecao`, `type MapaCorrecoes`, `obterCaminho(objeto, caminho)`,
  `definirCaminho(objeto, caminho, valor)`, `aplicarCorrecoes(registros, correcoes)`
  — used by Task 10 (repository), Task 11 (lib wiring), and Task 13 (admin UI).

- [ ] **Step 1: Write the failing tests**

Create `site/lib/correcoes-merge.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { obterCaminho, definirCaminho, aplicarCorrecoes, type MapaCorrecoes } from './correcoes-merge';

describe('obterCaminho', () => {
  it('lê um campo de primeiro nível', () => {
    expect(obterCaminho({ nome: 'Makoto' }, 'nome')).toBe('Makoto');
  });

  it('lê um campo aninhado', () => {
    expect(obterCaminho({ descricao: { pt: 'oi', en: 'hi' } }, 'descricao.pt')).toBe('oi');
  });

  it('devolve null quando o caminho não existe', () => {
    expect(obterCaminho({ descricao: null }, 'descricao.pt')).toBeNull();
  });
});

describe('definirCaminho', () => {
  it('escreve um campo de primeiro nível sem mutar o original', () => {
    const original = { nome: 'Makoto' };
    const resultado = definirCaminho(original, 'nome', 'Outro nome');

    expect(resultado.nome).toBe('Outro nome');
    expect(original.nome).toBe('Makoto');
  });

  it('escreve um campo aninhado existente', () => {
    const original = { descricao: { pt: 'oi', en: 'hi' } };
    const resultado = definirCaminho(original, 'descricao.pt', 'novo');

    expect(resultado.descricao).toEqual({ pt: 'novo', en: 'hi' });
  });

  it('cria o objeto intermediário quando o campo base é null', () => {
    const original: { descricao: { pt: string; en: string } | null } = { descricao: null };
    const resultado = definirCaminho(original, 'descricao.pt', 'novo');

    expect(resultado.descricao).toEqual({ pt: 'novo' });
  });
});

describe('aplicarCorrecoes', () => {
  it('devolve os registros sem alteração quando não há correções', () => {
    const registros = [{ id: 'a', nome: 'Original' }];
    const correcoes: MapaCorrecoes = new Map();

    expect(aplicarCorrecoes(registros, correcoes)).toEqual(registros);
  });

  it('aplica a correção por cima do registro certo', () => {
    const registros = [{ id: 'a', nome: 'Original' }, { id: 'b', nome: 'Outro' }];
    const correcoes: MapaCorrecoes = new Map([
      ['a', new Map([['nome', { valor: 'Corrigido', valorBase: 'Original', autor: '1', criadoEm: '2026-01-01' }]])],
    ]);

    const resultado = aplicarCorrecoes(registros, correcoes);

    expect(resultado[0].nome).toBe('Corrigido');
    expect(resultado[1].nome).toBe('Outro');
  });

  it('não muta o array original', () => {
    const registros = [{ id: 'a', nome: 'Original' }];
    const correcoes: MapaCorrecoes = new Map([
      ['a', new Map([['nome', { valor: 'Corrigido', valorBase: 'Original', autor: '1', criadoEm: '2026-01-01' }]])],
    ]);

    aplicarCorrecoes(registros, correcoes);

    expect(registros[0].nome).toBe('Original');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/correcoes-merge.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `site/lib/correcoes-merge.ts`:

```ts
export type Colecao = 'personagens' | 'itens' | 'locais' | 'faq' | 'controles';

export type CorrecaoSalva = { valor: string; valorBase: string; autor: string; criadoEm: string };

/** registroId -> campo -> correção salva */
export type MapaCorrecoes = Map<string, Map<string, CorrecaoSalva>>;

export function obterCaminho(objeto: unknown, caminho: string): string | null {
  const valor = caminho.split('.').reduce<unknown>((atual, chave) => {
    if (atual && typeof atual === 'object') return (atual as Record<string, unknown>)[chave];
    return undefined;
  }, objeto);
  return typeof valor === 'string' ? valor : null;
}

/** Escreve um valor num caminho pontilhado sem mutar o objeto original,
 * criando objetos intermediários que estejam ausentes ou nulos. */
export function definirCaminho<T extends object>(objeto: T, caminho: string, valor: string): T {
  const partes = caminho.split('.');
  const clone: Record<string, unknown> = { ...objeto };
  let atual = clone;

  for (let i = 0; i < partes.length - 1; i++) {
    const chave = partes[i];
    const existente = atual[chave];
    atual[chave] = existente && typeof existente === 'object' ? { ...existente } : {};
    atual = atual[chave] as Record<string, unknown>;
  }

  atual[partes[partes.length - 1]] = valor;
  return clone as T;
}

export function aplicarCorrecoes<T extends { id: string }>(
  registros: T[],
  correcoes: MapaCorrecoes,
): T[] {
  return registros.map((registro) => {
    const doRegistro = correcoes.get(registro.id);
    if (!doRegistro) return registro;

    let corrigido = registro;
    for (const [campo, correcao] of doRegistro) {
      corrigido = definirCaminho(corrigido, campo, correcao.valor);
    }
    return corrigido;
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/correcoes-merge.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/correcoes-merge.ts lib/correcoes-merge.test.ts
git commit -m "feat: logica pura de mesclagem de correcoes sobre um registro"
```

---

## Task 10: Correções — repository and auditoria

**Files:**
- Create: `site/db/repositorios/correcoes.ts`
- Create: `site/db/repositorios/correcoes.test.ts`
- Create: `site/db/repositorios/auditoria.ts`
- Create: `site/db/repositorios/auditoria.test.ts`

**Interfaces:**
- Consumes: `correcoes`, `auditoria` tables (Task 2); `Colecao`, `MapaCorrecoes`
  (Task 9).
- Produces: `buscarCorrecoesPorColecao(colecao): Promise<MapaCorrecoes>`,
  `salvarCorrecao({colecao, registroId, campo, valor, valorBase, autor}): Promise<void>`,
  `reverterCorrecao({colecao, registroId, campo, autor}): Promise<void>` from
  `db/repositorios/correcoes.ts`; `registrar({autor, acao, alvo, valorAntigo, valorNovo}): Promise<void>`,
  `listarAuditoria(filtros?: {autor?: string; colecao?: string}): Promise<AuditoriaLinha[]>`
  from `db/repositorios/auditoria.ts` — used by Task 13, 14, 15, and by the
  correções repository itself for audit trail writes.

- [ ] **Step 1: Write the failing tests for auditoria**

Create `site/db/repositorios/auditoria.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { urlBancoTeste, clienteTeste, limparTabelas } from '../testes/ambiente';
import { criarRepositorioAuditoria } from './auditoria';

const rodar = urlBancoTeste() ? describe : describe.skip;

rodar('repositório de auditoria (integração)', () => {
  const { db, client } = clienteTeste();
  const repo = criarRepositorioAuditoria(db);

  beforeEach(async () => { await limparTabelas(db); });
  afterAll(async () => { await client.end(); });

  it('registra e lista uma entrada', async () => {
    await repo.registrar({
      autor: '1', acao: 'correcao.criar', alvo: 'itens/x/descricao.pt',
      valorAntigo: null, valorNovo: 'novo valor',
    });

    const linhas = await repo.listarAuditoria();

    expect(linhas).toHaveLength(1);
    expect(linhas[0]).toMatchObject({ autor: '1', acao: 'correcao.criar', valorNovo: 'novo valor' });
  });

  it('filtra por autor', async () => {
    await repo.registrar({ autor: '1', acao: 'a', alvo: 'x', valorAntigo: null, valorNovo: null });
    await repo.registrar({ autor: '2', acao: 'a', alvo: 'x', valorAntigo: null, valorNovo: null });

    const linhas = await repo.listarAuditoria({ autor: '1' });

    expect(linhas).toHaveLength(1);
    expect(linhas[0].autor).toBe('1');
  });

  it('filtra por coleção, buscando no início do alvo', async () => {
    await repo.registrar({ autor: '1', acao: 'a', alvo: 'itens/x/nome', valorAntigo: null, valorNovo: null });
    await repo.registrar({ autor: '1', acao: 'a', alvo: 'personagens/y/nome', valorAntigo: null, valorNovo: null });

    const linhas = await repo.listarAuditoria({ colecao: 'itens' });

    expect(linhas).toHaveLength(1);
    expect(linhas[0].alvo).toBe('itens/x/nome');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run db/repositorios/auditoria.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement auditoria**

Create `site/db/repositorios/auditoria.ts`:

```ts
import { eq, like, and } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { auditoria } from '../schema';

type Banco = typeof DbClient;

export function criarRepositorioAuditoria(db: Banco) {
  return {
    async registrar(args: {
      autor: string; acao: string; alvo: string;
      valorAntigo: string | null; valorNovo: string | null;
    }) {
      await db.insert(auditoria).values(args);
    },

    async listarAuditoria(filtros: { autor?: string; colecao?: string } = {}) {
      const condicoes = [];
      if (filtros.autor) condicoes.push(eq(auditoria.autor, filtros.autor));
      if (filtros.colecao) condicoes.push(like(auditoria.alvo, `${filtros.colecao}/%`));

      const consulta = db.select().from(auditoria);
      return condicoes.length > 0 ? consulta.where(and(...condicoes)) : consulta;
    },
  };
}

import { db } from '../client';
export const repositorioAuditoria = criarRepositorioAuditoria(db);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run db/repositorios/auditoria.test.ts`
Expected: PASS (3 tests), or SKIP.

- [ ] **Step 5: Write the failing tests for correções**

Create `site/db/repositorios/correcoes.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { urlBancoTeste, clienteTeste, limparTabelas } from '../testes/ambiente';
import { criarRepositorioCorrecoes } from './correcoes';
import { criarRepositorioAuditoria } from './auditoria';

const rodar = urlBancoTeste() ? describe : describe.skip;

rodar('repositório de correções (integração)', () => {
  const { db, client } = clienteTeste();
  const repo = criarRepositorioCorrecoes(db);
  const auditoria = criarRepositorioAuditoria(db);

  beforeEach(async () => { await limparTabelas(db); });
  afterAll(async () => { await client.end(); });

  it('busca vazio para coleção sem correções', async () => {
    const mapa = await repo.buscarCorrecoesPorColecao('itens');
    expect(mapa.size).toBe(0);
  });

  it('salva e busca de volta', async () => {
    await repo.salvarCorrecao({
      colecao: 'itens', registroId: 'chave-mestra', campo: 'nome.pt',
      valor: 'Chave-Mestra', valorBase: 'Chave Mestra', autor: '1',
    });

    const mapa = await repo.buscarCorrecoesPorColecao('itens');

    expect(mapa.get('chave-mestra')?.get('nome.pt')?.valor).toBe('Chave-Mestra');
  });

  it('salvar de novo no mesmo alvo substitui, não duplica', async () => {
    await repo.salvarCorrecao({ colecao: 'itens', registroId: 'x', campo: 'nome.pt', valor: 'A', valorBase: 'base', autor: '1' });
    await repo.salvarCorrecao({ colecao: 'itens', registroId: 'x', campo: 'nome.pt', valor: 'B', valorBase: 'base', autor: '1' });

    const mapa = await repo.buscarCorrecoesPorColecao('itens');

    expect(mapa.get('x')?.get('nome.pt')?.valor).toBe('B');
  });

  it('salvar grava uma entrada de auditoria', async () => {
    await repo.salvarCorrecao({ colecao: 'itens', registroId: 'x', campo: 'nome.pt', valor: 'A', valorBase: 'base', autor: '1' });

    const linhas = await auditoria.listarAuditoria();

    expect(linhas).toHaveLength(1);
    expect(linhas[0]).toMatchObject({ acao: 'correcao.criar', alvo: 'itens/x/nome.pt', valorNovo: 'A' });
  });

  it('reverter remove a correção e o valor original volta a valer', async () => {
    await repo.salvarCorrecao({ colecao: 'itens', registroId: 'x', campo: 'nome.pt', valor: 'A', valorBase: 'base', autor: '1' });
    await repo.reverterCorrecao({ colecao: 'itens', registroId: 'x', campo: 'nome.pt', autor: '1' });

    const mapa = await repo.buscarCorrecoesPorColecao('itens');

    expect(mapa.get('x')).toBeUndefined();
  });

  it('reverter grava auditoria mesmo quando não havia correção', async () => {
    await repo.reverterCorrecao({ colecao: 'itens', registroId: 'x', campo: 'nome.pt', autor: '1' });

    const linhas = await auditoria.listarAuditoria();

    expect(linhas).toHaveLength(0);
  });
});
```

- [ ] **Step 6: Run tests to verify they fail**

Run: `npx vitest run db/repositorios/correcoes.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 7: Implement correções**

Create `site/db/repositorios/correcoes.ts`:

```ts
import { eq, and } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { correcoes } from '../schema';
import { criarRepositorioAuditoria } from './auditoria';
import type { Colecao, MapaCorrecoes } from '../../lib/correcoes-merge';

type Banco = typeof DbClient;

export function criarRepositorioCorrecoes(db: Banco) {
  const auditoria = criarRepositorioAuditoria(db);

  return {
    async buscarCorrecoesPorColecao(colecao: Colecao): Promise<MapaCorrecoes> {
      const linhas = await db.select().from(correcoes).where(eq(correcoes.colecao, colecao));

      const mapa: MapaCorrecoes = new Map();
      for (const linha of linhas) {
        if (!mapa.has(linha.registroId)) mapa.set(linha.registroId, new Map());
        mapa.get(linha.registroId)!.set(linha.campo, {
          valor: linha.valor,
          valorBase: linha.valorBase,
          autor: linha.autor,
          criadoEm: linha.criadoEm.toISOString(),
        });
      }
      return mapa;
    },

    async salvarCorrecao(args: {
      colecao: Colecao; registroId: string; campo: string;
      valor: string; valorBase: string; autor: string;
    }) {
      const alvo = and(
        eq(correcoes.colecao, args.colecao),
        eq(correcoes.registroId, args.registroId),
        eq(correcoes.campo, args.campo),
      );
      const anterior = await db.select().from(correcoes).where(alvo);

      await db.insert(correcoes).values(args).onConflictDoUpdate({
        target: [correcoes.colecao, correcoes.registroId, correcoes.campo],
        set: { valor: args.valor, valorBase: args.valorBase, autor: args.autor, criadoEm: new Date() },
      });

      await auditoria.registrar({
        autor: args.autor,
        acao: 'correcao.criar',
        alvo: `${args.colecao}/${args.registroId}/${args.campo}`,
        valorAntigo: anterior[0]?.valor ?? null,
        valorNovo: args.valor,
      });
    },

    async reverterCorrecao(args: { colecao: Colecao; registroId: string; campo: string; autor: string }) {
      const alvo = and(
        eq(correcoes.colecao, args.colecao),
        eq(correcoes.registroId, args.registroId),
        eq(correcoes.campo, args.campo),
      );
      const existente = await db.select().from(correcoes).where(alvo);
      if (existente.length === 0) return;

      await db.delete(correcoes).where(alvo);

      await auditoria.registrar({
        autor: args.autor,
        acao: 'correcao.reverter',
        alvo: `${args.colecao}/${args.registroId}/${args.campo}`,
        valorAntigo: existente[0].valor,
        valorNovo: null,
      });
    },
  };
}

import { db } from '../client';
export const repositorioCorrecoes = criarRepositorioCorrecoes(db);
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npx vitest run db/repositorios/correcoes.test.ts`
Expected: PASS (6 tests), or SKIP.

- [ ] **Step 9: Commit**

```bash
git add db/repositorios/correcoes.ts db/repositorios/correcoes.test.ts db/repositorios/auditoria.ts db/repositorios/auditoria.test.ts
git commit -m "feat: repositorio de correcoes com trilha de auditoria"
```

---

## Task 11: Wire `ComCorrecoes` reads — personagens, itens, locais

**Files:**
- Modify: `site/lib/dados.ts`
- Modify: `site/lib/dados.test.ts`
- Modify: `site/lib/itens.ts`
- Modify: `site/lib/itens.test.ts`

**Interfaces:**
- Consumes: `aplicarCorrecoes` (Task 9), `repositorioCorrecoes.buscarCorrecoesPorColecao`
  (Task 10).
- Produces: `listarPersonagensComCorrecoes(): Promise<Personagem[]>`,
  `buscarPersonagemComCorrecoes(id): Promise<Personagem | null>` (added to
  `lib/dados.ts`, existing sync exports untouched);
  `listarItensComCorrecoes()`, `buscarItemComCorrecoes(id)`,
  `listarLocaisComCorrecoes()`, `buscarLocalComCorrecoes(id)` (added to
  `lib/itens.ts`) — consumed by Task 12's page.tsx rewiring.

- [ ] **Step 1: Write the failing tests for `lib/dados.ts`**

Append to `site/lib/dados.test.ts` (read the existing file first to match its
current import/mock style before appending):

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/db/repositorios/correcoes', () => ({
  repositorioCorrecoes: { buscarCorrecoesPorColecao: vi.fn() },
}));
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { listarPersonagensComCorrecoes, buscarPersonagemComCorrecoes } from './dados';

describe('listarPersonagensComCorrecoes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devolve os personagens sem alteração quando não há correções', async () => {
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockResolvedValue(new Map());

    const lista = await listarPersonagensComCorrecoes();

    expect(lista.find((p) => p.id === 'makoto-naegi')?.nome).toBe('Makoto Naegi');
  });

  it('aplica uma correção de nome por cima do JSON', async () => {
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockResolvedValue(new Map([
      ['makoto-naegi', new Map([['nome', { valor: 'Nome Corrigido', valorBase: 'Makoto Naegi', autor: '1', criadoEm: '2026-01-01' }]])],
    ]));

    const lista = await listarPersonagensComCorrecoes();

    expect(lista.find((p) => p.id === 'makoto-naegi')?.nome).toBe('Nome Corrigido');
  });
});

describe('buscarPersonagemComCorrecoes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devolve null para id inexistente', async () => {
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockResolvedValue(new Map());
    expect(await buscarPersonagemComCorrecoes('nao-existe')).toBeNull();
  });

  it('aplica correção ao buscar um só personagem', async () => {
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockResolvedValue(new Map([
      ['makoto-naegi', new Map([['descricao.pt', { valor: 'Nova descrição', valorBase: 'x', autor: '1', criadoEm: '2026-01-01' }]])],
    ]));

    const p = await buscarPersonagemComCorrecoes('makoto-naegi');

    expect(p?.descricao.pt).toBe('Nova descrição');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/dados.test.ts`
Expected: FAIL — `listarPersonagensComCorrecoes` is not exported.

- [ ] **Step 3: Implement in `lib/dados.ts`**

Append to `site/lib/dados.ts` (do not touch the existing sync exports):

```ts
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { aplicarCorrecoes } from './correcoes-merge';

export async function listarPersonagensComCorrecoes(): Promise<Personagem[]> {
  const correcoes = await repositorioCorrecoes.buscarCorrecoesPorColecao('personagens');
  return aplicarCorrecoes(personagens, correcoes);
}

export async function buscarPersonagemComCorrecoes(id: string): Promise<Personagem | null> {
  const lista = await listarPersonagensComCorrecoes();
  return lista.find((p) => p.id === id) ?? null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/dados.test.ts`
Expected: PASS (all previous tests + 4 new ones).

- [ ] **Step 5: Write the failing tests for `lib/itens.ts`**

Append to `site/lib/itens.test.ts` (matching its existing style):

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/db/repositorios/correcoes', () => ({
  repositorioCorrecoes: { buscarCorrecoesPorColecao: vi.fn() },
}));
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import {
  listarItensComCorrecoes, buscarItemComCorrecoes,
  listarLocaisComCorrecoes, buscarLocalComCorrecoes,
} from './itens';

describe('listarItensComCorrecoes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('aplica correção de nome.pt sobre um item', async () => {
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockImplementation(async (colecao) =>
      colecao === 'itens'
        ? new Map([['chave-mestra', new Map([['nome.pt', { valor: 'Chave-Mestra', valorBase: 'x', autor: '1', criadoEm: '2026-01-01' }]])]])
        : new Map()
    );

    const lista = await listarItensComCorrecoes();
    const item = lista.find((i) => i.id === 'chave-mestra');

    expect(item?.nome.pt).toBe('Chave-Mestra');
  });
});

describe('buscarItemComCorrecoes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devolve null para id inexistente', async () => {
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockResolvedValue(new Map());
    expect(await buscarItemComCorrecoes('nao-existe')).toBeNull();
  });
});

describe('listarLocaisComCorrecoes / buscarLocalComCorrecoes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('aplica correção de nome.pt sobre um local', async () => {
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockImplementation(async (colecao) =>
      colecao === 'locais'
        ? new Map([['storeroom', new Map([['nome.pt', { valor: 'Depósito', valorBase: 'x', autor: '1', criadoEm: '2026-01-01' }]])]])
        : new Map()
    );

    const local = await buscarLocalComCorrecoes('storeroom');

    expect(local?.nome.pt).toBe('Depósito');
  });
});
```

Note: replace `'chave-mestra'`/`'storeroom'` with real ids from
`data/itens.json`/`data/locais.json` if these guesses don't match — check
with `node -e "console.log(require('./data/itens.json')[0].id)"` before
finalizing this step, and use whatever id actually exists.

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run lib/itens.test.ts`
Expected: FAIL — functions not exported.

- [ ] **Step 7: Implement in `lib/itens.ts`**

Append to `site/lib/itens.ts`:

```ts
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { aplicarCorrecoes } from './correcoes-merge';

export async function listarItensComCorrecoes(): Promise<Item[]> {
  const correcoes = await repositorioCorrecoes.buscarCorrecoesPorColecao('itens');
  return aplicarCorrecoes(itens, correcoes);
}

export async function buscarItemComCorrecoes(id: string): Promise<Item | null> {
  const lista = await listarItensComCorrecoes();
  return lista.find((i) => i.id === id) ?? null;
}

export async function listarLocaisComCorrecoes(): Promise<Local[]> {
  const correcoes = await repositorioCorrecoes.buscarCorrecoesPorColecao('locais');
  return aplicarCorrecoes(locais, correcoes);
}

export async function buscarLocalComCorrecoes(id: string): Promise<Local | null> {
  const lista = await listarLocaisComCorrecoes();
  return lista.find((l) => l.id === id) ?? null;
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run lib/itens.test.ts`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add lib/dados.ts lib/dados.test.ts lib/itens.ts lib/itens.test.ts
git commit -m "feat: personagens/itens/locais ganham leitura com correcoes aplicadas"
```

---

## Task 12: Wire `ComCorrecoes` reads — faq, controles

**Files:**
- Modify: `site/lib/faq.ts`
- Modify: `site/lib/faq.test.ts`
- Modify: `site/lib/controles.ts`
- Modify: `site/lib/controles.test.ts`

**Interfaces:**
- Produces: `listarFaqComCorrecoes()`, `faqPorSecaoComCorrecoes()` (added to
  `lib/faq.ts`); `cardsDeMecanicaComCorrecoes()`, `mecanicasPorGrupoComCorrecoes()`
  (added to `lib/controles.ts`) — consumed by Task 13's admin listing (base
  functions) is NOT this task's concern; this task is only the public
  read-side used by Task 14's page rewiring for `/faq` and `/mecanicas`.

- [ ] **Step 1: Write the failing tests for `lib/faq.ts`**

Append to `site/lib/faq.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/db/repositorios/correcoes', () => ({
  repositorioCorrecoes: { buscarCorrecoesPorColecao: vi.fn() },
}));
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { listarFaqComCorrecoes, faqPorSecaoComCorrecoes, listarFaq } from './faq';

describe('listarFaqComCorrecoes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('aplica uma correção de resposta', async () => {
    const idReal = listarFaq()[0].id;
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockResolvedValue(new Map([
      [idReal, new Map([['resposta', { valor: 'Resposta corrigida', valorBase: 'x', autor: '1', criadoEm: '2026-01-01' }]])],
    ]));

    const lista = await listarFaqComCorrecoes();

    expect(lista.find((p) => p.id === idReal)?.resposta).toBe('Resposta corrigida');
  });
});

describe('faqPorSecaoComCorrecoes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('agrupa por seção usando as respostas já corrigidas', async () => {
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockResolvedValue(new Map());
    const grupos = await faqPorSecaoComCorrecoes();
    expect(grupos.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/faq.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement in `lib/faq.ts`**

Append to `site/lib/faq.ts`:

```ts
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { aplicarCorrecoes } from './correcoes-merge';

export async function listarFaqComCorrecoes(): Promise<Pergunta[]> {
  const correcoes = await repositorioCorrecoes.buscarCorrecoesPorColecao('faq');
  return aplicarCorrecoes(perguntas, correcoes);
}

export async function faqPorSecaoComCorrecoes(): Promise<{ secao: string; perguntas: Pergunta[] }[]> {
  const lista = await listarFaqComCorrecoes();
  const mapa = new Map<string, Pergunta[]>();
  for (const p of lista) mapa.set(p.secao, [...(mapa.get(p.secao) ?? []), p]);
  return [...mapa.entries()].map(([secao, perguntas]) => ({ secao, perguntas }));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/faq.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the failing tests for `lib/controles.ts`**

Append to `site/lib/controles.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/db/repositorios/correcoes', () => ({
  repositorioCorrecoes: { buscarCorrecoesPorColecao: vi.fn() },
}));
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { cardsDeMecanicaComCorrecoes, mecanicasPorGrupoComCorrecoes, cardsDeMecanica } from './controles';

describe('cardsDeMecanicaComCorrecoes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('aplica uma correção de texto', async () => {
    const idReal = cardsDeMecanica()[0].id;
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockResolvedValue(new Map([
      [idReal, new Map([['texto', { valor: 'Texto corrigido', valorBase: 'x', autor: '1', criadoEm: '2026-01-01' }]])],
    ]));

    const lista = await cardsDeMecanicaComCorrecoes();

    expect(lista.find((c) => c.id === idReal)?.texto).toBe('Texto corrigido');
  });
});

describe('mecanicasPorGrupoComCorrecoes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('agrupa usando os cards já corrigidos', async () => {
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockResolvedValue(new Map());
    const grupos = await mecanicasPorGrupoComCorrecoes();
    expect(grupos.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run lib/controles.test.ts`
Expected: FAIL.

- [ ] **Step 7: Implement in `lib/controles.ts`**

Append to `site/lib/controles.ts`:

```ts
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { aplicarCorrecoes } from './correcoes-merge';

export async function cardsDeMecanicaComCorrecoes(): Promise<Card[]> {
  const correcoes = await repositorioCorrecoes.buscarCorrecoesPorColecao('controles');
  return aplicarCorrecoes(cardsDeMecanica(), correcoes);
}

export async function mecanicasPorGrupoComCorrecoes(): Promise<{ grupo: string; cards: Card[] }[]> {
  const lista = await cardsDeMecanicaComCorrecoes();
  const mapa = new Map<string, Card[]>();
  for (const c of lista) mapa.set(c.grupo, [...(mapa.get(c.grupo) ?? []), c]);
  return [...mapa.entries()].map(([grupo, cards]) => ({ grupo, cards }));
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run lib/controles.test.ts`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add lib/faq.ts lib/faq.test.ts lib/controles.ts lib/controles.test.ts
git commit -m "feat: faq/mecanicas ganham leitura com correcoes aplicadas"
```

---

## Task 13: Update public pages to render corrected content

**Files:**
- Modify: `site/app/page.tsx`
- Modify: `site/app/comecar/page.tsx`
- Modify: `site/app/elenco/page.tsx`
- Modify: `site/app/elenco/[id]/page.tsx`
- Modify: `site/app/itens/page.tsx`
- Modify: `site/app/itens/[id]/page.tsx`
- Modify: `site/app/mapa/page.tsx`
- Modify: `site/app/mapa/[id]/page.tsx`
- Modify: `site/app/faq/page.tsx`
- Modify: `site/app/mecanicas/page.tsx`

**Interfaces:**
- Consumes: every `...ComCorrecoes()` function from Tasks 11-12.

This task is mechanical, file-by-file wiring — no new behavior to unit-test
beyond what Tasks 11-12 already cover; its own verification is the full
suite + a production build (Step-by-step below), matching how the Alter Ego
work in this session was verified against the running app, not only unit
tests.

- [ ] **Step 1: `app/page.tsx`**

Change `export default function Inicio()` to `export default async function Inicio()`.
Change `listarPersonagens()` to `await listarPersonagensComCorrecoes()`.
Update the import from `@/lib/dados` to include `listarPersonagensComCorrecoes`.

- [ ] **Step 2: `app/comecar/page.tsx`**

Change to `export default async function PaginaIniciantes()`. Replace the
three call sites:
`listarPersonagens().length` → `(await listarPersonagensComCorrecoes()).length`,
`listarItens().length` → `(await listarItensComCorrecoes()).length`,
`listarLocais().length` → `(await listarLocaisComCorrecoes()).length`.
Update imports accordingly (`@/lib/dados`, `@/lib/itens`).

- [ ] **Step 3: `app/elenco/page.tsx`**

Change to `export default async function PaginaElenco()`. Replace
`listarPersonagens()` with `await listarPersonagensComCorrecoes()`.

- [ ] **Step 4: `app/elenco/[id]/page.tsx`**

This file already has an async `FichaPersonagem` component and a separate
sync `generateStaticParams` + a `generateMetadata`-like function (check the
exact second export at line 7-17 before editing — it calls
`buscarPersonagem(id)` too, likely for metadata). Rules:
- `generateStaticParams` **stays calling the sync `listarPersonagens()`** —
  ids don't change from corrections, and this function cannot be async in a
  way that touches per-request data (it runs once at build/ISR-seed time
  regardless, and using the DB-free version keeps it fast).
- The metadata-producing function and the page body both switch their
  `buscarPersonagem(id)` call to `await buscarPersonagemComCorrecoes(id)`.
- `valoresDoElenco('velocidade')` (or whichever attribute is used, check the
  file) **stays calling the sync version** — velocidade/mochila/percepção are
  explicitly not correctable fields (Global Constraints), so there's nothing
  to merge there.

- [ ] **Step 5: `app/itens/page.tsx`**

Change to `export default async function PaginaItens()`. Replace
`listarItens()` with `await listarItensComCorrecoes()`.
`categoriasComTotal()` **stays calling the sync `listarItens()` internally**
(it's defined in `lib/itens.ts` reading the module-level `itens` constant
directly) — categoria.pt/en ARE correctable per Task 13's field list below,
which means `categoriasComTotal()` could show a stale category label if an
ADM corrected it. This is an accepted minor inconsistency (category grouping
labels lag until next deploy) rather than adding a `ComCorrecoes` variant of
`categoriasComTotal()` for this v1 — categoria corrections are expected to be
rare (fixing a typo in a category name), and the alternative (async-ifying
the categorization/filter logic) is disproportionate complexity for this
edge. Note this explicitly as a documented, accepted gap — not a silent one.

- [ ] **Step 6: `app/itens/[id]/page.tsx`**

Same pattern as Step 4: `generateStaticParams` stays sync
(`listarItens()`), the page body's `buscarItem(id)` becomes
`await buscarItemComCorrecoes(id)`. `receitasQueUsam(id)` **stays sync** — it
compares craft ingredient ids, not correctable text fields, so there's
nothing to merge.

- [ ] **Step 7: `app/mapa/page.tsx`**

Change to `export default async function PaginaMapa()`. Replace
`listarLocais()` with `await listarLocaisComCorrecoes()`. `iconeDoItem(id)`
stays sync (icons aren't correctable).

- [ ] **Step 8: `app/mapa/[id]/page.tsx`**

Same pattern: `generateStaticParams` stays sync (`listarLocais()`), page body
uses `await buscarLocalComCorrecoes(id)`.

- [ ] **Step 9: `app/faq/page.tsx`**

Change to `export default async function PaginaFaq()`. Replace
`faqPorSecao()` with `await faqPorSecaoComCorrecoes()` and
`listarFaq().length` with `(await listarFaqComCorrecoes()).length`.

- [ ] **Step 10: `app/mecanicas/page.tsx`**

Change to `export default async function PaginaMecanicas()`. Replace
`mecanicasPorGrupo()` with `await mecanicasPorGrupoComCorrecoes()` and
`cardsDeMecanica().length` with `(await cardsDeMecanicaComCorrecoes()).length`.
`tabelasDeTeclas()` **stays sync** — key-binding tables aren't in the
correctable field list (Task 14 confirms this).

- [ ] **Step 11: Run the full suite**

```bash
npx vitest run
```

Expected: all existing component/page-level tests that render these pages
still pass. If any test renders a page component synchronously and now
breaks because the component is `async`, update that test to `await` the
component call, following the same pattern already used for
`app/elenco/[id]/page.tsx`'s existing tests (check how the codebase already
handles testing async Server Components, if at all — if no existing test
renders these particular pages directly, no test changes are needed here).

- [ ] **Step 12: Build and verify no `output: 'export'` regressions**

```bash
npm run build
```

Expected: build succeeds. Since `DATABASE_URL` must be set for the build to
succeed now (every page touches the DB via `ComCorrecoes` functions),
this is also the first point where a missing `DATABASE_URL` surfaces as a
build failure — confirm the error message (from Task 2's `db/client.ts`) is
the friendly one, not a raw Postgres connection error.

- [ ] **Step 13: Manual smoke test against the dev server**

```bash
npm run dev
```

In a browser (or via the claude-in-chrome tools, following the pattern used
earlier in this session for the Alter Ego work): visit `/`, `/elenco/`, an
item detail page, `/faq/`, `/mecanicas/`. Confirm each renders with no
console errors and the same content as before this task (since no
corrections exist in the database yet, output should be pixel-identical to
pre-Task-13 behavior).

- [ ] **Step 14: Commit**

```bash
git add app/page.tsx app/comecar/page.tsx app/elenco app/itens app/mapa app/faq/page.tsx app/mecanicas/page.tsx
git commit -m "feat: paginas publicas passam a renderizar conteudo com correcoes aplicadas"
```

---

## Task 14: Generic admin screen for correctable collections

**Files:**
- Create: `site/lib/adm/colecoes-corrigiveis.ts`
- Create: `site/lib/adm/colecoes-corrigiveis.test.ts`
- Create: `site/app/adm/correcoes-acoes.ts`
- Create: `site/app/adm/correcoes-acoes.test.ts`
- Create: `site/components/adm/EditorColecao.tsx`
- Create: `site/components/adm/EditorColecao.test.tsx`
- Create: `site/app/adm/itens/page.tsx`
- Create: `site/app/adm/personagens/page.tsx`
- Create: `site/app/adm/mapa/page.tsx`
- Create: `site/app/adm/faq/page.tsx`
- Create: `site/app/adm/mecanicas/page.tsx`

**Interfaces:**
- Consumes: `Colecao`, `obterCaminho`, `MapaCorrecoes` (Task 9);
  `repositorioCorrecoes` (Task 10); base sync functions from `lib/dados.ts`,
  `lib/itens.ts`, `lib/faq.ts`, `lib/controles.ts`; `exigirAdm()` (Task 4).
- Produces: `CAMPOS_POR_COLECAO: Record<Colecao, {rotulo: string; caminho: string}[]>`,
  `registrosBase(colecao): {id: string}[]` from `lib/adm/colecoes-corrigiveis.ts`
  — used by `EditorColecao` and the five `/adm/{itens,personagens,mapa,faq,mecanicas}`
  pages, which are thin wrappers passing a `colecao` prop into the shared
  component.

- [ ] **Step 1: Write the failing tests for the field configuration**

Create `site/lib/adm/colecoes-corrigiveis.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { CAMPOS_POR_COLECAO, registrosBase } from './colecoes-corrigiveis';

describe('CAMPOS_POR_COLECAO', () => {
  it('define os campos corrigíveis de personagens', () => {
    const caminhos = CAMPOS_POR_COLECAO.personagens.map((c) => c.caminho);
    expect(caminhos).toEqual(['nome', 'talento.pt', 'talento.en', 'descricao.pt', 'descricao.en', 'jogo']);
  });

  it('não inclui campos numéricos de personagens', () => {
    const caminhos = CAMPOS_POR_COLECAO.personagens.map((c) => c.caminho);
    expect(caminhos).not.toContain('velocidade');
    expect(caminhos).not.toContain('mochila');
    expect(caminhos).not.toContain('percepcao');
    expect(caminhos).not.toContain('vida');
  });

  it('define os campos corrigíveis de itens, sem campos de jogo', () => {
    const caminhos = CAMPOS_POR_COLECAO.itens.map((c) => c.caminho);
    expect(caminhos).toContain('nome.pt');
    expect(caminhos).toContain('descricao.pt');
    expect(caminhos).not.toContain('peso');
    expect(caminhos).not.toContain('nivelRaridade');
  });

  it('define os campos corrigíveis de locais', () => {
    expect(CAMPOS_POR_COLECAO.locais.map((c) => c.caminho)).toEqual(['nome.pt', 'nome.en']);
  });

  it('define os campos corrigíveis de faq', () => {
    expect(CAMPOS_POR_COLECAO.faq.map((c) => c.caminho)).toEqual(['pergunta', 'resposta']);
  });

  it('define os campos corrigíveis de controles', () => {
    expect(CAMPOS_POR_COLECAO.controles.map((c) => c.caminho)).toEqual(['titulo', 'texto']);
  });
});

describe('registrosBase', () => {
  it('lista os personagens base', () => {
    expect(registrosBase('personagens').length).toBeGreaterThan(0);
  });

  it('lista os itens base', () => {
    expect(registrosBase('itens').length).toBeGreaterThan(0);
  });

  it('lista os locais base', () => {
    expect(registrosBase('locais').length).toBeGreaterThan(0);
  });

  it('lista o faq base', () => {
    expect(registrosBase('faq').length).toBeGreaterThan(0);
  });

  it('lista os cards de mecânica base', () => {
    expect(registrosBase('controles').length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/adm/colecoes-corrigiveis.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `site/lib/adm/colecoes-corrigiveis.ts`:

```ts
import { listarPersonagens } from '@/lib/dados';
import { listarItens, listarLocais } from '@/lib/itens';
import { listarFaq } from '@/lib/faq';
import { cardsDeMecanica } from '@/lib/controles';
import type { Colecao } from '@/lib/correcoes-merge';

export type CampoCorrigivel = { rotulo: string; caminho: string };

export const CAMPOS_POR_COLECAO: Record<Colecao, CampoCorrigivel[]> = {
  personagens: [
    { rotulo: 'Nome', caminho: 'nome' },
    { rotulo: 'Talento (PT)', caminho: 'talento.pt' },
    { rotulo: 'Talento (EN)', caminho: 'talento.en' },
    { rotulo: 'Descrição (PT)', caminho: 'descricao.pt' },
    { rotulo: 'Descrição (EN)', caminho: 'descricao.en' },
    { rotulo: 'Jogo de origem', caminho: 'jogo' },
  ],
  itens: [
    { rotulo: 'Nome (PT)', caminho: 'nome.pt' },
    { rotulo: 'Nome (EN)', caminho: 'nome.en' },
    { rotulo: 'Categoria (PT)', caminho: 'categoria.pt' },
    { rotulo: 'Categoria (EN)', caminho: 'categoria.en' },
    { rotulo: 'Ramo (PT)', caminho: 'ramo.pt' },
    { rotulo: 'Ramo (EN)', caminho: 'ramo.en' },
    { rotulo: 'Raridade (PT)', caminho: 'raridade.pt' },
    { rotulo: 'Raridade (EN)', caminho: 'raridade.en' },
    { rotulo: 'Descrição (PT)', caminho: 'descricao.pt' },
    { rotulo: 'Descrição (EN)', caminho: 'descricao.en' },
    { rotulo: 'Efeito (PT)', caminho: 'efeito.pt' },
    { rotulo: 'Efeito (EN)', caminho: 'efeito.en' },
  ],
  locais: [
    { rotulo: 'Nome (PT)', caminho: 'nome.pt' },
    { rotulo: 'Nome (EN)', caminho: 'nome.en' },
  ],
  faq: [
    { rotulo: 'Pergunta', caminho: 'pergunta' },
    { rotulo: 'Resposta', caminho: 'resposta' },
  ],
  controles: [
    { rotulo: 'Título', caminho: 'titulo' },
    { rotulo: 'Texto', caminho: 'texto' },
  ],
};

export function registrosBase(colecao: Colecao): { id: string }[] {
  switch (colecao) {
    case 'personagens': return listarPersonagens();
    case 'itens': return listarItens();
    case 'locais': return listarLocais();
    case 'faq': return listarFaq();
    case 'controles': return cardsDeMecanica();
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/adm/colecoes-corrigiveis.test.ts`
Expected: PASS (11 tests).

- [ ] **Step 5: Write the failing tests for the shared Server Actions**

Create `site/app/adm/correcoes-acoes.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/adm/sessao', () => ({ exigirAdm: vi.fn() }));
vi.mock('@/db/repositorios/correcoes', () => ({
  repositorioCorrecoes: { salvarCorrecao: vi.fn(), reverterCorrecao: vi.fn() },
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { revalidatePath } from 'next/cache';
import { salvarCorrecaoAction, reverterCorrecaoAction } from './correcoes-acoes';

describe('salvarCorrecaoAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejeita sem sessão', async () => {
    vi.mocked(exigirAdm).mockRejectedValue(new Error('Acesso negado'));
    await expect(salvarCorrecaoAction({
      colecao: 'itens', registroId: 'x', campo: 'nome.pt', valor: 'A', valorBase: 'base',
    })).rejects.toThrow('Acesso negado');
  });

  it('salva com o autor da sessão e revalida a listagem e o detalhe', async () => {
    vi.mocked(exigirAdm).mockResolvedValue({ discordId: '9', papel: 'adm' });

    await salvarCorrecaoAction({ colecao: 'itens', registroId: 'x', campo: 'nome.pt', valor: 'A', valorBase: 'base' });

    expect(repositorioCorrecoes.salvarCorrecao).toHaveBeenCalledWith({
      colecao: 'itens', registroId: 'x', campo: 'nome.pt', valor: 'A', valorBase: 'base', autor: '9',
    });
    expect(revalidatePath).toHaveBeenCalledWith('/itens');
    expect(revalidatePath).toHaveBeenCalledWith('/itens/x');
  });

  it('revalida sem sufixo de detalhe para colecoes sem pagina de item (faq/controles)', async () => {
    vi.mocked(exigirAdm).mockResolvedValue({ discordId: '9', papel: 'adm' });

    await salvarCorrecaoAction({ colecao: 'faq', registroId: 'x', campo: 'resposta', valor: 'A', valorBase: 'base' });

    expect(revalidatePath).toHaveBeenCalledWith('/faq');
    expect(revalidatePath).not.toHaveBeenCalledWith('/faq/x');
  });
});

describe('reverterCorrecaoAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reverte com o autor da sessão', async () => {
    vi.mocked(exigirAdm).mockResolvedValue({ discordId: '9', papel: 'adm' });

    await reverterCorrecaoAction({ colecao: 'personagens', registroId: 'y', campo: 'nome' });

    expect(repositorioCorrecoes.reverterCorrecao).toHaveBeenCalledWith({
      colecao: 'personagens', registroId: 'y', campo: 'nome', autor: '9',
    });
    expect(revalidatePath).toHaveBeenCalledWith('/elenco');
    expect(revalidatePath).toHaveBeenCalledWith('/elenco/y');
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run app/adm/correcoes-acoes.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 7: Implement**

Create `site/app/adm/correcoes-acoes.ts`:

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import type { Colecao } from '@/lib/correcoes-merge';

const ROTA_LISTAGEM: Record<Colecao, string> = {
  personagens: '/elenco',
  itens: '/itens',
  locais: '/mapa',
  faq: '/faq',
  controles: '/mecanicas',
};

/** Só personagens/itens/locais têm página de detalhe própria por registro. */
const TEM_PAGINA_DE_DETALHE: Record<Colecao, boolean> = {
  personagens: true, itens: true, locais: true, faq: false, controles: false,
};

function revalidarColecao(colecao: Colecao, registroId: string) {
  const base = ROTA_LISTAGEM[colecao];
  revalidatePath(base);
  if (TEM_PAGINA_DE_DETALHE[colecao]) revalidatePath(`${base}/${registroId}`);
}

export async function salvarCorrecaoAction(args: {
  colecao: Colecao; registroId: string; campo: string; valor: string; valorBase: string;
}) {
  const sessao = await exigirAdm();
  await repositorioCorrecoes.salvarCorrecao({ ...args, autor: sessao.discordId });
  revalidarColecao(args.colecao, args.registroId);
}

export async function reverterCorrecaoAction(args: {
  colecao: Colecao; registroId: string; campo: string;
}) {
  const sessao = await exigirAdm();
  await repositorioCorrecoes.reverterCorrecao({ ...args, autor: sessao.discordId });
  revalidarColecao(args.colecao, args.registroId);
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run app/adm/correcoes-acoes.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 9: Write the failing tests for `EditorColecao`**

Create `site/components/adm/EditorColecao.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditorColecao } from './EditorColecao';

const campos = [{ rotulo: 'Nome', caminho: 'nome' }];
const registros = [{ id: 'a', nome: 'Original' }, { id: 'b', nome: 'Outro' }];

describe('EditorColecao', () => {
  it('lista os registros pelo campo id/rotulo', () => {
    render(<EditorColecao registros={registros} campos={campos} correcoes={new Map()}
      aoSalvar={vi.fn()} aoReverter={vi.fn()} />);

    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
  });

  it('abre um registro e mostra o valor atual do campo', () => {
    render(<EditorColecao registros={registros} campos={campos} correcoes={new Map()}
      aoSalvar={vi.fn()} aoReverter={vi.fn()} />);

    fireEvent.click(screen.getByText('a'));

    expect(screen.getByDisplayValue('Original')).toBeInTheDocument();
  });

  it('salva ao sair do campo com um valor novo, passando o valor base atual', async () => {
    const aoSalvar = vi.fn().mockResolvedValue(undefined);
    render(<EditorColecao registros={registros} campos={campos} correcoes={new Map()}
      aoSalvar={aoSalvar} aoReverter={vi.fn()} />);

    fireEvent.click(screen.getByText('a'));
    const input = screen.getByDisplayValue('Original');
    fireEvent.change(input, { target: { value: 'Corrigido' } });
    fireEvent.blur(input);

    await waitFor(() => expect(aoSalvar).toHaveBeenCalledWith({
      registroId: 'a', campo: 'nome', valor: 'Corrigido', valorBase: 'Original',
    }));
  });

  it('não chama aoSalvar quando o valor não mudou', () => {
    const aoSalvar = vi.fn();
    render(<EditorColecao registros={registros} campos={campos} correcoes={new Map()}
      aoSalvar={aoSalvar} aoReverter={vi.fn()} />);

    fireEvent.click(screen.getByText('a'));
    fireEvent.blur(screen.getByDisplayValue('Original'));

    expect(aoSalvar).not.toHaveBeenCalled();
  });

  it('mostra uma mensagem e mantém o valor digitado quando salvar falha', async () => {
    const aoSalvar = vi.fn().mockRejectedValue(new Error('Banco fora do ar'));
    render(<EditorColecao registros={registros} campos={campos} correcoes={new Map()}
      aoSalvar={aoSalvar} aoReverter={vi.fn()} />);

    fireEvent.click(screen.getByText('a'));
    const input = screen.getByDisplayValue('Original');
    fireEvent.change(input, { target: { value: 'Corrigido' } });
    fireEvent.blur(input);

    expect(await screen.findByRole('alert')).toHaveTextContent('Banco fora do ar');
    expect(screen.getByDisplayValue('Corrigido')).toBeInTheDocument();
  });

  it('mostra o botão reverter só quando o campo tem correção', () => {
    const correcoes = new Map([['a', new Map([['nome', { valor: 'Corrigido', valorBase: 'Original', autor: '1', criadoEm: '2026-01-01' }]])]]);
    render(<EditorColecao registros={registros} campos={campos} correcoes={correcoes}
      aoSalvar={vi.fn()} aoReverter={vi.fn()} />);

    fireEvent.click(screen.getByText('a'));

    expect(screen.getByRole('button', { name: 'Reverter' })).toBeInTheDocument();
  });

  it('chama aoReverter com registroId e campo', () => {
    const aoReverter = vi.fn();
    const correcoes = new Map([['a', new Map([['nome', { valor: 'Corrigido', valorBase: 'Original', autor: '1', criadoEm: '2026-01-01' }]])]]);
    render(<EditorColecao registros={registros} campos={campos} correcoes={correcoes}
      aoSalvar={vi.fn()} aoReverter={aoReverter} />);

    fireEvent.click(screen.getByText('a'));
    fireEvent.click(screen.getByRole('button', { name: 'Reverter' }));

    expect(aoReverter).toHaveBeenCalledWith({ registroId: 'a', campo: 'nome' });
  });

  it('avisa quando o jogo mudou o valor base de uma correção existente', () => {
    const correcoes = new Map([['a', new Map([['nome', { valor: 'Corrigido', valorBase: 'Valor antigo do jogo', autor: '1', criadoEm: '2026-01-01' }]])]]);
    render(<EditorColecao registros={registros} campos={campos} correcoes={correcoes}
      aoSalvar={vi.fn()} aoReverter={vi.fn()} />);

    fireEvent.click(screen.getByText('a'));

    expect(screen.getByText(/o jogo mudou isto/i)).toBeInTheDocument();
  });

  it('separa correções sem registro correspondente num grupo à parte', () => {
    const correcoes = new Map([['registro-removido', new Map([['nome', { valor: 'X', valorBase: 'Y', autor: '1', criadoEm: '2026-01-01' }]])]]);
    render(<EditorColecao registros={registros} campos={campos} correcoes={correcoes}
      aoSalvar={vi.fn()} aoReverter={vi.fn()} />);

    expect(screen.getByText(/correções sem registro correspondente/i)).toBeInTheDocument();
    expect(screen.getByText('registro-removido')).toBeInTheDocument();
  });
});
```

- [ ] **Step 10: Run test to verify it fails**

Run: `npx vitest run components/adm/EditorColecao.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 11: Implement `EditorColecao`**

Create `site/components/adm/EditorColecao.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { obterCaminho, type MapaCorrecoes } from '@/lib/correcoes-merge';

type Campo = { rotulo: string; caminho: string };
type Registro = { id: string; [chave: string]: unknown };

export function EditorColecao({
  registros, campos, correcoes, aoSalvar, aoReverter,
}: {
  registros: Registro[];
  campos: Campo[];
  correcoes: MapaCorrecoes;
  aoSalvar: (args: { registroId: string; campo: string; valor: string; valorBase: string }) => Promise<void>;
  aoReverter: (args: { registroId: string; campo: string }) => Promise<void>;
}) {
  const [aberto, setAberto] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const idsBase = new Set(registros.map((r) => r.id));
  const orfaos = [...correcoes.keys()].filter((id) => !idsBase.has(id));

  async function salvarCampo(campo: string, valor: string, valorBase: string) {
    if (!aberto) return;
    setErro(null);
    try {
      await aoSalvar({ registroId: aberto, campo, valor, valorBase });
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não deu para salvar. Tenta de novo?');
    }
  }

  async function reverterCampo(campo: string) {
    if (!aberto) return;
    setErro(null);
    try {
      await aoReverter({ registroId: aberto, campo });
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não deu para reverter. Tenta de novo?');
    }
  }

  return (
    <div className="flex gap-6">
      <ul className="w-64 flex-shrink-0">
        {registros.map((r) => (
          <li key={r.id}>
            <button type="button" onClick={() => { setAberto(r.id); setErro(null); }}
              className={aberto === r.id ? 'font-bold' : ''}>
              {r.id} {correcoes.has(r.id) && '●'}
            </button>
          </li>
        ))}
      </ul>

      {aberto && (
        <div className="flex-1">
          {erro && <p role="alert" className="mb-2 text-red-400">{erro}</p>}
          {campos.map((campo) => {
            const registro = registros.find((r) => r.id === aberto)!;
            const correcao = correcoes.get(aberto)?.get(campo.caminho);
            const valorBaseAtual = obterCaminho(registro, campo.caminho) ?? '';
            const valorMostrado = correcao?.valor ?? valorBaseAtual;
            const conflito = correcao && correcao.valorBase !== valorBaseAtual;

            return (
              <div key={campo.caminho} className="mb-4">
                <label>{campo.rotulo}
                  <input
                    defaultValue={valorMostrado}
                    onBlur={(e) => {
                      const valor = e.target.value;
                      if (valor !== valorMostrado) salvarCampo(campo.caminho, valor, valorBaseAtual);
                    }}
                  />
                </label>
                {conflito && (
                  <p className="text-amber-400">
                    O jogo mudou isto para <b>{valorBaseAtual}</b>. Sua correção (<b>{correcao.valor}</b>) continua valendo.
                  </p>
                )}
                {correcao && (
                  <button type="button" onClick={() => reverterCampo(campo.caminho)}>
                    Reverter
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {orfaos.length > 0 && (
        <div className="w-64">
          <h2>Correções sem registro correspondente</h2>
          <ul>
            {orfaos.map((id) => <li key={id}>{id}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
```

Editing a field always keeps its typed value on screen: `salvarCampo`
catching the rejection is the only thing standing between a failed save and
the input silently reverting, and the input is uncontrolled
(`defaultValue`, not `value`) precisely so a failed save never overwrites
what the ADM typed — React only re-renders that `defaultValue` when
`aberto`/the field's own key changes, not on every render.

- [ ] **Step 12: Run test to verify it passes**

Run: `npx vitest run components/adm/EditorColecao.test.tsx`
Expected: PASS (9 tests).

- [ ] **Step 13: Wire the five collection pages**

Create `site/app/adm/itens/page.tsx`:

```tsx
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { CAMPOS_POR_COLECAO, registrosBase } from '@/lib/adm/colecoes-corrigiveis';
import { salvarCorrecaoAction, reverterCorrecaoAction } from '../correcoes-acoes';
import { EditorColecao } from '@/components/adm/EditorColecao';

export default async function AdmItens() {
  const correcoes = await repositorioCorrecoes.buscarCorrecoesPorColecao('itens');

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold">Itens</h1>
      <EditorColecao
        registros={registrosBase('itens')}
        campos={CAMPOS_POR_COLECAO.itens}
        correcoes={correcoes}
        aoSalvar={(args) => salvarCorrecaoAction({ colecao: 'itens', ...args })}
        aoReverter={(args) => reverterCorrecaoAction({ colecao: 'itens', ...args })}
      />
    </div>
  );
}
```

The remaining four collection pages are the same shape with the `Colecao`
value and title swapped. Note `/adm/mapa` uses collection `'locais'` and
`/adm/mecanicas` uses collection `'controles'` — the URL segment and the
`Colecao` value differ for these two, matching how the public routes
`/mapa` and `/mecanicas` don't literally spell `locais`/`controles` either.

Create `site/app/adm/personagens/page.tsx`:

```tsx
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { CAMPOS_POR_COLECAO, registrosBase } from '@/lib/adm/colecoes-corrigiveis';
import { salvarCorrecaoAction, reverterCorrecaoAction } from '../correcoes-acoes';
import { EditorColecao } from '@/components/adm/EditorColecao';

export default async function AdmPersonagens() {
  const correcoes = await repositorioCorrecoes.buscarCorrecoesPorColecao('personagens');

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold">Personagens</h1>
      <EditorColecao
        registros={registrosBase('personagens')}
        campos={CAMPOS_POR_COLECAO.personagens}
        correcoes={correcoes}
        aoSalvar={(args) => salvarCorrecaoAction({ colecao: 'personagens', ...args })}
        aoReverter={(args) => reverterCorrecaoAction({ colecao: 'personagens', ...args })}
      />
    </div>
  );
}
```

Create `site/app/adm/mapa/page.tsx`:

```tsx
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { CAMPOS_POR_COLECAO, registrosBase } from '@/lib/adm/colecoes-corrigiveis';
import { salvarCorrecaoAction, reverterCorrecaoAction } from '../correcoes-acoes';
import { EditorColecao } from '@/components/adm/EditorColecao';

export default async function AdmMapa() {
  const correcoes = await repositorioCorrecoes.buscarCorrecoesPorColecao('locais');

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold">Mapa</h1>
      <EditorColecao
        registros={registrosBase('locais')}
        campos={CAMPOS_POR_COLECAO.locais}
        correcoes={correcoes}
        aoSalvar={(args) => salvarCorrecaoAction({ colecao: 'locais', ...args })}
        aoReverter={(args) => reverterCorrecaoAction({ colecao: 'locais', ...args })}
      />
    </div>
  );
}
```

Create `site/app/adm/faq/page.tsx`:

```tsx
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { CAMPOS_POR_COLECAO, registrosBase } from '@/lib/adm/colecoes-corrigiveis';
import { salvarCorrecaoAction, reverterCorrecaoAction } from '../correcoes-acoes';
import { EditorColecao } from '@/components/adm/EditorColecao';

export default async function AdmFaq() {
  const correcoes = await repositorioCorrecoes.buscarCorrecoesPorColecao('faq');

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold">Textos (FAQ)</h1>
      <EditorColecao
        registros={registrosBase('faq')}
        campos={CAMPOS_POR_COLECAO.faq}
        correcoes={correcoes}
        aoSalvar={(args) => salvarCorrecaoAction({ colecao: 'faq', ...args })}
        aoReverter={(args) => reverterCorrecaoAction({ colecao: 'faq', ...args })}
      />
    </div>
  );
}
```

Create `site/app/adm/mecanicas/page.tsx`:

```tsx
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { CAMPOS_POR_COLECAO, registrosBase } from '@/lib/adm/colecoes-corrigiveis';
import { salvarCorrecaoAction, reverterCorrecaoAction } from '../correcoes-acoes';
import { EditorColecao } from '@/components/adm/EditorColecao';

export default async function AdmMecanicas() {
  const correcoes = await repositorioCorrecoes.buscarCorrecoesPorColecao('controles');

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold">Mecânicas</h1>
      <EditorColecao
        registros={registrosBase('controles')}
        campos={CAMPOS_POR_COLECAO.controles}
        correcoes={correcoes}
        aoSalvar={(args) => salvarCorrecaoAction({ colecao: 'controles', ...args })}
        aoReverter={(args) => reverterCorrecaoAction({ colecao: 'controles', ...args })}
      />
    </div>
  );
}
```

Note: `aoSalvar`/`aoReverter` passed to a Client Component
(`EditorColecao`) here are again Server Action references, same pattern as
Task 8 Step 9.

- [ ] **Step 14: Run the full suite**

```bash
npx vitest run
```

Expected: all pass.

- [ ] **Step 15: Commit**

```bash
git add lib/adm/colecoes-corrigiveis.ts lib/adm/colecoes-corrigiveis.test.ts app/adm/correcoes-acoes.ts app/adm/correcoes-acoes.test.ts components/adm/EditorColecao.tsx components/adm/EditorColecao.test.tsx app/adm/itens app/adm/personagens app/adm/mapa app/adm/faq app/adm/mecanicas
git commit -m "feat: tela generica de correcoes para itens/personagens/mapa/faq/mecanicas, com erro visivel ao falhar salvar"
```
## Task 15: Gerenciar ADMs (chefe)

**Files:**
- Create: `site/app/adm/administradores/page.tsx`
- Create: `site/app/adm/administradores/acoes.ts`
- Create: `site/app/adm/administradores/acoes.test.ts`
- Create: `site/components/adm/ListaAdms.tsx`
- Create: `site/components/adm/ListaAdms.test.tsx`

**Interfaces:**
- Consumes: `exigirChefe()` (Task 4), `repositorioAdms` (Task 3).
- Produces: working `/adm/administradores` screen, chefe-only.

- [ ] **Step 1: Write the failing tests for the Server Actions**

Create `site/app/adm/administradores/acoes.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/adm/sessao', () => ({ exigirChefe: vi.fn() }));
vi.mock('@/db/repositorios/administradores', () => ({
  repositorioAdms: { promoverAdm: vi.fn(), rebaixarAdm: vi.fn() },
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { exigirChefe } from '@/lib/adm/sessao';
import { repositorioAdms } from '@/db/repositorios/administradores';
import { promoverAdmAction, rebaixarAdmAction } from './acoes';

describe('promoverAdmAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejeita quando quem chama não é chefe', async () => {
    vi.mocked(exigirChefe).mockRejectedValue(new Error('Acesso negado'));
    await expect(promoverAdmAction({ discordId: '1', nome: 'Novo', papel: 'adm' })).rejects.toThrow('Acesso negado');
  });

  it('promove registrando quem promoveu', async () => {
    vi.mocked(exigirChefe).mockResolvedValue({ discordId: '9', papel: 'chefe' });

    await promoverAdmAction({ discordId: '1', nome: 'Novo', papel: 'adm' });

    expect(repositorioAdms.promoverAdm).toHaveBeenCalledWith({
      discordId: '1', nome: 'Novo', papel: 'adm', promovidoPor: '9',
    });
  });
});

describe('rebaixarAdmAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejeita quando quem chama não é chefe', async () => {
    vi.mocked(exigirChefe).mockRejectedValue(new Error('Acesso negado'));
    await expect(rebaixarAdmAction('1')).rejects.toThrow('Acesso negado');
  });

  it('rebaixa', async () => {
    vi.mocked(exigirChefe).mockResolvedValue({ discordId: '9', papel: 'chefe' });
    await rebaixarAdmAction('1');
    expect(repositorioAdms.rebaixarAdm).toHaveBeenCalledWith('1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/adm/administradores/acoes.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `site/app/adm/administradores/acoes.ts`:

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { exigirChefe } from '@/lib/adm/sessao';
import { repositorioAdms } from '@/db/repositorios/administradores';

export async function promoverAdmAction(args: { discordId: string; nome: string; papel: 'adm' | 'chefe' }) {
  const sessao = await exigirChefe();
  await repositorioAdms.promoverAdm({ ...args, promovidoPor: sessao.discordId });
  revalidatePath('/adm/administradores');
}

export async function rebaixarAdmAction(discordId: string) {
  await exigirChefe();
  await repositorioAdms.rebaixarAdm(discordId);
  revalidatePath('/adm/administradores');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/adm/administradores/acoes.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Write the failing tests for the list component**

Create `site/components/adm/ListaAdms.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListaAdms } from './ListaAdms';

const adms = [
  { discordId: '1', nome: 'Fulano', papel: 'adm' as const, promovidoPor: '9', criadoEm: new Date() },
  { discordId: '9', nome: 'Chefe', papel: 'chefe' as const, promovidoPor: null, criadoEm: new Date() },
];

describe('ListaAdms', () => {
  it('lista os administradores', () => {
    render(<ListaAdms adms={adms} aoPromover={vi.fn()} aoRebaixar={vi.fn()} />);
    expect(screen.getByText('Fulano')).toBeInTheDocument();
    expect(screen.getByText('Chefe')).toBeInTheDocument();
  });

  it('adiciona um novo adm pelo Discord ID e limpa o formulário quando dá certo', async () => {
    const aoPromover = vi.fn().mockResolvedValue(undefined);
    render(<ListaAdms adms={adms} aoPromover={aoPromover} aoRebaixar={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Discord ID'), { target: { value: '555' } });
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Novo ADM' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(aoPromover).toHaveBeenCalledWith({ discordId: '555', nome: 'Novo ADM', papel: 'adm' });
    await waitFor(() => expect(screen.getByLabelText('Discord ID')).toHaveValue(''));
  });

  it('mantém o que foi digitado e mostra uma mensagem quando promover falha', async () => {
    const aoPromover = vi.fn().mockRejectedValue(new Error('Banco fora do ar'));
    render(<ListaAdms adms={adms} aoPromover={aoPromover} aoRebaixar={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Discord ID'), { target: { value: '555' } });
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Novo ADM' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Banco fora do ar');
    expect(screen.getByLabelText('Discord ID')).toHaveValue('555');
    expect(screen.getByLabelText('Nome')).toHaveValue('Novo ADM');
  });

  it('rebaixa clicando no botão da linha', () => {
    const aoRebaixar = vi.fn();
    render(<ListaAdms adms={adms} aoPromover={vi.fn()} aoRebaixar={aoRebaixar} />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Rebaixar' })[0]);

    expect(aoRebaixar).toHaveBeenCalledWith('1');
  });
});
```

Note: this test file's first `import` line needs `waitFor` added:
`import { render, screen, fireEvent, waitFor } from '@testing-library/react';`

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run components/adm/ListaAdms.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 7: Implement**

Create `site/components/adm/ListaAdms.tsx`:

```tsx
'use client';

import { useState } from 'react';

type Adm = { discordId: string; nome: string; papel: 'adm' | 'chefe'; promovidoPor: string | null; criadoEm: Date };

export function ListaAdms({
  adms, aoPromover, aoRebaixar,
}: {
  adms: Adm[];
  aoPromover: (args: { discordId: string; nome: string; papel: 'adm' | 'chefe' }) => Promise<void>;
  aoRebaixar: (discordId: string) => void;
}) {
  const [discordId, setDiscordId] = useState('');
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  async function adicionar() {
    setErro(null);
    try {
      await aoPromover({ discordId, nome, papel: 'adm' });
      setDiscordId('');
      setNome('');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não deu para adicionar. Tenta de novo?');
    }
  }

  return (
    <div>
      <ul className="mb-4 flex flex-col gap-2">
        {adms.map((a) => (
          <li key={a.discordId} className="flex items-center justify-between">
            <span>{a.nome} — {a.papel}</span>
            <button type="button" onClick={() => aoRebaixar(a.discordId)}>Rebaixar</button>
          </li>
        ))}
      </ul>
      {erro && <p role="alert" className="mb-2 text-red-400">{erro}</p>}
      <div className="flex gap-2">
        <label>Discord ID
          <input value={discordId} onChange={(e) => setDiscordId(e.target.value)} />
        </label>
        <label>Nome
          <input value={nome} onChange={(e) => setNome(e.target.value)} />
        </label>
        <button type="button" onClick={adicionar}>
          Adicionar
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run components/adm/ListaAdms.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 9: Wire the page**

Create `site/app/adm/administradores/page.tsx`:

```tsx
import { redirect } from 'next/navigation';
import { sessaoAdm } from '@/lib/adm/sessao';
import { repositorioAdms } from '@/db/repositorios/administradores';
import { promoverAdmAction, rebaixarAdmAction } from './acoes';
import { ListaAdms } from '@/components/adm/ListaAdms';

export default async function AdmAdministradores() {
  // Defense-in-depth: proxy.ts (Task 3) only checks "authenticated admin",
  // and the Task 5 layout doesn't distinguish adm/chefe — a chefe-only page
  // must gate itself. Uses sessaoAdm() + redirect() (not exigirChefe(),
  // which throws) so a non-chefe lands on the same /sem-acesso page as a
  // logged-out visitor, matching Task 5's layout pattern — exigirChefe()
  // stays reserved for Server Actions, where a thrown, catchable rejection
  // is what the calling component's error handling expects.
  const sessao = await sessaoAdm();
  if (sessao?.papel !== 'chefe') redirect('/sem-acesso');

  const adms = await repositorioAdms.listarAdms();

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold">Administradores</h1>
      <ListaAdms adms={adms} aoPromover={promoverAdmAction} aoRebaixar={rebaixarAdmAction} />
    </div>
  );
}
```

- [ ] **Step 10: Run the full suite**

```bash
npx vitest run
```

Expected: all pass.

- [ ] **Step 11: Commit**

```bash
git add app/adm/administradores components/adm/ListaAdms.tsx components/adm/ListaAdms.test.tsx
git commit -m "feat: tela de gerenciar administradores, restrita a chefe"
```

---

## Task 16: Auditoria (chefe, somente leitura)

**Files:**
- Create: `site/app/adm/auditoria/page.tsx`
- Create: `site/components/adm/TabelaAuditoria.tsx`
- Create: `site/components/adm/TabelaAuditoria.test.tsx`

**Interfaces:**
- Consumes: `exigirChefe()` (Task 4), `repositorioAuditoria.listarAuditoria()` (Task 10).

- [ ] **Step 1: Write the failing tests for the table component**

Create `site/components/adm/TabelaAuditoria.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TabelaAuditoria } from './TabelaAuditoria';

const linhas = [
  { id: 1, autor: '1', acao: 'correcao.criar', alvo: 'itens/x/nome.pt', valorAntigo: null, valorNovo: 'Novo', criadoEm: new Date('2026-01-01') },
];

describe('TabelaAuditoria', () => {
  it('mostra cada entrada com autor, ação e alvo', () => {
    render(<TabelaAuditoria linhas={linhas} />);
    expect(screen.getByText('correcao.criar')).toBeInTheDocument();
    expect(screen.getByText('itens/x/nome.pt')).toBeInTheDocument();
  });

  it('mostra estado vazio quando não há entradas', () => {
    render(<TabelaAuditoria linhas={[]} />);
    expect(screen.getByText(/nenhuma entrada/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/adm/TabelaAuditoria.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `site/components/adm/TabelaAuditoria.tsx`:

```tsx
type Linha = {
  id: number; autor: string; acao: string; alvo: string;
  valorAntigo: string | null; valorNovo: string | null; criadoEm: Date;
};

export function TabelaAuditoria({ linhas }: { linhas: Linha[] }) {
  if (linhas.length === 0) {
    return <p>Nenhuma entrada de auditoria ainda.</p>;
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr><th>Quando</th><th>Autor</th><th>Ação</th><th>Alvo</th><th>De</th><th>Para</th></tr>
      </thead>
      <tbody>
        {linhas.map((l) => (
          <tr key={l.id}>
            <td>{l.criadoEm.toLocaleString('pt-BR')}</td>
            <td>{l.autor}</td>
            <td>{l.acao}</td>
            <td>{l.alvo}</td>
            <td>{l.valorAntigo ?? '—'}</td>
            <td>{l.valorNovo ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/adm/TabelaAuditoria.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Wire the page**

Create `site/app/adm/auditoria/page.tsx`:

```tsx
import { redirect } from 'next/navigation';
import { sessaoAdm } from '@/lib/adm/sessao';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { TabelaAuditoria } from '@/components/adm/TabelaAuditoria';

export default async function AdmAuditoria() {
  const sessao = await sessaoAdm();
  if (sessao?.papel !== 'chefe') redirect('/sem-acesso');

  const linhas = await repositorioAuditoria.listarAuditoria();

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold">Auditoria</h1>
      <TabelaAuditoria linhas={linhas} />
    </div>
  );
}
```

Note: unlike the other `/adm/*` pages, this one gates itself directly with
`sessaoAdm()` + `redirect()` (not just relying on the layout's coarser
authenticated-or-not gate from Task 5) — this is the defense-in-depth the
Global Constraints section calls for: `proxy.ts` only checks
"authenticated admin", and the layout from Task 5 doesn't distinguish
adm/chefe, so chefe-only pages must check for themselves. This uses
`sessaoAdm()` rather than the throwing `exigirChefe()` so a non-chefe lands
on `/sem-acesso` like a logged-out visitor, instead of hitting Next's
generic error boundary — `exigirChefe()`/`exigirAdm()` stay reserved for
Server Actions (Tasks 8, 14, 15), where a thrown, catchable rejection is
exactly what the calling component's error handling expects.

- [ ] **Step 6: Run the full suite**

```bash
npx vitest run
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add app/adm/auditoria components/adm/TabelaAuditoria.tsx components/adm/TabelaAuditoria.test.tsx
git commit -m "feat: tela de auditoria somente-leitura, restrita a chefe"
```

---

## Task 17: End-to-end verification

**Files:** none created — this task verifies Tasks 1-16 together.

- [ ] **Step 1: Full automated suite**

```bash
cd site
npx vitest run
```

Expected: every test passes or skips (DB-touching tests skip only if
`DATABASE_URL_TEST` is unset — run this once with it set, to actually
exercise every repository test, before considering the plan done).

- [ ] **Step 2: Lint**

```bash
npx eslint .
```

Expected: no errors. Warnings pre-existing before this plan (per this
session's earlier work: `lib/busca.ts:65`, `lib/schema.test.ts:28`) are
acceptable; no new warnings from files this plan touched.

- [ ] **Step 3: Production build**

```bash
npm run build
```

Expected: succeeds with `DATABASE_URL` set. Confirm in the build output that
`/elenco/[id]`, `/itens/[id]`, `/mapa/[id]` still show as SSG (●) — the same
"prerendered as static HTML" marker seen before this plan — proving the
"public pages stay static" requirement held even after wiring in DB reads at
generation time.

- [ ] **Step 4: Manual browser walkthrough of the whole admin flow**

Using the claude-in-chrome tools (same pattern as this session's Alter Ego
verification): with `npm run dev` running and a real Discord app configured
in `.env`,

1. Visit `/adm` while logged out — confirm redirect to Discord sign-in.
2. Sign in with the `ADM_CHEFE_DISCORD_ID` account — confirm landing on
   `/adm/eventos` with the full sidebar (including ADMs, Auditoria).
3. Create an evento, confirm it appears on the public `/eventos` page within
   a few seconds (revalidation).
4. Open `/adm/itens`, pick a real item, correct its `Descrição (PT)`, and
   confirm the public `/itens/<id>` page shows the corrected text.
5. Click "Reverter" on that same field, confirm the public page reverts to
   the original JSON value.
6. Visit `/adm/auditoria`, confirm the create + revert both appear with the
   right autor/valores.
7. Visit `/adm/administradores`, add a second Discord ID as `adm`. Sign in as
   that second account (a second Discord account/browser profile) — confirm
   it can reach `/adm/itens` but gets no "ADMs"/"Auditoria" sidebar links,
   and that navigating to `/adm/administradores` or `/adm/auditoria` directly
   redirects to `/sem-acesso` (both pages call `exigirChefe()` themselves,
   per Task 15 Step 9 and Task 16 Step 5 — this step is the end-to-end proof
   that the defense-in-depth check actually rejects a non-chefe, not just
   that the code compiles).
8. Try correcting a field, then reload the page and try correcting it again
   with a different value — confirm the second correction replaces the
   first (no duplicate row), and `/adm/auditoria` shows both writes.

- [ ] **Step 5: Report**

Summarize for the user: what's live, what still needs a Neon project /
Discord app / `ADM_CHEFE_DISCORD_ID` filled in before deploying to Vercel,
and remind them this plan explicitly left `data/traducoes/*.json` corrections
out of scope (Global Constraints) as a fast-follow.
