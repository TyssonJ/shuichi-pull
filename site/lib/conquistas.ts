import { temInvisiveis } from './identidade';
import { ehUrlDeMidia } from './midia';
import { validarUrlBanner } from './perfil-visual';

export const CONQUISTA_NOME_MAX = 40;
export const CONQUISTA_CURTA_MAX = 90;
export const CONQUISTA_LONGA_MAX = 800;
export const MOTIVO_MAX = 200;

type Resultado<T> = { ok: true; valor: T } | { ok: false; erro: string };

export type DadosConquista = { nome: string; descricaoCurta: string; descricaoLonga: string; iconeUrl: string };

/** Ícone: arquivo enviado pro nosso Blob, ou link de hospedagem de imagem permitida. */
export function validarIconeDeConquista(url: string): Resultado<string> {
  const texto = url.trim();
  if (ehUrlDeMidia(texto)) return { ok: true, valor: texto };
  const r = validarUrlBanner(texto);
  return r.ok ? r : { ok: false, erro: 'O ícone precisa ser uma imagem enviada aqui ou de uma hospedagem permitida.' };
}

export function validarConquista(entrada: DadosConquista): Resultado<DadosConquista> {
  const nome = entrada.nome.normalize('NFC').replace(/\s+/g, ' ').trim();
  if (temInvisiveis(nome)) return { ok: false, erro: 'O nome da conquista tem caracteres invisíveis.' };
  if ([...nome].length < 2) return { ok: false, erro: 'O nome da conquista precisa de ao menos 2 caracteres.' };
  if ([...nome].length > CONQUISTA_NOME_MAX) return { ok: false, erro: `O nome passa de ${CONQUISTA_NOME_MAX} caracteres.` };

  const curta = entrada.descricaoCurta.replace(/\s+/g, ' ').trim();
  if (!curta) return { ok: false, erro: 'Escreva a descrição curta da conquista.' };
  if (curta.length > CONQUISTA_CURTA_MAX) return { ok: false, erro: `A descrição curta passa de ${CONQUISTA_CURTA_MAX} caracteres.` };

  const longa = entrada.descricaoLonga.replace(/\r\n/g, '\n').trim();
  if (longa.length > CONQUISTA_LONGA_MAX) return { ok: false, erro: `A descrição completa passa de ${CONQUISTA_LONGA_MAX} caracteres.` };

  const icone = validarIconeDeConquista(entrada.iconeUrl);
  if (!icone.ok) return icone;

  return { ok: true, valor: { nome, descricaoCurta: curta, descricaoLonga: longa, iconeUrl: icone.valor } };
}

/** Motivo opcional da concessão (fica na auditoria e na conquista). */
export function validarMotivo(entrada: string | null | undefined): Resultado<string | null> {
  const texto = (entrada ?? '').replace(/\s+/g, ' ').trim();
  if (texto.length > MOTIVO_MAX) return { ok: false, erro: `O motivo passa de ${MOTIVO_MAX} caracteres.` };
  return { ok: true, valor: texto || null };
}
