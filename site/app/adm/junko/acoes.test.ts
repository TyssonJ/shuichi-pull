import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/adm/sessao', () => ({ exigirChefe: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/db/repositorios/auditoria', () => ({ repositorioAuditoria: { registrar: vi.fn() } }));
vi.mock('@/db/repositorios/configuracoes', () => ({ repositorioConfiguracoes: { definir: vi.fn() } }));
vi.mock('@/lib/junko/servico', () => ({ notificarJunko: vi.fn(), lerConfigEnvio: vi.fn() }));

import { exigirChefe } from '@/lib/adm/sessao';
import { repositorioConfiguracoes } from '@/db/repositorios/configuracoes';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { notificarJunko } from '@/lib/junko/servico';
import { chaveConfere } from '@/lib/junko/chave';
import { gerarChaveJunkoAction, salvarConfigJunkoAction, enviarTesteJunkoAction } from './acoes';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(exigirChefe).mockResolvedValue({ discordId: 'chefe1', papel: 'chefe' });
});

describe('só chefe', () => {
  it('ADM comum é barrado em todas as ações', async () => {
    vi.mocked(exigirChefe).mockRejectedValue(new Error('Acesso negado: ação restrita a chefes.'));
    await expect(gerarChaveJunkoAction()).rejects.toThrow('chefes');
    await expect(salvarConfigJunkoAction({ url: 'https://x.exemplo.com', ativo: true, chaveSaida: null })).rejects.toThrow('chefes');
    await expect(enviarTesteJunkoAction()).rejects.toThrow('chefes');
    expect(repositorioConfiguracoes.definir).not.toHaveBeenCalled();
    expect(notificarJunko).not.toHaveBeenCalled();
  });
});

describe('gerarChaveJunkoAction', () => {
  it('guarda só o hash, devolve a chave em texto e audita sem a chave', async () => {
    const chave = await gerarChaveJunkoAction();

    const [nomeConfig, hashGuardado] = vi.mocked(repositorioConfiguracoes.definir).mock.calls[0];
    expect(nomeConfig).toBe('segredo.junko.chave_hash');
    expect(hashGuardado).not.toContain(chave);
    expect(chaveConfere(chave, hashGuardado)).toBe(true);

    const registro = vi.mocked(repositorioAuditoria.registrar).mock.calls[0][0];
    expect(registro.acao).toBe('junko.chave_gerar');
    expect(JSON.stringify(registro)).not.toContain(chave);
  });

  it('cada chamada gera uma chave diferente (a anterior deixa de valer)', async () => {
    expect(await gerarChaveJunkoAction()).not.toBe(await gerarChaveJunkoAction());
  });
});

describe('salvarConfigJunkoAction', () => {
  it('grava url normalizada e o interruptor; chaveSaida null não mexe na credencial', async () => {
    await salvarConfigJunkoAction({ url: 'https://junkobott.squareweb.app/', ativo: true, chaveSaida: null });
    expect(repositorioConfiguracoes.definir).toHaveBeenCalledWith('junko.url', 'https://junkobott.squareweb.app');
    expect(repositorioConfiguracoes.definir).toHaveBeenCalledWith('junko.eventos_ativos', 'true');
    expect(vi.mocked(repositorioConfiguracoes.definir).mock.calls.map((c) => c[0])).not.toContain('segredo.junko.chave_saida');
  });

  it('grava a credencial do bot mas nunca a coloca na auditoria', async () => {
    await salvarConfigJunkoAction({ url: 'https://junkobott.squareweb.app', ativo: false, chaveSaida: '  token-super-secreto  ' });
    expect(repositorioConfiguracoes.definir).toHaveBeenCalledWith('segredo.junko.chave_saida', 'token-super-secreto');
    expect(JSON.stringify(vi.mocked(repositorioAuditoria.registrar).mock.calls)).not.toContain('token-super-secreto');
  });

  it('string vazia apaga a credencial', async () => {
    await salvarConfigJunkoAction({ url: 'https://junkobott.squareweb.app', ativo: false, chaveSaida: '' });
    expect(repositorioConfiguracoes.definir).toHaveBeenCalledWith('segredo.junko.chave_saida', '');
  });

  it('rejeita URL interna (proteção contra o site virar ponte pra rede interna) sem gravar nada', async () => {
    expect(await salvarConfigJunkoAction({ url: 'https://169.254.169.254/', ativo: true, chaveSaida: null })).toEqual({ ok: false, erro: expect.stringContaining('público') });
    expect(await salvarConfigJunkoAction({ url: 'http://junkobott.squareweb.app', ativo: true, chaveSaida: null })).toEqual({ ok: false, erro: expect.stringContaining('https') });
    expect(repositorioConfiguracoes.definir).not.toHaveBeenCalled();
  });
});

describe('enviarTesteJunkoAction', () => {
  it('força o envio do evento teste e devolve o resultado', async () => {
    vi.mocked(notificarJunko).mockResolvedValue({ enviado: false, status: 404, motivo: 'o bot respondeu HTTP 404' });
    const r = await enviarTesteJunkoAction();
    expect(notificarJunko).toHaveBeenCalledWith({ tipo: 'teste' }, { forcar: true });
    expect(r.motivo).toContain('404');
  });
});
