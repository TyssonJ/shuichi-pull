import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const uploadMock = vi.hoisted(() => vi.fn());
vi.mock('@vercel/blob/client', () => ({ upload: uploadMock }));
const duracaoMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/midia-cliente', async (importarOriginal) => {
  const mod = await importarOriginal<typeof import('@/lib/midia-cliente')>();
  return { ...mod, lerDuracaoDoVideo: duracaoMock };
});

import { EnviarArquivo } from './EnviarArquivo';

const arquivo = (nome: string, tipo: string, tamanho: number) => {
  const f = new File(['x'], nome, { type: tipo });
  Object.defineProperty(f, 'size', { value: tamanho });
  return f;
};
const escolher = (rotulo: string, f: File) => fireEvent.change(screen.getByLabelText(rotulo), { target: { files: [f] } });

beforeEach(() => vi.clearAllMocks());

describe('EnviarArquivo', () => {
  it('envia direto pro Blob com o tipo do uso e devolve o endereço', async () => {
    uploadMock.mockResolvedValue({ url: 'https://a.public.blob.vercel-storage.com/icone/a-x.png' });
    const aoConcluir = vi.fn();
    render(<EnviarArquivo tipo="icone" rotulo="Ícone" aoConcluir={aoConcluir} />);

    escolher('Ícone', arquivo('Meu Ícone é legal.png', 'image/png', 200 * 1024));

    await waitFor(() => expect(aoConcluir).toHaveBeenCalledWith({
      url: 'https://a.public.blob.vercel-storage.com/icone/a-x.png', mime: 'image/png', tamanho: 200 * 1024, duracaoSegundos: null,
    }));
    const [caminho, , opcoes] = uploadMock.mock.calls[0];
    expect(caminho).toBe('icone/Meu-Icone-e-legal.png');
    expect(opcoes).toMatchObject({ access: 'public', handleUploadUrl: '/api/midia/upload/', clientPayload: JSON.stringify({ tipo: 'icone' }) });
  });

  it('arquivo grande demais ou formato errado: avisa antes de enviar', () => {
    render(<EnviarArquivo tipo="icone" rotulo="Ícone" aoConcluir={vi.fn()} />);
    escolher('Ícone', arquivo('a.png', 'image/png', 3 * 1024 * 1024));
    expect(screen.getByRole('alert')).toHaveTextContent('o máximo é 1,0 MB');
    escolher('Ícone', arquivo('a.exe', 'application/x-msdownload', 1000));
    expect(screen.getByRole('alert')).toHaveTextContent('Formato não aceito');
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it('vídeo do perfil acima de 5 minutos é barrado pela duração, sem enviar', async () => {
    duracaoMock.mockResolvedValue(301);
    render(<EnviarArquivo tipo="video-perfil" rotulo="Vídeo" aoConcluir={vi.fn()} />);
    escolher('Vídeo', arquivo('v.mp4', 'video/mp4', 20 * 1024 * 1024));
    expect(await screen.findByRole('alert')).toHaveTextContent('5 min 1 s; o máximo é 5 min');
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it('vídeo dentro do limite é enviado e devolve a duração', async () => {
    duracaoMock.mockResolvedValue(120.4);
    uploadMock.mockResolvedValue({ url: 'https://a/v.mp4' });
    const aoConcluir = vi.fn();
    render(<EnviarArquivo tipo="video-perfil" rotulo="Vídeo" aoConcluir={aoConcluir} />);
    escolher('Vídeo', arquivo('v.mp4', 'video/mp4', 20 * 1024 * 1024));
    await waitFor(() => expect(aoConcluir).toHaveBeenCalledWith(expect.objectContaining({ duracaoSegundos: 120 })));
    expect(uploadMock.mock.calls[0][2].multipart).toBe(true);
  });

  it('mostra o erro do servidor (ex.: limite diário) e volta ao normal', async () => {
    uploadMock.mockRejectedValue(new Error('Você já enviou muitos arquivos hoje. Tenta de novo amanhã.'));
    render(<EnviarArquivo tipo="imagem" rotulo="Imagem" aoConcluir={vi.fn()} />);
    escolher('Imagem', arquivo('a.png', 'image/png', 1000));
    expect(await screen.findByRole('alert')).toHaveTextContent('muitos arquivos hoje');
    expect(screen.getByRole('button', { name: /ENVIAR|Imagem/i })).toBeEnabled();
  });

  it('mostra o teto do uso ao lado do botão', () => {
    render(<EnviarArquivo tipo="video-perfil" aoConcluir={vi.fn()} />);
    expect(screen.getByText(/até 150 MB · 5 min/)).toBeInTheDocument();
  });
});
