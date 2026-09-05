import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Regua } from './Regua';

const velocidades = [
  ...Array(7).fill(180), ...Array(3).fill(185), ...Array(10).fill(190),
  ...Array(7).fill(195), ...Array(10).fill(200), ...Array(6).fill(205),
  ...Array(4).fill(210), ...Array(4).fill(215), ...Array(3).fill(220), 225, 230,
];

describe('Regua', () => {
  const props = {
    nome: 'VELOCIDADE', valor: 180, unidade: 'u/s',
    valores: velocidades, passo: 5, maiorEhMelhor: true, sentido: 'mais rápido',
  };

  it('mostra o nome, o valor e a unidade', () => {
    render(<Regua {...props} />);
    expect(screen.getByText('VELOCIDADE')).toBeInTheDocument();
    expect(screen.getByText('180', { selector: '.valor-grande' })).toBeInTheDocument();
    expect(screen.getByText('u/s')).toBeInTheDocument();
  });

  it('mostra a frase de posição em português', () => {
    render(<Regua {...props} />);
    expect(screen.getByText(/no grupo mais baixo · 7 de 56 empatam/)).toBeInTheDocument();
  });

  it('rotula as pontas da escala com mínimo e máximo', () => {
    render(<Regua {...props} />);
    expect(screen.getByText(/^180$/, { selector: '.ponta-min' })).toBeInTheDocument();
    expect(screen.getByText(/^230$/, { selector: '.ponta-max' })).toBeInTheDocument();
  });

  it('explica o sentido do eixo', () => {
    render(<Regua {...props} />);
    expect(screen.getByText('mais rápido →')).toBeInTheDocument();
  });

  it('desenha uma coluna por valor da escala', () => {
    render(<Regua {...props} />);
    expect(screen.getAllByTestId('coluna')).toHaveLength(11);
  });

  it('marca a coluna do personagem', () => {
    render(<Regua {...props} />);
    const marcadas = screen.getAllByTestId('coluna').filter(
      (c) => c.getAttribute('data-ativa') === 'true'
    );
    expect(marcadas).toHaveLength(1);
  });

  it('descreve o gráfico para leitor de tela', () => {
    render(<Regua {...props} />);
    expect(screen.getByRole('img', { name: /VELOCIDADE.*180.*média/i })).toBeInTheDocument();
  });
});
