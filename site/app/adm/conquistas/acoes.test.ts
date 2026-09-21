import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/adm/sessao', () => ({ exigirAdm: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/junko/servico', () => ({ emitirEvento: vi.fn() }));
vi.mock('@/lib/midia-servidor', () => ({ verificarMidia: vi.fn(), apagarMidia: vi.fn() }));
vi.mock('@/db/repositorios/auditoria', () => ({ repositorioAuditoria: { registrar: vi.fn() } }));
vi.mock('@/db/repositorios/usuarios', () => ({ repositorioUsuarios: { buscar: vi.fn() } }));
vi.mock('@/db/repositorios/conquistas', () => ({
  repositorioConquistas: {
    buscar: vi.fn(), criar: vi.fn(), atualizar: vi.fn(), excluir: vi.fn(), conceder: vi.fn(), retirar: vi.fn(),
  },
}));

import { exigirAdm } from '@/lib/adm/sessao';
import { revalidatePath } from 'next/cache';
import { emitirEvento } from '@/lib/junko/servico';
import { verificarMidia, apagarMidia } from '@/lib/midia-servidor';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { repositorioConquistas } from '@/db/repositorios/conquistas';
import { MIDIA_HOST } from '@/lib/midia-host';
import {
  criarConquistaAction, atualizarConquistaAction, excluirConquistaAction, concederConquistaAction, retirarConquistaAction,
} from './acoes';

const dados = { nome: 'Detetive Nato', descricaoCurta: 'Resolveu 5 casos', descricaoLonga: 'Detalhes.', iconeUrl: 'https://i.imgur.com/a.png' };
const existente = { id: 4, ...dados, criadoEm: new Date() };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(exigirAdm).mockResolvedValue({ discordId: 'adm1', papel: 'adm' });
  vi.mocked(repositorioConquistas.buscar).mockResolvedValue(existente);
  vi.mocked(repositorioUsuarios.buscar).mockResolvedValue({ discordId: '42' } as never);
  vi.mocked(verificarMidia).mockResolvedValue({ ok: true, tamanho: 1000, mime: 'image/png' });
});

describe('permissão', () => {
  it('só ADM mexe em conquistas', async () => {
    vi.mocked(exigirAdm).mockRejectedValue(new Error('Acesso negado'));
    await expect(criarConquistaAction(dados)).rejects.toThrow('Acesso negado');
    await expect(concederConquistaAction('42', 4)).rejects.toThrow('Acesso negado');
    expect(repositorioConquistas.criar).not.toHaveBeenCalled();
  });
});

describe('criar e editar', () => {
  it('cria com ícone de host permitido, sem consultar o Blob', async () => {
    vi.mocked(repositorioConquistas.criar).mockResolvedValue(4);
    expect(await criarConquistaAction(dados)).toEqual({ ok: true, dados: 4 });
    expect(verificarMidia).not.toHaveBeenCalled();
    expect(repositorioAuditoria.registrar).toHaveBeenCalledWith(expect.objectContaining({ acao: 'conquista.criar' }));
  });

  it('ícone enviado pelo site é conferido no Blob (tipo e tamanho); se falhar, a mensagem chega', async () => {
    vi.mocked(verificarMidia).mockResolvedValue({ ok: false, erro: 'O ícone tem 3,0 MB; o máximo é 1,0 MB.' });
    const r = await criarConquistaAction({ ...dados, iconeUrl: `https://${MIDIA_HOST}/icone/a.png` });
    expect(r).toEqual({ ok: false, erro: expect.stringContaining('3,0 MB') });
    expect(verificarMidia).toHaveBeenCalledWith(`https://${MIDIA_HOST}/icone/a.png`, 'icone');
    expect(repositorioConquistas.criar).not.toHaveBeenCalled();
  });

  it('validação: descrição curta, ícone de host não permitido', async () => {
    expect(await criarConquistaAction({ ...dados, descricaoCurta: '' })).toEqual({ ok: false, erro: expect.stringContaining('descrição curta') });
    expect(await criarConquistaAction({ ...dados, iconeUrl: 'https://evil.example/a.png' })).toEqual({ ok: false, erro: expect.stringContaining('ícone') });
  });

  it('trocar o ícone apaga o arquivo antigo do Blob; manter não apaga', async () => {
    vi.mocked(repositorioConquistas.buscar).mockResolvedValue({ ...existente, iconeUrl: `https://${MIDIA_HOST}/icone/velho.png` });
    await atualizarConquistaAction(4, { ...dados, iconeUrl: 'https://i.imgur.com/novo.png' });
    expect(apagarMidia).toHaveBeenCalledWith(`https://${MIDIA_HOST}/icone/velho.png`);

    vi.mocked(apagarMidia).mockClear();
    vi.mocked(repositorioConquistas.buscar).mockResolvedValue(existente);
    await atualizarConquistaAction(4, { ...dados, nome: 'Outro nome' });
    expect(apagarMidia).not.toHaveBeenCalled();
  });

  it('excluir apaga a conquista e o ícone; inexistente dá mensagem', async () => {
    expect((await excluirConquistaAction(4)).ok).toBe(true);
    expect(repositorioConquistas.excluir).toHaveBeenCalledWith(4);
    expect(apagarMidia).toHaveBeenCalledWith(existente.iconeUrl);
    vi.mocked(repositorioConquistas.buscar).mockResolvedValue(null);
    expect(await excluirConquistaAction(4)).toEqual({ ok: false, erro: expect.stringContaining('não existe mais') });
  });
});

describe('entregar e retirar', () => {
  it('entrega com motivo: grava, revalida o perfil e avisa o bot', async () => {
    const r = await concederConquistaAction('42', 4, '  venceu o torneio ');
    expect(r.ok).toBe(true);
    expect(repositorioConquistas.conceder).toHaveBeenCalledWith('42', 4, 'adm1', 'venceu o torneio');
    expect(revalidatePath).toHaveBeenCalledWith('/u/42');
    expect(emitirEvento).toHaveBeenCalledWith({
      tipo: 'conquista.concedida', discordId: '42', motivo: 'venceu o torneio',
      conquista: { id: 4, nome: 'Detetive Nato', descricaoCurta: 'Resolveu 5 casos' },
    });
  });

  it('motivo é opcional; longo demais, pessoa desconhecida e conquista sumida são barrados', async () => {
    expect((await concederConquistaAction('42', 4)).ok).toBe(true);
    expect(vi.mocked(repositorioConquistas.conceder).mock.calls[0][3]).toBeNull();
    expect((await concederConquistaAction('42', 4, 'a'.repeat(201))).ok).toBe(false);
    vi.mocked(repositorioUsuarios.buscar).mockResolvedValue(null);
    expect(await concederConquistaAction('99', 4)).toEqual({ ok: false, erro: expect.stringContaining('ainda não entrou') });
  });

  it('retirar tira, audita e avisa o bot', async () => {
    expect((await retirarConquistaAction('42', 4)).ok).toBe(true);
    expect(repositorioConquistas.retirar).toHaveBeenCalledWith('42', 4);
    expect(repositorioAuditoria.registrar).toHaveBeenCalledWith(expect.objectContaining({ acao: 'conquista.retirar' }));
    expect(emitirEvento).toHaveBeenCalledWith({ tipo: 'conquista.retirada', discordId: '42', conquista: { id: 4, nome: 'Detetive Nato' } });
  });
});
