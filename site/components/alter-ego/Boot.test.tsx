import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
