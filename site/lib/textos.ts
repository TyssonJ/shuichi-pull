import { repositorioConfiguracoes } from '@/db/repositorios/configuracoes';
import { criarTextos } from './textos-site';

/** Leitor de textos editáveis para páginas de servidor. Fica separado de
 * `textos-site.ts` pelo mesmo motivo de `dados-corrigidos.ts`: quem importa o
 * repositório puxa o cliente do banco, e o registro puro precisa poder ir
 * pro navegador (o editor de textos do ADM). */
export async function obterTextos() {
  return criarTextos(await repositorioConfiguracoes.listar());
}
