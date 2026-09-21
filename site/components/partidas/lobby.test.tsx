import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { BarraVagas } from './BarraVagas';
import { IconesInscritos } from './IconesInscritos';
import { Contagem } from './Contagem';

describe('BarraVagas', () => {
  it('descreve a lotação pra leitor de tela', () => {
    render(<BarraVagas ocupadas={7} total={16} />);
    expect(screen.getByRole('img', { name: '7 de 16 vagas ocupadas; 0 reservas, que não contam como vaga' })).toBeInTheDocument();
    expect(screen.getByText(/07\/16 VAGAS/)).toBeInTheDocument();
  });

  it('mostra a quantidade de reservas num quadrado amarelo, sem contar como vaga', () => {
    const { container } = render(<BarraVagas ocupadas={7} total={16} reservas={3} />);
    expect(screen.getByRole('img', { name: '7 de 16 vagas ocupadas; 3 reservas, que não contam como vaga' })).toBeInTheDocument();
    expect(screen.getByText(/03 RESERVAS/)).toBeInTheDocument();
    expect(screen.getByText(/07\/16 VAGAS/)).toBeInTheDocument();
    // o quadrado amarelo é o da legenda: a fileira de vagas continua com 16 casinhas
    expect(container.querySelectorAll('div > span')).toHaveLength(16);
    expect(container.querySelector('p span.bg-\\[\\#F5D30E\\]')).not.toBeNull();
  });

  it('uma reserva fica no singular; sem reserva o quadrado aparece apagado', () => {
    const { container, rerender } = render(<BarraVagas ocupadas={1} total={16} reservas={1} />);
    expect(screen.getByText(/01 RESERVA(?!S)/)).toBeInTheDocument();
    rerender(<BarraVagas ocupadas={1} total={16} />);
    expect(screen.getByText(/00 RESERVAS/)).toBeInTheDocument();
    expect(container.querySelector('p span.opacity-40')).not.toBeNull();
  });

  it('avisa quando lotou', () => {
    render(<BarraVagas ocupadas={16} total={16} />);
    expect(screen.getByText(/LOTADA/)).toBeInTheDocument();
  });

  it('ocupação acima do total não estoura a barra', () => {
    const { container } = render(<BarraVagas ocupadas={20} total={16} />);
    expect(container.querySelectorAll('div > span')).toHaveLength(16);
  });
});

describe('IconesInscritos', () => {
  it('sala vazia convida a entrar', () => {
    render(<IconesInscritos inscritos={[]} />);
    expect(screen.getByText(/SALA VAZIA/)).toBeInTheDocument();
  });

  it('vaga genérica vira "?", reserva ganha borda âmbar e o nome vai no title', () => {
    render(
      <IconesInscritos
        inscritos={[
          { src: null, tipo: 'participante', nome: 'vaga genérica' },
          { src: '/sprites/pixel/makoto-naegi.png', tipo: 'reserva', nome: 'Makoto Naegi' },
        ]}
      />,
    );
    expect(screen.getByText('?')).toBeInTheDocument();
    const reserva = screen.getByTitle('Makoto Naegi (reserva)');
    expect(reserva.className).toMatch(/border-amber/);
    expect(reserva.querySelector('img')).toHaveAttribute('src', '/sprites/pixel/makoto-naegi.png');
  });

  it('corta no máximo e mostra quantos ficaram de fora', () => {
    const muitos = Array.from({ length: 20 }, () => ({ src: null, tipo: 'participante' as const, nome: 'x' }));
    render(<IconesInscritos inscritos={muitos} max={14} />);
    expect(screen.getByText('+6')).toBeInTheDocument();
  });
});

describe('Contagem', () => {
  afterEach(() => vi.useRealTimers());

  it('mostra o tempo restante e anda a cada segundo na reta final', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-21T12:00:00Z'));
    render(<Contagem dataHora="2026-09-21T12:12:05Z" />);
    expect(screen.getByTestId('contagem')).toHaveTextContent('12m 05s');

    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByTestId('contagem')).toHaveTextContent('12m 04s');
  });

  it('depois do horário mostra AGORA', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-21T12:00:00Z'));
    render(<Contagem dataHora="2026-09-21T11:00:00Z" />);
    expect(screen.getByTestId('contagem')).toHaveTextContent('AGORA');
  });
});
