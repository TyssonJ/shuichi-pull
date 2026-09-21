import { listarItens, listarLocais } from './itens';
import type { Item, Local } from './schema-itens';
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { repositorioItensAdm } from '@/db/repositorios/itens-adm';
import { aplicarCorrecoes } from './correcoes-merge';
import { mesclarSpawnsNosLocais } from './spawns-extras';

// Separado de `itens.ts` de propósito: `itens.ts` é importado por
// `lib/busca.ts`, que por sua vez é importado pelo componente de cliente
// `BarraEgo`. Se as funções ComCorrecoes (e o import de `repositorioCorrecoes`,
// que puxa `db/client.ts` e o pacote `postgres`) morassem em `itens.ts`, o
// bundler tentaria incluir `postgres` no bundle do navegador e o build
// quebraria em módulos nativos do Node (fs/net/tls/perf_hooks). Mantendo
// essas funções aqui, só quem realmente as importa (as páginas de servidor)
// puxa o cliente do banco.

export async function listarItensComCorrecoes(): Promise<Item[]> {
  const [correcoes, removidos, extras] = await Promise.all([
    repositorioCorrecoes.buscarCorrecoesPorColecao('itens'),
    repositorioItensAdm.listarRemovidos(),
    repositorioItensAdm.listarExtras(),
  ]);
  const base = aplicarCorrecoes(listarItens(), correcoes).filter((i) => !removidos.has(i.id));
  return [...base, ...extras];
}

export async function buscarItemComCorrecoes(id: string): Promise<Item | null> {
  const lista = await listarItensComCorrecoes();
  return lista.find((i) => i.id === id) ?? null;
}

export async function listarLocaisComCorrecoes(): Promise<Local[]> {
  const [correcoes, extras] = await Promise.all([
    repositorioCorrecoes.buscarCorrecoesPorColecao('locais'),
    repositorioItensAdm.listarExtras(),
  ]);
  // Item criado pelo ADM com ponto de spawn também entra no mapa do local.
  return mesclarSpawnsNosLocais(aplicarCorrecoes(listarLocais(), correcoes), extras);
}

export async function buscarLocalComCorrecoes(id: string): Promise<Local | null> {
  const lista = await listarLocaisComCorrecoes();
  return lista.find((l) => l.id === id) ?? null;
}
