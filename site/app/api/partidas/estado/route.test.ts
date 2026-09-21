import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/db/repositorios/partidas', () => ({ repositorioPartidas: { estados: vi.fn() } }));

import { repositorioPartidas } from '@/db/repositorios/partidas';
import { GET } from './route';

const pedir = (query: string) => GET(new Request(`http://localhost/api/partidas/estado/${query}`));

beforeEach(() => vi.clearAllMocks());

describe('GET /api/partidas/estado', () => {
  it('devolve status e horários das partidas pedidas, sem cache', async () => {
    vi.mocked(repositorioPartidas.estados).mockResolvedValue([
      { id: 14, status: 'em_andamento', iniciadaEm: new Date('2026-09-21T20:00:00Z'), finalizadaEm: null },
      { id: 15, status: 'agendada', iniciadaEm: null, finalizadaEm: null },
    ] as never);

    const r = await pedir('?ids=14,15');
    expect(repositorioPartidas.estados).toHaveBeenCalledWith([14, 15]);
    expect(r.headers.get('cache-control')).toBe('no-store');
    expect(await r.json()).toEqual({
      estados: {
        '14': { status: 'em_andamento', iniciadaEm: '2026-09-21T20:00:00.000Z', finalizadaEm: null },
        '15': { status: 'agendada', iniciadaEm: null, finalizadaEm: null },
      },
    });
  });

  it('sem ids (ou só lixo): 400 e nem toca no banco', async () => {
    expect((await pedir('')).status).toBe(400);
    expect((await pedir('?ids=abc,-1,0')).status).toBe(400);
    expect(repositorioPartidas.estados).not.toHaveBeenCalled();
  });

  it('id que não existe simplesmente não aparece (o monitor ignora)', async () => {
    vi.mocked(repositorioPartidas.estados).mockResolvedValue([] as never);
    expect(await (await pedir('?ids=999')).json()).toEqual({ estados: {} });
  });
});
