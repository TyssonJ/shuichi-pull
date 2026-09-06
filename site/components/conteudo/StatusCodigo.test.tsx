import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusCodigo } from './StatusCodigo';

describe('StatusCodigo', () => {
  it('diz que está valendo quando não expirou', () => {
    render(<StatusCodigo expiraEm="2099-01-01" expiradoNoBuild={false} />);
    expect(screen.getByText(/funcionando/i)).toBeInTheDocument();
  });

  it('diz que expirou quando a data já passou', () => {
    render(<StatusCodigo expiraEm="2020-01-01" expiradoNoBuild={false} />);
    expect(screen.getByText(/expirado/i)).toBeInTheDocument();
  });

  it('recalcula no navegador em vez de confiar no build', () => {
    // O build dizia que estava valendo, mas a data ja passou faz tempo.
    render(<StatusCodigo expiraEm="2020-01-01" expiradoNoBuild={false} />);
    expect(screen.queryByText(/funcionando/i)).not.toBeInTheDocument();
  });

  it('código sem prazo aparece como sem data de expiração', () => {
    render(<StatusCodigo expiraEm={null} expiradoNoBuild={false} />);
    expect(screen.getByText(/sem prazo/i)).toBeInTheDocument();
  });
});
