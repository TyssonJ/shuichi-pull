import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { TextoComEmojis } from './TextoComEmojis';
import { FundoLateral } from './FundoLateral';
import { MoldePerfil } from './MoldePerfil';
import { CabecalhoPerfil } from './CabecalhoPerfil';
import { EstiloDoPerfil } from '@/components/conta/EstiloDoPerfil';
import { FilaDePerfis, type PedidoDePerfil } from '@/components/adm/FilaDePerfis';
import { ESTILO_VAZIO, type EstiloPerfil } from '@/lib/estilo-perfil';

vi.mock('@/components/midia/EnviarArquivo', () => ({
  EnviarArquivo: ({ rotulo, aoConcluir }: { rotulo?: string; aoConcluir: (a: { url: string }) => void }) => (
    <button type="button" onClick={() => aoConcluir({ url: 'https://i.imgur.com/enviado.png' })}>{rotulo ?? 'ENVIAR'}</button>
  ),
}));

const emojis = [{ codigo: 'kappa', url: 'https://i.imgur.com/k.png' }];
const estilo: EstiloPerfil = { corTema: '#ff007f', fundoEsquerdo: 'https://i.imgur.com/l.png', fundoDireito: null, emojis };

describe('TextoComEmojis', () => {
  it('troca só os códigos do dono por imagem e mantém o resto como texto', () => {
    render(<p><TextoComEmojis texto="oi :kappa: e :pepe:" emojis={emojis} /></p>);
    const img = screen.getByAltText(':kappa:');
    expect(img).toHaveAttribute('src', 'https://i.imgur.com/k.png');
    expect(screen.getByText(/e :pepe:/)).toBeInTheDocument();
  });

  it('sem emojis, devolve o texto puro', () => {
    render(<p><TextoComEmojis texto="só texto :kappa:" emojis={[]} /></p>);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('só texto :kappa:')).toBeInTheDocument();
  });

  it('não interpreta HTML no texto', () => {
    const { container } = render(<p><TextoComEmojis texto={'<img src=x onerror=alert(1)> :kappa:'} emojis={emojis} /></p>);
    expect(container.querySelectorAll('img')).toHaveLength(1);
  });
});

describe('FundoLateral', () => {
  it('sem fundo não renderiza nada', () => {
    const { container } = render(<FundoLateral estilo={{ fundoEsquerdo: null, fundoDireito: null }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('a direita espelha a esquerda quando não tem imagem própria', () => {
    const { container } = render(<FundoLateral estilo={{ fundoEsquerdo: 'https://i.imgur.com/l.png', fundoDireito: null }} />);
    const direita = container.querySelector('[data-lado="direito"] img')!;
    expect(direita).toHaveAttribute('src', 'https://i.imgur.com/l.png');
    expect(direita.className).toContain('-scale-x-100');
  });

  it('imagem própria na direita não é espelhada', () => {
    const { container } = render(<FundoLateral estilo={{ fundoEsquerdo: 'https://i.imgur.com/l.png', fundoDireito: 'https://i.imgur.com/r.png' }} />);
    const direita = container.querySelector('[data-lado="direito"] img')!;
    expect(direita).toHaveAttribute('src', 'https://i.imgur.com/r.png');
    expect(direita.className).not.toContain('-scale-x-100');
  });
});

describe('MoldePerfil', () => {
  it('sem estilo, só repassa o conteúdo (nada de wrapper nem fundo)', () => {
    render(<MoldePerfil estilo={null}><p>conteúdo</p></MoldePerfil>);
    expect(screen.getByText('conteúdo')).toBeInTheDocument();
    expect(screen.queryByTestId('molde-perfil')).toBeNull();
  });

  it('com estilo, troca o verde de destaque só ali dentro e mostra o fundo', () => {
    render(<MoldePerfil estilo={estilo}><p>conteúdo</p></MoldePerfil>);
    expect(screen.getByTestId('molde-perfil').getAttribute('style')).toContain('--color-alter-green: #ff007f');
    expect(screen.getByTestId('fundo-lateral')).toBeInTheDocument();
  });

  it('só cor, sem imagens: sem camada de fundo', () => {
    render(<MoldePerfil estilo={{ ...ESTILO_VAZIO, corTema: '#ff007f' }}><p>x</p></MoldePerfil>);
    expect(screen.queryByTestId('fundo-lateral')).toBeNull();
  });
});

describe('CabecalhoPerfil com emojis', () => {
  it('a descrição usa os emojis do dono do perfil', () => {
    render(
      <CabecalhoPerfil
        nome="Ana" avatar={null} desde="01/01/2026" titulo={null} reputacao={null}
        bio="Salve :kappa:" emojis={emojis} banner={{ tipo: 'preset', valor: 'noite' }} spritePersonagem={null}
      />,
    );
    expect(screen.getByAltText(':kappa:')).toBeInTheDocument();
  });
});

describe('EstiloDoPerfil (editor)', () => {
  const ok = <T,>(dados: T) => vi.fn().mockResolvedValue({ ok: true, dados });
  const props = (extra: Partial<React.ComponentProps<typeof EstiloDoPerfil>> = {}) => ({
    inicial: ESTILO_VAZIO,
    estado: { status: 'nenhum' as const, motivo: null, temPublicado: false },
    souAdm: false,
    nome: 'Ana',
    aoEnviar: ok('pendente' as const),
    aoCancelar: ok(undefined),
    ...extra,
  });

  it('avisa que passa por aprovação; ADM vê que publica direto', () => {
    const { unmount } = render(<EstiloDoPerfil {...props()} />);
    expect(screen.getByText(/um ADM confere/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar para aprovação' })).toBeDisabled();
    unmount();
    render(<EstiloDoPerfil {...props({ souAdm: true })} />);
    expect(screen.getByText(/entra no ar na hora/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publicar no perfil' })).toBeInTheDocument();
  });

  it('cor escura demais mostra o erro e bloqueia o envio', () => {
    render(<EstiloDoPerfil {...props()} />);
    fireEvent.change(screen.getByLabelText('Cor de tema em hexadecimal'), { target: { value: '#101020' } });
    expect(screen.getByRole('alert')).toHaveTextContent('escura demais');
    expect(screen.getByRole('button', { name: 'Enviar para aprovação' })).toBeDisabled();
  });

  it('envia o estilo montado (cor, fundo enviado por upload e emoji) e mostra "aguardando"', async () => {
    const aoEnviar = ok('pendente' as const);
    render(<EstiloDoPerfil {...props({ aoEnviar })} />);

    fireEvent.change(screen.getByLabelText('Cor de tema em hexadecimal'), { target: { value: '#ff007f' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'ENVIAR IMAGEM' })[0]);
    fireEvent.change(screen.getByLabelText('Código do novo emoji'), { target: { value: ':Kappa:' } });
    fireEvent.click(screen.getByRole('button', { name: 'ENVIAR IMAGEM DO EMOJI' }));
    fireEvent.click(screen.getByRole('button', { name: '+ ADICIONAR EMOJI' }));
    expect(within(screen.getByLabelText('Emojis do perfil')).getByText(':kappa:')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Enviar para aprovação' }));
    await waitFor(() => expect(aoEnviar).toHaveBeenCalledWith({
      corTema: '#ff007f',
      fundoEsquerdo: 'https://i.imgur.com/enviado.png',
      fundoDireito: null,
      emojis: [{ codigo: 'kappa', url: 'https://i.imgur.com/enviado.png' }],
    }));
    expect(await screen.findByText(/Enviado! Um ADM vai conferir/)).toBeInTheDocument();
    expect(screen.getByText(/Aguardando um ADM aprovar/)).toBeInTheDocument();
  });

  it('mostra o motivo da rejeição e libera reenviar o mesmo pedido corrigido', () => {
    render(<EstiloDoPerfil {...props({
      inicial: { ...ESTILO_VAZIO, corTema: '#ff007f' },
      estado: { status: 'rejeitado', motivo: 'fundo impróprio', temPublicado: false },
    })} />);
    expect(screen.getByRole('alert')).toHaveTextContent('fundo impróprio');
    expect(screen.getByRole('button', { name: 'Enviar para aprovação' })).toBeEnabled();
  });

  it('cancelar pedido pendente chama a ação e some o aviso', async () => {
    const aoCancelar = ok(undefined);
    render(<EstiloDoPerfil {...props({
      inicial: { ...ESTILO_VAZIO, corTema: '#ff007f' },
      estado: { status: 'pendente', motivo: null, temPublicado: false },
      aoCancelar,
    })} />);
    fireEvent.click(screen.getByRole('button', { name: 'cancelar pedido' }));
    await waitFor(() => expect(aoCancelar).toHaveBeenCalled());
    expect(await screen.findByText('Pedido cancelado.')).toBeInTheDocument();
    expect(screen.queryByText(/Aguardando um ADM aprovar/)).toBeNull();
  });

  it('erro do servidor aparece pra pessoa', async () => {
    const aoEnviar = vi.fn().mockResolvedValue({ ok: false, erro: 'Arquivo grande demais.' });
    render(<EstiloDoPerfil {...props({ aoEnviar, inicial: ESTILO_VAZIO })} />);
    fireEvent.change(screen.getByLabelText('Cor de tema em hexadecimal'), { target: { value: '#ff007f' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar para aprovação' }));
    expect(await screen.findByText('Arquivo grande demais.')).toBeInTheDocument();
  });
});

describe('FilaDePerfis (ADM)', () => {
  const pedido: PedidoDePerfil = { discordId: '42', nome: 'Ana', estilo, quando: '21/09/2026' };
  const ok = () => vi.fn().mockResolvedValue({ ok: true, dados: undefined });

  it('fila vazia avisa; lista o que está no ar com o botão de remover', async () => {
    const aoRemover = ok();
    render(<FilaDePerfis pedidos={[]} publicados={[pedido]} aoAprovar={ok()} aoRejeitar={ok()} aoRemover={aoRemover} />);
    expect(screen.getByText(/Nenhum pedido esperando/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Remover do ar' }));
    await waitFor(() => expect(aoRemover).toHaveBeenCalledWith('42'));
  });

  it('mostra tudo que vai pro ar (cor, fundo, emojis) e aprova', async () => {
    const aoAprovar = ok();
    render(<FilaDePerfis pedidos={[pedido]} publicados={[]} aoAprovar={aoAprovar} aoRejeitar={ok()} aoRemover={ok()} />);
    expect(screen.getByText('#ff007f')).toBeInTheDocument();
    expect(screen.getAllByAltText(/Fundo —/).length).toBe(2);
    expect(screen.getByText(':kappa:', { selector: 'code' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Aprovar' }));
    await waitFor(() => expect(aoAprovar).toHaveBeenCalledWith('42'));
  });

  it('rejeitar pede o motivo e o envia', async () => {
    const aoRejeitar = ok();
    render(<FilaDePerfis pedidos={[pedido]} publicados={[]} aoAprovar={ok()} aoRejeitar={aoRejeitar} aoRemover={ok()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Rejeitar…' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'imagem imprópria' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar rejeição' }));
    await waitFor(() => expect(aoRejeitar).toHaveBeenCalledWith('42', 'imagem imprópria'));
  });

  it('erro da ação (ex.: outro ADM já revisou) aparece no cartão', async () => {
    const aoAprovar = vi.fn().mockResolvedValue({ ok: false, erro: 'Esse pedido não está mais pendente.' });
    render(<FilaDePerfis pedidos={[pedido]} publicados={[]} aoAprovar={aoAprovar} aoRejeitar={ok()} aoRemover={ok()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Aprovar' }));
    expect(await screen.findByText('Esse pedido não está mais pendente.')).toBeInTheDocument();
  });
});
