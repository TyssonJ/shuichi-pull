import type { Item, Local } from './schema-itens';

/**
 * Item criado pelo ADM com pontos de spawn precisa aparecer também na página
 * do local (e no contêiner certo) — senão a ficha do item diz "sai no
 * Ginásio" e o mapa do Ginásio nunca lista o item. Não muta a entrada.
 *
 * `totalItens` no dado base conta itens ÚNICOS do local, não linhas de
 * contêiner; aqui só soma quando o item ainda não estava em nenhum contêiner
 * daquele local.
 */
export function mesclarSpawnsNosLocais(locais: Local[], itens: Item[]): Local[] {
  const comSpawn = itens.filter((i) => i.spawns.length > 0);
  if (comSpawn.length === 0) return locais;

  const resultado = new Map<string, Local>();
  const clonar = (l: Local): Local => {
    const existente = resultado.get(l.id);
    if (existente) return existente;
    const novo: Local = { ...l, conteineres: l.conteineres.map((c) => ({ ...c, itens: [...c.itens] })) };
    resultado.set(l.id, novo);
    return novo;
  };
  const porId = new Map(locais.map((l) => [l.id, l]));

  for (const item of comSpawn) {
    for (const s of item.spawns) {
      const original = porId.get(s.localId);
      if (!original) continue;
      const local = clonar(original);
      const conteiner = local.conteineres.find((c) => c.fonteId === s.fonteId);
      if (!conteiner || conteiner.itens.some((i) => i.id === item.id)) continue;

      const jaNoLocal = local.conteineres.some((c) => c.itens.some((i) => i.id === item.id));
      conteiner.itens.push({
        id: item.id, nome: item.nome, chance: s.chance, qtdMin: s.qtdMin, qtdMax: s.qtdMax,
      });
      if (!jaNoLocal) local.totalItens += 1;
    }
  }

  return locais.map((l) => resultado.get(l.id) ?? l);
}
