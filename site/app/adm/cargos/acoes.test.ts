import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/adm/sessao', () => ({ exigirAdm: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/junko/servico', () => ({ emitirEvento: vi.fn() }));
vi.mock('@/db/repositorios/auditoria', () => ({ repositorioAuditoria: { registrar: vi.fn() } }));
vi.mock('@/db/repositorios/usuarios', () => ({ repositorioUsuarios: { buscar: vi.fn() } }));
vi.mock('@/db/repositorios/cargos', () => ({
  repositorioCargos: {
    listar: vi.fn(), buscar: vi.fn(), criar: vi.fn(), atualizar: vi.fn(), excluir: vi.fn(), conceder: vi.fn(), retirar: vi.fn(),
  },
}));

import { exigirAdm } from '@/lib/adm/sessao';
import { revalidatePath } from 'next/cache';
import { emitirEvento } from '@/lib/junko/servico';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { repositorioCargos } from '@/db/repositorios/cargos';
import {
  criarCargoAction, atualizarCargoAction, excluirCargoAction, concederCargoAction, retirarCargoAction,
} from './acoes';

const calouro = { id: 3, nome: 'Calouro', cor: '#00ff66', criadoEm: new Date() };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(exigirAdm).mockResolvedValue({ discordId: 'adm1', papel: 'adm' });
  vi.mocked(repositorioCargos.listar).mockResolvedValue([calouro]);
  vi.mocked(repositorioCargos.buscar).mockResolvedValue(calouro);
  vi.mocked(repositorioUsuarios.buscar).mockResolvedValue({ discordId: '42' } as never);
});

describe('permissão', () => {
  it('só ADM mexe em cargos', async () => {
    vi.mocked(exigirAdm).mockRejectedValue(new Error('Acesso negado'));
    await expect(criarCargoAction({ nome: 'X1', cor: '#000000' })).rejects.toThrow('Acesso negado');
    await expect(concederCargoAction('42', 3)).rejects.toThrow('Acesso negado');
    await expect(excluirCargoAction(3)).rejects.toThrow('Acesso negado');
    expect(repositorioCargos.criar).not.toHaveBeenCalled();
    expect(repositorioCargos.conceder).not.toHaveBeenCalled();
  });
});

describe('criarCargoAction', () => {
  it('valida, cria, audita e devolve o id', async () => {
    vi.mocked(repositorioCargos.criar).mockResolvedValue(9);
    const r = await criarCargoAction({ nome: '  Veterano ', cor: '#F5D30E' });
    expect(r).toEqual({ ok: true, dados: 9 });
    expect(repositorioCargos.criar).toHaveBeenCalledWith({ nome: 'Veterano', cor: '#f5d30e' });
    expect(repositorioAuditoria.registrar).toHaveBeenCalledWith(expect.objectContaining({ autor: 'adm1', acao: 'cargo.criar' }));
    expect(revalidatePath).toHaveBeenCalledWith('/adm/cargos');
  });

  it('nome inválido, cor inválida e nome repetido (sem olhar maiúsculas) voltam como mensagem', async () => {
    expect(await criarCargoAction({ nome: 'a', cor: '#000000' })).toEqual({ ok: false, erro: expect.stringContaining('ao menos 2') });
    expect(await criarCargoAction({ nome: 'Ok', cor: 'verde' })).toEqual({ ok: false, erro: expect.stringContaining('#RRGGBB') });
    expect(await criarCargoAction({ nome: 'CALOURO', cor: '#000000' })).toEqual({ ok: false, erro: expect.stringContaining('Já existe') });
    expect(repositorioCargos.criar).not.toHaveBeenCalled();
  });
});

describe('atualizar e excluir', () => {
  it('editar o próprio nome não conta como repetido; audita antes e depois', async () => {
    const r = await atualizarCargoAction(3, { nome: 'Calouro', cor: '#ff007f' });
    expect(r.ok).toBe(true);
    expect(repositorioCargos.atualizar).toHaveBeenCalledWith(3, { nome: 'Calouro', cor: '#ff007f' });
    expect(repositorioAuditoria.registrar).toHaveBeenCalledWith(expect.objectContaining({
      acao: 'cargo.editar', valorAntigo: expect.stringContaining('#00ff66'), valorNovo: expect.stringContaining('#ff007f'),
    }));
  });

  it('cargo inexistente', async () => {
    vi.mocked(repositorioCargos.buscar).mockResolvedValue(null);
    expect(await atualizarCargoAction(9, { nome: 'Novo', cor: '#000000' })).toEqual({ ok: false, erro: expect.stringContaining('não existe mais') });
    expect(await excluirCargoAction(9)).toEqual({ ok: false, erro: expect.stringContaining('não existe mais') });
  });

  it('excluir apaga e audita', async () => {
    expect((await excluirCargoAction(3)).ok).toBe(true);
    expect(repositorioCargos.excluir).toHaveBeenCalledWith(3);
    expect(repositorioAuditoria.registrar).toHaveBeenCalledWith(expect.objectContaining({ acao: 'cargo.excluir' }));
  });
});

describe('entregar e retirar', () => {
  it('entrega a quem já entrou no site: grava, revalida o perfil e avisa o bot', async () => {
    const r = await concederCargoAction('42', 3);
    expect(r.ok).toBe(true);
    expect(repositorioCargos.conceder).toHaveBeenCalledWith('42', 3, 'adm1');
    expect(revalidatePath).toHaveBeenCalledWith('/u/42');
    expect(emitirEvento).toHaveBeenCalledWith({ tipo: 'cargo.concedido', discordId: '42', cargo: { id: 3, nome: 'Calouro' } });
  });

  it('não entrega pra quem nunca entrou no site nem de cargo que sumiu', async () => {
    vi.mocked(repositorioUsuarios.buscar).mockResolvedValue(null);
    expect(await concederCargoAction('99', 3)).toEqual({ ok: false, erro: expect.stringContaining('ainda não entrou') });
    vi.mocked(repositorioCargos.buscar).mockResolvedValue(null);
    expect((await concederCargoAction('42', 3)).ok).toBe(false);
    expect(repositorioCargos.conceder).not.toHaveBeenCalled();
  });

  it('retirar tira, audita e avisa o bot', async () => {
    expect((await retirarCargoAction('42', 3)).ok).toBe(true);
    expect(repositorioCargos.retirar).toHaveBeenCalledWith('42', 3);
    expect(emitirEvento).toHaveBeenCalledWith({ tipo: 'cargo.retirado', discordId: '42', cargo: { id: 3, nome: 'Calouro' } });
  });
});
