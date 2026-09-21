import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/adm/sessao', () => ({ exigirAdm: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/db/repositorios/auditoria', () => ({ repositorioAuditoria: { registrar: vi.fn() } }));
vi.mock('@/db/repositorios/configuracoes', () => ({
  repositorioConfiguracoes: { obter: vi.fn(), definir: vi.fn() },
}));

import { exigirAdm } from '@/lib/adm/sessao';
import { revalidatePath } from 'next/cache';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { repositorioConfiguracoes } from '@/db/repositorios/configuracoes';
import { salvarTextoAction } from './acoes';

describe('salvarTextoAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(exigirAdm).mockResolvedValue({ discordId: 'adm1', papel: 'adm' });
    vi.mocked(repositorioConfiguracoes.obter).mockResolvedValue(null);
  });

  it('exige ADM', async () => {
    vi.mocked(exigirAdm).mockRejectedValue(new Error('Acesso negado'));
    await expect(salvarTextoAction('home.botao', 'X')).rejects.toThrow('Acesso negado');
    expect(repositorioConfiguracoes.definir).not.toHaveBeenCalled();
  });

  it('grava com o prefixo texto., audita e revalida a página e o painel', async () => {
    vi.mocked(repositorioConfiguracoes.obter).mockResolvedValue('antigo');
    await salvarTextoAction('faq.introducao', ' São {total} respostas. ');

    expect(repositorioConfiguracoes.definir).toHaveBeenCalledWith('texto.faq.introducao', 'São {total} respostas.');
    expect(repositorioAuditoria.registrar).toHaveBeenCalledWith({
      autor: 'adm1', acao: 'texto.definir', alvo: 'texto/faq.introducao', valorAntigo: 'antigo', valorNovo: 'São {total} respostas.',
    });
    expect(revalidatePath).toHaveBeenCalledWith('/faq');
    expect(revalidatePath).toHaveBeenCalledWith('/adm/textos');
  });

  it('a home revalida "/" (sem cortar a barra)', async () => {
    await salvarTextoAction('home.botao', 'COMEÇAR');
    expect(revalidatePath).toHaveBeenCalledWith('/');
  });

  it('vazio volta ao padrão (grava vazio, audita como null)', async () => {
    await salvarTextoAction('home.botao', '  ');
    expect(repositorioConfiguracoes.definir).toHaveBeenCalledWith('texto.home.botao', '');
    expect(repositorioAuditoria.registrar).toHaveBeenCalledWith(expect.objectContaining({ valorNovo: null }));
  });

  it('não deixa gravar chave que não é um texto editável (ex.: segredos)', async () => {
    expect(await salvarTextoAction('segredo.junko', 'x')).toEqual({ ok: false, erro: expect.stringContaining('não é editável') });
    expect(repositorioConfiguracoes.definir).not.toHaveBeenCalled();
  });

  it('respeita o limite de tamanho', async () => {
    expect(await salvarTextoAction('home.botao', 'a'.repeat(60))).toEqual({ ok: false, erro: expect.stringContaining('50') });
    expect(repositorioConfiguracoes.definir).not.toHaveBeenCalled();
  });
});
