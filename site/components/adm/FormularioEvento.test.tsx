import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormularioEvento } from './FormularioEvento';

describe('FormularioEvento', () => {
  it('preenche os campos a partir de um evento existente', () => {
    render(<FormularioEvento
      evento={{ id: 'e1', tipo: 'noticia', titulo: 'Título', data: '2026-01-01', ate: null, destaque: false, autor: 'admin', resumo: 'resumo', corpo: 'corpo', imagemUrl: null }}
      aoSalvar={vi.fn()}
    />);
    expect(screen.getByDisplayValue('Título')).toBeInTheDocument();
  });

  it('chama aoSalvar com os dados preenchidos', () => {
    const aoSalvar = vi.fn();
    render(<FormularioEvento evento={null} aoSalvar={aoSalvar} />);

    fireEvent.change(screen.getByLabelText('Id'), { target: { value: 'novo-evento' } });
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Um título' } });
    fireEvent.change(screen.getByLabelText('Data'), { target: { value: '2026-02-01' } });
    fireEvent.change(screen.getByLabelText('Autor'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('Resumo'), { target: { value: 'r' } });
    fireEvent.change(screen.getByLabelText('Corpo'), { target: { value: 'c' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(aoSalvar).toHaveBeenCalledWith(expect.objectContaining({
      id: 'novo-evento', titulo: 'Um título', data: '2026-02-01', autor: 'admin', resumo: 'r', corpo: 'c',
    }));
  });

  it('mostra uma mensagem e mantém os dados quando salvar falha', async () => {
    const aoSalvar = vi.fn().mockRejectedValue(new Error('Banco fora do ar'));
    render(<FormularioEvento evento={null} aoSalvar={aoSalvar} />);

    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Um título' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Banco fora do ar');
    expect(screen.getByDisplayValue('Um título')).toBeInTheDocument();
  });
});
