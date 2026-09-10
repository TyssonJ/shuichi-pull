import { listarPersonagens } from './dados';
import type { Personagem } from './schema';
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { aplicarCorrecoes } from './correcoes-merge';

// Este arquivo existe separado de `dados.ts` de propósito: `dados.ts` é
// importado por `lib/busca.ts`, que por sua vez é importado pelo componente
// de cliente `BarraEgo`. Se as funções ComCorrecoes (e o import de
// `repositorioCorrecoes`, que puxa `db/client.ts` e o pacote `postgres`)
// morassem em `dados.ts`, o bundler tentaria incluir `postgres` no bundle do
// navegador e o build quebraria em módulos nativos do Node (fs/net/tls/
// perf_hooks). Mantendo essas funções aqui, só quem realmente as importa
// (as páginas de servidor) puxa o cliente do banco.

export async function listarPersonagensComCorrecoes(): Promise<Personagem[]> {
  const correcoes = await repositorioCorrecoes.buscarCorrecoesPorColecao('personagens');
  return aplicarCorrecoes(listarPersonagens(), correcoes);
}

export async function buscarPersonagemComCorrecoes(id: string): Promise<Personagem | null> {
  const lista = await listarPersonagensComCorrecoes();
  return lista.find((p) => p.id === id) ?? null;
}
