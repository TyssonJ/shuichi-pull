import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/adm/sessao', () => ({ exigirAdm: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/db/repositorios/auditoria', () => ({ repositorioAuditoria: { registrar: vi.fn() } }));
vi.mock('@/db/repositorios/correcoes', () => ({
  repositorioCorrecoes: { buscarCorrecoesPorColecao: vi.fn(), salvarCorrecao: vi.fn(), reverterCorrecao: vi.fn() },
}));
vi.mock('@/db/repositorios/conteudo-adm', () => ({
  repositorioConteudoAdm: {
    buscarExtra: vi.fn(), listarExtras: vi.fn(), listarRemovidos: vi.fn(),
    criarExtra: vi.fn(), atualizarExtra: vi.fn(), excluirExtra: vi.fn(), ocultar: vi.fn(), restaurar: vi.fn(),
  },
}));

import { exigirAdm } from '@/lib/adm/sessao';
import { revalidatePath } from 'next/cache';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { repositorioConteudoAdm } from '@/db/repositorios/conteudo-adm';
import { listarFaq } from '@/lib/faq';
import { listarPersonagens } from '@/lib/dados';
import {
  salvarRegistroAction, reverterRegistroAction, criarConteudoAction, excluirConteudoAction, restaurarConteudoAction,
} from './conteudo-acoes';

const faq = listarFaq()[0];
const personagem = listarPersonagens()[0];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(exigirAdm).mockResolvedValue({ discordId: 'adm1', papel: 'adm' });
  vi.mocked(repositorioConteudoAdm.buscarExtra).mockResolvedValue(null);
  vi.mocked(repositorioConteudoAdm.listarExtras).mockResolvedValue([]);
  vi.mocked(repositorioConteudoAdm.listarRemovidos).mockResolvedValue(new Set());
  vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockResolvedValue(new Map());
});

describe('permissão', () => {
  it('toda ação exige ADM', async () => {
    vi.mocked(exigirAdm).mockRejectedValue(new Error('Acesso negado'));
    await expect(salvarRegistroAction('faq', faq.id, {})).rejects.toThrow('Acesso negado');
    await expect(criarConteudoAction('faq', {})).rejects.toThrow('Acesso negado');
    await expect(excluirConteudoAction('faq', faq.id)).rejects.toThrow('Acesso negado');
    await expect(restaurarConteudoAction('faq', faq.id)).rejects.toThrow('Acesso negado');
    await expect(reverterRegistroAction('faq', faq.id)).rejects.toThrow('Acesso negado');
    expect(repositorioCorrecoes.salvarCorrecao).not.toHaveBeenCalled();
  });
});

describe('salvarRegistroAction — registro do guia', () => {
  it('grava correção só dos campos que mudaram, com o valor original do guia', async () => {
    await salvarRegistroAction('faq', faq.id, { pergunta: faq.pergunta, resposta: 'Resposta nova' });

    expect(repositorioCorrecoes.salvarCorrecao).toHaveBeenCalledTimes(1);
    expect(repositorioCorrecoes.salvarCorrecao).toHaveBeenCalledWith({
      colecao: 'faq', registroId: faq.id, campo: 'resposta', valor: 'Resposta nova',
      valorBase: faq.resposta, autor: 'adm1',
    });
    expect(revalidatePath).toHaveBeenCalledWith('/faq');
    expect(revalidatePath).toHaveBeenCalledWith('/adm/faq');
  });

  it('valor igual ao original remove a correção existente em vez de gravar uma igual', async () => {
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockResolvedValue(new Map([
      [faq.id, new Map([['resposta', { valor: 'antiga', valorBase: faq.resposta, autor: 'x', criadoEm: 'x' }]])],
    ]));

    await salvarRegistroAction('faq', faq.id, { resposta: faq.resposta });

    expect(repositorioCorrecoes.reverterCorrecao).toHaveBeenCalledWith(
      expect.objectContaining({ registroId: faq.id, campo: 'resposta' }),
    );
    expect(repositorioCorrecoes.salvarCorrecao).not.toHaveBeenCalled();
  });

  it('não regrava correção que já tem o mesmo valor', async () => {
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockResolvedValue(new Map([
      [faq.id, new Map([['resposta', { valor: 'igual', valorBase: faq.resposta, autor: 'x', criadoEm: 'x' }]])],
    ]));
    await salvarRegistroAction('faq', faq.id, { resposta: 'igual' });
    expect(repositorioCorrecoes.salvarCorrecao).not.toHaveBeenCalled();
  });

  it('história e segredo do personagem são editáveis', async () => {
    await salvarRegistroAction('personagens', personagem.id, { historia: 'Nova história', segredo: 'Novo segredo' });
    const campos = vi.mocked(repositorioCorrecoes.salvarCorrecao).mock.calls.map(([a]) => a.campo);
    expect(campos).toEqual(expect.arrayContaining(['historia', 'segredo']));
    expect(revalidatePath).toHaveBeenCalledWith(`/elenco/${personagem.id}`);
  });

  it('não deixa o título ficar vazio nem salva nada pela metade', async () => {
    expect(await salvarRegistroAction('faq', faq.id, { resposta: 'ok', pergunta: '   ' })).toEqual({ ok: false, erro: expect.stringContaining('não pode ficar vazio') });
    expect(repositorioCorrecoes.salvarCorrecao).not.toHaveBeenCalled();
  });

  it('sprite só aceita caminho do site ou https', async () => {
    expect(await salvarRegistroAction('personagens', personagem.id, { sprite: 'javascript:alert(1)' })).toEqual({ ok: false, erro: expect.stringContaining('começar com') });
    await salvarRegistroAction('personagens', personagem.id, { sprite: 'https://i.imgur.com/x.png' });
    expect(repositorioCorrecoes.salvarCorrecao).toHaveBeenCalled();
  });

  it('registro inexistente', async () => {
    expect(await salvarRegistroAction('faq', 'nao-existe', { resposta: 'x' })).toEqual({ ok: false, erro: expect.stringContaining('não existe mais') });
  });
});

describe('salvarRegistroAction — registro criado no painel', () => {
  it('atualiza o extra (não mexe em correções) e audita', async () => {
    vi.mocked(repositorioConteudoAdm.buscarExtra).mockResolvedValue({
      id: 'minha', dados: { secao: 'S', pergunta: 'P?', resposta: 'R' },
    });

    await salvarRegistroAction('faq', 'minha', { resposta: 'R2' });

    expect(repositorioConteudoAdm.atualizarExtra).toHaveBeenCalledWith('faq', 'minha', { secao: 'S', pergunta: 'P?', resposta: 'R2' });
    expect(repositorioCorrecoes.salvarCorrecao).not.toHaveBeenCalled();
    expect(repositorioAuditoria.registrar).toHaveBeenCalledWith(expect.objectContaining({ acao: 'conteudo.editar', alvo: 'faq/minha' }));
  });

  it('rejeita campo vazio no extra', async () => {
    vi.mocked(repositorioConteudoAdm.buscarExtra).mockResolvedValue({ id: 'm', dados: { secao: 'S', pergunta: 'P?', resposta: 'R' } });
    expect(await salvarRegistroAction('faq', 'm', { resposta: '  ' })).toEqual({ ok: false, erro: expect.stringContaining('Preencha') });
    expect(repositorioConteudoAdm.atualizarExtra).not.toHaveBeenCalled();
  });
});

describe('criarConteudoAction', () => {
  it('cria com id do título e devolve o id', async () => {
    const r = await criarConteudoAction('faq', { secao: 'Regras', pergunta: 'Posso jogar sem Discord?', resposta: 'Não.' });
    const id = 'posso-jogar-sem-discord';
    expect(r).toEqual({ ok: true, dados: id });
    expect(repositorioConteudoAdm.criarExtra).toHaveBeenCalledWith(
      'faq', id, { secao: 'Regras', pergunta: 'Posso jogar sem Discord?', resposta: 'Não.' }, 'adm1',
    );
    expect(repositorioAuditoria.registrar).toHaveBeenCalledWith(expect.objectContaining({ acao: 'conteudo.criar' }));
    expect(revalidatePath).toHaveBeenCalledWith('/faq');
  });

  it('id que já existe (no guia, criado ou escondido) ganha sufixo', async () => {
    vi.mocked(repositorioConteudoAdm.listarExtras).mockResolvedValue([{ id: 'duvida', dados: {} }]);
    vi.mocked(repositorioConteudoAdm.listarRemovidos).mockResolvedValue(new Set(['duvida-2']));
    const r = await criarConteudoAction('controles', { grupo: 'G', titulo: 'Dúvida', texto: 'x' });
    expect(r).toEqual({ ok: true, dados: 'duvida-3' });
  });

  it('valida antes de gravar', async () => {
    expect(await criarConteudoAction('faq', { secao: 'S', pergunta: '', resposta: 'R' })).toEqual({ ok: false, erro: expect.stringContaining('Preencha') });
    expect(repositorioConteudoAdm.criarExtra).not.toHaveBeenCalled();
  });
});

describe('excluirConteudoAction / restaurarConteudoAction', () => {
  it('extra é apagado de vez', async () => {
    vi.mocked(repositorioConteudoAdm.buscarExtra).mockResolvedValue({ id: 'm', dados: { secao: 'S' } });
    await excluirConteudoAction('faq', 'm');
    expect(repositorioConteudoAdm.excluirExtra).toHaveBeenCalledWith('faq', 'm');
    expect(repositorioConteudoAdm.ocultar).not.toHaveBeenCalled();
  });

  it('registro do guia é só escondido', async () => {
    await excluirConteudoAction('faq', faq.id);
    expect(repositorioConteudoAdm.ocultar).toHaveBeenCalledWith('faq', faq.id, 'adm1');
    expect(repositorioConteudoAdm.excluirExtra).not.toHaveBeenCalled();
  });

  it('id que não existe em lugar nenhum dá erro', async () => {
    expect(await excluirConteudoAction('faq', 'fantasma')).toEqual({ ok: false, erro: expect.stringContaining('não existe mais') });
  });

  it('restaurar volta a mostrar', async () => {
    await restaurarConteudoAction('faq', faq.id);
    expect(repositorioConteudoAdm.restaurar).toHaveBeenCalledWith('faq', faq.id);
  });
});

describe('reverterRegistroAction', () => {
  it('reverte todos os campos do registro', async () => {
    await reverterRegistroAction('faq', faq.id);
    const campos = vi.mocked(repositorioCorrecoes.reverterCorrecao).mock.calls.map(([a]) => a.campo);
    expect(campos).toEqual(['pergunta', 'resposta']);
  });
});
