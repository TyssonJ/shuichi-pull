import { auth } from '@/auth';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';

type Usuario = NonNullable<Awaited<ReturnType<typeof repositorioUsuarios.buscar>>>;

type Dependencias = {
  buscar: (discordId: string) => Promise<Usuario | null>;
  garantir: (discordId: string, nome: string, avatar: string | null) => Promise<void>;
  /** Quem está logado agora (ou null). */
  sessao: () => Promise<{ discordId?: string; nome?: string | null; imagem?: string | null } | null>;
};

const padrao: Dependencias = {
  buscar: (id) => repositorioUsuarios.buscar(id),
  garantir: (id, nome, avatar) => repositorioUsuarios.garantir(id, nome, avatar),
  sessao: async () => {
    const s = await auth();
    return s?.user ? { discordId: s.user.discordId, nome: s.user.name, imagem: s.user.image } : null;
  },
};

/**
 * Quem é o dono de `/u/{id}/`. A conta no site só nasce quando a pessoa entra
 * (ou abre /conta/), então quem já estava logado antes disso, ou nunca abriu a
 * conta, não tem linha — e o próprio perfil dava 404. Se o visitante É o dono
 * daquele id, a conta é criada na hora; pra qualquer outra pessoa, perfil
 * inexistente continua sendo 404.
 */
export async function usuarioDoPerfil(id: string, deps: Dependencias = padrao): Promise<Usuario | null> {
  const existente = await deps.buscar(id);
  if (existente) return existente;

  const eu = await deps.sessao();
  if (!eu?.discordId || eu.discordId !== id) return null;

  await deps.garantir(id, eu.nome ?? 'Sem nome', eu.imagem ?? null);
  return deps.buscar(id);
}
