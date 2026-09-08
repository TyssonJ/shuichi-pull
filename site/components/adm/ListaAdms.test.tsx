import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ListaAdms } from './ListaAdms';

const adms = [
  { discordId: '1', nome: 'Fulano', papel: 'adm' as const, promovidoPor: '9', criadoEm: new Date() },
  { discordId: '9', nome: 'Chefe', papel: 'chefe' as const, promovidoPor: null, criadoEm: new Date() },
];

describe('ListaAdms', () => {
  it('lista os administradores', () => {
    render(<ListaAdms adms={adms} aoPromover={vi.fn()} aoRebaixar={vi.fn()} />);
    expect(screen.getByText('Fulano')).toBeInTheDocument();
    expect(screen.getByText('Chefe')).toBeInTheDocument();
  });

  it('adiciona um novo adm pelo Discord ID e limpa o formulário quando dá certo', async () => {
    const aoPromover = vi.fn().mockResolvedValue(undefined);
    render(<ListaAdms adms={adms} aoPromover={aoPromover} aoRebaixar={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Discord ID'), { target: { value: '555' } });
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Novo ADM' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(aoPromover).toHaveBeenCalledWith({ discordId: '555', nome: 'Novo ADM', papel: 'adm' });
    await waitFor(() => expect(screen.getByLabelText('Discord ID')).toHaveValue(''));
  });

  it('mantém o que foi digitado e mostra uma mensagem quando promover falha', async () => {
    const aoPromover = vi.fn().mockRejectedValue(new Error('Banco fora do ar'));
    render(<ListaAdms adms={adms} aoPromover={aoPromover} aoRebaixar={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Discord ID'), { target: { value: '555' } });
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Novo ADM' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Banco fora do ar');
    expect(screen.getByLabelText('Discord ID')).toHaveValue('555');
    expect(screen.getByLabelText('Nome')).toHaveValue('Novo ADM');
  });

  it('rebaixa clicando no botão da linha', () => {
    const aoRebaixar = vi.fn();
    render(<ListaAdms adms={adms} aoPromover={vi.fn()} aoRebaixar={aoRebaixar} />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Rebaixar' })[0]);

    expect(aoRebaixar).toHaveBeenCalledWith('1');
  });
});
