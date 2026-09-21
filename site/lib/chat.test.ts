import { describe, it, expect } from 'vitest';
import {
  lerSala, salaDaPartida, janelaVisivelMs, validarTextoChat, checarLimiteDeEnvio, segmentarMencoes, sugerirMencoes,
  corLegivel, corPorId, corDoPersonagem, CHAT_TEXTO_MAX, ENVIOS_POR_MINUTO, JANELA_ADM_MS, JANELA_JOGADOR_MS,
  juntarMensagens, CHAT_MENSAGENS_NA_TELA,
  type PersonagemChat,
} from './chat';
import { razaoDeContraste } from './estilo-perfil';

const makoto: PersonagemChat = { id: 'makoto-naegi', nome: 'Makoto Naegi', cor: '#7faa55' };
const kyoko: PersonagemChat = { id: 'kyoko-kirigiri', nome: 'Kyōko Kirigiri', cor: '#a58bd0' };
const mapa = new Map([makoto, kyoko].map((p) => [p.id, p]));

describe('salas', () => {
  it('aceita geral e partida:N; recusa o resto', () => {
    expect(lerSala('geral')).toEqual({ tipo: 'geral' });
    expect(lerSala(salaDaPartida(12))).toEqual({ tipo: 'partida', partidaId: 12 });
    for (const ruim of ['', 'partida:', 'partida:0', 'partida:-1', 'partida:1a', 'partida:1234567890', 'Geral', 'x']) {
      expect(lerSala(ruim)).toBeNull();
    }
  });

  it('jogador vê 4 h, ADM 24 h', () => {
    expect(janelaVisivelMs(false)).toBe(JANELA_JOGADOR_MS);
    expect(janelaVisivelMs(true)).toBe(JANELA_ADM_MS);
    expect(JANELA_JOGADOR_MS).toBe(4 * 3600_000);
    expect(JANELA_ADM_MS).toBe(24 * 3600_000);
  });
});

describe('validarTextoChat', () => {
  it('apara e limita linhas em branco', () => {
    expect(validarTextoChat('  oi\r\n\r\n\r\n\r\nfim ')).toEqual({ ok: true, valor: 'oi\n\nfim' });
  });

  it('recusa controle e texto longo demais', () => {
    expect(validarTextoChat('a\u0000b').ok).toBe(false);
    expect(validarTextoChat('x'.repeat(CHAT_TEXTO_MAX)).ok).toBe(true);
    expect(validarTextoChat('x'.repeat(CHAT_TEXTO_MAX + 1)).ok).toBe(false);
  });
});

describe('checarLimiteDeEnvio', () => {
  const base = { ultimoEnvioMs: null, enviosNoUltimoMinuto: 0, agoraMs: 100_000 };
  it('libera a primeira mensagem', () => expect(checarLimiteDeEnvio(base).ok).toBe(true));
  it('barra rajada (menos de 1 s desde a última)', () => {
    expect(checarLimiteDeEnvio({ ...base, ultimoEnvioMs: 99_500 }).ok).toBe(false);
    expect(checarLimiteDeEnvio({ ...base, ultimoEnvioMs: 98_900 }).ok).toBe(true);
  });
  it('barra acima do teto por minuto', () => {
    expect(checarLimiteDeEnvio({ ...base, enviosNoUltimoMinuto: ENVIOS_POR_MINUTO }).ok).toBe(false);
    expect(checarLimiteDeEnvio({ ...base, enviosNoUltimoMinuto: ENVIOS_POR_MINUTO - 1 }).ok).toBe(true);
  });
});

describe('segmentarMencoes', () => {
  it('troca @id de personagem existente e preserva o resto', () => {
    expect(segmentarMencoes('viu o @makoto-naegi? e @kyoko-kirigiri!', mapa)).toEqual([
      { tipo: 'texto', texto: 'viu o ' },
      { tipo: 'mencao', id: 'makoto-naegi', nome: 'Makoto Naegi', cor: '#7faa55' },
      { tipo: 'texto', texto: '? e ' },
      { tipo: 'mencao', id: 'kyoko-kirigiri', nome: 'Kyōko Kirigiri', cor: '#a58bd0' },
      { tipo: 'texto', texto: '!' },
    ]);
  });

  it('id inexistente, e-mail e prefixo de id continuam texto', () => {
    expect(segmentarMencoes('@ninguem oi@makoto-naegi.com @makoto', mapa)).toEqual([
      { tipo: 'texto', texto: '@ninguem oi@makoto-naegi.com @makoto' },
    ]);
  });

  it('menção colada no começo e no fim', () => {
    expect(segmentarMencoes('@makoto-naegi', mapa).map((s) => s.tipo)).toEqual(['mencao']);
    expect(segmentarMencoes('', mapa)).toEqual([]);
  });
});

describe('sugerirMencoes', () => {
  const lista = [makoto, kyoko];
  it('sem @ antes do cursor, nada', () => {
    expect(sugerirMencoes('oi', 2, lista)).toBeNull();
    expect(sugerirMencoes('a@b', 3, lista)).toBeNull();
  });

  it('só "@" mostra todos; termo filtra por id ou nome sem acento', () => {
    expect(sugerirMencoes('oi @', 4, lista)).toMatchObject({ inicio: 3 });
    expect(sugerirMencoes('oi @', 4, lista)!.opcoes).toHaveLength(2);
    expect(sugerirMencoes('@kyo', 4, lista)!.opcoes.map((p) => p.id)).toEqual(['kyoko-kirigiri']);
    expect(sugerirMencoes('oi @kyo', 7, lista)!.opcoes.map((p) => p.id)).toEqual(['kyoko-kirigiri']);
    expect(sugerirMencoes('oi @kyoto', 9, lista)!.opcoes).toEqual([]);
    expect(sugerirMencoes('oi @makoto', 10, lista)!.opcoes.map((p) => p.id)).toEqual(['makoto-naegi']);
  });

  it('respeita o cursor no meio do texto', () => {
    expect(sugerirMencoes('@ma bla', 3, lista)!.opcoes.map((p) => p.id)).toEqual(['makoto-naegi']);
  });
});

describe('cores', () => {
  it('cor escura é clareada até ler no fundo do chat; cor boa fica intacta', () => {
    expect(razaoDeContraste(corLegivel('#701d16'), '#0e0e13')).toBeGreaterThanOrEqual(4.5);
    expect(corLegivel('#ffffff')).toBe('#ffffff');
  });

  it('cor por id é estável, hexadecimal e legível', () => {
    expect(corPorId('abc')).toBe(corPorId('abc'));
    expect(corPorId('abc')).toMatch(/^#[0-9a-f]{6}$/);
    expect(corPorId('abc')).not.toBe(corPorId('abd'));
    expect(razaoDeContraste(corDoPersonagem('x', undefined), '#0e0e13')).toBeGreaterThanOrEqual(4.5);
  });
});

describe('juntarMensagens', () => {
  const m = (id: number) => ({ id });
  it('junta sem repetir e em ordem', () => {
    expect(juntarMensagens([m(1), m(2)], [m(2), m(3)], [1, 2, 3])).toEqual([m(1), m(2), m(3)]);
  });

  it('tira o que o servidor não lista mais (apagado), dentro do intervalo listado', () => {
    expect(juntarMensagens([m(1), m(2), m(3)], [], [3, 1])).toEqual([m(1), m(3)]);
  });

  it('não tira o que é mais antigo que a lista do servidor (ela é limitada)', () => {
    expect(juntarMensagens([m(1), m(2), m(50)], [], [50, 51])).toEqual([m(1), m(2), m(50)]);
  });

  it('servidor sem nenhuma mensagem na janela: a tela esvazia (apagadas ou vencidas)', () => {
    expect(juntarMensagens([m(1)], [], [])).toEqual([]);
  });

  it('mensagem que passou da janela de tempo sai da tela mesmo com o painel aberto', () => {
    const c = (id: number, iso: string) => ({ id, criadoEm: iso });
    const velha = c(1, '2026-09-21T10:00:00.000Z');
    const nova = c(2, '2026-09-21T13:00:00.000Z');
    expect(juntarMensagens([velha, nova], [], [1, 2], { desdeMs: Date.parse('2026-09-21T12:00:00.000Z') })).toEqual([nova]);
  });

  it('guarda só as últimas da tela', () => {
    const muitas = Array.from({ length: CHAT_MENSAGENS_NA_TELA + 10 }, (_, i) => m(i + 1));
    const r = juntarMensagens([], muitas, muitas.map((x) => x.id));
    expect(r).toHaveLength(CHAT_MENSAGENS_NA_TELA);
    expect(r[r.length - 1].id).toBe(CHAT_MENSAGENS_NA_TELA + 10);
  });
});
