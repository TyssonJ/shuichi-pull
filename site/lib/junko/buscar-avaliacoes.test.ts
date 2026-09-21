import { describe, it, expect, vi } from 'vitest';
import { buscarAvaliacoesDoBot, validarCaminhoAvaliacoes } from './buscar-avaliacoes';

const cfg = { url: 'https://bot.exemplo.com', caminho: '/avaliacoes', chave: null as string | null, desde: null as string | null };
const json = (corpo: unknown, status = 200) => new Response(JSON.stringify(corpo), { status });

describe('validarCaminhoAvaliacoes', () => {
  it('aceita rotas simples', () => {
    expect(validarCaminhoAvaliacoes('/avaliacoes')).toEqual({ ok: true, valor: '/avaliacoes' });
    expect(validarCaminhoAvaliacoes(' /api/v1/ratings ')).toEqual({ ok: true, valor: '/api/v1/ratings' });
  });

  it.each(['avaliacoes', 'https://evil.example/x', '/a/../b', '//evil.example', '/x?y=1', '/x#h', ''])(
    'recusa %j', (entrada) => { expect(validarCaminhoAvaliacoes(entrada).ok).toBe(false); },
  );
});

describe('buscarAvaliacoesDoBot', () => {
  it('GET no endereço + rota, com a chave do bot, e devolve a lista', async () => {
    const buscar = vi.fn<typeof fetch>(async () => json([{ externoId: '1' }]));
    const r = await buscarAvaliacoesDoBot({ ...cfg, chave: 'segredo' }, buscar);
    expect(r).toEqual({ ok: true, bruto: [{ externoId: '1' }] });
    const [url, init] = buscar.mock.calls[0];
    expect(url).toBe('https://bot.exemplo.com/avaliacoes');
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer segredo');
    expect(init?.redirect).toBe('manual');
  });

  it('manda `desde` quando já houve importação e aceita {avaliacoes: [...]}', async () => {
    const buscar = vi.fn<typeof fetch>(async () => json({ avaliacoes: [{ externoId: '2' }] }));
    const r = await buscarAvaliacoesDoBot({ ...cfg, desde: '2026-09-20T00:00:00.000Z' }, buscar);
    expect(r).toEqual({ ok: true, bruto: [{ externoId: '2' }] });
    expect(buscar.mock.calls[0][0]).toBe('https://bot.exemplo.com/avaliacoes?desde=2026-09-20T00%3A00%3A00.000Z');
  });

  it('rota inexistente no bot (o caso de hoje) vira mensagem clara', async () => {
    const r = await buscarAvaliacoesDoBot(cfg, vi.fn<typeof fetch>(async () => new Response('404: Not Found', { status: 404 })));
    expect(r.ok).toBe(false);
    expect(!r.ok && r.erro).toContain('ainda não tem a rota /avaliacoes');
  });

  it('outros erros HTTP, não-JSON, JSON no formato errado e rede caída nunca lançam', async () => {
    const erro = async (resposta: () => Promise<Response>) => {
      const r = await buscarAvaliacoesDoBot(cfg, vi.fn<typeof fetch>(resposta));
      expect(r.ok).toBe(false);
      return r.ok ? '' : r.erro;
    };
    expect(await erro(async () => new Response('x', { status: 500 }))).toContain('HTTP 500');
    expect(await erro(async () => new Response('<html>', { status: 200 }))).toContain('não com JSON');
    expect(await erro(async () => json({ outra: 1 }))).toContain('lista');
    expect(await erro(async () => { throw new TypeError('fetch failed'); })).toContain('conectar');
    expect(await erro(async () => { throw Object.assign(new Error('t'), { name: 'TimeoutError' }); })).toContain('não respondeu');
  });
});
