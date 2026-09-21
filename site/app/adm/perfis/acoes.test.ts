import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/adm/sessao', () => ({ exigirAdm: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/junko/servico', () => ({ emitirEvento: vi.fn() }));
vi.mock('@/db/repositorios/auditoria', () => ({ repositorioAuditoria: { registrar: vi.fn() } }));
vi.mock('@/db/repositorios/perfil-estilos', () => ({
  repositorioPerfilEstilos: { buscar: vi.fn(), aprovar: vi.fn(), rejeitar: vi.fn(), removerPublicado: vi.fn() },
}));

import { exigirAdm } from '@/lib/adm/sessao';
import { revalidatePath } from 'next/cache';
import { emitirEvento } from '@/lib/junko/servico';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { repositorioPerfilEstilos as repo } from '@/db/repositorios/perfil-estilos';
import { ESTILO_VAZIO } from '@/lib/estilo-perfil';
import { aprovarEstiloAction, rejeitarEstiloAction, removerEstiloPublicadoAction } from './acoes';

const pendente = { discordId: '42', publicado: null, pendente: { ...ESTILO_VAZIO, corTema: '#ff007f' }, status: 'pendente' } as never;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(exigirAdm).mockResolvedValue({ discordId: 'adm1', papel: 'adm' });
  vi.mocked(repo.buscar).mockResolvedValue(pendente);
});

describe('permissão', () => {
  it('só ADM revisa', async () => {
    vi.mocked(exigirAdm).mockRejectedValue(new Error('Acesso negado'));
    await expect(aprovarEstiloAction('42')).rejects.toThrow('Acesso negado');
    await expect(rejeitarEstiloAction('42', 'motivo qualquer')).rejects.toThrow('Acesso negado');
    await expect(removerEstiloPublicadoAction('42')).rejects.toThrow('Acesso negado');
    expect(repo.aprovar).not.toHaveBeenCalled();
  });
});

describe('aprovarEstiloAction', () => {
  it('publica o pedido, audita, atualiza o perfil e avisa o bot', async () => {
    expect(await aprovarEstiloAction('42')).toEqual({ ok: true, dados: undefined });
    expect(repo.aprovar).toHaveBeenCalledWith('42', 'adm1');
    expect(repositorioAuditoria.registrar).toHaveBeenCalledWith(expect.objectContaining({ autor: 'adm1', acao: 'perfil.aprovar', alvo: 'perfil/42' }));
    expect(revalidatePath).toHaveBeenCalledWith('/u/42');
    expect(emitirEvento).toHaveBeenCalledWith({ tipo: 'perfil.aprovado', discordId: '42' });
  });

  it('pedido que já foi revisado (ou não existe) não é aprovado de novo', async () => {
    vi.mocked(repo.buscar).mockResolvedValue({ ...(pendente as object), status: 'nenhum' } as never);
    expect(await aprovarEstiloAction('42')).toEqual({ ok: false, erro: expect.stringContaining('não está mais pendente') });
    vi.mocked(repo.buscar).mockResolvedValue(null);
    expect((await aprovarEstiloAction('42')).ok).toBe(false);
    expect(repo.aprovar).not.toHaveBeenCalled();
  });
});

describe('rejeitarEstiloAction', () => {
  it('exige motivo e o guarda limpo', async () => {
    expect(await rejeitarEstiloAction('42', '   ')).toEqual({ ok: false, erro: expect.stringContaining('motivo') });
    expect(repo.rejeitar).not.toHaveBeenCalled();

    expect(await rejeitarEstiloAction('42', '  imagem   imprópria  ')).toEqual({ ok: true, dados: undefined });
    expect(repo.rejeitar).toHaveBeenCalledWith('42', 'adm1', 'imagem imprópria');
    expect(emitirEvento).toHaveBeenCalledWith({ tipo: 'perfil.rejeitado', discordId: '42', motivo: 'imagem imprópria' });
  });

  it('recusa motivo longo demais e pedido que não está pendente', async () => {
    expect((await rejeitarEstiloAction('42', 'x'.repeat(201))).ok).toBe(false);
    vi.mocked(repo.buscar).mockResolvedValue(null);
    expect((await rejeitarEstiloAction('42', 'motivo válido')).ok).toBe(false);
    expect(repo.rejeitar).not.toHaveBeenCalled();
  });
});

describe('removerEstiloPublicadoAction', () => {
  it('tira do ar o que estava publicado', async () => {
    vi.mocked(repo.buscar).mockResolvedValue({ discordId: '42', publicado: { ...ESTILO_VAZIO, corTema: '#ff007f' }, status: 'nenhum' } as never);
    expect(await removerEstiloPublicadoAction('42')).toEqual({ ok: true, dados: undefined });
    expect(repo.removerPublicado).toHaveBeenCalledWith('42', 'adm1');
    expect(repositorioAuditoria.registrar).toHaveBeenCalledWith(expect.objectContaining({ acao: 'perfil.remover_estilo' }));
  });

  it('sem estilo publicado, avisa', async () => {
    expect(await removerEstiloPublicadoAction('42')).toEqual({ ok: false, erro: expect.stringContaining('não tem estilo publicado') });
  });
});
