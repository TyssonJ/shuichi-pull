import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Boot } from './Boot';

describe('Boot', () => {
  beforeEach(() => localStorage.clear());

  it('aparece na primeira visita', () => {
    render(<Boot />);
    expect(screen.getByTestId('boot')).toBeInTheDocument();
  });

  it('oferece pular', () => {
    render(<Boot />);
    expect(screen.getByRole('button', { name: /pular/i })).toBeInTheDocument();
  });

  it('não aparece para quem já visitou', () => {
    localStorage.setItem('ego-ja-visitou', 'true');
    render(<Boot />);
    expect(screen.queryByTestId('boot')).not.toBeInTheDocument();
  });

  it('marca a visita ao pular', () => {
    render(<Boot />);
    screen.getByRole('button', { name: /pular/i }).click();
    expect(localStorage.getItem('ego-ja-visitou')).toBe('true');
  });

  describe('números do catálogo na abertura', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('mostra os totais reais recebidos, não um número fixo', () => {
      render(<Boot contagens={{ alunos: 56, itens: 139, locais: 39 }} />);
      act(() => { vi.advanceTimersByTime(1500); });
      expect(screen.getByText('56 fichas de aluno · 139 itens · 39 locais')).toBeInTheDocument();
    });

    it('sem os totais, não inventa número', () => {
      render(<Boot />);
      act(() => { vi.advanceTimersByTime(1500); });
      expect(screen.getByText('fichas de aluno · itens · locais')).toBeInTheDocument();
      expect(document.body.textContent).not.toMatch(/162/);
    });
  });
});
