import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/db/repositorios/configuracoes', () => ({ repositorioConfiguracoes: { obter: vi.fn() } }));

import { repositorioConfiguracoes } from '@/db/repositorios/configuracoes';
import { exigirChaveJunko } from './autenticar';
import { gerarChave, hashDaChave } from './chave';

const pedido = (auth?: string) => new Request('https://x.test/api/junko/status/', {
  headers: auth ? { authorization: auth } : {},
});

describe('exigirChaveJunko', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sem chave gerada no painel: 503, mesmo com um Authorization qualquer', async () => {
    vi.mocked(repositorioConfiguracoes.obter).mockResolvedValue(null);
    const r = await exigirChaveJunko(pedido('Bearer qualquer'));
    expect(r?.status).toBe(503);
  });

  it('sem cabeçalho ou com chave errada: 401', async () => {
    vi.mocked(repositorioConfiguracoes.obter).mockResolvedValue(hashDaChave(gerarChave()));
    expect((await exigirChaveJunko(pedido()))?.status).toBe(401);
    expect((await exigirChaveJunko(pedido('Bearer errada')))?.status).toBe(401);
    expect((await exigirChaveJunko(pedido('Basic abc')))?.status).toBe(401);
  });

  it('chave certa passa (null = pode seguir)', async () => {
    const chave = gerarChave();
    vi.mocked(repositorioConfiguracoes.obter).mockResolvedValue(hashDaChave(chave));
    expect(await exigirChaveJunko(pedido(`Bearer ${chave}`))).toBeNull();
  });

  it('a resposta de erro não vaza o hash guardado', async () => {
    const hash = hashDaChave(gerarChave());
    vi.mocked(repositorioConfiguracoes.obter).mockResolvedValue(hash);
    const r = await exigirChaveJunko(pedido('Bearer errada'));
    expect(await r!.text()).not.toContain(hash);
  });
});
