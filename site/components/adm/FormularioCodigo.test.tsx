import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormularioCodigo } from './FormularioCodigo';

describe('FormularioCodigo', () => {
  it('preenche os campos a partir de um código existente', () => {
    render(<FormularioCodigo
      codigo={{ codigo: 'X2026', recompensa: '100 moedas', descricao: 'd', expiraEm: null, fonte: null }}
      aoSalvar={vi.fn()}
    />);
    expect(screen.getByDisplayValue('X2026')).toBeInTheDocument();
  });

  it('chama aoSalvar com os dados preenchidos', () => {
    const aoSalvar = vi.fn();
    render(<FormularioCodigo codigo={null} aoSalvar={aoSalvar} />);

    fireEvent.change(screen.getByLabelText('Código'), { target: { value: 'NOVO2026' } });
    fireEvent.change(screen.getByLabelText('Recompensa'), { target: { value: '200 moedas' } });
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'd' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(aoSalvar).toHaveBeenCalledWith(expect.objectContaining({
      codigo: 'NOVO2026', recompensa: '200 moedas', descricao: 'd',
    }));
  });

  it('mostra uma mensagem e mantém os dados quando salvar falha', async () => {
    const aoSalvar = vi.fn().mockRejectedValue(new Error('Banco fora do ar'));
    render(<FormularioCodigo codigo={null} aoSalvar={aoSalvar} />);

    fireEvent.change(screen.getByLabelText('Recompensa'), { target: { value: '300 moedas' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Banco fora do ar');
    expect(screen.getByDisplayValue('300 moedas')).toBeInTheDocument();
  });
});
