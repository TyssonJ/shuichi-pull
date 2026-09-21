import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { SeloCargo } from './SeloCargo';
import { Conquistas, type ConquistaExibida } from './Conquistas';
import { GerenciarCargos, type CargoGerido } from '@/components/adm/GerenciarCargos';
import { GerenciarConquistas, type ConquistaGerida } from '@/components/adm/GerenciarConquistas';

vi.mock('@/components/midia/EnviarArquivo', () => ({
  EnviarArquivo: ({ aoConcluir }: { aoConcluir: (a: { url: string }) => void }) => (
    <button type="button" onClick={() => aoConcluir({ url: 'https://blob.example/icone.png' })}>ENVIAR MOCK</button>
  ),
}));

const ok = () => vi.fn().mockResolvedValue({ ok: true, dados: undefined });

describe('SeloCargo', () => {
  it('usa a cor do cargo e texto legível sobre ela', () => {
    render(<><SeloCargo nome="Claro" cor="#f5d30e" /><SeloCargo nome="Escuro" cor="#7a1fa2" /></>);
    expect(screen.getByText('Claro')).toHaveStyle({ backgroundColor: '#f5d30e', color: '#08090D' });
    expect(screen.getByText('Escuro')).toHaveStyle({ backgroundColor: '#7a1fa2', color: '#F2F2F5' });
  });
});

describe('Conquistas (perfil)', () => {
  const lista: ConquistaExibida[] = [
    { id: 1, nome: 'Detetive Nato', descricaoCurta: 'Resolveu 5 casos', descricaoLonga: 'Prendeu o culpado em 5 partidas.', iconeUrl: '/a.png', concedidaEm: '21/09/2026', motivo: 'Torneio de setembro' },
    { id: 2, nome: 'Calouro', descricaoCurta: 'Primeira partida', descricaoLonga: '', iconeUrl: '/b.png', concedidaEm: '17/09/2026', motivo: null },
  ];

  it('sem conquistas, avisa', () => {
    render(<Conquistas conquistas={[]} />);
    expect(screen.getByText('Nenhuma conquista ainda.')).toBeInTheDocument();
  });

  it('mostra nome e descrição curta; a completa só aparece ao clicar, e clicar de novo fecha', () => {
    render(<Conquistas conquistas={lista} />);
    expect(screen.getByText('CONQUISTAS (2)')).toBeInTheDocument();
    expect(screen.queryByText(/Prendeu o culpado/)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Detetive Nato/ }));
    expect(screen.getByText('Prendeu o culpado em 5 partidas.')).toBeInTheDocument();
    expect(screen.getByText('“Torneio de setembro”')).toBeInTheDocument();
    expect(screen.getByText('conquistada em 21/09/2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Detetive Nato/ })).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('button', { name: /Detetive Nato/ }));
    expect(screen.queryByText(/Prendeu o culpado/)).toBeNull();
  });

  it('sem descrição completa, abre a curta; abrir outra troca a aberta', () => {
    render(<Conquistas conquistas={lista} />);
    fireEvent.click(screen.getByRole('button', { name: /Calouro/ }));
    const regiao = screen.getByRole('region', { name: 'Conquista Calouro' });
    expect(within(regiao).getByText('Primeira partida')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Detetive Nato/ }));
    expect(screen.queryByRole('region', { name: 'Conquista Calouro' })).toBeNull();
  });
});

describe('GerenciarCargos', () => {
  const cargos: CargoGerido[] = [{ id: 3, nome: 'Calouro', cor: '#00ff66', portadores: [{ discordId: '42', nome: 'Ana' }] }];
  const usuarios = [{ discordId: '42', nome: 'Ana' }, { discordId: '43', nome: 'Beto' }];
  const montar = (extra: Partial<React.ComponentProps<typeof GerenciarCargos>> = {}) => {
    const p = {
      cargos, usuarios,
      aoCriar: vi.fn().mockResolvedValue({ ok: true, dados: 9 }), aoAtualizar: ok(), aoExcluir: ok(), aoConceder: ok(), aoRetirar: ok(), ...extra,
    };
    render(<GerenciarCargos {...p} />);
    return p;
  };

  it('cria um cargo com nome e cor', async () => {
    const p = montar();
    fireEvent.click(screen.getByRole('button', { name: '+ NOVO CARGO' }));
    fireEvent.change(screen.getByLabelText(/^Nome do cargo/), { target: { value: 'Veterano' } });
    fireEvent.change(screen.getByLabelText('Cor em hexadecimal'), { target: { value: '#F5D30E' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar cargo' }));
    await waitFor(() => expect(p.aoCriar).toHaveBeenCalledWith({ nome: 'Veterano', cor: '#F5D30E' }));
  });

  it('nome curto e cor inválida mostram o motivo e travam o botão', () => {
    montar();
    fireEvent.click(screen.getByRole('button', { name: '+ NOVO CARGO' }));
    fireEvent.change(screen.getByLabelText(/^Nome do cargo/), { target: { value: 'a' } });
    expect(screen.getByText(/ao menos 2/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar cargo' })).toBeDisabled();
  });

  it('entrega a alguém (que ainda não tem) e retira de quem tem', async () => {
    const p = montar();
    fireEvent.click(screen.getByRole('button', { name: /Calouro/ }));
    const select = screen.getByLabelText('Jogador');
    expect(within(select).queryByText('Ana')).toBeNull();
    fireEvent.change(select, { target: { value: '43' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entregar' }));
    await waitFor(() => expect(p.aoConceder).toHaveBeenCalledWith('43', 3));

    fireEvent.click(screen.getByRole('button', { name: 'Retirar o cargo de Ana' }));
    await waitFor(() => expect(p.aoRetirar).toHaveBeenCalledWith('42', 3));
  });

  it('apagar pede confirmação; erro do servidor aparece', async () => {
    const p = montar({ aoExcluir: vi.fn().mockResolvedValue({ ok: false, erro: 'Esse cargo não existe mais.' }) });
    fireEvent.click(screen.getByRole('button', { name: /Calouro/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Apagar cargo' }));
    expect(p.aoExcluir).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('não existe mais');
  });
});

describe('GerenciarConquistas', () => {
  const conquistas: ConquistaGerida[] = [{
    id: 4, nome: 'Detetive Nato', descricaoCurta: 'Resolveu 5 casos', descricaoLonga: 'Detalhes.', iconeUrl: 'https://i.imgur.com/a.png',
    portadores: [{ discordId: '42', nome: 'Ana' }],
  }];
  const usuarios = [{ discordId: '42', nome: 'Ana' }, { discordId: '43', nome: 'Beto' }];
  const montar = () => {
    const p = {
      conquistas, usuarios,
      aoCriar: vi.fn().mockResolvedValue({ ok: true, dados: 9 }), aoAtualizar: ok(), aoExcluir: ok(), aoConceder: ok(), aoRetirar: ok(),
    };
    render(<GerenciarConquistas {...p} />);
    return p;
  };

  it('o botão de enviar ícone preenche o link e a prévia', async () => {
    const p = montar();
    fireEvent.click(screen.getByRole('button', { name: '+ NOVA CONQUISTA' }));
    fireEvent.click(screen.getByRole('button', { name: 'ENVIAR MOCK' }));
    expect(screen.getByLabelText('Link do ícone')).toHaveValue('https://blob.example/icone.png');
    expect(screen.getByAltText('Prévia do ícone')).toHaveAttribute('src', 'https://blob.example/icone.png');
    expect(p.aoCriar).not.toHaveBeenCalled();
  });

  it('entrega com motivo e retira', async () => {
    const p = montar();
    fireEvent.click(screen.getByRole('button', { name: /Detetive Nato/ }));
    fireEvent.change(screen.getByLabelText('Jogador'), { target: { value: '43' } });
    fireEvent.change(screen.getByLabelText('Motivo'), { target: { value: 'venceu o torneio' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entregar' }));
    await waitFor(() => expect(p.aoConceder).toHaveBeenCalledWith('43', 4, 'venceu o torneio'));

    fireEvent.click(screen.getByRole('button', { name: 'Retirar a conquista de Ana' }));
    await waitFor(() => expect(p.aoRetirar).toHaveBeenCalledWith('42', 4));
  });

  it('salvar edição só habilita depois de mudar algo', async () => {
    const p = montar();
    fireEvent.click(screen.getByRole('button', { name: /Detetive Nato/ }));
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/^Descrição curta/), { target: { value: 'Resolveu 6 casos' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(p.aoAtualizar).toHaveBeenCalledWith(4, expect.objectContaining({ descricaoCurta: 'Resolveu 6 casos' })));
  });
});
