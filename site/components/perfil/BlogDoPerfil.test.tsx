import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BlogDoPerfil, type PostExibido } from './BlogDoPerfil';
import { MIDIA_HOST } from '@/lib/midia-host';

vi.mock('@/components/midia/EnviarArquivo', () => ({
  EnviarArquivo: ({ tipo, rotulo, aoConcluir }: { tipo: string; rotulo?: string; aoConcluir: (a: unknown) => void }) => (
    <button
      type="button"
      onClick={() => aoConcluir({
        url: `https://${MIDIA_HOST}/${tipo}/arq-${tipo}`, mime: tipo === 'imagem' ? 'image/png' : 'video/mp4', tamanho: 1,
        duracaoSegundos: tipo === 'imagem' ? null : 95,
      })}
    >
      {rotulo}
    </button>
  ),
}));

const post: PostExibido = {
  id: 1, texto: 'Salve :kappa:', quando: '21/09/2026',
  anexos: [
    { tipo: 'imagem', url: `https://${MIDIA_HOST}/imagem/a.png`, duracaoSegundos: null },
    { tipo: 'video', url: `https://${MIDIA_HOST}/video-perfil/v.mp4`, duracaoSegundos: 65 },
  ],
};
const ok = <T,>(dados: T) => vi.fn().mockResolvedValue({ ok: true, dados });

describe('BlogDoPerfil — leitura', () => {
  it('sem posts e sem ser o dono, não mostra a seção', () => {
    const { container } = render(<BlogDoPerfil posts={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('mostra texto (com os emojis do dono), imagem e vídeo com duração', () => {
    render(<BlogDoPerfil posts={[post]} emojis={[{ codigo: 'kappa', url: 'https://i.imgur.com/k.png' }]} />);
    expect(screen.getByAltText(':kappa:')).toBeInTheDocument();
    expect(screen.getByAltText('Imagem do post')).toBeInTheDocument();
    expect(screen.getByText('vídeo · 1 min 5 s')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Apagar post' })).toBeNull();
    expect(screen.queryByText('NOVO POST')).toBeNull();
  });

  it('quem pode apagar vê o botão e ele chama a ação; erro aparece', async () => {
    const aoApagar = vi.fn().mockResolvedValue({ ok: false, erro: 'Esse post não existe mais.' });
    render(<BlogDoPerfil posts={[post]} aoApagar={aoApagar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Apagar post' }));
    await waitFor(() => expect(aoApagar).toHaveBeenCalledWith(1));
    expect(await screen.findByText('Esse post não existe mais.')).toBeInTheDocument();
  });
});

describe('BlogDoPerfil — escrever', () => {
  it('publicar fica desabilitado sem texto e sem arquivo', () => {
    render(<BlogDoPerfil posts={[]} aoPublicar={ok(1)} />);
    expect(screen.getByRole('button', { name: 'Publicar' })).toBeDisabled();
  });

  it('monta o post com texto, imagem e vídeo (marcando vídeo e a duração) e limpa o formulário', async () => {
    const aoPublicar = ok(3);
    render(<BlogDoPerfil posts={[]} aoPublicar={aoPublicar} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Meu clipe' } });
    fireEvent.click(screen.getByRole('button', { name: '+ IMAGEM' }));
    fireEvent.click(screen.getByRole('button', { name: /^\+ VÍDEO/ }));
    // só cabe um vídeo por post: o botão some
    expect(screen.queryByRole('button', { name: /^\+ VÍDEO/ })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Publicar' }));
    await waitFor(() => expect(aoPublicar).toHaveBeenCalledWith({
      texto: 'Meu clipe',
      anexos: [
        { url: `https://${MIDIA_HOST}/imagem/arq-imagem`, video: false, duracaoSegundos: null },
        { url: `https://${MIDIA_HOST}/video-perfil/arq-video-perfil`, video: true, duracaoSegundos: 95 },
      ],
    }));
    await waitFor(() => expect(screen.getByRole('textbox')).toHaveValue(''));
    expect(screen.queryByLabelText('Arquivos do post')).toBeNull();
  });

  it('tirar um arquivo libera o botão de vídeo de novo', () => {
    render(<BlogDoPerfil posts={[]} aoPublicar={ok(1)} />);
    fireEvent.click(screen.getByRole('button', { name: /^\+ VÍDEO/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Tirar o vídeo' }));
    expect(screen.getByRole('button', { name: /^\+ VÍDEO/ })).toBeInTheDocument();
  });

  it('erro do servidor aparece e o texto digitado é mantido', async () => {
    const aoPublicar = vi.fn().mockResolvedValue({ ok: false, erro: 'Você já tem 30 posts.' });
    render(<BlogDoPerfil posts={[]} aoPublicar={aoPublicar} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'oi' } });
    fireEvent.click(screen.getByRole('button', { name: 'Publicar' }));
    expect(await screen.findByText('Você já tem 30 posts.')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('oi');
  });
});
