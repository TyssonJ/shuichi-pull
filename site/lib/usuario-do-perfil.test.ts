import { describe, it, expect, vi } from 'vitest';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/db/repositorios/usuarios', () => ({ repositorioUsuarios: { buscar: vi.fn(), garantir: vi.fn() } }));

import { usuarioDoPerfil } from './usuario-do-perfil';

const linha = { discordId: '42', discordNome: 'Ana' } as never;

function deps(opcoes: { existe?: boolean; eu?: { discordId?: string; nome?: string | null; imagem?: string | null } | null }) {
  const buscar = vi.fn();
  // 1ª busca: existe ou não; depois de garantir, existe.
  buscar.mockResolvedValueOnce(opcoes.existe ? linha : null).mockResolvedValue(linha);
  const garantir = vi.fn().mockResolvedValue(undefined);
  const sessao = vi.fn().mockResolvedValue(opcoes.eu ?? null);
  return { buscar, garantir, sessao };
}

describe('usuarioDoPerfil', () => {
  it('conta que já existe: devolve sem criar nada nem olhar a sessão', async () => {
    const d = deps({ existe: true });
    expect(await usuarioDoPerfil('42', d)).toBe(linha);
    expect(d.garantir).not.toHaveBeenCalled();
    expect(d.sessao).not.toHaveBeenCalled();
  });

  it('o dono abrindo o próprio perfil sem ter conta: cria com nome e ícone do Discord e devolve (era o 404)', async () => {
    const d = deps({ existe: false, eu: { discordId: '42', nome: 'Ana', imagem: 'https://cdn/a.png' } });
    expect(await usuarioDoPerfil('42', d)).toBe(linha);
    expect(d.garantir).toHaveBeenCalledWith('42', 'Ana', 'https://cdn/a.png');
  });

  it('sem nome na sessão usa um nome padrão em vez de falhar', async () => {
    const d = deps({ existe: false, eu: { discordId: '42', nome: null, imagem: null } });
    await usuarioDoPerfil('42', d);
    expect(d.garantir).toHaveBeenCalledWith('42', 'Sem nome', null);
  });

  it('perfil de OUTRA pessoa que não existe continua 404 (não cria conta de terceiros)', async () => {
    const d = deps({ existe: false, eu: { discordId: '99', nome: 'Bia' } });
    expect(await usuarioDoPerfil('42', d)).toBeNull();
    expect(d.garantir).not.toHaveBeenCalled();
  });

  it('visitante sem login: 404 e nada é criado', async () => {
    const d = deps({ existe: false, eu: null });
    expect(await usuarioDoPerfil('42', d)).toBeNull();
    const d2 = deps({ existe: false, eu: { nome: 'sem id' } });
    expect(await usuarioDoPerfil('42', d2)).toBeNull();
    expect(d.garantir).not.toHaveBeenCalled();
    expect(d2.garantir).not.toHaveBeenCalled();
  });
});
