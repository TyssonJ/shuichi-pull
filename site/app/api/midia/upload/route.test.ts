import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/db/repositorios/midias', () => ({
  repositorioMidias: { contarDoDia: vi.fn(), registrar: vi.fn() },
}));
// O handleUpload real fala com a API do Blob; aqui ele só chama os dois ganchos como o SDK faria.
vi.mock('@vercel/blob/client', () => ({
  handleUpload: vi.fn(async ({ body, onBeforeGenerateToken, onUploadCompleted }) => {
    if (body.tipo === 'gerar') return { permissao: await onBeforeGenerateToken(body.pathname, body.clientPayload) };
    await onUploadCompleted({ blob: { url: body.url, contentType: body.mime }, tokenPayload: body.tokenPayload });
    return { ok: true };
  }),
}));

import { auth } from '@/auth';
import { repositorioMidias } from '@/db/repositorios/midias';
import { POST } from './route';

const pedir = (corpo: unknown) => POST(new Request('https://x.test/api/midia/upload/', { method: 'POST', body: JSON.stringify(corpo) }));
const gerar = (pathname: string, payload: unknown) => pedir({ tipo: 'gerar', pathname, clientPayload: JSON.stringify(payload) });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(auth).mockResolvedValue({ user: { discordId: '42' } } as never);
  vi.mocked(repositorioMidias.contarDoDia).mockResolvedValue(0);
});

describe('POST /api/midia/upload', () => {
  it('sem login: recusa, com a mensagem', async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const r = await gerar('icone/a.png', { tipo: 'icone' });
    expect(r.status).toBe(400);
    expect((await r.json()).erro).toContain('Entre com o Discord');
  });

  it('libera o token com os tipos e o tamanho DO USO escolhido', async () => {
    const r = await gerar('video-perfil/a.mp4', { tipo: 'video-perfil' });
    const { permissao } = await r.json();
    expect(permissao.allowedContentTypes).toEqual(['video/mp4', 'video/webm', 'video/quicktime']);
    expect(permissao.maximumSizeInBytes).toBe(150 * 1024 * 1024);
    expect(permissao.addRandomSuffix).toBe(true);
    expect(JSON.parse(permissao.tokenPayload)).toEqual({ discordId: '42', tipo: 'video-perfil' });
  });

  it('ícone é pequeno e só imagem', async () => {
    const { permissao } = await (await gerar('icone/a.png', { tipo: 'icone' })).json();
    expect(permissao.maximumSizeInBytes).toBe(1024 * 1024);
    expect(permissao.allowedContentTypes.every((t: string) => t.startsWith('image/'))).toBe(true);
  });

  it('tipo inventado, payload quebrado e pasta que não bate com o tipo são recusados', async () => {
    expect((await gerar('x/a.png', { tipo: 'script' })).status).toBe(400);
    expect((await pedir({ tipo: 'gerar', pathname: 'icone/a.png', clientPayload: '{quebrado' })).status).toBe(400);
    expect((await gerar('video-perfil/a.png', { tipo: 'icone' })).status).toBe(400);
    expect((await gerar('icone/../../x.png', { tipo: 'icone' })).status).toBe(400);
  });

  it('teto diário de envios', async () => {
    vi.mocked(repositorioMidias.contarDoDia).mockResolvedValue(40);
    const r = await gerar('imagem/a.png', { tipo: 'imagem' });
    expect(r.status).toBe(400);
    expect((await r.json()).erro).toContain('muitos arquivos hoje');
  });

  it('corpo que não é JSON: 400', async () => {
    const r = await POST(new Request('https://x.test/api/midia/upload/', { method: 'POST', body: 'lixo' }));
    expect(r.status).toBe(400);
  });

  it('ao terminar o envio, registra a mídia de quem enviou', async () => {
    await pedir({
      tipo: 'concluido', url: 'https://a.public.blob.vercel-storage.com/x.png', mime: 'image/png',
      tokenPayload: JSON.stringify({ discordId: '42', tipo: 'icone' }),
    });
    expect(repositorioMidias.registrar).toHaveBeenCalledWith({
      url: 'https://a.public.blob.vercel-storage.com/x.png', discordId: '42', tipo: 'icone', tipoMime: 'image/png',
    });
  });

  it('token de envio adulterado (tipo inválido) não registra nada', async () => {
    await pedir({ tipo: 'concluido', url: 'https://a/x.png', mime: 'image/png', tokenPayload: JSON.stringify({ discordId: '42', tipo: 'x' }) });
    expect(repositorioMidias.registrar).not.toHaveBeenCalled();
  });
});
