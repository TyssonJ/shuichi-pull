import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Prosa } from './Prosa';

describe('Prosa', () => {
  it('quebra parágrafos em blocos separados', () => {
    render(<Prosa texto={'Primeiro.\n\nSegundo.'} />);
    expect(screen.getByText('Primeiro.')).toBeInTheDocument();
    expect(screen.getByText('Segundo.')).toBeInTheDocument();
  });

  it('vira lista quando as linhas começam com traço', () => {
    render(<Prosa texto={'- um\n- dois'} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('destaca o texto entre asteriscos duplos', () => {
    render(<Prosa texto={'Isto é **importante** mesmo.'} />);
    expect(screen.getByText('importante').tagName).toBe('STRONG');
  });

  it('mostra código entre crases em fonte mono', () => {
    render(<Prosa texto={'Digite `+voicerecord` no console.'} />);
    expect(screen.getByText('+voicerecord').tagName).toBe('CODE');
  });

  it('transforma link solto em link clicável', () => {
    render(<Prosa texto={'Veja discord.gg/KYkzy9n3HW para entrar.'} />);
    expect(screen.getByRole('link', { name: /discord\.gg/ }))
      .toHaveAttribute('href', 'https://discord.gg/KYkzy9n3HW');
  });

  it('não inventa link onde não há', () => {
    render(<Prosa texto={'Sem link nenhum aqui.'} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
