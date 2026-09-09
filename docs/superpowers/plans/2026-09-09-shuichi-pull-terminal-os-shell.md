# Shinri Trial — Terminal OS do Alter Ego (Fundação 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar ao header uma identidade de "Terminal OS do Alter Ego" (núcleo/prompt/módulos), resolver o espaço vazio em telas largas com um HUD de 3 colunas na ficha de personagem e um layout com trilhas reaproveitável nas demais páginas de conteúdo, alimentados por um banco de falas novo e compartilhado do Alter Ego.

**Architecture:** Duas peças de dados/lógica puras (`lib/secoes.ts`, `lib/alter-ego-log.ts` + `content/log-alterego.json`) alimentam um hook compartilhado (`useLogAlterEgo`) consumido tanto pelo header quanto por um novo componente de layout (`PainelComTrilhas`) aplicado a 10 páginas de conteúdo via wrapper swap. A ficha de personagem ganha sua própria reestruturação de grid dedicada, sem usar o componente de trilhas genérico.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Vitest + Testing Library.

**Spec:** docs/superpowers/specs/2026-09-09-shuichi-pull-terminal-os-shell-design.md

## Global Constraints

- Português (pt-BR) para todo identificador novo, texto de teste, texto de UI e comentário.
- Toda função/componente novo ganha teste Vitest; nenhum teste existente pode regredir sem justificativa explícita.
- `npx vitest run`, `npx eslint .`, `npx tsc --noEmit` e `npm run build` ficam limpos ao final de **cada** tarefa — não só na verificação final (lição de sub-projetos anteriores: bugs reais só foram achados quando o eslint rodou cedo).
- Nenhum placeholder, TODO ou implementação parcial.
- A busca do header **não** ganha parsing de comando novo — decisão já tomada no brainstorm (spec, seção 3).

## Ruling de pré-implementação (documentado antes da Task 1)

A spec (seção 5) lista `/comecar/` entre as páginas que ganham
`PainelComTrilhas`. Ao ler o arquivo atual
(`site/app/comecar/page.tsx`) pra escrever esta tarefa, confirmei que
essa página **já tem** seu próprio grid de 2 colunas com uma `<aside>`
cheia de conteúdo específico e real (dicas de quem já jogou, links
externos, atalhos pro resto do site) — exatamente o tipo de "trilha com
utilidade real" que a spec pede, só que já construída, com conteúdo
próprio em vez do genérico (nav + log do Alter Ego).

**Ruling:** `/comecar/` fica de fora da Task 6 (aplicação do
`PainelComTrilhas`), pelo mesmo motivo que a Home já ficou de fora na
spec — colocar uma segunda trilha genérica por cima de uma trilha
específica já funcional seria redundante, não uma melhoria. Isso não
contradiz a spec: o princípio dela ("preencher o vazio com utilidade
real") já está satisfeito nessa página por outro meio. Custo se essa
leitura estiver errada: baixo — é a exclusão de 1 página de uma tarefa
que já cobre as outras 10; adicioná-la depois é um wrapper swap a mais,
não uma mudança estrutural.

---

### Task 1: `lib/secoes.ts` — array de seções compartilhado

**Files:**
- Create: `site/lib/secoes.ts`
- Create: `site/lib/secoes.test.ts`
- Modify: `site/components/alter-ego/BarraEgo.tsx:10-19` (remove o array local, importa do novo módulo)

**Interfaces:**
- Produces: `SECOES: Secao[]` e `type Secao = { numero: string; nome: string; url: string }`, exportados de `@/lib/secoes`. Consumido por `BarraEgo.tsx` (Task 4) e `PainelComTrilhas.tsx` (Task 5).

- [ ] **Step 1: Escrever o teste que falha**

Criar `site/lib/secoes.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { SECOES } from './secoes';

describe('SECOES', () => {
  it('tem as 8 seções na ordem e numeração já usadas no header', () => {
    expect(SECOES).toHaveLength(8);
    expect(SECOES[0]).toEqual({ numero: '01', nome: 'Elenco', url: '/elenco/' });
    expect(SECOES[7]).toEqual({ numero: '08', nome: 'Começar', url: '/comecar/' });
  });

  it('toda url termina com barra', () => {
    for (const s of SECOES) {
      expect(s.url.endsWith('/')).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npx vitest run lib/secoes.test.ts`
Expected: FALHA — `./secoes` não existe ainda.

- [ ] **Step 3: Implementar**

Criar `site/lib/secoes.ts`:

```ts
export type Secao = { numero: string; nome: string; url: string };

export const SECOES: Secao[] = [
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

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npx vitest run lib/secoes.test.ts`
Expected: PASS (2 testes).

- [ ] **Step 5: Atualizar `BarraEgo.tsx` para usar o array compartilhado**

Editar `site/components/alter-ego/BarraEgo.tsx`. Remover o array local
(linhas 10-19 do arquivo atual):

```diff
 import { JanelaEgo } from './JanelaEgo';
 import { usePersistencia } from './usePersistencia';
 import { buscar, type Resultado } from '@/lib/busca';
 import type { EstadoEgo } from '@/lib/alter-ego';
-
-const SECOES = [
-  { numero: '01', nome: 'Elenco', url: '/elenco/' },
-  { numero: '02', nome: 'Itens', url: '/itens/' },
-  { numero: '03', nome: 'Mapa', url: '/mapa/' },
-  { numero: '04', nome: 'Mecânicas', url: '/mecanicas/' },
-  { numero: '05', nome: 'Eventos', url: '/eventos/' },
-  { numero: '06', nome: 'Códigos', url: '/codigos/' },
-  { numero: '07', nome: 'FAQ', url: '/faq/' },
-  { numero: '08', nome: 'Começar', url: '/comecar/' },
-];
+import { SECOES } from '@/lib/secoes';
```

- [ ] **Step 6: Confirmar que os testes existentes de `BarraEgo` continuam passando sem alteração**

Run: `npx vitest run components/alter-ego/BarraEgo.test.tsx`
Expected: PASS (10 testes, arquivo de teste **não modificado**).

- [ ] **Step 7: Rodar a suíte completa, eslint, tsc e build**

```bash
npx vitest run
npx eslint .
npx tsc --noEmit
npm run build
```

Expected: tudo limpo.

- [ ] **Step 8: Commit**

```bash
git add lib/secoes.ts lib/secoes.test.ts components/alter-ego/BarraEgo.tsx
git commit -m "refactor: extrai SECOES pra lib/secoes, compartilhado entre header e trilhas"
```

---

### Task 2: Banco de falas do Alter Ego — dados e funções puras

**Files:**
- Create: `site/content/log-alterego.json`
- Create: `site/lib/alter-ego-log.ts`
- Create: `site/lib/alter-ego-log.test.ts`

**Interfaces:**
- Produces: `type LinhaLog = { tag: string; texto: string }`, `logDaSecao(caminho: string): LinhaLog | null`, `logDeBoot(sorteio?: () => number): LinhaLog`, `logAleatorio(evitarTag?: string, sorteio?: () => number): LinhaLog` — todos exportados de `@/lib/alter-ego-log`. Consumidos pela Task 3 (`useLogAlterEgo`).

- [ ] **Step 1: Escrever o teste que falha**

Criar `site/lib/alter-ego-log.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { logDaSecao, logDeBoot, logAleatorio } from './alter-ego-log';

describe('logDaSecao', () => {
  it('acha a fala certa pra uma rota conhecida', () => {
    expect(logDaSecao('/elenco/')).toEqual({
      tag: 'ELENCO_LOG',
      texto: expect.stringContaining('56 alunos'),
    });
  });

  it('acha a fala certa mesmo com sub-rota (ficha de personagem)', () => {
    expect(logDaSecao('/elenco/chihiro-fujisaki/')).toEqual({
      tag: 'ELENCO_LOG',
      texto: expect.any(String),
    });
  });

  it('retorna null pra uma rota sem seção correspondente', () => {
    expect(logDaSecao('/')).toBeNull();
  });
});

describe('logDeBoot', () => {
  it('sorteia uma das falas de boot, respeitando a função de sorteio', () => {
    const linha = logDeBoot(() => 0);
    expect(linha.tag).toBe('SYS_BOOT');
  });

  it('nunca sorteia fora do pool de boot', () => {
    const tagsVistas = new Set<string>();
    for (let i = 0; i < 20; i++) {
      tagsVistas.add(logDeBoot(() => i / 20).tag);
    }
    for (const tag of tagsVistas) {
      expect(['SYS_BOOT', 'CORE_INIT', 'WELCOME', 'SEC_CHECK']).toContain(tag);
    }
  });
});

describe('logAleatorio', () => {
  it('sorteia dentre as 19 entradas do pool ocioso (tudo menos boot)', () => {
    const tagsVistas = new Set<string>();
    for (let i = 0; i < 40; i++) {
      tagsVistas.add(logAleatorio(undefined, () => i / 40).tag);
    }
    expect(tagsVistas.size).toBeGreaterThan(1);
    for (const tag of tagsVistas) {
      expect(['SYS_BOOT', 'CORE_INIT', 'WELCOME', 'SEC_CHECK']).not.toContain(tag);
    }
  });

  it('nunca repete a tag que está evitando, mesmo quando o sorteio cairia nela', () => {
    // Sorteio determinístico: sempre pede o primeiro item do pool restante.
    const linha = logAleatorio('ELENCO_LOG', () => 0);
    expect(linha.tag).not.toBe('ELENCO_LOG');
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npx vitest run lib/alter-ego-log.test.ts`
Expected: FALHA — `./alter-ego-log` não existe ainda.

- [ ] **Step 3: Criar o banco de falas**

Criar `site/content/log-alterego.json`:

```json
{
  "SYS_BOOT": { "texto": "Olá! Sou o Alter Ego. Um programa criado para auxiliar... Estou muito feliz em poder ser útil por aqui.", "categoria": "boot" },
  "CORE_INIT": { "texto": "Estabelecendo conexão neural com o banco de dados de Shinri Trial. Por favor, aguarde um instante.", "categoria": "boot" },
  "WELCOME": { "texto": "Sistema online e sincronizado. Sinto que podemos resolver muita coisa juntos hoje, não acha?", "categoria": "boot" },
  "SEC_CHECK": { "texto": "Verificando integridade dos arquivos... Nenhuma anomalia perigosa detectada no setor principal.", "categoria": "boot" },
  "ELENCO_LOG": { "texto": "Acessando fichas individuais dos 56 alunos. Cruzando atributos de velocidade, percepção e inventário...", "categoria": "secao" },
  "ITENS_LOG": { "texto": "Varrendo o inventário global. Mapeando pesos, taxas de raridade e receitas de craft ativas.", "categoria": "secao" },
  "MAPA_LOG": { "texto": "Carregando layout arquitetônico da academia. Mapeando zonas de spawn e rotas de fuga conectadas.", "categoria": "secao" },
  "MEC_LOG": { "texto": "Carregando protocolos de regras e guias de sobrevivência para operadores de primeira viagem.", "categoria": "secao" },
  "EVENTOS_LOG": { "texto": "Sincronizando registros de eventos da comunidade. Cruzando datas, transmissões e atualizações recentes...", "categoria": "secao" },
  "CODIGOS_LOG": { "texto": "Validando códigos de resgate ativos. Verificando prazos de expiração no núcleo do jogo...", "categoria": "secao" },
  "FAQ_LOG": { "texto": "Compilando respostas do arquivo de perguntas frequentes. Organizando por relevância e frequência de acesso.", "categoria": "secao" },
  "COMECAR_LOG": { "texto": "Preparando protocolo de boas-vindas para novos operadores. Carregando guia de primeiros passos...", "categoria": "secao" },
  "SEARCH_READY": { "texto": "O que você está procurando nos arquivos ocultos? Pode me perguntar qualquer coisa!", "categoria": "busca" },
  "QUERY_FOUND": { "texto": "Registro localizado com sucesso nos arquivos centrais. Exibindo dados completos na tela principal.", "categoria": "busca" },
  "QUERY_EMPTY": { "texto": "Hmm... Não encontrei correspondências exatas nos registros atuais. Quer que eu tente varrer pastas secundárias?", "categoria": "busca" },
  "DEEP_SCAN": { "texto": "Processando parâmetros avançados de busca através do núcleo de inteligência de alta velocidade...", "categoria": "busca" },
  "IDLE_1": { "texto": "Estou monitorando os fluxos de rede em segundo plano. Pode continuar sua investigação tranquilamente.", "categoria": "ocioso" },
  "IDLE_2": { "texto": "Às vezes, sinto como se pudesse sentir o clima do lado de fora através dos cabos... É uma sensação curiosa para um programa.", "categoria": "ocioso" },
  "IDLE_3": { "texto": "Lembre-se: a verdade sempre deixa rastros, mesmo nos lugares mais escuros e restritos da academia.", "categoria": "ocioso" },
  "IDLE_4": { "texto": "O arquivo está seguro comigo. Ninguém vai conseguir deletar nossos dados tão facilmente.", "categoria": "ocioso" },
  "WARN_EXEC": { "texto": "Atenção: Flutuação de energia detectada no setor de execução. Mantenha a guarda alta.", "categoria": "alerta" },
  "ERR_ACCESS": { "texto": "Acesso negado por protocolos de segurança locais. Nível de permissão insuficiente para abrir este diretório.", "categoria": "alerta" },
  "SYS_BACKUP": { "texto": "Salvando cópia de segurança dos dados na memória cache... Pronto. Seus arquivos estão protegidos contra falhas.", "categoria": "alerta" }
}
```

- [ ] **Step 4: Implementar as funções**

Criar `site/lib/alter-ego-log.ts`:

```ts
import banco from '@/content/log-alterego.json';

export type LinhaLog = { tag: string; texto: string };
type Categoria = 'boot' | 'secao' | 'busca' | 'ocioso' | 'alerta';
type Entrada = { texto: string; categoria: Categoria };

const BANCO = banco as Record<string, Entrada>;

// Mapeia prefixo de rota pra tag de seção — usado tanto pro gatilho real
// de navegação (logDaSecao) quanto implicitamente pelo pool ocioso, que
// inclui essas mesmas tags.
const ROTA_POR_TAG: Record<string, string> = {
  ELENCO_LOG: '/elenco',
  ITENS_LOG: '/itens',
  MAPA_LOG: '/mapa',
  MEC_LOG: '/mecanicas',
  EVENTOS_LOG: '/eventos',
  CODIGOS_LOG: '/codigos',
  FAQ_LOG: '/faq',
  COMECAR_LOG: '/comecar',
};

const TAGS_BOOT = Object.entries(BANCO)
  .filter(([, v]) => v.categoria === 'boot')
  .map(([tag]) => tag);

// Pool ocioso: tudo que não é boot (seção + busca + ocioso + alerta) —
// decisão do brainstorm, ver spec seção 6.
const TAGS_OCIOSO = Object.entries(BANCO)
  .filter(([, v]) => v.categoria !== 'boot')
  .map(([tag]) => tag);

export function logDaSecao(caminho: string): LinhaLog | null {
  for (const [tag, rota] of Object.entries(ROTA_POR_TAG)) {
    if (caminho === rota || caminho === `${rota}/` || caminho.startsWith(`${rota}/`)) {
      return { tag, texto: BANCO[tag].texto };
    }
  }
  return null;
}

export function logDeBoot(sorteio: () => number = Math.random): LinhaLog {
  const tag = TAGS_BOOT[Math.floor(sorteio() * TAGS_BOOT.length)];
  return { tag, texto: BANCO[tag].texto };
}

export function logAleatorio(evitarTag?: string, sorteio: () => number = Math.random): LinhaLog {
  const opcoes = evitarTag ? TAGS_OCIOSO.filter((tag) => tag !== evitarTag) : TAGS_OCIOSO;
  const tag = opcoes[Math.floor(sorteio() * opcoes.length)];
  return { tag, texto: BANCO[tag].texto };
}
```

- [ ] **Step 5: Rodar o teste e confirmar que passa**

Run: `npx vitest run lib/alter-ego-log.test.ts`
Expected: PASS (7 testes).

- [ ] **Step 6: Rodar a suíte completa, eslint, tsc e build**

```bash
npx vitest run
npx eslint .
npx tsc --noEmit
npm run build
```

Expected: tudo limpo.

- [ ] **Step 7: Commit**

```bash
git add content/log-alterego.json lib/alter-ego-log.ts lib/alter-ego-log.test.ts
git commit -m "feat: banco de falas taggeado do Alter Ego e funcoes de selecao"
```

---

### Task 3: `useLogAlterEgo` — hook compartilhado de estado

**Files:**
- Create: `site/components/alter-ego/useLogAlterEgo.ts`
- Create: `site/components/alter-ego/useLogAlterEgo.test.ts`

**Interfaces:**
- Consumes: `logDaSecao`, `logDeBoot`, `logAleatorio` de `@/lib/alter-ego-log` (Task 2).
- Produces: `useLogAlterEgo(): { tag: string; texto: string; forcarNovaLinha: () => void }`. Consumido pela Task 4 (header) e Task 5 (`PainelComTrilhas`).

- [ ] **Step 1: Escrever os testes que falham**

Criar `site/components/alter-ego/useLogAlterEgo.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const usePathnameMock = vi.fn(() => '/');
vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}));

import { useLogAlterEgo } from './useLogAlterEgo';

describe('useLogAlterEgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    usePathnameMock.mockReturnValue('/');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('mostra uma fala de boot ao montar', () => {
    const { result } = renderHook(() => useLogAlterEgo());
    expect(['SYS_BOOT', 'CORE_INIT', 'WELCOME', 'SEC_CHECK']).toContain(result.current.tag);
  });

  it('troca pra fala da seção quando o pathname muda pra uma rota conhecida', () => {
    usePathnameMock.mockReturnValue('/');
    const { result, rerender } = renderHook(() => useLogAlterEgo());

    usePathnameMock.mockReturnValue('/elenco/');
    rerender();

    expect(result.current.tag).toBe('ELENCO_LOG');
  });

  it('troca sozinho depois do intervalo ocioso (30-45s)', () => {
    const { result } = renderHook(() => useLogAlterEgo());
    const falaInicial = result.current.tag;

    act(() => {
      vi.advanceTimersByTime(45_000);
    });

    expect(result.current.tag).not.toBe(falaInicial);
  });

  it('não troca antes dos 30s mínimos', () => {
    const { result } = renderHook(() => useLogAlterEgo());
    const falaInicial = result.current.tag;

    act(() => {
      vi.advanceTimersByTime(29_000);
    });

    expect(result.current.tag).toBe(falaInicial);
  });

  it('forcarNovaLinha troca a fala imediatamente, sem esperar o rodízio', () => {
    const { result } = renderHook(() => useLogAlterEgo());
    const falaInicial = result.current.tag;

    act(() => {
      result.current.forcarNovaLinha();
    });

    expect(result.current.tag).not.toBe(falaInicial);
  });
});
```

- [ ] **Step 2: Rodar os testes e confirmar que falham**

Run: `npx vitest run components/alter-ego/useLogAlterEgo.test.ts`
Expected: FALHA — `./useLogAlterEgo` não existe ainda.

- [ ] **Step 3: Implementar**

Criar `site/components/alter-ego/useLogAlterEgo.ts`:

```ts
'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { logAleatorio, logDaSecao, logDeBoot, type LinhaLog } from '@/lib/alter-ego-log';

const INTERVALO_MIN_MS = 30_000;
const INTERVALO_MAX_MS = 45_000;

export function useLogAlterEgo() {
  const pathname = usePathname();
  const [linha, setLinha] = useState<LinhaLog | null>(null);
  const montado = useRef(false);

  // Ao montar, mostra uma fala de boot — uma única vez, fora do rodízio
  // recorrente (senão o Alter Ego ficaria se reapresentando a cada
  // 30-45s). Trocas de pathname depois do primeiro mount reagem à seção
  // de verdade.
  useEffect(() => {
    if (!montado.current) {
      montado.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLinha(logDeBoot());
      return;
    }
    const daSecao = logDaSecao(pathname ?? '');
    if (daSecao) setLinha(daSecao);
  }, [pathname]);

  // Rodízio ocioso: a cada troca de `linha` (por qualquer motivo — boot,
  // navegação, ou o próprio rodízio), agenda a próxima troca sozinha
  // dentro de 30-45s. Reiniciar a cada troca evita disparar de novo logo
  // depois de uma reatividade real.
  useEffect(() => {
    const duracao = INTERVALO_MIN_MS + Math.random() * (INTERVALO_MAX_MS - INTERVALO_MIN_MS);
    const id = setTimeout(() => {
      setLinha((atual) => logAleatorio(atual?.tag));
    }, duracao);
    return () => clearTimeout(id);
  }, [linha]);

  function forcarNovaLinha() {
    setLinha((atual) => logAleatorio(atual?.tag));
  }

  return { tag: linha?.tag ?? '', texto: linha?.texto ?? '', forcarNovaLinha };
}
```

- [ ] **Step 4: Rodar os testes e confirmar que passam**

Run: `npx vitest run components/alter-ego/useLogAlterEgo.test.ts`
Expected: PASS (5 testes).

- [ ] **Step 5: Rodar a suíte completa, eslint, tsc e build**

```bash
npx vitest run
npx eslint .
npx tsc --noEmit
npm run build
```

Expected: tudo limpo — o hook ainda não é usado em nenhum componente
(isso é a Task 4 e a Task 5), então nada mais deveria mudar de
comportamento.

- [ ] **Step 6: Commit**

```bash
git add components/alter-ego/useLogAlterEgo.ts components/alter-ego/useLogAlterEgo.test.ts
git commit -m "feat: hook useLogAlterEgo, estado compartilhado de fala entre header e trilhas"
```

---

### Task 4: Header — Terminal OS do Alter Ego

**Files:**
- Modify: `site/components/alter-ego/BarraEgo.tsx`
- Modify: `site/components/alter-ego/BarraEgo.test.tsx`

**Interfaces:**
- Consumes: `SECOES` de `@/lib/secoes` (Task 1, já importado desde a Task 1), `useLogAlterEgo()` de `./useLogAlterEgo` (Task 3).
- Produces: nenhuma interface nova — `BarraEgo` continua sem props, comportamento existente (busca, esconder ao rolar, janela flutuante, `Ctrl+K`) intacto.

- [ ] **Step 1: Escrever os testes que falham**

Adicionar ao final de `site/components/alter-ego/BarraEgo.test.tsx`
(depois do último `describe` existente, mantendo os 3 `describe`
anteriores exatamente como estão):

```tsx
describe('BarraEgo — Terminal OS', () => {
  beforeEach(() => localStorage.clear());

  it('mostra o indicador de núcleo online', () => {
    render(<BarraEgo />);
    expect(screen.getByText('CORE: ONLINE')).toBeInTheDocument();
  });

  it('o campo de busca troca de placeholder quando ganha foco', () => {
    render(<BarraEgo />);
    const campo = screen.getAllByRole('searchbox')[0];
    expect(campo).toHaveAttribute('placeholder', 'buscar item, local, personagem…');
    fireEvent.focus(campo);
    expect(campo).toHaveAttribute('placeholder', 'digite pra consultar os registros…');
    fireEvent.blur(campo);
    expect(campo).toHaveAttribute('placeholder', 'buscar item, local, personagem…');
  });

  it('mostra a linha de log do Alter Ego quando o campo não está em foco', () => {
    render(<BarraEgo />);
    expect(screen.getByTestId('log-alterego')).toBeInTheDocument();
  });

  it('esconde a linha de log enquanto o campo de busca está em foco', () => {
    render(<BarraEgo />);
    const campo = screen.getAllByRole('searchbox')[0];
    fireEvent.focus(campo);
    expect(screen.queryByTestId('log-alterego')).not.toBeInTheDocument();
  });
});
```

Adicionar `fireEvent` ao import do topo do arquivo se ainda não estiver
lá (já está — `BarraEgo.test.tsx` já importa `fireEvent` de
`@testing-library/react`).

- [ ] **Step 2: Rodar os testes e confirmar que falham**

Run: `npx vitest run components/alter-ego/BarraEgo.test.tsx`
Expected: 4 testes novos FALHAM (nada disso existe ainda); os 20 testes
anteriores continuam passando.

- [ ] **Step 3: Implementar**

Editar `site/components/alter-ego/BarraEgo.tsx`.

Adicionar o import do hook, junto aos outros imports do topo:

```diff
 import { JanelaEgo } from './JanelaEgo';
 import { usePersistencia } from './usePersistencia';
+import { useLogAlterEgo } from './useLogAlterEgo';
 import { buscar, type Resultado } from '@/lib/busca';
 import type { EstadoEgo } from '@/lib/alter-ego';
 import { SECOES } from '@/lib/secoes';
```

Trocar a função `Busca` inteira (ela ganha `emFoco`/`aoFocar`/`aoDesfocar`
como props novas, **opcionais** — pra controlar o placeholder e esconder
a linha de log enquanto o usuário digita na busca do header, sem exigir
essas props no outro lugar que usa `Busca`: a janela flutuante, mais
abaixo neste mesmo arquivo, continua chamando `<Busca id="busca-flutuante"
termo={termo} resultados={resultados} setTermo={setTermo} />` sem
mudança nenhuma — ela não tem linha de log nem precisa da moldura de
foco, e com as props opcionais isso continua compilando sem erro):

```tsx
function Busca({
  id,
  termo,
  resultados,
  setTermo,
  emFoco = false,
  aoFocar,
  aoDesfocar,
}: {
  id: string;
  termo: string;
  resultados: Resultado[];
  setTermo: (termo: string) => void;
  emFoco?: boolean;
  aoFocar?: () => void;
  aoDesfocar?: () => void;
}) {
  return (
    <div className="relative flex-1">
      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-cyber-cyan">
        &gt;
      </span>
      <input
        id={id}
        type="search"
        role="searchbox"
        aria-label="Buscar no Shuichi Pull"
        placeholder={emFoco ? 'digite pra consultar os registros…' : 'buscar item, local, personagem…'}
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        onFocus={aoFocar}
        onBlur={aoDesfocar}
        className="w-full rounded-[3px] border border-cyber-cyan/40 bg-[#0A0A10] py-1.5 pl-6 pr-2 font-mono text-[10px] uppercase tracking-[.08em] text-[#D6D6E0] placeholder:text-dim focus:border-cyber-cyan focus:outline-none"
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

Dentro de `BarraEgo()`, adicionar o estado de foco e o hook, junto aos
outros hooks já existentes:

```diff
   const [termo, setTermo] = useState('');
   const [barraVisivel, setBarraVisivel] = useState(true);
   const [flutuanteAberta, setFlutuanteAberta] = usePersistencia('ego-flutuante-aberta', false);
   const alvo = useRef<HTMLDivElement>(null);
+  const [buscaEmFoco, setBuscaEmFoco] = useState(false);
+  const { tag: logTag, texto: logTexto } = useLogAlterEgo();
   const focarFlutuanteRef = useRef(false);
```

Trocar o `<header>` inteiro (única mudança de JSX daqui pra baixo — o
resto do componente, incluindo os `useEffect`s de teclado/scroll e o
botão/janela flutuante, não muda):

```tsx
      <header className="sticky top-0 z-40 border-b-2 border-cyber-cyan/40 bg-[#0A0A0D] px-2 py-1.5">
        <div className="flex items-center gap-3">
          <div className="flex shrink-0 flex-col items-center gap-1">
            <div className="w-[52px] overflow-hidden rounded-[4px] border border-alter-green shadow-[0_0_8px_rgba(0,255,102,0.35)]">
              <JanelaEgo estado={estado} variaveis={{ n: resultados.length }} compacta />
            </div>
            <p className="flex items-center gap-1 font-mono text-[6px] tracking-[.1em] text-alter-green">
              <span className="h-1 w-1 animate-pulse rounded-full bg-alter-green" aria-hidden />
              CORE: ONLINE
            </p>
          </div>

          <div className="flex-1">
            <Busca
              id="busca-header" termo={termo} resultados={resultados} setTermo={setTermo}
              emFoco={buscaEmFoco} aoFocar={() => setBuscaEmFoco(true)} aoDesfocar={() => setBuscaEmFoco(false)}
            />
            {!buscaEmFoco && (
              <p data-testid="log-alterego" className="mt-1 truncate font-mono text-[8px] tracking-[.02em]">
                <span className="text-alter-green">[{logTag}]</span>{' '}
                <span className="text-[#5A5A68]">{logTexto}</span>
              </p>
            )}
          </div>

          <nav className="hidden flex-wrap gap-1.5 sm:flex">
            {SECOES.map((s) => (
              <Link key={s.url} href={s.url}
                className="group relative overflow-hidden rounded-[2px] border border-execution-pink/30 px-1.5 py-0.5 font-mono text-[8px] tracking-[.08em] text-dim hover:text-execution-pink">
                {s.numero} // {s.nome.toUpperCase()}
                <svg data-testid="reticula" aria-hidden viewBox="0 0 24 24"
                  className="pointer-events-none absolute -right-2 -top-1.5 h-2.5 w-2.5 opacity-0 text-execution-pink transition-opacity group-hover:opacity-100 group-hover:animate-spin-slow">
                  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1" />
                  <line x1="12" y1="0" x2="12" y2="6" stroke="currentColor" strokeWidth="1" />
                  <line x1="12" y1="18" x2="12" y2="24" stroke="currentColor" strokeWidth="1" />
                  <line x1="0" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1" />
                  <line x1="18" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="1" />
                </svg>
              </Link>
            ))}
          </nav>
        </div>
      </header>
```

`forcarNovaLinha` não é desestruturado no header — só a trilha (Task 5)
usa esse gatilho (spec, seção 3: "O header não ganha esse clique"). O
hook continua retornando os três campos; o header só lê os dois que usa.

- [ ] **Step 4: Rodar os testes e confirmar que passam**

Run: `npx vitest run components/alter-ego/BarraEgo.test.tsx`
Expected: PASS (24 testes — os 20 anteriores mais os 4 novos).

- [ ] **Step 5: Rodar a suíte completa, eslint, tsc e build**

```bash
npx vitest run
npx eslint .
npx tsc --noEmit
npm run build
```

Expected: tudo limpo.

- [ ] **Step 6: Verificação manual no navegador — risco dos 8 módulos**

Com `npm run dev` rodando, visite qualquer página numa largura de tela
média (~900-1100px, onde `sm:` já ativa a nav mas a tela não é tão larga
quanto um desktop grande) — confirme que os 8 chips de seção cabem sem
quebrar o header de forma feia (podem quebrar linha graças ao
`flex-wrap` do `<nav>`, isso é esperado e aceitável; o que não é
aceitável é overflow cortando texto ou sobrepondo a busca). Se não
couber bem, ajustar o `gap-1.5`/padding dos chips ou a fonte
(`text-[8px]` já é pequena; evitar diminuir mais) — decisão de
implementação, sem impacto no resto do plano (spec, seção 8, risco 2).

- [ ] **Step 7: Commit**

```bash
git add components/alter-ego/BarraEgo.tsx components/alter-ego/BarraEgo.test.tsx
git commit -m "feat: header vira Terminal OS do Alter Ego (nucleo, prompt reativo, modulos)"
```

---

### Task 5: `PainelComTrilhas` — layout com trilhas reaproveitável

**Files:**
- Create: `site/components/layout/PainelComTrilhas.tsx`
- Create: `site/components/layout/PainelComTrilhas.test.tsx`

**Interfaces:**
- Consumes: `SECOES` de `@/lib/secoes` (Task 1), `useLogAlterEgo()` de `@/components/alter-ego/useLogAlterEgo` (Task 3).
- Produces: `PainelComTrilhas({ as?: 'div' | 'article'; children: React.ReactNode })`. Consumido pela Task 6 (10 páginas de conteúdo).

- [ ] **Step 1: Escrever os testes que falham**

Criar `site/components/layout/PainelComTrilhas.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/itens/',
}));

import { PainelComTrilhas } from './PainelComTrilhas';

describe('PainelComTrilhas', () => {
  it('mostra o conteúdo recebido na coluna central', () => {
    render(<PainelComTrilhas><p>conteúdo da página</p></PainelComTrilhas>);
    expect(screen.getByText('conteúdo da página')).toBeInTheDocument();
  });

  it('mostra os 8 links de navegação na trilha esquerda', () => {
    render(<PainelComTrilhas><p>x</p></PainelComTrilhas>);
    expect(screen.getByRole('link', { name: /01 \/\/ ELENCO/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /02 \/\/ ITENS/i })).toBeInTheDocument();
  });

  it('destaca a seção atual na nav, baseado no pathname', () => {
    render(<PainelComTrilhas><p>x</p></PainelComTrilhas>);
    const linkAtual = screen.getByRole('link', { name: /02 \/\/ ITENS/i });
    expect(linkAtual.className).toMatch(/execution-pink/);
  });

  it('mostra o feed de log do Alter Ego na trilha direita', () => {
    render(<PainelComTrilhas><p>x</p></PainelComTrilhas>);
    expect(screen.getByTestId('feed-alterego')).toBeInTheDocument();
  });

  it('o feed do Alter Ego é clicável e troca a fala ao clicar (re-scan tátil)', () => {
    render(<PainelComTrilhas><p>x</p></PainelComTrilhas>);
    const feed = screen.getByTestId('feed-alterego');
    const falaAntes = feed.textContent;
    fireEvent.click(feed);
    expect(feed.textContent).not.toBe(falaAntes);
  });

  it('usa <article> como elemento raiz quando a prop as="article" é passada', () => {
    const { container } = render(
      <PainelComTrilhas as="article"><p>x</p></PainelComTrilhas>
    );
    expect(container.querySelector('article')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar os testes e confirmar que falham**

Run: `npx vitest run components/layout/PainelComTrilhas.test.tsx`
Expected: FALHA — `./PainelComTrilhas` não existe ainda.

- [ ] **Step 3: Implementar**

Criar `site/components/layout/PainelComTrilhas.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SECOES } from '@/lib/secoes';
import { useLogAlterEgo } from '@/components/alter-ego/useLogAlterEgo';

type Props = {
  as?: 'div' | 'article';
  children: React.ReactNode;
};

export function PainelComTrilhas({ as = 'div', children }: Props) {
  const pathname = usePathname();
  const { tag, texto, forcarNovaLinha } = useLogAlterEgo();
  const Tag = as;

  return (
    <Tag className="relative px-4 py-8 xl:mx-auto xl:grid xl:max-w-[1400px] xl:grid-cols-[180px_minmax(0,56rem)_220px] xl:gap-10 xl:px-8">
      {/* Textura CRT sutil e estática — reaproveita .crt-lines do
          sub-projeto 1, sem a animação de flicker (essa área não precisa
          de mais uma coisa piscando). Ver spec, seção 5 e 8, sobre o
          risco de ficar redundante contra a camada de ambiência global. */}
      <div aria-hidden className="crt-lines pointer-events-none absolute inset-0 opacity-[0.03]" />

      <aside className="relative hidden xl:block">
        <nav aria-label="Seções do site" className="sticky top-20 space-y-1">
          {SECOES.map((s) => {
            const ativa = pathname?.startsWith(s.url);
            return (
              <Link
                key={s.url}
                href={s.url}
                className={`block rounded-[2px] border px-2 py-1.5 font-mono text-[8px] tracking-[.08em] ${
                  ativa
                    ? 'border-execution-pink text-execution-pink'
                    : 'border-line text-dim hover:border-cyber-cyan hover:text-cyber-cyan'
                }`}
              >
                {s.numero} // {s.nome.toUpperCase()}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="relative min-w-0">{children}</div>

      <aside className="relative hidden xl:block">
        <button
          type="button"
          data-testid="feed-alterego"
          onClick={forcarNovaLinha}
          className="sticky top-20 w-full rounded-[3px] border border-line bg-sur p-3 text-left transition-colors hover:border-alter-green"
        >
          <p className="mb-1.5 font-mono text-[8px] tracking-[.14em] text-alter-green">
            ALTER_EGO // LOG
          </p>
          <p className="font-mono text-[9px] leading-relaxed text-dim">
            <span className="text-alter-green">[{tag}]</span> {texto}
          </p>
        </button>
      </aside>
    </Tag>
  );
}
```

- [ ] **Step 4: Rodar os testes e confirmar que passam**

Run: `npx vitest run components/layout/PainelComTrilhas.test.tsx`
Expected: PASS (6 testes).

- [ ] **Step 5: Rodar a suíte completa, eslint, tsc e build**

```bash
npx vitest run
npx eslint .
npx tsc --noEmit
npm run build
```

Expected: tudo limpo — `PainelComTrilhas` ainda não é usado em nenhuma
página (isso é a Task 6).

- [ ] **Step 6: Commit**

```bash
git add components/layout/PainelComTrilhas.tsx components/layout/PainelComTrilhas.test.tsx
git commit -m "feat: PainelComTrilhas, layout reutilizavel com nav e feed do Alter Ego"
```

---

### Task 6: Aplicar `PainelComTrilhas` nas 10 páginas de conteúdo

**Files:**
- Modify: `site/app/elenco/page.tsx`
- Modify: `site/app/itens/page.tsx`
- Modify: `site/app/itens/[id]/page.tsx`
- Modify: `site/app/mapa/page.tsx`
- Modify: `site/app/mapa/[id]/page.tsx`
- Modify: `site/app/mecanicas/page.tsx`
- Modify: `site/app/faq/page.tsx`
- Modify: `site/app/eventos/page.tsx`
- Modify: `site/app/eventos/[id]/page.tsx`
- Modify: `site/app/codigos/page.tsx`

**Interfaces:**
- Consumes: `PainelComTrilhas` de `@/components/layout/PainelComTrilhas` (Task 5).
- Produces: nada consumido por tarefas futuras.

Mudança mecânica, idêntica em espírito nas 10 páginas: trocar o elemento
raiz (`<div className="px-4 py-8">` ou `<article className="...px-4
py-8">`) por `<PainelComTrilhas>` (ou `<PainelComTrilhas as="article">`
pras 3 páginas de ficha, que usam `<article>` hoje), removendo `px-4
py-8` do elemento raiz antigo (o `PainelComTrilhas` já aplica esse
padding) e qualquer `max-w-*`/`mx-auto` que o elemento raiz antigo tinha
(a largura da coluna central agora é controlada pelo `PainelComTrilhas`).
Nenhuma outra parte do conteúdo de cada página muda.

Nenhum teste novo — nenhuma dessas páginas tinha teste de página antes
desta tarefa, e a mudança não introduz lógica nova pra testar (só troca
o wrapper). A suíte completa (Step depois de cada edição) é a
verificação.

- [ ] **Step 1: `site/app/elenco/page.tsx`**

Adicionar o import:

```diff
 import { listarPersonagens } from '@/lib/dados';
 import { CartaoPersonagem } from '@/components/ficha/CartaoPersonagem';
+import { PainelComTrilhas } from '@/components/layout/PainelComTrilhas';
```

Trocar o elemento raiz — de:

```tsx
  return (
    <div className="px-4 py-8">
```

para:

```tsx
  return (
    <PainelComTrilhas>
```

E o fechamento correspondente — de `</div>` (a última linha antes de
`);`) para `</PainelComTrilhas>`.

- [ ] **Step 2: `site/app/itens/page.tsx`**

Mesmo padrão do Step 1: adicionar o import de `PainelComTrilhas`, trocar
`<div className="px-4 py-8">` por `<PainelComTrilhas>` e o `</div>` de
fechamento por `</PainelComTrilhas>`.

- [ ] **Step 3: `site/app/itens/[id]/page.tsx`**

Adicionar o import:

```diff
 import { Papel } from '@/components/ficha/Papel';
+import { PainelComTrilhas } from '@/components/layout/PainelComTrilhas';
```

Trocar — de:

```tsx
  return (
    <article className="px-4 py-8">
```

para:

```tsx
  return (
    <PainelComTrilhas as="article">
```

E `</article>` (fechamento) por `</PainelComTrilhas>`.

- [ ] **Step 4: `site/app/mapa/page.tsx`**

Mesmo padrão do Step 1 (`<div className="px-4 py-8">` → `<PainelComTrilhas>`).

- [ ] **Step 5: `site/app/mapa/[id]/page.tsx`**

Mesmo padrão do Step 3 (`<article className="px-4 py-8">` → `<PainelComTrilhas as="article">`).

- [ ] **Step 6: `site/app/mecanicas/page.tsx`**

Mesmo padrão do Step 1.

- [ ] **Step 7: `site/app/faq/page.tsx`**

Mesmo padrão do Step 1.

- [ ] **Step 8: `site/app/eventos/page.tsx`**

Mesmo padrão do Step 1.

- [ ] **Step 9: `site/app/eventos/[id]/page.tsx`**

Este arquivo é o único cujo elemento raiz já tinha largura própria —
`<article className="mx-auto max-w-2xl px-4 py-8">`, não só `px-4
py-8`. Trocar — de:

```tsx
    <article className="mx-auto max-w-2xl px-4 py-8">
```

para:

```tsx
    <PainelComTrilhas as="article">
```

(o `mx-auto max-w-2xl` some inteiro — o `PainelComTrilhas` já define a
largura da coluna central). Fechamento `</article>` → `</PainelComTrilhas>`.

- [ ] **Step 10: `site/app/codigos/page.tsx`**

Mesmo padrão do Step 1.

- [ ] **Step 11: Rodar a suíte completa, eslint, tsc e build**

```bash
npx vitest run
npx eslint .
npx tsc --noEmit
npm run build
```

Expected: tudo limpo — 309 páginas continuam sendo geradas (nenhuma rota
nova ou removida).

- [ ] **Step 12: Verificação manual no navegador**

Com `npm run dev` rodando, visitar pelo menos `/itens/`, `/codigos/` e
um `/eventos/<id>/` numa tela larga (redimensionar a janela ou usar
DevTools em ~1920px) — confirmar que as trilhas aparecem, a nav destaca
a seção certa, o feed do Alter Ego mostra uma fala e reage ao clique.
Confirmar também numa tela estreita (~768px) que as trilhas somem e o
conteúdo ocupa a largura disponível, sem quebrar layout.

Verificar também o risco de redundância visual da textura CRT (spec,
seção 8): olhar de perto o fundo da área das trilhas contra o resto da
página — se a `.crt-lines` do `PainelComTrilhas` não marcar nenhuma
diferença perceptível contra a camada de ambiência global (que já cobre
a página inteira com o mesmo padrão), remover a `<div aria-hidden
className="crt-lines ...">` de `PainelComTrilhas.tsx` nesta mesma tarefa
— CSS morto sem efeito não fica no código só porque estava no plano.

- [ ] **Step 13: Commit**

```bash
git add app/elenco/page.tsx app/itens/page.tsx "app/itens/[id]/page.tsx" app/mapa/page.tsx "app/mapa/[id]/page.tsx" app/mecanicas/page.tsx app/faq/page.tsx app/eventos/page.tsx "app/eventos/[id]/page.tsx" app/codigos/page.tsx
git commit -m "feat: aplica PainelComTrilhas nas paginas de conteudo (elenco, itens, mapa, mecanicas, faq, eventos, codigos)"
```

---

### Task 7: Ficha do personagem — HUD de 3 colunas

**Files:**
- Modify: `site/app/elenco/[id]/page.tsx`

**Interfaces:**
- Consumes: nada de outra tarefa desta plano (não usa `PainelComTrilhas` — tem sua própria estrutura de 3 colunas, por decisão da spec seção 4/5).
- Produces: nada consumido por tarefas futuras.

Sem teste novo — é uma reestruturação de layout puramente visual; o
conteúdo (textos, componentes, dados) não muda, só a posição. Não há
teste de página existente pra este arquivo cujas asserções dependam da
estrutura de grid (as únicas asserções de teste que tocam esta página
vêm de `app/elenco/[id]/page.test.tsx`, criado no sub-projeto anterior,
que verifica texto — `[ STUDENT ID: #0XX ]` e o título da seção
comparativa — não a estrutura de colunas).

- [ ] **Step 1: Confirmar que o teste existente passa antes de mexer**

Run: `npx vitest run "app/elenco/[id]/page.test.tsx"`
Expected: PASS (2 testes) — ponto de partida confirmado.

- [ ] **Step 2: Implementar**

Substituir o `return` de `site/app/elenco/[id]/page.tsx` (a função em
si, `generateStaticParams` e `generateMetadata`, não mudam):

```tsx
  return (
    <article className="mx-auto max-w-[1400px] px-4 py-8 xl:grid xl:grid-cols-[280px_minmax(0,1fr)_320px] xl:gap-10">
      <Link href="/elenco/" className="font-mono text-[9px] text-dim hover:text-alter-green xl:col-span-3">
        ← todo o elenco
      </Link>

      <div className="relative mx-auto mt-4 w-40 xl:mx-0 xl:mt-6 xl:w-full">
        <CarteirinhaEstudante personagem={p} numero={numero} />
      </div>

      <header className="mt-6 min-w-0 xl:mt-6">
        <p className="font-mono text-[8px] tracking-[.2em] text-dim">{p.jogo}</p>
        <h1 className="mt-1 text-3xl font-black leading-[.95] tracking-tight text-[#F2F2F5] sm:text-4xl">
          {p.nome}
        </h1>
        <p className="mt-1 font-serif text-[17px] italic leading-tight text-alter-green">
          {p.talento.pt}
        </p>
        <p className="font-mono text-[9px] text-dim">{p.talento.en}</p>

        <p className="mt-4 max-w-prose text-[13px] leading-relaxed text-[#C8C8D4]">
          {p.descricao.pt}
        </p>

        {p.etiquetas.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {p.etiquetas.map((e) => (
              <li
                key={e.en}
                title={e.en}
                className="rounded-[2px] border px-1.5 py-0.5 font-mono text-[8px]"
                style={{
                  color: e.bom ? 'var(--color-alter-green)' : 'var(--color-alerta)',
                  borderColor: 'currentColor',
                }}
              >
                {e.pt}
              </li>
            ))}
          </ul>
        )}
      </header>

      <section className="mt-8 xl:mt-6">
        <h2 className="mb-1 flex items-center gap-2 font-serif text-[11px] tracking-[.14em] text-[#B9B9C6]">
          <span className="h-px flex-1 bg-line" />
          — // ANÁLISE // —
          <span className="h-px flex-1 bg-line" />
        </h2>
        <p className="mb-4 text-center font-mono text-[7px] tracking-[.1em] text-dim">
          DE {total} ALUNOS
        </p>

        <dl className="mb-6 grid grid-cols-2 gap-x-4 gap-y-1.5 border-b border-line pb-4">
          <div className="flex items-baseline gap-1.5">
            <dt className="font-mono text-[7px] tracking-[.1em] text-dim">VIDA</dt>
            <dd className="font-mono text-[11px] font-bold text-[#D6D6E0]">{p.vida}</dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="font-mono text-[7px] tracking-[.1em] text-dim">VELOCIDADE</dt>
            <dd className="font-mono text-[11px] font-bold text-[#D6D6E0]">{p.velocidade}</dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="font-mono text-[7px] tracking-[.1em] text-dim">MOCHILA</dt>
            <dd className="font-mono text-[11px] font-bold text-[#D6D6E0]">{p.mochila}</dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="font-mono text-[7px] tracking-[.1em] text-dim">PERCEPÇÃO</dt>
            <dd className="font-mono text-[11px] font-bold text-[#D6D6E0]">{p.percepcao}</dd>
          </div>
        </dl>

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
      </section>

      {!p.traducaoRevisada && (
        <p className="mt-10 text-center font-mono text-[8px] text-dim xl:col-span-3">
          Tradução ainda não revisada por um ADM.
        </p>
      )}
    </article>
  );
```

Mudanças em relação ao arquivo atual: o título da seção comparativa
encurta de "— // ANÁLISE DE DADOS DO ALUNO // —" pra "— // ANÁLISE // —"
e o texto de apoio de "CADA COLUNA É QUANTOS DOS {total} ALUNOS TÊM
AQUELE VALOR" pra "DE {total} ALUNOS" — a versão longa não cabe numa
coluna de ~320px sem quebrar feio; a intenção (explicar o que o gráfico
mostra) continua presente, só mais compacta. O bloco `dl` de estatísticas
sai de dentro do `<header>` (onde ficava ao lado da descrição) e desce
pra cima dos `Regua`, na coluna direita — mais perto do que estatística.

- [ ] **Step 3: Rodar o teste existente e confirmar que ainda passa**

Run: `npx vitest run "app/elenco/[id]/page.test.tsx"`
Expected: PASS (2 testes) — os textos que o teste verifica (`[ STUDENT
ID: #0XX ]`, dentro de `CarteirinhaEstudante`) não mudaram.

Se o teste do título quebrar por causa do texto ter encurtado — **esse
teste não verifica o título da seção comparativa** (confirmado lendo o
arquivo antes desta tarefa), então isso não deveria acontecer; se
acontecer, é sinal de que o teste existente precisa ser atualizado pra
refletir a intenção nova, não que a implementação está errada — o título
mudou de propósito nesta tarefa.

- [ ] **Step 4: Rodar a suíte completa, eslint, tsc, build**

```bash
npx vitest run
npx eslint .
npx tsc --noEmit
npm run build
```

Expected: tudo limpo — as 56 páginas de personagem continuam sendo
geradas.

- [ ] **Step 5: Verificação manual no navegador**

Visitar `/elenco/<qualquer-id>/` numa tela larga (~1920px) — confirmar
que a carteirinha, o texto e o painel de análise aparecem lado a lado
sem rolagem vertical excessiva, e que os `Regua` continuam legíveis na
coluna mais estreita (~320px) — este é o risco identificado na spec
(seção 4/8): se as colunas do histograma ficarem finas demais pra ler
(a `Regua` de MOCHILA tem ~34 colunas), ajustar ali mesmo — reduzir o
`gap-[3px]` interno do `Regua` pra `gap-[2px]`, ou aceitar overflow
horizontal com scroll dentro da coluna (o `Regua` já usa `overflow-x-auto`
no contêiner das colunas, então isso já funciona sem mudança de código,
só precisa ser confirmado visualmente que fica utilizável). Também
confirmar em tela estreita (~768px) que tudo empilha normalmente, igual
ao comportamento de antes desta tarefa.

- [ ] **Step 6: Commit**

```bash
git add "app/elenco/[id]/page.tsx"
git commit -m "feat: ficha do personagem vira HUD de 3 colunas em telas largas"
```

---

### Task 8: Verificação end-to-end

**Files:** nenhum criado — esta tarefa verifica as Tasks 1-7 juntas.

- [ ] **Step 1: Suíte automatizada completa, lint, build**

```bash
cd site
npx vitest run
npx eslint .
npx tsc --noEmit
npm run build
```

Expected: suíte completa passa; lint sem erros novos; tsc limpo; build
com 309 páginas (mesmo total de antes — este plano não adiciona nem
remove rotas).

- [ ] **Step 2: Passagem manual pelo navegador**

Com `npm run dev` rodando, numa janela larga (~1920px):

1. Visite `/` — confirme: header no novo formato Terminal OS (núcleo
   com "CORE: ONLINE", prompt central, módulos como chips à direita),
   busca funcionando normalmente.
2. Foque o campo de busca — confirme: placeholder muda pro texto de
   comando, a linha de log some.
3. Desfoque sem digitar — confirme: linha de log volta.
4. Visite `/elenco/` — confirme: cards do grid normais (sub-projeto
   anterior) na coluna central, mais as trilhas genéricas (nav + feed
   do Alter Ego) nas bordas, já que Elenco está na lista de páginas com
   `PainelComTrilhas` (Task 6).
5. Visite `/elenco/<id>/` — confirme: HUD de 3 colunas, carteirinha à
   esquerda, texto no centro, estatísticas+histogramas à direita, sem
   trilhas genéricas (esta página tem sua própria estrutura).
6. Visite `/itens/`, `/codigos/`, `/comecar/` — confirme: as duas
   primeiras têm as trilhas genéricas (nav + feed do Alter Ego);
   `/comecar/` **não** tem (mantém sua própria aside com dicas/links,
   por decisão desta plano).
7. Na trilha direita de qualquer página com `PainelComTrilhas`, clique
   no feed do Alter Ego — confirme: a fala troca imediatamente.
8. Navegue entre 2-3 seções diferentes (clicando nos módulos do header
   ou na nav da trilha) — confirme: a linha de log do header (e da
   trilha, se visível) reage à seção nova.
9. Redimensione pra uma tela estreita (~768px) — confirme: trilhas
   somem, conteúdo ocupa a largura disponível, header continua utilizável
   (nav pode ficar escondida em `sm:`, como já era antes).

- [ ] **Step 3: Relatório**

Resumir para o usuário: o que está no ar, lembrar que os próximos
sub-projetos da lista original (Itens, Mecânicas, Mapa) continuam
pendentes, cada um com sua própria spec → plano → implementação — e que
o sistema de contas (Discord, ADMIN, perfis) é uma frente totalmente
separada, ainda não iniciada.
