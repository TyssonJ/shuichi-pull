import { validarUrlBanner } from './perfil-visual';

/**
 * Identidade de uma pessoa no site: apelido e ícone escolhidos por ela, ao
 * lado dos ORIGINAIS do Discord — que sempre aparecem, menores, junto dos
 * personalizados. É a regra que impede alguém de se passar por outra pessoa:
 * o nome verdadeiro nunca some.
 */
export const APELIDO_MIN = 2;
export const APELIDO_MAX = 32;

type Resultado<T> = { ok: true; valor: T } | { ok: false; erro: string };

// Controles, quebras de linha, caracteres invisíveis e de direção (usados pra
// esconder texto ou embaralhar a ordem de leitura). Em faixas de código, não
// em regex com escape: o editor troca \\uXXXX pelo próprio caractere e o
// regex deixava de compilar (mesma pegadinha de lib/adm/gerar-id.ts).
const FAIXAS_INVISIVEIS: readonly (readonly [number, number])[] = [
  [0x0000, 0x001f], [0x007f, 0x009f], [0x200b, 0x200f], [0x2028, 0x202f], [0x2060, 0x206f], [0xfeff, 0xfeff],
];

export function temInvisiveis(texto: string): boolean {
  for (const ch of texto) {
    const c = ch.codePointAt(0)!;
    if (FAIXAS_INVISIVEIS.some(([de, ate]) => c >= de && c <= ate)) return true;
  }
  return false;
}

/** Vazio remove o apelido (volta a valer o nome do Discord). */
export function validarApelido(entrada: string): Resultado<string | null> {
  const texto = entrada.normalize('NFC').replace(/\s+/g, ' ').trim();
  if (texto === '') return { ok: true, valor: null };
  if (temInvisiveis(texto)) return { ok: false, erro: 'O apelido tem caracteres invisíveis ou de controle.' };
  const tamanho = [...texto].length;
  if (tamanho < APELIDO_MIN) return { ok: false, erro: `O apelido precisa de ao menos ${APELIDO_MIN} caracteres.` };
  if (tamanho > APELIDO_MAX) return { ok: false, erro: `O apelido passa de ${APELIDO_MAX} caracteres.` };
  if (!/[\p{L}\p{N}]/u.test(texto)) return { ok: false, erro: 'O apelido precisa ter ao menos uma letra ou número.' };
  return { ok: true, valor: texto };
}

export type TipoAvatar = 'discord' | 'personagem' | 'url';
export type AvatarEscolhido = { tipo: 'personagem' | 'url'; valor: string; url: string } | null;

/** O ícone escolhido → o endereço que as telas usam. `discord` (o padrão)
 * devolve null: não há ícone personalizado. Personagem só se estiver no elenco. */
export function resolverAvatar(
  tipo: string, valor: string, spritesDoElenco: ReadonlyMap<string, string>,
): Resultado<AvatarEscolhido> {
  if (tipo === 'discord') return { ok: true, valor: null };
  if (tipo === 'personagem') {
    const sprite = spritesDoElenco.get(valor);
    return sprite ? { ok: true, valor: { tipo, valor, url: sprite } } : { ok: false, erro: 'Esse personagem não está no elenco.' };
  }
  if (tipo === 'url') {
    const r = validarUrlBanner(valor);
    return r.ok ? { ok: true, valor: { tipo, valor: r.valor, url: r.valor } } : r;
  }
  return { ok: false, erro: 'Tipo de ícone inválido.' };
}

export type DadosDeIdentidade = {
  discordNome: string;
  discordAvatar: string | null;
  apelido: string | null;
  avatarUrl: string | null;
};

export type IdentidadeExibida = {
  /** O que vai em destaque. */
  nome: string;
  avatar: string | null;
  /** O do Discord, pra mostrar pequeno ao lado — só quando difere do destaque. */
  nomeOriginal: string | null;
  avatarOriginal: string | null;
};

export function identidadeDe(u: DadosDeIdentidade): IdentidadeExibida {
  const nome = u.apelido ?? u.discordNome;
  const avatar = u.avatarUrl ?? u.discordAvatar;
  return {
    nome,
    avatar,
    nomeOriginal: u.apelido !== null && u.apelido !== u.discordNome ? u.discordNome : null,
    avatarOriginal: u.avatarUrl !== null ? u.discordAvatar : null,
  };
}
