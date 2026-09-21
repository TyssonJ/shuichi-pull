import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/midia-servidor', () => ({ verificarMidia: vi.fn(), apagarMidia: vi.fn() }));
vi.mock('@/db/repositorios/auditoria', () => ({ repositorioAuditoria: { registrar: vi.fn() } }));
vi.mock('@/db/repositorios/midias', () => ({ repositorioMidias: { buscarPorUrl: vi.fn() } }));
vi.mock('@/db/repositorios/perfil-posts', () => ({
  repositorioPerfilPosts: { listar: vi.fn(), buscar: vi.fn(), criar: vi.fn(), remover: vi.fn() },
}));

import { auth } from '@/auth';
import { verificarMidia, apagarMidia } from '@/lib/midia-servidor';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { repositorioMidias } from '@/db/repositorios/midias';
import { repositorioPerfilPosts as repo } from '@/db/repositorios/perfil-posts';
import { MIDIA_HOST } from '@/lib/midia-host';
import { POSTS_MAX_POR_PESSOA, VIDEOS_MAX_POR_PESSOA } from '@/lib/perfil-posts';
import { publicarPostAction, apagarPostAction } from './post-acoes';

const imagem = `https://${MIDIA_HOST}/imagem/a.png`;
const clipe = `https://${MIDIA_HOST}/video-perfil/v.mp4`;
const comum = { user: { discordId: '42', papel: null } };
const adm = { user: { discordId: '7', papel: 'adm' } };
const postComVideo = { id: 1, discordId: '42', texto: 'x', anexos: [{ tipo: 'video', url: clipe, duracaoSegundos: 10 }], criadoEm: new Date() };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(auth).mockResolvedValue(comum as never);
  vi.mocked(repositorioMidias.buscarPorUrl).mockResolvedValue(null);
  vi.mocked(verificarMidia).mockResolvedValue({ ok: true, tamanho: 1000, mime: 'image/png' });
  vi.mocked(repo.listar).mockResolvedValue([]);
  vi.mocked(repo.criar).mockResolvedValue(5);
});

describe('publicarPostAction', () => {
  it('exige login', async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    expect(await publicarPostAction({ texto: 'oi', anexos: [] })).toEqual({ ok: false, erro: expect.stringContaining('Entra com o Discord') });
  });

  it('publica só texto e devolve o id', async () => {
    expect(await publicarPostAction({ texto: '  Olá  ', anexos: [] })).toEqual({ ok: true, dados: 5 });
    expect(repo.criar).toHaveBeenCalledWith('42', 'Olá', []);
  });

  it('o tipo do anexo vem do arquivo real (mime), não do que o navegador afirma', async () => {
    vi.mocked(verificarMidia).mockResolvedValue({ ok: true, tamanho: 1, mime: 'video/mp4' });
    await publicarPostAction({ texto: '', anexos: [{ url: clipe, video: false, duracaoSegundos: 30 }] });
    expect(verificarMidia).toHaveBeenCalledWith(clipe, 'imagem');
    // (com limite de imagem o servidor real recusaria; aqui só conferimos o tipo gravado)
    expect(repo.criar).toHaveBeenCalledWith('42', '', [{ tipo: 'video', url: clipe, duracaoSegundos: 30 }]);
  });

  it('vídeo vai conferido com o limite de vídeo do perfil; imagem sem duração', async () => {
    vi.mocked(verificarMidia).mockImplementation(async (_u, tipo) => ({ ok: true, tamanho: 1, mime: tipo === 'imagem' ? 'image/png' : 'video/mp4' }));
    await publicarPostAction({ texto: 'oi', anexos: [{ url: imagem, video: false, duracaoSegundos: 99 }, { url: clipe, video: true, duracaoSegundos: 120 }] });
    expect(verificarMidia).toHaveBeenCalledWith(clipe, 'video-perfil');
    expect(repo.criar).toHaveBeenCalledWith('42', 'oi', [
      { tipo: 'imagem', url: imagem, duracaoSegundos: null },
      { tipo: 'video', url: clipe, duracaoSegundos: 120 },
    ]);
  });

  it('vídeo de mais de 5 min é recusado', async () => {
    vi.mocked(verificarMidia).mockResolvedValue({ ok: true, tamanho: 1, mime: 'video/mp4' });
    expect(await publicarPostAction({ texto: '', anexos: [{ url: clipe, video: true, duracaoSegundos: 301 }] }))
      .toEqual({ ok: false, erro: expect.stringContaining('o máximo é 5 min') });
    expect(repo.criar).not.toHaveBeenCalled();
  });

  it('arquivo de outra pessoa não pode ser anexado', async () => {
    vi.mocked(repositorioMidias.buscarPorUrl).mockResolvedValue({ discordId: '99' } as never);
    expect(await publicarPostAction({ texto: 'oi', anexos: [{ url: imagem, video: false, duracaoSegundos: null }] }))
      .toEqual({ ok: false, erro: expect.stringContaining('outra pessoa') });
    expect(repo.criar).not.toHaveBeenCalled();
  });

  it('arquivo que não passa na conferência do Blob barra o post', async () => {
    vi.mocked(verificarMidia).mockResolvedValue({ ok: false, erro: 'Não encontrei o arquivo enviado.' });
    expect(await publicarPostAction({ texto: 'oi', anexos: [{ url: imagem, video: false, duracaoSegundos: null }] }))
      .toEqual({ ok: false, erro: 'Não encontrei o arquivo enviado.' });
  });

  it('link de fora do Blob e post vazio são recusados', async () => {
    vi.mocked(verificarMidia).mockResolvedValue({ ok: true, tamanho: 1, mime: 'image/png' });
    expect((await publicarPostAction({ texto: 'oi', anexos: [{ url: 'https://evil.example/a.png', video: false, duracaoSegundos: null }] })).ok).toBe(false);
    expect(await publicarPostAction({ texto: '   ', anexos: [] })).toEqual({ ok: false, erro: expect.stringContaining('Escreva algo') });
    expect(repo.criar).not.toHaveBeenCalled();
  });

  it('respeita o limite de posts e de vídeos por pessoa', async () => {
    vi.mocked(repo.listar).mockResolvedValue(Array.from({ length: POSTS_MAX_POR_PESSOA }, () => ({ ...postComVideo, anexos: [] })) as never);
    expect(await publicarPostAction({ texto: 'oi', anexos: [] })).toEqual({ ok: false, erro: expect.stringContaining(`${POSTS_MAX_POR_PESSOA} posts`) });

    vi.mocked(repo.listar).mockResolvedValue(Array.from({ length: VIDEOS_MAX_POR_PESSOA }, () => postComVideo) as never);
    vi.mocked(verificarMidia).mockResolvedValue({ ok: true, tamanho: 1, mime: 'video/mp4' });
    expect(await publicarPostAction({ texto: '', anexos: [{ url: clipe, video: true, duracaoSegundos: 10 }] }))
      .toEqual({ ok: false, erro: expect.stringContaining('vídeos') });
    // mas texto/imagem continuam liberados
    vi.mocked(verificarMidia).mockResolvedValue({ ok: true, tamanho: 1, mime: 'image/png' });
    expect((await publicarPostAction({ texto: 'oi', anexos: [] })).ok).toBe(true);
  });
});

describe('apagarPostAction', () => {
  beforeEach(() => { vi.mocked(repo.buscar).mockResolvedValue(postComVideo as never); });

  it('o dono apaga o post e os arquivos, sem auditoria', async () => {
    expect(await apagarPostAction(1)).toEqual({ ok: true, dados: undefined });
    expect(repo.remover).toHaveBeenCalledWith(1);
    expect(apagarMidia).toHaveBeenCalledWith(clipe);
    expect(repositorioAuditoria.registrar).not.toHaveBeenCalled();
  });

  it('ADM apaga o post de outra pessoa e isso fica na auditoria', async () => {
    vi.mocked(auth).mockResolvedValue(adm as never);
    expect((await apagarPostAction(1)).ok).toBe(true);
    expect(repositorioAuditoria.registrar).toHaveBeenCalledWith(expect.objectContaining({ autor: '7', acao: 'perfil.apagar_post' }));
  });

  it('pessoa comum não apaga post alheio; post inexistente avisa', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { discordId: '55', papel: null } } as never);
    expect(await apagarPostAction(1)).toEqual({ ok: false, erro: expect.stringContaining('só pode apagar os seus') });
    expect(repo.remover).not.toHaveBeenCalled();
    vi.mocked(repo.buscar).mockResolvedValue(null);
    expect((await apagarPostAction(9)).ok).toBe(false);
  });
});
