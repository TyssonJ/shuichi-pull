import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Tira o fundo branco de um sprite. Alguns personagens (a Ryoko, por exemplo)
 * so existem na wiki como ilustracao de divulgacao, que vem com fundo branco
 * chapado em vez do PNG recortado dos sprites de jogo.
 *
 * Sao duas passadas. A primeira entra pelas bordas e come o fundo de fora,
 * com tolerancia folgada — nada de dentro do desenho encosta ali. A segunda
 * limpa os buracos fechados (o fundo que aparece entre as mechas de cabelo).
 *
 * A segunda passada nao pode ser so "e claro o bastante": o brilho da pele e
 * o reflexo do olho tambem chegam a 255, e sair apagando isso abre furo no
 * desenho. O que separa fundo de brilho e o tamanho — o fundo entre as mechas
 * e uma mancha grande e chapada, o brilho e respingo. Entao a passada mede
 * cada regiao fechada antes de apagar e so tira as grandes.
 *
 * Uso: npm run fundo -- ../assets/sprites/elenco/ryoko-otonashi.png
 */

// Acima de LIMITE o pixel some de vez; entre MACIO e LIMITE vira meio-tom,
// que e o que evita serrilhado na borda do desenho.
const BORDA = { limite: 236, macio: 200 };
const BURACO = { limite: 250, macio: 240 };
const SEMENTE_BURACO = 250;
/** Fracao da imagem a partir da qual uma regiao fechada conta como fundo. */
const AREA_MINIMA = 0.0015;

export async function removerFundo(origem: string, destino = origem): Promise<number> {
  const { data, info } = await sharp(origem)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: l, height: a, channels: c } = info;
  const claro = (i: number) => Math.min(data[i * c], data[i * c + 1], data[i * c + 2]);
  const visitado = new Uint8Array(l * a);
  let apagados = 0;

  /** Junta a regiao contigua que nasce destas sementes, sem apagar nada. */
  function coletar(sementes: number[], macio: number): number[] {
    const regiao: number[] = [];
    const fila: number[] = [];
    const enfileirar = (i: number) => {
      if (visitado[i] || claro(i) < macio) return;
      visitado[i] = 1;
      fila.push(i);
    };
    for (const s of sementes) enfileirar(s);

    while (fila.length > 0) {
      const i = fila.pop()!;
      regiao.push(i);
      const x = i % l;
      const y = (i - x) / l;
      if (x > 0) enfileirar(i - 1);
      if (x < l - 1) enfileirar(i + 1);
      if (y > 0) enfileirar(i - l);
      if (y < a - 1) enfileirar(i + l);
    }
    return regiao;
  }

  function apagar(regiao: number[], regra: { limite: number; macio: number }) {
    for (const i of regiao) {
      const nivel = claro(i);
      data[i * c + 3] =
        nivel >= regra.limite
          ? 0
          : Math.round(255 * (1 - (nivel - regra.macio) / (regra.limite - regra.macio)));
      apagados++;
    }
  }

  const bordas: number[] = [];
  for (let x = 0; x < l; x++) bordas.push(x, (a - 1) * l + x);
  for (let y = 0; y < a; y++) bordas.push(y * l, y * l + l - 1);
  apagar(coletar(bordas, BORDA.macio), BORDA);

  const minimo = Math.round(l * a * AREA_MINIMA);
  for (let i = 0; i < l * a; i++) {
    if (visitado[i] || claro(i) < SEMENTE_BURACO) continue;
    const regiao = coletar([i], BURACO.macio);
    if (regiao.length >= minimo) apagar(regiao, BURACO);
  }

  const saida = sharp(data, { raw: { width: l, height: a, channels: 4 } }).png();
  if (path.resolve(origem) === path.resolve(destino)) {
    // Sharp nao le e escreve o mesmo arquivo: gera ao lado e troca no lugar.
    const temporario = `${destino}.tmp.png`;
    await saida.toFile(temporario);
    fs.copyFileSync(temporario, destino);
    fs.unlinkSync(temporario);
  } else {
    await saida.toFile(destino);
  }

  return apagados;
}

async function main() {
  const alvo = process.argv[2];
  if (!alvo) {
    console.error('uso: npm run fundo -- <caminho do png> [saida]');
    process.exit(1);
  }
  const caminho = path.resolve(alvo);
  const saida = process.argv[3] ? path.resolve(process.argv[3]) : caminho;
  const apagados = await removerFundo(caminho, saida);
  console.log(`${apagados} pixels de fundo removidos de ${path.basename(caminho)}`);
}

if (process.argv[1]?.endsWith('remover-fundo.ts')) main();
