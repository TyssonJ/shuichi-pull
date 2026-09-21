import { describe, it, expect, vi } from 'vitest';
import { criarNotificador, type ConfigEnvio } from './enviar';
import { montarPayload, resumoDaPartida } from './eventos';

function montar(config: Partial<ConfigEnvio> = {}, resposta: () => Promise<Response> = async () => new Response('{}', { status: 200 })) {
  let agora = new Date('2026-09-21T12:00:00Z');
  const buscar = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() => resposta());
  const registrarFalha = vi.fn().mockResolvedValue(undefined);
  const notificar = criarNotificador({
    config: async () => ({ ativo: true, url: 'https://bot.exemplo.com', chave: null, ...config }),
    buscar,
    registrarFalha,
    agora: () => agora,
  });
  return { notificar, buscar, registrarFalha, avancar: (ms: number) => { agora = new Date(agora.getTime() + ms); } };
}

describe('notificador do Junko', () => {
  it('desligado: não faz requisição nenhuma', async () => {
    const { notificar, buscar } = montar({ ativo: false });
    expect(await notificar({ tipo: 'teste' })).toEqual({ enviado: false, motivo: 'envio de eventos desligado' });
    expect(buscar).not.toHaveBeenCalled();
  });

  it('teste manual (forcar) envia mesmo desligado', async () => {
    const { notificar, buscar } = montar({ ativo: false });
    expect((await notificar({ tipo: 'teste' }, { forcar: true })).enviado).toBe(true);
    expect(buscar).toHaveBeenCalledTimes(1);
  });

  it('POST em /eventos com JSON, origem e (se houver) a chave do bot', async () => {
    const { notificar, buscar } = montar({ chave: 'segredo-do-bot' });
    await notificar({ tipo: 'inscricao.saiu', partidaId: 7, discordId: '42' });

    const [url, init] = buscar.mock.calls[0];
    expect(url).toBe('https://bot.exemplo.com/eventos');
    expect(init.method).toBe('POST');
    expect(init.redirect).toBe('manual');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer segredo-do-bot');
    expect(JSON.parse(init.body as string)).toMatchObject({
      origem: 'shuichipull', evento: 'inscricao.saiu', dados: { partidaId: 7, discordId: '42' },
    });
  });

  it('sem chave configurada não manda cabeçalho Authorization', async () => {
    const { notificar, buscar } = montar({ chave: null });
    await notificar({ tipo: 'teste' });
    expect((buscar.mock.calls[0][1].headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it('bot respondendo erro vira resultado, não exceção, e registra a falha', async () => {
    const { notificar, registrarFalha } = montar({}, async () => new Response('x', { status: 500 }));
    const r = await notificar({ tipo: 'teste' });
    expect(r).toEqual({ enviado: false, status: 500, motivo: 'o bot respondeu HTTP 500' });
    expect(registrarFalha).toHaveBeenCalledWith('teste', 'o bot respondeu HTTP 500');
  });

  it('bot fora do ar (rede) nunca lança', async () => {
    const { notificar } = montar({}, async () => { throw new TypeError('fetch failed'); });
    expect(await notificar({ tipo: 'teste' })).toEqual({ enviado: false, motivo: 'não deu pra conectar no bot' });
  });

  it('timeout tem mensagem própria', async () => {
    const { notificar } = montar({}, async () => { throw Object.assign(new Error('t'), { name: 'TimeoutError' }); });
    expect((await notificar({ tipo: 'teste' })).motivo).toContain('não respondeu');
  });

  it('falha ao ler a configuração também não lança', async () => {
    const notificar = criarNotificador({
      config: async () => { throw new Error('banco fora'); },
      buscar: vi.fn(), registrarFalha: vi.fn(), agora: () => new Date(),
    });
    expect((await notificar({ tipo: 'teste' })).enviado).toBe(false);
  });

  it('bot fora do ar: registra no máximo uma falha por minuto (exceto no teste manual)', async () => {
    const { notificar, registrarFalha, avancar } = montar({}, async () => new Response('x', { status: 502 }));
    await notificar({ tipo: 'teste' });
    await notificar({ tipo: 'teste' });
    await notificar({ tipo: 'teste' });
    expect(registrarFalha).toHaveBeenCalledTimes(1);

    avancar(61_000);
    await notificar({ tipo: 'teste' });
    expect(registrarFalha).toHaveBeenCalledTimes(2);

    await notificar({ tipo: 'teste' }, { forcar: true });
    expect(registrarFalha).toHaveBeenCalledTimes(3);
  });

  it('erro ao gravar o log de falha não derruba o envio', async () => {
    const { notificar, registrarFalha } = montar({}, async () => new Response('x', { status: 500 }));
    registrarFalha.mockRejectedValue(new Error('banco'));
    await expect(notificar({ tipo: 'teste' })).resolves.toMatchObject({ enviado: false });
  });
});

describe('montarPayload / resumoDaPartida', () => {
  it('separa o tipo do resto dos dados', () => {
    const p = montarPayload({ tipo: 'uid.status', discordId: '1', status: 'aprovado' }, new Date('2026-09-21T00:00:00Z'));
    expect(p).toEqual({
      origem: 'shuichipull', evento: 'uid.status', enviadoEm: '2026-09-21T00:00:00.000Z',
      dados: { discordId: '1', status: 'aprovado' },
    });
  });

  it('resumo da partida usa ISO e o link público', () => {
    const r = resumoDaPartida({ id: 3, titulo: 'T', hostDiscordId: 'h', dataHora: new Date('2026-09-21T23:00:00Z'), vagas: 16 });
    expect(r).toMatchObject({ id: 3, dataHora: '2026-09-21T23:00:00.000Z', url: 'https://shuichipull.vercel.app/partidas/3/' });
  });
});
