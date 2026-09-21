import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { EditorConteudo } from './EditorConteudo';
import type { RegistroEditor } from '@/lib/adm/montar-registros';
import type { CampoEditor } from '@/lib/adm/campos-editor';

const campos: CampoEditor[] = [
  { chave: 'secao', rotulo: 'Seção', soNovo: true },
  { chave: 'pergunta', rotulo: 'Pergunta' },
  { chave: 'resposta', rotulo: 'Resposta', longo: true },
];

const guia: RegistroEditor = {
  id: 'como-jogo', titulo: 'Como jogo?', grupo: 'Primeiros passos', origem: 'guia', alterado: false,
  valores: { secao: 'Primeiros passos', pergunta: 'Como jogo?', resposta: 'Instale o GMod.' },
  originais: { secao: 'Primeiros passos', pergunta: 'Como jogo?', resposta: 'Instale o GMod.' },
};
const novo: RegistroEditor = {
  id: 'minha', titulo: 'Minha pergunta?', grupo: 'Regras', origem: 'novo', alterado: false,
  valores: { secao: 'Regras', pergunta: 'Minha pergunta?', resposta: 'Resposta minha.' }, originais: null,
};

function montar(extra: Partial<React.ComponentProps<typeof EditorConteudo>> = {}) {
  const props = {
    colecao: 'faq' as const,
    singular: 'pergunta',
    campos,
    registros: [guia, novo],
    preview: 'faq' as const,
    aoSalvar: vi.fn().mockResolvedValue(undefined),
    aoReverter: vi.fn().mockResolvedValue(undefined),
    aoCriar: vi.fn().mockResolvedValue('criada'),
    aoExcluir: vi.fn().mockResolvedValue(undefined),
    aoRestaurar: vi.fn().mockResolvedValue(undefined),
    ...extra,
  };
  render(<EditorConteudo {...props} />);
  return props;
}

const abrir = (titulo: string) => fireEvent.click(within(screen.getByLabelText('Lista de pergunta')).getByText(titulo));

describe('EditorConteudo', () => {
  it('lista os registros, com selo NOVO nos criados no painel', () => {
    montar();
    expect(screen.getByText('Como jogo?')).toBeInTheDocument();
    expect(screen.getByText('NOVO')).toBeInTheDocument();
  });

  it('busca filtra a lista', () => {
    montar();
    fireEvent.change(screen.getByLabelText('Buscar pergunta'), { target: { value: 'minha' } });
    expect(screen.queryByText('Como jogo?')).toBeNull();
    expect(screen.getByText('Minha pergunta?')).toBeInTheDocument();
  });

  it('a prévia acompanha o que é digitado', () => {
    montar();
    abrir('Como jogo?');
    fireEvent.change(screen.getByLabelText(/Resposta/), { target: { value: 'Texto **novo** aqui' } });
    expect(screen.getByText('PRÉVIA — COMO APARECE NO SITE')).toBeInTheDocument();
    expect(screen.getByText('novo').tagName).toBe('STRONG');
  });

  it('salvar só habilita depois de mexer e manda todos os campos', async () => {
    const p = montar();
    abrir('Como jogo?');
    const salvar = screen.getByRole('button', { name: 'Salvar' });
    expect(salvar).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Resposta/), { target: { value: 'Outra resposta' } });
    expect(salvar).toBeEnabled();
    fireEvent.click(salvar);

    await waitFor(() => expect(p.aoSalvar).toHaveBeenCalledWith('como-jogo', {
      secao: 'Primeiros passos', pergunta: 'Como jogo?', resposta: 'Outra resposta',
    }));
  });

  it('a seção de um registro do guia é fixa', () => {
    montar();
    abrir('Como jogo?');
    expect(screen.getByLabelText(/Seção/)).toBeDisabled();
  });

  it('criar: abre em branco, escolhe seção nova e devolve o id', async () => {
    const p = montar();
    fireEvent.click(screen.getByRole('button', { name: '+ NOVA PERGUNTA' }));
    fireEvent.change(screen.getByLabelText(/Seção/), { target: { value: 'Seção nova' } });
    fireEvent.change(screen.getByLabelText(/^Pergunta/), { target: { value: 'P?' } });
    fireEvent.change(screen.getByLabelText(/Resposta/), { target: { value: 'R.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar pergunta' }));

    await waitFor(() => expect(p.aoCriar).toHaveBeenCalledWith({ secao: 'Seção nova', pergunta: 'P?', resposta: 'R.' }));
  });

  it('sem aoCriar não há botão de nova (ex.: itens e locais)', () => {
    montar({ aoCriar: undefined, aoExcluir: undefined });
    expect(screen.queryByRole('button', { name: /NOVA/ })).toBeNull();
  });

  it('apagar pede confirmação antes de chamar a ação', async () => {
    const p = montar();
    abrir('Minha pergunta?');
    fireEvent.click(screen.getByRole('button', { name: 'Apagar pergunta' }));
    expect(p.aoExcluir).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    await waitFor(() => expect(p.aoExcluir).toHaveBeenCalledWith('minha'));
  });

  it('registro do guia se chama "Tirar do site" e mostra o aviso de que dá pra restaurar', () => {
    montar();
    abrir('Como jogo?');
    fireEvent.click(screen.getByRole('button', { name: 'Tirar do site' }));
    expect(screen.getByText(/dá pra restaurar/)).toBeInTheDocument();
  });

  it('"Voltar ao original" só aparece em registro do guia editado', async () => {
    const editado = { ...guia, alterado: true, valores: { ...guia.valores, resposta: 'Editada' } };
    const p = montar({ registros: [editado] });
    abrir('Como jogo?');
    fireEvent.click(screen.getByRole('button', { name: 'Voltar ao original' }));
    await waitFor(() => expect(p.aoReverter).toHaveBeenCalledWith('como-jogo'));
  });

  it('mostra o erro devolvido pelo servidor', async () => {
    montar({ aoSalvar: vi.fn().mockRejectedValue(new Error('"Pergunta" não pode ficar vazio.')) });
    abrir('Como jogo?');
    fireEvent.change(screen.getByLabelText(/Resposta/), { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('não pode ficar vazio');
  });

  it('lista as escondidas e restaura', async () => {
    const p = montar({ removidos: [{ id: 'velha', titulo: 'Pergunta velha' }] });
    expect(screen.getByText('ESCONDIDAS DO SITE (1)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Restaurar pergunta' }));
    await waitFor(() => expect(p.aoRestaurar).toHaveBeenCalledWith('velha'));
  });

  it('erro devolvido no envelope {ok:false} aparece com a mensagem real', async () => {
    montar({ aoSalvar: vi.fn().mockResolvedValue({ ok: false, erro: '"Pergunta" não pode ficar vazio.' }) });
    abrir('Como jogo?');
    fireEvent.change(screen.getByLabelText(/Resposta/), { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('não pode ficar vazio');
  });

  it('em produção o React esconde a mensagem: a tela mostra um texto amigável, não o boilerplate', async () => {
    const producao = new Error('An error occurred in the Server Components render. The specific message is omitted in production builds.');
    montar({ aoSalvar: vi.fn().mockRejectedValue(producao) });
    abrir('Como jogo?');
    fireEvent.change(screen.getByLabelText(/Resposta/), { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    const alerta = await screen.findByRole('alert');
    expect(alerta).not.toHaveTextContent('Server Components');
    expect(alerta).toHaveTextContent('Tenta de novo');
  });

  it('criar: erro no envelope não abre o registro nem some com o formulário', async () => {
    montar({ aoCriar: vi.fn().mockResolvedValue({ ok: false, erro: 'Preencha o campo "Resposta".' }) });
    fireEvent.click(screen.getByRole('button', { name: '+ NOVA PERGUNTA' }));
    fireEvent.change(screen.getByLabelText(/^Pergunta/), { target: { value: 'P?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar pergunta' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Preencha o campo');
    expect(screen.getByRole('button', { name: 'Criar pergunta' })).toBeInTheDocument();
  });

});
