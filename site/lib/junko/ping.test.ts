import { describe, it, expect, vi } from 'vitest';
import { pingarBot } from './ping';

const json = (corpo: unknown, status = 200) => new Response(JSON.stringify(corpo), { status });

describe('pingarBot', () => {
  it('online: devolve a mensagem do bot e o tempo', async () => {
    let t = 1000;
    const r = await pingarBot('https://bot.test', {
      buscar: vi.fn(async () => json({ status: 'online', bot: 'JunkoBot', mensagem: 'API do Shinri Trial conectada e operante!' })),
      agora: () => (t += 40),
    });
    expect(r).toEqual({ online: true, ms: 40, mensagem: 'API do Shinri Trial conectada e operante!' });
  });

  it('bate na raiz com barra final', async () => {
    const buscar = vi.fn<typeof fetch>(async () => json({}));
    await pingarBot('https://bot.test', { buscar });
    expect(buscar.mock.calls[0][0]).toBe('https://bot.test/');
  });

  it('HTTP de erro = offline', async () => {
    const r = await pingarBot('https://bot.test', { buscar: vi.fn(async () => new Response('x', { status: 503 })) });
    expect(r).toMatchObject({ online: false, erro: 'o bot respondeu HTTP 503' });
  });

  it('bot que diz que não está online = offline', async () => {
    const r = await pingarBot('https://bot.test', { buscar: vi.fn(async () => json({ status: 'manutencao' })) });
    expect(r.online).toBe(false);
    expect(r.erro).toContain('manutencao');
  });

  it('200 sem JSON ainda conta como online', async () => {
    const r = await pingarBot('https://bot.test', { buscar: vi.fn(async () => new Response('ok', { status: 200 })) });
    expect(r.online).toBe(true);
  });

  it('rede caindo e timeout não lançam', async () => {
    expect(await pingarBot('https://bot.test', { buscar: vi.fn(async () => { throw new TypeError('x'); }) }))
      .toEqual({ online: false, erro: 'não deu pra conectar' });
    const t = await pingarBot('https://bot.test', { buscar: vi.fn(async () => { throw Object.assign(new Error('t'), { name: 'TimeoutError' }); }) });
    expect(t.erro).toContain('não respondeu');
  });
});
