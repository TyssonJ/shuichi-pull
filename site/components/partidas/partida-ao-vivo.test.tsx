import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Cronometro } from './Cronometro';
import { CartaoAoVivo, type DadosCartaoLobby } from './CartaoLobby';
import { ControlesHost } from './ControlesHost';
import { GestaoParticipantes, type InscritoGerido } from './GestaoParticipantes';
import { AvaliarParticipantes } from './AvaliarParticipantes';
import { Estrelas } from '@/components/perfil/Estrelas';

describe('Cronometro', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-21T20:42:07Z')); });
  afterEach(() => vi.useRealTimers());

  it('mostra o tempo desde o início e anda a cada segundo', () => {
    render(<Cronometro desdeIso="2026-09-21T20:00:00Z" />);
    expect(screen.getByTestId('cronometro')).toHaveTextContent('00:42:07');
    act(() => { vi.advanceTimersByTime(3000); });
    expect(screen.getByTestId('cronometro')).toHaveTextContent('00:42:10');
  });

  it('passa da hora sem quebrar o formato', () => {
    render(<Cronometro desdeIso="2026-09-21T18:30:00Z" />);
    expect(screen.getByTestId('cronometro')).toHaveTextContent('02:12:07');
  });
});

describe('CartaoAoVivo', () => {
  const dados: DadosCartaoLobby = {
    id: 3, titulo: 'Sala do Tyson', capaUrl: null, hostNome: 'Tyson', dataHoraIso: '2026-09-21T20:00:00Z',
    dataHoraTexto: '21/09 17:00', vagas: 16, ocupadas: 9, reservas: 1, inscritos: [], voceInscrito: true,
    iniciadaEmIso: '2026-09-21T20:00:00Z',
  };

  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-21T20:05:00Z')); });
  afterEach(() => vi.useRealTimers());

  it('AO VIVO, título, host, link da sala e cronômetro', () => {
    render(<CartaoAoVivo d={dados} />);
    expect(screen.getByText('AO VIVO')).toBeInTheDocument();
    expect(screen.getByText('Sala do Tyson')).toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('href')).toMatch(/^\/partidas\/3\/?$/);
    expect(screen.getByText('VOCÊ ESTÁ NA PARTIDA')).toBeInTheDocument();
    expect(screen.getByTestId('cronometro')).toHaveTextContent('00:05:00');
  });
});

describe('ControlesHost — Começar / Finalizar', () => {
  const props = (status: 'agendada' | 'em_andamento' | 'finalizada', aoMudarStatus = vi.fn().mockResolvedValue({ ok: true, dados: undefined })) => ({
    partidaId: 3, status, participantes: [], aoMudarStatus,
    inicial: { titulo: 'T', dataHora: '2026-09-21T20:00', regras: '', capaUrl: '', vagas: 16 },
    relatorioInicial: { capitulo: '', blackened: '', mvpDiscordIds: [], resultado: null },
    aoAtualizar: vi.fn(), aoSalvarRelatorio: vi.fn(),
  });

  beforeEach(() => { vi.spyOn(window, 'confirm').mockReturnValue(true); });
  afterEach(() => vi.restoreAllMocks());

  it('agendada: o botão de Começar dispara a mudança pra em andamento', async () => {
    const p = props('agendada');
    render(<ControlesHost {...p} />);
    expect(screen.queryByRole('button', { name: /Finalizar/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Começar partida/ }));
    await waitFor(() => expect(p.aoMudarStatus).toHaveBeenCalledWith(3, 'em_andamento'));
  });

  it('em andamento: aparece Finalizar (não Começar) e ele finaliza', async () => {
    const p = props('em_andamento');
    render(<ControlesHost {...p} />);
    expect(screen.queryByRole('button', { name: /Começar/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Finalizar partida/ }));
    await waitFor(() => expect(p.aoMudarStatus).toHaveBeenCalledWith(3, 'finalizada'));
  });

  it('cancelar no confirm não muda nada', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const p = props('agendada');
    render(<ControlesHost {...p} />);
    fireEvent.click(screen.getByRole('button', { name: /Começar partida/ }));
    expect(p.aoMudarStatus).not.toHaveBeenCalled();
  });

  it('erro de regra vem do envelope e aparece', async () => {
    const p = props('agendada', vi.fn().mockResolvedValue({ ok: false, erro: 'Só o host desta partida pode fazer isso.' }));
    render(<ControlesHost {...p} />);
    fireEvent.click(screen.getByRole('button', { name: /Começar partida/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Só o host');
  });
});

describe('GestaoParticipantes', () => {
  const inscritos: InscritoGerido[] = [
    { discordId: 'host1', nome: 'Host', personagemId: 'monokuma', tipo: 'participante', convidado: true },
    { discordId: 'a', nome: 'Ana', personagemId: 'makoto', tipo: 'participante', convidado: false },
    { discordId: 'b', nome: 'Beto', personagemId: null, tipo: 'reserva', convidado: false },
  ];
  const montar = (extra: Partial<React.ComponentProps<typeof GestaoParticipantes>> = {}) => {
    const p = {
      partidaId: 3, hostDiscordId: 'host1', inscritos,
      personagens: [{ id: 'makoto', nome: 'Makoto Naegi' }, { id: 'kaede', nome: 'Kaede Akamatsu' }],
      aoTrocar: vi.fn().mockResolvedValue({ ok: true, dados: undefined }),
      aoRemover: vi.fn().mockResolvedValue({ ok: true, dados: undefined }),
      aoConvidado: vi.fn().mockResolvedValue({ ok: true, dados: undefined }),
      ...extra,
    };
    render(<GestaoParticipantes {...p} />);
    return p;
  };

  it('mostra o progresso da checklist de convites', () => {
    montar();
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('marcar "convidado" responde na hora e avisa o servidor', async () => {
    const p = montar();
    fireEvent.click(screen.getByLabelText('Já convidei Ana pra party'));
    expect(screen.getByText('2/3')).toBeInTheDocument();
    await waitFor(() => expect(p.aoConvidado).toHaveBeenCalledWith(3, 'a', true));
  });

  it('se o servidor recusar, a marcação volta atrás e o erro aparece', async () => {
    montar({ aoConvidado: vi.fn().mockResolvedValue({ ok: false, erro: 'Essa partida já terminou.' }) });
    fireEvent.click(screen.getByLabelText('Já convidei Ana pra party'));
    expect(await screen.findByRole('alert')).toHaveTextContent('já terminou');
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('trocar o personagem e a vaga chama a ação com os valores certos', async () => {
    const p = montar();
    fireEvent.change(screen.getByLabelText('Personagem de Ana'), { target: { value: 'kaede' } });
    await waitFor(() => expect(p.aoTrocar).toHaveBeenCalledWith(3, 'a', 'kaede', 'participante'));

    fireEvent.change(screen.getByLabelText('Vaga de Ana'), { target: { value: 'reserva' } });
    await waitFor(() => expect(p.aoTrocar).toHaveBeenCalledWith(3, 'a', 'makoto', 'reserva'));
  });

  it('só o host tem a opção Monokuma', () => {
    montar();
    expect(screen.getByLabelText('Personagem de Host').querySelector('option[value="monokuma"]')).not.toBeNull();
    expect(screen.getByLabelText('Personagem de Ana').querySelector('option[value="monokuma"]')).toBeNull();
  });

  it('expulsar pede confirmação e só então chama a ação', async () => {
    const p = montar();
    fireEvent.click(screen.getAllByRole('button', { name: 'expulsar' })[1]);
    expect(p.aoRemover).not.toHaveBeenCalled();
    expect(screen.getByText(/Tirar Ana da partida/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Expulsar' }));
    await waitFor(() => expect(p.aoRemover).toHaveBeenCalledWith(3, 'a'));
  });
});

describe('Estrelas', () => {
  it('preenche a proporção da nota (média fracionada)', () => {
    const { container } = render(<Estrelas valor={3.5} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '3,5 de 5 estrelas');
    expect((container.querySelectorAll('span[aria-hidden]')[1] as HTMLElement).style.width).toBe('70%');
  });

  it('valores fora de 0–5 são limitados', () => {
    const { container } = render(<Estrelas valor={9} />);
    expect((container.querySelectorAll('span[aria-hidden]')[1] as HTMLElement).style.width).toBe('100%');
  });
});

describe('AvaliarParticipantes — estrelas e texto obrigatório', () => {
  const participantes = [
    { discordId: 'a', nome: 'Ana', media: 4.5, total: 2, minhaEstrelas: null, meuComentario: '' },
    { discordId: 'b', nome: 'Beto', media: null, total: 0, minhaEstrelas: 3, meuComentario: 'foi ok' },
  ];
  const montar = (aoAvaliar = vi.fn().mockResolvedValue({ ok: true, dados: undefined })) => {
    const aoRemover = vi.fn().mockResolvedValue({ ok: true, dados: undefined });
    render(<AvaliarParticipantes partidaId={3} participantes={participantes} aoAvaliar={aoAvaliar} aoRemover={aoRemover} />);
    return { aoAvaliar, aoRemover };
  };
  const cartao = (nome: string) => screen.getByLabelText(`Avaliação escrita sobre ${nome}`).closest('li') as HTMLElement;

  it('escolhe de 0 a 5 estrelas, escreve e envia', async () => {
    const { aoAvaliar } = montar();
    const ana = cartao('Ana');
    fireEvent.click(ana.querySelector('[aria-label="4 estrelas"]')!);
    fireEvent.change(screen.getByLabelText('Avaliação escrita sobre Ana'), { target: { value: 'ótima interpretação' } });
    fireEvent.click(ana.querySelector('button.rounded-\\[3px\\]')!);
    await waitFor(() => expect(aoAvaliar).toHaveBeenCalledWith(3, 'a', 4, 'ótima interpretação'));
    expect(await screen.findByText('Avaliação salva.')).toBeInTheDocument();
  });

  it('a nota 0 existe (botão à parte) e é enviada', async () => {
    const { aoAvaliar } = montar();
    const ana = cartao('Ana');
    fireEvent.click(ana.querySelector('[aria-label="0 estrelas"]')!);
    fireEvent.change(screen.getByLabelText('Avaliação escrita sobre Ana'), { target: { value: 'não apareceu' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar avaliação' }));
    await waitFor(() => expect(aoAvaliar).toHaveBeenCalledWith(3, 'a', 0, 'não apareceu'));
  });

  it('sem escolher a nota não envia', () => {
    const { aoAvaliar } = montar();
    fireEvent.click(screen.getByRole('button', { name: 'Enviar avaliação' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Escolha a nota');
    expect(aoAvaliar).not.toHaveBeenCalled();
  });

  it('o texto obrigatório é imposto pelo servidor: a mensagem dele aparece', async () => {
    montar(vi.fn().mockResolvedValue({ ok: false, erro: 'Escreva a avaliação (mínimo 5 caracteres).' }));
    fireEvent.click(cartao('Ana').querySelector('[aria-label="5 estrelas"]')!);
    fireEvent.click(screen.getByRole('button', { name: 'Enviar avaliação' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Escreva a avaliação');
  });

  it('mostra a nota que eu já dei e a média dos outros; dá pra atualizar ou apagar', async () => {
    const { aoRemover } = montar();
    expect(screen.getByDisplayValue('foi ok')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Atualizar avaliação' })).toBeInTheDocument();
    expect(screen.getByText('4,5 (2)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'apagar a minha' }));
    await waitFor(() => expect(aoRemover).toHaveBeenCalledWith(3, 'b'));
  });
});
