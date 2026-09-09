import { describe, it, expect } from 'vitest';
import { logDaSecao, logDeBoot, logAleatorio } from './alter-ego-log';

describe('logDaSecao', () => {
  it('acha a fala certa pra uma rota conhecida', () => {
    expect(logDaSecao('/elenco/')).toEqual({
      tag: 'ELENCO_LOG',
      texto: expect.stringContaining('56 alunos'),
    });
  });

  it('acha a fala certa mesmo com sub-rota (ficha de personagem)', () => {
    expect(logDaSecao('/elenco/chihiro-fujisaki/')).toEqual({
      tag: 'ELENCO_LOG',
      texto: expect.any(String),
    });
  });

  it('retorna null pra uma rota sem seção correspondente', () => {
    expect(logDaSecao('/')).toBeNull();
  });
});

describe('logDeBoot', () => {
  it('sorteia uma das falas de boot, respeitando a função de sorteio', () => {
    const linha = logDeBoot(() => 0);
    expect(linha.tag).toBe('SYS_BOOT');
  });

  it('nunca sorteia fora do pool de boot', () => {
    const tagsVistas = new Set<string>();
    for (let i = 0; i < 20; i++) {
      tagsVistas.add(logDeBoot(() => i / 20).tag);
    }
    for (const tag of tagsVistas) {
      expect(['SYS_BOOT', 'CORE_INIT', 'WELCOME', 'SEC_CHECK']).toContain(tag);
    }
  });
});

describe('logAleatorio', () => {
  it('sorteia dentre as 19 entradas do pool ocioso (tudo menos boot)', () => {
    const tagsVistas = new Set<string>();
    for (let i = 0; i < 40; i++) {
      tagsVistas.add(logAleatorio(undefined, () => i / 40).tag);
    }
    expect(tagsVistas.size).toBeGreaterThan(1);
    for (const tag of tagsVistas) {
      expect(['SYS_BOOT', 'CORE_INIT', 'WELCOME', 'SEC_CHECK']).not.toContain(tag);
    }
  });

  it('nunca repete a tag que está evitando, mesmo quando o sorteio cairia nela', () => {
    // Sorteio determinístico: sempre pede o primeiro item do pool restante.
    const linha = logAleatorio('ELENCO_LOG', () => 0);
    expect(linha.tag).not.toBe('ELENCO_LOG');
  });
});
