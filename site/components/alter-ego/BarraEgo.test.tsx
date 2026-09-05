import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BarraEgo } from './BarraEgo';

describe('BarraEgo', () => {
  beforeEach(() => localStorage.clear());

  it('mostra a busca e os links de seção', () => {
    render(<BarraEgo />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /elenco/i })).toBeInTheDocument();
  });

  it('lista resultados ao digitar', () => {
    render(<BarraEgo />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'chihiro' } });
    expect(screen.getByText('Chihiro Fujisaki')).toBeInTheDocument();
  });

  it('avisa quando não acha nada', () => {
    render(<BarraEgo />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzzzzzz' } });
    expect(screen.getByText(/não achei nada/i)).toBeInTheDocument();
  });

  it('lembra que a janela flutuante ficou aberta', () => {
    localStorage.setItem('ego-flutuante-aberta', 'true');
    render(<BarraEgo />);
    expect(screen.getByTestId('ego-flutuante')).toBeInTheDocument();
  });

  it('guarda o fechamento da janela flutuante', () => {
    localStorage.setItem('ego-flutuante-aberta', 'true');
    render(<BarraEgo />);
    fireEvent.click(screen.getByRole('button', { name: /fechar a janela/i }));
    expect(localStorage.getItem('ego-flutuante-aberta')).toBe('false');
  });
});
