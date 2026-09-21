import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/junko/servico', () => ({ emitirEvento: vi.fn() }));
vi.mock('@/lib/midia-servidor', () => ({ verificarMidia: vi.fn() }));
vi.mock('@/db/repositorios/auditoria', () => ({ repositorioAuditoria: { registrar: vi.fn() } }));
vi.mock('@/db/repositorios/perfil-estilos', () => ({
  repositorioPerfilEstilos: {
    buscar: vi.fn(), enviar: vi.fn(), cancelarPedido: vi.fn(), removerPublicado: vi.fn(),
  },
}));

import { auth } from '@/auth';
import { emitirEvento } from '@/lib/junko/servico';
import { verificarMidia } from '@/lib/midia-servidor';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { repositorioPerfilEstilos as repo } from '@/db/repositorios/perfil-estilos';
import { MIDIA_HOST } from '@/lib/midia-host';
import { ESTILO_VAZIO } from '@/lib/estilo-perfil';
import { enviarEstiloAction, cancelarPedidoEstiloAction } from './estilo-acoes';

const blob = (n: string) => `https://${MIDIA_HOST}/imagem/${n}`;
const comum = { user: { discordId: '42', papel: null } };
const adm = { user: { discordId: '7', papel: 'adm' } };
const linha = (extra: object) => ({ discordId: '42', publicado: null, pendente: null, status: 'nenhum', ...extra }) as never;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(auth).mockResolvedValue(comum as never);
  vi.mocked(repo.buscar).mockResolvedValue(null);
  vi.mocked(verificarMidia).mockResolvedValue({ ok: true } as never);
});

describe('enviarEstiloAction', () => {
  it('exige login', async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    expect(await enviarEstiloAction({ corTema: '#ff007f' })).toEqual({ ok: false, erro: expect.stringContaining('Entra com o Discord') });
    expect(repo.enviar).not.toHaveBeenCalled();
  });

  it('pessoa comum: vira pedido pendente, audita e avisa o bot', async () => {
    const r = await enviarEstiloAction({ corTema: '#FF007F', fundoEsquerdo: blob('a.png') });
    expect(r).toEqual({ ok: true, dados: 'pendente' });
    expect(repo.enviar).toHaveBeenCalledWith(
      '42', expect.objectContaining({ corTema: '#ff007f', fundoEsquerdo: blob('a.png') }), { publicarDireto: false, autor: '42' },
    );
    expect(repositorioAuditoria.registrar).toHaveBeenCalledWith(expect.objectContaining({ autor: '42', acao: 'perfil.enviar_estilo' }));
    expect(emitirEvento).toHaveBeenCalledWith({ tipo: 'perfil.pendente', discordId: '42' });
  });

  it('ADM: publica direto e não gera evento de pendência', async () => {
    vi.mocked(auth).mockResolvedValue(adm as never);
    const r = await enviarEstiloAction({ corTema: '#ff007f' });
    expect(r).toEqual({ ok: true, dados: 'publicado' });
    expect(repo.enviar).toHaveBeenCalledWith('7', expect.anything(), { publicarDireto: true, autor: '7' });
    expect(emitirEvento).not.toHaveBeenCalled();
  });

  it('estilo inválido volta como mensagem, sem gravar', async () => {
    expect(await enviarEstiloAction({ corTema: '#101020' })).toEqual({ ok: false, erro: expect.stringContaining('escura demais') });
    expect(await enviarEstiloAction({ fundoEsquerdo: 'https://evil.example/x.png' })).toEqual({ ok: false, erro: expect.stringContaining('Fundo da esquerda') });
    expect(repo.enviar).not.toHaveBeenCalled();
  });

  it('arquivo do nosso Blob que não passa na conferência barra o envio', async () => {
    vi.mocked(verificarMidia).mockResolvedValue({ ok: false, erro: 'Arquivo grande demais.' } as never);
    expect(await enviarEstiloAction({ fundoEsquerdo: blob('a.png') })).toEqual({ ok: false, erro: 'Arquivo grande demais.' });
    expect(verificarMidia).toHaveBeenCalledWith(blob('a.png'), 'imagem');
    expect(repo.enviar).not.toHaveBeenCalled();
  });

  it('link externo permitido não passa pelo Blob', async () => {
    await enviarEstiloAction({ fundoEsquerdo: 'https://i.imgur.com/a.png' });
    expect(verificarMidia).not.toHaveBeenCalled();
    expect(repo.enviar).toHaveBeenCalled();
  });

  it('estilo vazio = limpar o próprio perfil na hora, sem revisão', async () => {
    const r = await enviarEstiloAction({});
    expect(r).toEqual({ ok: true, dados: 'removido' });
    expect(repo.removerPublicado).toHaveBeenCalledWith('42', '42');
    expect(repo.cancelarPedido).toHaveBeenCalledWith('42');
    expect(repo.enviar).not.toHaveBeenCalled();
    expect(emitirEvento).not.toHaveBeenCalled();
  });

  it('igual ao que já está no ar, sem pedido: recusa', async () => {
    vi.mocked(repo.buscar).mockResolvedValue(linha({ publicado: { ...ESTILO_VAZIO, corTema: '#ff007f' } }));
    expect(await enviarEstiloAction({ corTema: '#ff007f' })).toEqual({ ok: false, erro: expect.stringContaining('já está no ar') });
  });

  it('voltar ao que está no ar com um pedido aberto = cancelar o pedido', async () => {
    vi.mocked(repo.buscar).mockResolvedValue(linha({
      publicado: { ...ESTILO_VAZIO, corTema: '#ff007f' }, pendente: { ...ESTILO_VAZIO, corTema: '#00f0ff' }, status: 'rejeitado',
    }));
    expect(await enviarEstiloAction({ corTema: '#ff007f' })).toEqual({ ok: true, dados: 'publicado' });
    expect(repo.cancelarPedido).toHaveBeenCalledWith('42');
    expect(repo.enviar).not.toHaveBeenCalled();
  });
});

describe('cancelarPedidoEstiloAction', () => {
  it('cancela só o pedido da própria pessoa', async () => {
    expect(await cancelarPedidoEstiloAction()).toEqual({ ok: true, dados: undefined });
    expect(repo.cancelarPedido).toHaveBeenCalledWith('42');
  });
});
