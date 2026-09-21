import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('next/server', () => ({ after: vi.fn() }));
vi.mock('@/lib/chat-acesso', () => ({ podeAcessarSala: vi.fn() }));
vi.mock('@/lib/midia-servidor', () => ({ verificarMidia: vi.fn(), apagarMidia: vi.fn() }));
vi.mock('@/db/repositorios/auditoria', () => ({ repositorioAuditoria: { registrar: vi.fn() } }));
vi.mock('@/db/repositorios/midias', () => ({ repositorioMidias: { buscarPorUrl: vi.fn() } }));
vi.mock('@/db/repositorios/chat', () => ({
  repositorioChat: { criar: vi.fn(), buscar: vi.fn(), remover: vi.fn(), atividadeRecente: vi.fn(), purgar: vi.fn() },
}));

import { after } from 'next/server';
import { auth } from '@/auth';
import { podeAcessarSala } from '@/lib/chat-acesso';
import { verificarMidia, apagarMidia } from '@/lib/midia-servidor';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { repositorioMidias } from '@/db/repositorios/midias';
import { repositorioChat as repo } from '@/db/repositorios/chat';
import { MIDIA_HOST } from '@/lib/midia-host';
import { ENVIOS_POR_MINUTO, CHAT_TEXTO_MAX } from '@/lib/chat';
import { enviarMensagemAction, apagarMensagemAction } from './acoes';

const imagem = `https://${MIDIA_HOST}/imagem/a.png`;
const clipe = `https://${MIDIA_HOST}/chat-video/v.mp4`;
const comum = { user: { discordId: '42', papel: null } };
const adm = { user: { discordId: '7', papel: 'adm' } };
const msg = (extra: object = {}) => ({ id: 1, sala: 'geral', autorDiscordId: '42', texto: 'oi', anexos: [], criadoEm: new Date(), ...extra }) as never;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(auth).mockResolvedValue(comum as never);
  vi.mocked(podeAcessarSala).mockResolvedValue(true);
  vi.mocked(repo.atividadeRecente).mockResolvedValue({ ultimo: null, noUltimoMinuto: 0 });
  vi.mocked(repo.criar).mockResolvedValue(9);
  vi.mocked(repositorioMidias.buscarPorUrl).mockResolvedValue(null);
  vi.mocked(verificarMidia).mockResolvedValue({ ok: true, tamanho: 1, mime: 'image/png' });
});

describe('enviarMensagemAction', () => {
  it('exige login', async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    expect(await enviarMensagemAction({ sala: 'geral', texto: 'oi', anexo: null })).toEqual({ ok: false, erro: expect.stringContaining('Entra com o Discord') });
  });

  it('envia texto pra sala, agenda a limpeza e devolve o id', async () => {
    expect(await enviarMensagemAction({ sala: 'geral', texto: '  oi  ', anexo: null })).toEqual({ ok: true, dados: 9 });
    expect(repo.criar).toHaveBeenCalledWith({ sala: 'geral', autorDiscordId: '42', texto: 'oi', anexos: [] });
    expect(after).toHaveBeenCalledOnce();
  });

  it('sala inválida ou sem acesso: recusa sem gravar', async () => {
    expect(await enviarMensagemAction({ sala: 'partida:0', texto: 'oi', anexo: null })).toEqual({ ok: false, erro: 'Sala inválida.' });
    vi.mocked(podeAcessarSala).mockResolvedValue(false);
    expect(await enviarMensagemAction({ sala: 'partida:5', texto: 'oi', anexo: null })).toEqual({ ok: false, erro: expect.stringContaining('não está nessa sala') });
    expect(podeAcessarSala).toHaveBeenLastCalledWith({ tipo: 'partida', partidaId: 5 }, { discordId: '42', ehAdm: false });
    expect(repo.criar).not.toHaveBeenCalled();
  });

  it('mensagem vazia e mensagem longa demais são recusadas', async () => {
    expect((await enviarMensagemAction({ sala: 'geral', texto: '   ', anexo: null })).ok).toBe(false);
    expect((await enviarMensagemAction({ sala: 'geral', texto: 'x'.repeat(CHAT_TEXTO_MAX + 1), anexo: null })).ok).toBe(false);
    expect(repo.criar).not.toHaveBeenCalled();
  });

  it('anti-flood: rajada e excesso por minuto', async () => {
    vi.mocked(repo.atividadeRecente).mockResolvedValue({ ultimo: new Date(), noUltimoMinuto: 1 });
    expect(await enviarMensagemAction({ sala: 'geral', texto: 'oi', anexo: null })).toEqual({ ok: false, erro: expect.stringContaining('rápido demais') });
    vi.mocked(repo.atividadeRecente).mockResolvedValue({ ultimo: new Date(Date.now() - 5000), noUltimoMinuto: ENVIOS_POR_MINUTO });
    expect(await enviarMensagemAction({ sala: 'geral', texto: 'oi', anexo: null })).toEqual({ ok: false, erro: expect.stringContaining('por minuto') });
    expect(repo.criar).not.toHaveBeenCalled();
  });

  it('imagem conferida no Blob vai como anexo; só arquivo enviado por aqui e da própria pessoa', async () => {
    expect((await enviarMensagemAction({ sala: 'geral', texto: '', anexo: { url: imagem, video: false, duracaoSegundos: null } })).ok).toBe(true);
    expect(verificarMidia).toHaveBeenCalledWith(imagem, 'imagem');
    expect(repo.criar).toHaveBeenCalledWith(expect.objectContaining({ anexos: [{ tipo: 'imagem', url: imagem, duracaoSegundos: null }] }));

    expect((await enviarMensagemAction({ sala: 'geral', texto: 'x', anexo: { url: 'https://evil.example/a.png', video: false, duracaoSegundos: null } })).ok).toBe(false);
    vi.mocked(repositorioMidias.buscarPorUrl).mockResolvedValue({ discordId: '99' } as never);
    expect(await enviarMensagemAction({ sala: 'geral', texto: 'x', anexo: { url: imagem, video: false, duracaoSegundos: null } }))
      .toEqual({ ok: false, erro: expect.stringContaining('outra pessoa') });
  });

  it('vídeo do chat: conferido como chat-video, até 1 min', async () => {
    vi.mocked(verificarMidia).mockResolvedValue({ ok: true, tamanho: 1, mime: 'video/mp4' });
    expect((await enviarMensagemAction({ sala: 'geral', texto: '', anexo: { url: clipe, video: true, duracaoSegundos: 45.4 } })).ok).toBe(true);
    expect(verificarMidia).toHaveBeenCalledWith(clipe, 'chat-video');
    expect(repo.criar).toHaveBeenCalledWith(expect.objectContaining({ anexos: [{ tipo: 'video', url: clipe, duracaoSegundos: 45 }] }));

    expect(await enviarMensagemAction({ sala: 'geral', texto: '', anexo: { url: clipe, video: true, duracaoSegundos: 61 } }))
      .toEqual({ ok: false, erro: expect.stringContaining('no chat o máximo é 1 min') });
  });

  it('arquivo que o Blob não confirma barra a mensagem', async () => {
    vi.mocked(verificarMidia).mockResolvedValue({ ok: false, erro: 'Não encontrei o arquivo enviado.' });
    expect(await enviarMensagemAction({ sala: 'geral', texto: 'oi', anexo: { url: imagem, video: false, duracaoSegundos: null } }))
      .toEqual({ ok: false, erro: 'Não encontrei o arquivo enviado.' });
    expect(repo.criar).not.toHaveBeenCalled();
  });

  it('ADM passa o papel na checagem de acesso', async () => {
    vi.mocked(auth).mockResolvedValue(adm as never);
    await enviarMensagemAction({ sala: 'partida:5', texto: 'oi', anexo: null });
    expect(podeAcessarSala).toHaveBeenCalledWith({ tipo: 'partida', partidaId: 5 }, { discordId: '7', ehAdm: true });
  });
});

describe('apagarMensagemAction', () => {
  it('a pessoa apaga a própria mensagem (e o arquivo), sem auditoria', async () => {
    vi.mocked(repo.buscar).mockResolvedValue(msg({ anexos: [{ tipo: 'imagem', url: imagem, duracaoSegundos: null }] }));
    expect(await apagarMensagemAction(1)).toEqual({ ok: true, dados: undefined });
    expect(repo.remover).toHaveBeenCalledWith(1);
    expect(apagarMidia).toHaveBeenCalledWith(imagem);
    expect(repositorioAuditoria.registrar).not.toHaveBeenCalled();
  });

  it('ADM apaga a de outra pessoa e fica na auditoria', async () => {
    vi.mocked(auth).mockResolvedValue(adm as never);
    vi.mocked(repo.buscar).mockResolvedValue(msg());
    expect((await apagarMensagemAction(1)).ok).toBe(true);
    expect(repositorioAuditoria.registrar).toHaveBeenCalledWith(expect.objectContaining({ autor: '7', acao: 'chat.apagar_mensagem' }));
  });

  it('pessoa comum não apaga a dos outros; mensagem inexistente avisa', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { discordId: '55', papel: null } } as never);
    vi.mocked(repo.buscar).mockResolvedValue(msg());
    expect(await apagarMensagemAction(1)).toEqual({ ok: false, erro: expect.stringContaining('só pode apagar as suas') });
    expect(repo.remover).not.toHaveBeenCalled();
    vi.mocked(repo.buscar).mockResolvedValue(null as never);
    expect((await apagarMensagemAction(2)).ok).toBe(false);
  });
});
