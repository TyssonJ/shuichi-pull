import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tecla } from './Tecla';

describe('Tecla', () => {
  it('mostra cada tecla numa capa própria', () => {
    render(<Tecla combinacao="Shift + W" />);
    expect(screen.getByText('Shift')).toBeInTheDocument();
    expect(screen.getByText('W')).toBeInTheDocument();
  });

  it('mantém o sinal de mais entre as teclas', () => {
    render(<Tecla combinacao="Space + Ctrl" />);
    expect(screen.getAllByText('+')).toHaveLength(1);
  });

  it('trata barra como alternativa', () => {
    render(<Tecla combinacao="W / WA / WD" />);
    expect(screen.getAllByText('/')).toHaveLength(2);
  });

  it('lê a combinação inteira para leitor de tela', () => {
    render(<Tecla combinacao="Alt + E" />);
    expect(screen.getByRole('group')).toHaveAccessibleName('Alt + E');
  });
});
