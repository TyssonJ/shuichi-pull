import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PersonalizarPerfil } from './PersonalizarPerfil';

const personagens = [
  { id: 'shuichi-saihara', nome: 'Shuichi Saihara', sprite: '/sprites/shuichi.webp' },
  { id: 'kaede-akamatsu', nome: 'Kaede Akamatsu', sprite: '/sprites/kaede.webp' },
];

function montar(aoSalvar = vi.fn().mockResolvedValue(undefined)) {
  render(
    <PersonalizarPerfil
      nome="Tyson" avatar={null} desde="17/09/2026" titulo="Calouro"
      bioInicial="" bannerInicial={{ tipo: 'preset', valor: 'terminal' }}
      personagens={personagens} aoSalvar={aoSalvar}
    />,
  );
  return aoSalvar;
}

describe('PersonalizarPerfil', () => {
  it('a prévia mostra a descrição enquanto a pessoa digita', () => {
    montar();
    fireEvent.change(screen.getByPlaceholderText(/Fale um pouco de você/), { target: { value: 'Main detetive' } });
    expect(screen.getAllByText('Main detetive').length).toBeGreaterThan(0);
    expect(screen.getByText('13/280')).toBeInTheDocument();
  });

  it('salvar manda descrição e banner escolhidos', async () => {
    const aoSalvar = montar();
    fireEvent.change(screen.getByPlaceholderText(/Fale um pouco de você/), { target: { value: 'oi' } });
    fireEvent.click(screen.getByRole('button', { name: /Execução/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar personalização' }));

    await waitFor(() => expect(aoSalvar).toHaveBeenCalledWith({ bio: 'oi', bannerTipo: 'preset', bannerValor: 'execucao' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Salvo');
  });

  it('banner de personagem só vale depois de escolher um; a prévia usa o sprite dele', () => {
    montar();
    fireEvent.click(screen.getByRole('tab', { name: 'PERSONAGEM' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kaede Akamatsu' }));
    expect(document.querySelector('img[src="/sprites/kaede.webp"]')).not.toBeNull();
  });

  it('link de host não permitido mostra o erro e a prévia não carrega a imagem', () => {
    montar();
    fireEvent.click(screen.getByRole('tab', { name: 'IMAGEM' }));
    fireEvent.change(screen.getByPlaceholderText(/imgur/), { target: { value: 'https://evil.example/x.png' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Use uma imagem hospedada em');
    expect(document.querySelector('img[src="https://evil.example/x.png"]')).toBeNull();
  });

  it('mostra o erro devolvido pelo servidor', async () => {
    const aoSalvar = vi.fn().mockRejectedValue(new Error('Esse personagem não está no elenco.'));
    montar(aoSalvar);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar personalização' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('não está no elenco');
  });

  it('bloqueia salvar com descrição acima do limite', () => {
    montar();
    fireEvent.change(screen.getByPlaceholderText(/Fale um pouco de você/), { target: { value: 'a'.repeat(281) } });
    expect(screen.getByRole('button', { name: 'Salvar personalização' })).toBeDisabled();
  });

  it('erro no envelope {ok:false} mostra a mensagem do servidor', async () => {
    montar(vi.fn().mockResolvedValue({ ok: false, erro: 'Use uma imagem hospedada em: i.imgur.com.' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar personalização' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Use uma imagem hospedada');
    expect(screen.queryByRole('status')).toBeNull();
  });

});
