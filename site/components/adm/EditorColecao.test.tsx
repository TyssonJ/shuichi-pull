import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditorColecao } from './EditorColecao';

const campos = [{ rotulo: 'Nome', caminho: 'nome' }];
const registros = [{ id: 'a', nome: 'Original' }, { id: 'b', nome: 'Outro' }];

describe('EditorColecao', () => {
  it('lista os registros pelo campo id/rotulo', () => {
    render(<EditorColecao registros={registros} campos={campos} correcoes={new Map()}
      aoSalvar={vi.fn()} aoReverter={vi.fn()} />);

    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
  });

  it('abre um registro e mostra o valor atual do campo', () => {
    render(<EditorColecao registros={registros} campos={campos} correcoes={new Map()}
      aoSalvar={vi.fn()} aoReverter={vi.fn()} />);

    fireEvent.click(screen.getByText('a'));

    expect(screen.getByDisplayValue('Original')).toBeInTheDocument();
  });

  it('salva ao sair do campo com um valor novo, passando o valor base atual', async () => {
    const aoSalvar = vi.fn().mockResolvedValue(undefined);
    render(<EditorColecao registros={registros} campos={campos} correcoes={new Map()}
      aoSalvar={aoSalvar} aoReverter={vi.fn()} />);

    fireEvent.click(screen.getByText('a'));
    const input = screen.getByDisplayValue('Original');
    fireEvent.change(input, { target: { value: 'Corrigido' } });
    fireEvent.blur(input);

    await waitFor(() => expect(aoSalvar).toHaveBeenCalledWith({
      registroId: 'a', campo: 'nome', valor: 'Corrigido', valorBase: 'Original',
    }));
  });

  it('não chama aoSalvar quando o valor não mudou', () => {
    const aoSalvar = vi.fn();
    render(<EditorColecao registros={registros} campos={campos} correcoes={new Map()}
      aoSalvar={aoSalvar} aoReverter={vi.fn()} />);

    fireEvent.click(screen.getByText('a'));
    fireEvent.blur(screen.getByDisplayValue('Original'));

    expect(aoSalvar).not.toHaveBeenCalled();
  });

  it('mostra uma mensagem e mantém o valor digitado quando salvar falha', async () => {
    const aoSalvar = vi.fn().mockRejectedValue(new Error('Banco fora do ar'));
    render(<EditorColecao registros={registros} campos={campos} correcoes={new Map()}
      aoSalvar={aoSalvar} aoReverter={vi.fn()} />);

    fireEvent.click(screen.getByText('a'));
    const input = screen.getByDisplayValue('Original');
    fireEvent.change(input, { target: { value: 'Corrigido' } });
    fireEvent.blur(input);

    expect(await screen.findByRole('alert')).toHaveTextContent('Banco fora do ar');
    expect(screen.getByDisplayValue('Corrigido')).toBeInTheDocument();
  });

  it('mostra o botão reverter só quando o campo tem correção', () => {
    const correcoes = new Map([['a', new Map([['nome', { valor: 'Corrigido', valorBase: 'Original', autor: '1', criadoEm: '2026-01-01' }]])]]);
    render(<EditorColecao registros={registros} campos={campos} correcoes={correcoes}
      aoSalvar={vi.fn()} aoReverter={vi.fn()} />);

    fireEvent.click(screen.getByText('a'));

    expect(screen.getByRole('button', { name: 'Reverter' })).toBeInTheDocument();
  });

  it('chama aoReverter com registroId e campo', () => {
    const aoReverter = vi.fn();
    const correcoes = new Map([['a', new Map([['nome', { valor: 'Corrigido', valorBase: 'Original', autor: '1', criadoEm: '2026-01-01' }]])]]);
    render(<EditorColecao registros={registros} campos={campos} correcoes={correcoes}
      aoSalvar={vi.fn()} aoReverter={aoReverter} />);

    fireEvent.click(screen.getByText('a'));
    fireEvent.click(screen.getByRole('button', { name: 'Reverter' }));

    expect(aoReverter).toHaveBeenCalledWith({ registroId: 'a', campo: 'nome' });
  });

  it('avisa quando o jogo mudou o valor base de uma correção existente', () => {
    const correcoes = new Map([['a', new Map([['nome', { valor: 'Corrigido', valorBase: 'Valor antigo do jogo', autor: '1', criadoEm: '2026-01-01' }]])]]);
    render(<EditorColecao registros={registros} campos={campos} correcoes={correcoes}
      aoSalvar={vi.fn()} aoReverter={vi.fn()} />);

    fireEvent.click(screen.getByText('a'));

    expect(screen.getByText(/o jogo mudou isto/i)).toBeInTheDocument();
  });

  it('separa correções sem registro correspondente num grupo à parte', () => {
    const correcoes = new Map([['registro-removido', new Map([['nome', { valor: 'X', valorBase: 'Y', autor: '1', criadoEm: '2026-01-01' }]])]]);
    render(<EditorColecao registros={registros} campos={campos} correcoes={correcoes}
      aoSalvar={vi.fn()} aoReverter={vi.fn()} />);

    expect(screen.getByText(/correções sem registro correspondente/i)).toBeInTheDocument();
    expect(screen.getByText('registro-removido')).toBeInTheDocument();
  });
});
