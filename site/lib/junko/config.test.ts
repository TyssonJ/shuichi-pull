import { describe, it, expect } from 'vitest';
import { validarUrlJunko, URL_JUNKO_PADRAO } from './config';

describe('validarUrlJunko', () => {
  it('aceita o endereço padrão do bot, sem barra final', () => {
    expect(validarUrlJunko(URL_JUNKO_PADRAO)).toEqual({ ok: true, valor: 'https://junkobott.squareweb.app' });
    expect(validarUrlJunko('https://junkobott.squareweb.app/')).toEqual({ ok: true, valor: 'https://junkobott.squareweb.app' });
  });

  it('mantém um caminho base e descarta query e fragmento', () => {
    expect(validarUrlJunko('https://bot.exemplo.com/api/?x=1#y')).toEqual({ ok: true, valor: 'https://bot.exemplo.com/api' });
  });

  it('exige https', () => {
    expect(validarUrlJunko('http://junkobott.squareweb.app').ok).toBe(false);
  });

  it.each([
    'https://localhost/x', 'https://127.0.0.1/', 'https://10.0.0.5/', 'https://169.254.169.254/latest',
    'https://[::1]/', 'https://servico.internal/', 'https://impressora.local/', 'https://intranet/',
    'https://app.localhost/',
  ])('bloqueia endereço interno: %s', (url) => {
    expect(validarUrlJunko(url).ok).toBe(false);
  });

  it('rejeita credenciais e lixo', () => {
    expect(validarUrlJunko('https://user:pw@bot.exemplo.com').ok).toBe(false);
    expect(validarUrlJunko('não é url').ok).toBe(false);
  });
});
