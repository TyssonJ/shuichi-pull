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
  const indice = Math.min(TAGS_BOOT.length - 1, Math.floor(sorteio() * TAGS_BOOT.length));
  const tag = TAGS_BOOT[indice];
  return { tag, texto: BANCO[tag].texto };
}

export function logAleatorio(evitarTag?: string, sorteio: () => number = Math.random): LinhaLog {
  const opcoes = evitarTag ? TAGS_OCIOSO.filter((tag) => tag !== evitarTag) : TAGS_OCIOSO;
  const indice = Math.min(opcoes.length - 1, Math.floor(sorteio() * opcoes.length));
  const tag = opcoes[indice];
  return { tag, texto: BANCO[tag].texto };
}
