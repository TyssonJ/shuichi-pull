import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ORIGEM = path.join(process.cwd(), '..', 'assets', 'icones');
const DESTINO = path.join(process.cwd(), 'public', 'icones');

/** Icone aparece pequeno na listagem; 128px cobre ate telas densas. */
export async function otimizar(origem: string, destino: string) {
  await sharp(origem)
    .resize({ width: 128, height: 128, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(destino);
}

async function main() {
  fs.mkdirSync(DESTINO, { recursive: true });
  let n = 0;
  for (const arquivo of fs.readdirSync(ORIGEM)) {
    if (!/\.png$/i.test(arquivo)) continue;
    await otimizar(
      path.join(ORIGEM, arquivo),
      path.join(DESTINO, arquivo.replace(/\.png$/i, '.webp'))
    );
    n++;
  }
  console.log(`${n} icones otimizados em ${DESTINO}`);
}

if (process.argv[1]?.endsWith('otimizar-icones.ts')) main();
