import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PainelJunko } from './PainelJunko';

function montar(extra: Partial<React.ComponentProps<typeof PainelJunko>> = {}) {
  const props: React.ComponentProps<typeof PainelJunko> = {
    botInicial: { online: true, ms: 120, mensagem: 'API conectada' },
    urlInicial: 'https://junkobott.squareweb.app',
    ativoInicial: false,
    chaveApiConfigurada: false,
    chaveSaidaConfigurada: false,
    log: [],
    aoVerificar: vi.fn().mockResolvedValue({ online: false, erro: 'não deu pra conectar' }),
    aoGerarChave: vi.fn().mockResolvedValue('jk_chave-de-teste'),
    aoSalvar: vi.fn().mockResolvedValue(undefined),
    aoTestar: vi.fn().mockResolvedValue({ enviado: true, status: 200 }),
    ...extra,
  };
  render(<PainelJunko {...props} />);
  return props;
}

describe('PainelJunko', () => {
  it('mostra o status inicial do bot e atualiza ao verificar', async () => {
    const p = montar();
    expect(screen.getByText('ONLINE')).toBeInTheDocument();
    expect(screen.getByText(/API conectada/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Verificar agora' }));
    await waitFor(() => expect(p.aoVerificar).toHaveBeenCalled());
    expect(await screen.findByText('OFFLINE')).toBeInTheDocument();
  });

  it('sem chave gerada avisa que a API está fechada', () => {
    montar();
    expect(screen.getByText(/nenhuma chave/)).toBeInTheDocument();
  });

  it('gerar chave mostra o texto uma vez e "Já guardei" some com ele', async () => {
    montar();
    fireEvent.click(screen.getByRole('button', { name: 'Gerar chave' }));
    expect(await screen.findByTestId('chave-nova')).toHaveTextContent('jk_chave-de-teste');
    expect(screen.getByText(/NÃO VAI APARECER DE NOVO/)).toBeInTheDocument();
    expect(screen.getByText('● chave ativa')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Já guardei' }));
    expect(screen.queryByTestId('chave-nova')).toBeNull();
  });

  it('salvar sem digitar credencial manda chaveSaida null (não mexe na guardada)', async () => {
    const p = montar({ chaveSaidaConfigurada: true });
    fireEvent.click(screen.getByRole('checkbox', { name: /Enviar eventos ao bot/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(p.aoSalvar).toHaveBeenCalledWith({
      url: 'https://junkobott.squareweb.app', ativo: true, chaveSaida: null,
    }));
    expect(await screen.findByText('Configuração salva.')).toBeInTheDocument();
  });

  it('credencial digitada é enviada; marcar "apagar" manda string vazia', async () => {
    const p = montar({ chaveSaidaConfigurada: true });
    fireEvent.change(screen.getByLabelText(/Credencial que o bot exige/), { target: { value: 'novo-token' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(p.aoSalvar).toHaveBeenLastCalledWith(expect.objectContaining({ chaveSaida: 'novo-token' })));

    fireEvent.click(screen.getByRole('checkbox', { name: /apagar a credencial/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(p.aoSalvar).toHaveBeenLastCalledWith(expect.objectContaining({ chaveSaida: '' })));
  });

  it('nunca exibe a credencial guardada, só o placeholder', () => {
    montar({ chaveSaidaConfigurada: true });
    expect(screen.getByLabelText(/Credencial que o bot exige/)).toHaveValue('');
    expect(screen.getByText(/Já configurada/)).toBeInTheDocument();
  });

  it('mostra o erro do servidor ao salvar', async () => {
    montar({ aoSalvar: vi.fn().mockRejectedValue(new Error('Use o endereço público do bot.')) });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('endereço público');
  });

  it('teste: mostra sucesso ou o motivo da falha', async () => {
    const aoTestar = vi.fn().mockResolvedValueOnce({ enviado: true, status: 200 })
      .mockResolvedValueOnce({ enviado: false, status: 404, motivo: 'o bot respondeu HTTP 404' });
    montar({ aoTestar });

    fireEvent.click(screen.getByRole('button', { name: 'Enviar evento de teste' }));
    expect(await screen.findByText(/O bot recebeu o teste/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Enviar evento de teste' }));
    expect(await screen.findByText(/HTTP 404/)).toBeInTheDocument();
  });

  it('lista o contrato e o log de falhas', () => {
    montar({ log: [{ id: 1, quando: '21/09/2026 12:00', acao: 'junko.falha', alvo: 'junko/partida.criada', detalhe: 'não deu pra conectar no bot' }] });
    expect(screen.getByText('partida.criada', { selector: 'code' })).toBeInTheDocument();
    expect(screen.getByText(/POST \/api\/junko\/partidas\/\{id\}\/inscricao\//)).toBeInTheDocument();
    expect(screen.getByText(/não deu pra conectar no bot/)).toBeInTheDocument();
  });
});
