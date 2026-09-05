import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ORIGEM = path.join(process.cwd(), '..', 'assets', 'sprites');
const DESTINO = path.join(process.cwd(), 'public', 'sprites');

export async function otimizar(origem: string, destino: string, largura: number) {
  await sharp(origem).resize({ width: largura, withoutEnlargement: true })
    .webp({ quality: 82 }).toFile(destino);
}

async function main() {
  fs.mkdirSync(DESTINO, { recursive: true });
  let n = 0;
  for (const pasta of fs.readdirSync(ORIGEM)) {
    const dirOrigem = path.join(ORIGEM, pasta);
    if (!fs.statSync(dirOrigem).isDirectory()) continue;
    const dirDestino = path.join(DESTINO, pasta);
    fs.mkdirSync(dirDestino, { recursive: true });

    for (const arquivo of fs.readdirSync(dirOrigem)) {
      if (!/\.png$/i.test(arquivo)) continue;
      // Alter Ego é tela deitada e aparece pequeno; o resto é personagem de corpo.
      const largura = pasta === 'alterego' ? 480 : 700;
      const saida = path.join(dirDestino, arquivo.replace(/\.png$/i, '.webp'));
      await otimizar(path.join(dirOrigem, arquivo), saida, largura);
      n++;
    }
  }
  console.log(`${n} sprites otimizados em ${DESTINO}`);
}

if (process.argv[1]?.endsWith('otimizar-sprites.ts')) main();
