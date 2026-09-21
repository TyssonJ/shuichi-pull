import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within, cleanup, act } from '@testing-library/react';
import { SalaChat } from './SalaChat';
import { ChatFlutuante } from './ChatFlutuante';
import { AbrirChat } from './AbrirChat';
import { EVENTO_ABRIR_CHAT, type PersonagemChat } from '@/lib/chat';
import type { MensagemTela } from './MensagemChat';

vi.mock('@/components/midia/EnviarArquivo', () => ({
  EnviarArquivo: ({ tipo, rotulo, aoConcluir }: { tipo: string; rotulo?: string; aoConcluir: (a: unknown) => void }) => (
    <button
      type="button"
      onClick={() => aoConcluir({ url: `https://blob.example/${tipo}/x`, mime: 'x', tamanho: 1, duracaoSegundos: tipo === 'chat-video' ? 20 : null })}
    >
      {rotulo}
    </button>
  ),
}));
vi.mock('@/app/chat/acoes', () => ({ enviarMensagemAction: vi.fn(), apagarMensagemAction: vi.fn() }));
const rota = vi.hoisted(() => ({ caminho: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => rota.caminho }));

const makoto: PersonagemChat = { id: 'makoto-naegi', nome: 'Makoto Naegi', cor: '#7faa55' };
const kyoko: PersonagemChat = { id: 'kyoko-kirigiri', nome: 'Kyoko Kirigiri', cor: '#a58bd0' };

const msg = (extra: Partial<MensagemTela> = {}): MensagemTela => ({
  id: 1, autorId: '9', autorNome: 'Ana', autorNomeOriginal: null, autorAvatar: null, autorEhAdm: false,
  texto: 'oi', anexos: [], criadoEm: new Date().toISOString(), ...extra,
});

type Resposta = { ok?: boolean; status?: number; corpo: unknown };
function simularServidor(responder: (url: string) => Resposta) {
  const chamadas: string[] = [];
  vi.stubGlobal('fetch', vi.fn(async (entrada: string) => {
    chamadas.push(entrada);
    const r = responder(entrada);
    return { ok: r.ok ?? true, status: r.status ?? 200, json: async () => r.corpo };
  }));
  return chamadas;
}
const consulta = (mensagens: MensagemTela[], online = 2) => ({ corpo: { online, ids: mensagens.map((m) => m.id), mensagens } });
const ok = <T,>(dados: T) => vi.fn().mockResolvedValue({ ok: true, dados });

beforeEach(() => { rota.caminho = '/'; });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function sala(extra: Partial<React.ComponentProps<typeof SalaChat>> = {}) {
  return render(
    <SalaChat sala="geral" eu="42" ehAdm={false} personagens={[makoto, kyoko]} aoEnviar={ok(1)} aoApagar={ok(undefined)} {...extra} />,
  );
}

describe('SalaChat — leitura', () => {
  it('mostra as mensagens, o selo de ADM, o nome original e quantos estão online', async () => {
    simularServidor(() => consulta([
      msg({ id: 1, texto: 'salve' }),
      msg({ id: 2, autorNome: 'Chefe', autorEhAdm: true, autorNomeOriginal: 'Chefe#0001', texto: 'regra nova' }),
    ], 5));
    sala();
    expect(await screen.findByText('salve')).toBeInTheDocument();
    expect(screen.getByText('ADM')).toBeInTheDocument();
    expect(screen.getByText('(Chefe#0001)')).toBeInTheDocument();
    expect(screen.getByText(/5 online aqui · histórico de 4 h/)).toBeInTheDocument();
  });

  it('ADM vê "histórico de 24 h"', async () => {
    simularServidor(() => consulta([]));
    sala({ ehAdm: true });
    expect(await screen.findByText(/histórico de 24 h/)).toBeInTheDocument();
  });

  it('sala vazia convida a mandar o primeiro recado', async () => {
    simularServidor(() => consulta([]));
    sala();
    expect(await screen.findByText(/Manda o primeiro recado/)).toBeInTheDocument();
  });

  it('menção a personagem vira link colorido pra ficha; imagem e vídeo aparecem', async () => {
    simularServidor(() => consulta([msg({
      texto: 'cadê o @makoto-naegi?',
      anexos: [{ tipo: 'imagem', url: 'https://blob.example/a.png', duracaoSegundos: null }, { tipo: 'video', url: 'https://blob.example/v.mp4', duracaoSegundos: 30 }],
    })]));
    sala();
    const link = await screen.findByRole('link', { name: '@Makoto Naegi' });
    expect(link.getAttribute('href')).toMatch(/^\/elenco\/makoto-naegi\/?$/); // next/link perde a barra final no jsdom
    expect(link).toHaveStyle({ color: '#7faa55' });
    expect(screen.getByAltText('Imagem enviada no chat')).toBeInTheDocument();
    expect(screen.getByText('vídeo · 30 s')).toBeInTheDocument();
  });

  it('só apaga a própria mensagem; ADM apaga qualquer uma', async () => {
    simularServidor(() => consulta([msg({ id: 1, autorId: '42' }), msg({ id: 2, autorId: '9', texto: 'outra' })]));
    const { unmount } = sala();
    await screen.findByText('outra');
    expect(screen.getAllByRole('button', { name: 'Apagar mensagem' })).toHaveLength(1);
    unmount();
    sala({ ehAdm: true });
    await screen.findByText('outra');
    expect(screen.getAllByRole('button', { name: 'Apagar mensagem' })).toHaveLength(2);
  });

  it('apagar chama a ação e tira a mensagem da tela', async () => {
    simularServidor(() => consulta([msg({ id: 1, autorId: '42', texto: 'minha' })]));
    const aoApagar = ok(undefined);
    sala({ aoApagar });
    await screen.findByText('minha');
    fireEvent.click(screen.getByRole('button', { name: 'Apagar mensagem' }));
    await waitFor(() => expect(aoApagar).toHaveBeenCalledWith(1));
    await waitFor(() => expect(screen.queryByText('minha')).toBeNull());
  });

  it('sem acesso (403) mostra o motivo e para de consultar', async () => {
    const chamadas = simularServidor(() => ({ ok: false, status: 403, corpo: { erro: 'Você não está nessa sala.' } }));
    sala();
    expect(await screen.findByRole('alert')).toHaveTextContent('Você não está nessa sala.');
    await new Promise((r) => setTimeout(r, 50));
    expect(chamadas).toHaveLength(1);
  });

  it('a primeira consulta pede a janela toda; depois de enviar, só o que é novo', async () => {
    const chamadas = simularServidor(() => consulta([msg({ id: 7 })]));
    sala();
    await screen.findByText('oi');
    expect(chamadas[0]).toBe('/api/chat/?sala=geral');

    fireEvent.change(screen.getByLabelText('Escrever mensagem'), { target: { value: 'nova' } });
    fireEvent.click(screen.getByRole('button', { name: 'ENVIAR' }));
    await waitFor(() => expect(chamadas.length).toBeGreaterThan(1));
    expect(chamadas[1]).toBe('/api/chat/?sala=geral&depois=7');
  });
});

describe('SalaChat — aba em segundo plano', () => {
  const definirVisibilidade = (estado: 'hidden' | 'visible') =>
    Object.defineProperty(document, 'visibilityState', { get: () => estado, configurable: true });
  afterEach(() => { Reflect.deleteProperty(document, 'visibilityState'); });

  it('oculta não consulta; ao voltar pra aba, consulta na hora', async () => {
    const chamadas = simularServidor(() => consulta([msg({ texto: 'chegou' })]));
    definirVisibilidade('hidden');
    sala();
    await new Promise((r) => setTimeout(r, 50));
    expect(chamadas).toHaveLength(0);

    definirVisibilidade('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(await screen.findByText('chegou')).toBeInTheDocument();
    expect(chamadas).toHaveLength(1);
  });
});

describe('SalaChat — escrever', () => {
  it('Enter envia (Shift+Enter não), limpa o campo e manda a sala', async () => {
    simularServidor(() => consulta([]));
    const aoEnviar = ok(1);
    sala({ aoEnviar });
    const campo = await screen.findByLabelText('Escrever mensagem');
    fireEvent.change(campo, { target: { value: 'salve, pessoal' } });
    fireEvent.keyDown(campo, { key: 'Enter', shiftKey: true });
    expect(aoEnviar).not.toHaveBeenCalled();
    fireEvent.keyDown(campo, { key: 'Enter' });
    await waitFor(() => expect(aoEnviar).toHaveBeenCalledWith({ sala: 'geral', texto: 'salve, pessoal', anexo: null }));
    await waitFor(() => expect(campo).toHaveValue(''));
  });

  it('ENVIAR fica desabilitado sem texto e sem arquivo', async () => {
    simularServidor(() => consulta([]));
    sala();
    await screen.findByLabelText('Escrever mensagem');
    expect(screen.getByRole('button', { name: 'ENVIAR' })).toBeDisabled();
  });

  it('anexa um vídeo (com duração) e manda junto', async () => {
    simularServidor(() => consulta([]));
    const aoEnviar = ok(1);
    sala({ aoEnviar });
    await screen.findByLabelText('Escrever mensagem');
    fireEvent.click(screen.getByRole('button', { name: /^🎞/ }));
    expect(screen.getByText(/vídeo · 20 s pronta/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'ENVIAR' }));
    await waitFor(() => expect(aoEnviar).toHaveBeenCalledWith({
      sala: 'geral', texto: '', anexo: { url: 'https://blob.example/chat-video/x', video: true, duracaoSegundos: 20 },
    }));
  });

  it('erro do servidor (ex.: limite de mensagens) aparece e o texto fica', async () => {
    simularServidor(() => consulta([]));
    const aoEnviar = vi.fn().mockResolvedValue({ ok: false, erro: 'Calma, você está mandando mensagem rápido demais.' });
    sala({ aoEnviar });
    const campo = await screen.findByLabelText('Escrever mensagem');
    fireEvent.change(campo, { target: { value: 'oi' } });
    fireEvent.click(screen.getByRole('button', { name: 'ENVIAR' }));
    expect(await screen.findByText(/rápido demais/)).toBeInTheDocument();
    expect(campo).toHaveValue('oi');
  });

  it('"@" oferece personagens e escolher um insere o @id', async () => {
    simularServidor(() => consulta([]));
    sala();
    const campo = (await screen.findByLabelText('Escrever mensagem')) as HTMLTextAreaElement;
    fireEvent.change(campo, { target: { value: 'oi @ma', selectionStart: 6 } });
    const opcoes = within(await screen.findByRole('listbox', { name: 'Personagens' }));
    expect(opcoes.getByRole('button', { name: 'Makoto Naegi' })).toBeInTheDocument();
    expect(opcoes.queryByRole('button', { name: 'Kyoko Kirigiri' })).toBeNull();
    fireEvent.click(opcoes.getByRole('button', { name: 'Makoto Naegi' }));
    expect(campo).toHaveValue('oi @makoto-naegi ');
  });
});

describe('ChatFlutuante', () => {
  const salasJson = (extra: object = {}) => ({ corpo: { eu: '42', ehAdm: false, salas: [{ id: 'geral', nome: 'GERAL' }], ...extra } });
  const roteador = (salas: Resposta) => (url: string): Resposta => {
    if (url.startsWith('/api/chat/salas')) return salas;
    if (url.startsWith('/api/chat/personagens')) return { corpo: { personagens: [makoto] } };
    return consulta([]);
  };

  it('sem login (401), o botão não existe', async () => {
    const chamadas = simularServidor(roteador({ ok: false, status: 401, corpo: { erro: 'x' } }));
    render(<ChatFlutuante />);
    await waitFor(() => expect(chamadas).toContain('/api/chat/salas/'));
    expect(screen.queryByRole('button', { name: 'Abrir o chat' })).toBeNull();
  });

  it('logado: botão abre o painel na sala geral e fecha com o X e com Esc', async () => {
    simularServidor(roteador(salasJson()));
    render(<ChatFlutuante />);
    fireEvent.click(await screen.findByRole('button', { name: 'Abrir o chat' }));
    expect(await screen.findByRole('dialog', { name: 'Chat do Alter Ego' })).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).toBeNull(); // só a geral: sem abas
    fireEvent.click(screen.getByRole('button', { name: 'Fechar o chat' }));
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir o chat' }));
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('com partida, mostra abas e troca de sala', async () => {
    const chamadas = simularServidor(roteador(salasJson({ salas: [{ id: 'geral', nome: 'GERAL' }, { id: 'partida:5', nome: 'Noite de terror' }] })));
    render(<ChatFlutuante />);
    fireEvent.click(await screen.findByRole('button', { name: 'Abrir o chat' }));
    fireEvent.click(await screen.findByRole('tab', { name: /Noite de terror/ }));
    await waitFor(() => expect(chamadas).toContain('/api/chat/?sala=partida%3A5'));
    expect(screen.getByRole('tab', { name: /Noite de terror/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('o botão "Chat da partida" abre o painel direto na sala dela', async () => {
    const chamadas = simularServidor(roteador(salasJson({ salas: [{ id: 'geral', nome: 'GERAL' }, { id: 'partida:5', nome: 'Noite' }] })));
    render(<><ChatFlutuante /><AbrirChat sala="partida:5" /></>);
    await screen.findByRole('button', { name: 'Abrir o chat' });
    fireEvent.click(screen.getByRole('button', { name: '💬 CHAT DA PARTIDA' }));
    await waitFor(() => expect(chamadas).toContain('/api/chat/?sala=partida%3A5'));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('o evento aceita sala que sumiu da lista: volta pra geral', async () => {
    const chamadas = simularServidor(roteador(salasJson()));
    render(<ChatFlutuante />);
    await screen.findByRole('button', { name: 'Abrir o chat' });
    act(() => { window.dispatchEvent(new CustomEvent(EVENTO_ABRIR_CHAT, { detail: { sala: 'partida:99' } })); });
    await waitFor(() => expect(chamadas).toContain('/api/chat/?sala=geral'));
    expect(chamadas).not.toContain('/api/chat/?sala=partida%3A99');
  });

  it('no painel do ADM o chat não aparece', async () => {
    rota.caminho = '/adm/partidas';
    const chamadas = simularServidor(roteador(salasJson()));
    render(<ChatFlutuante />);
    await waitFor(() => expect(chamadas).toContain('/api/chat/salas/'));
    expect(screen.queryByRole('button', { name: 'Abrir o chat' })).toBeNull();
  });
});
