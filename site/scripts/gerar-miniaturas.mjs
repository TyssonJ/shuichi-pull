// Gera public/sprites/elenco-mini/<id>.webp a partir de public/sprites/elenco/<id>.webp.
//
// Os cartões do elenco mostram o sprite com 128 px de altura, mas os arquivos
// originais têm até ~680 px: a página baixava 2,2 MB pra desenhar imagens
// pequenas. A miniatura tem 256 px de altura (2x, nítida em tela retina) e
// pesa uma fração. O original continua sendo usado onde o sprite aparece grande.
//
//   node scripts/gerar-miniaturas.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const origem = path.join(process.cwd(), 'public', 'sprites', 'elenco');
const destino = path.join(process.cwd(), 'public', 'sprites', 'elenco-mini');
const ALTURA = 256;

fs.mkdirSync(destino, { recursive: true });

let antes = 0;
let depois = 0;
const arquivos = fs.readdirSync(origem).filter((a) => a.endsWith('.webp')).sort();
for (const nome of arquivos) {
  const entrada = path.join(origem, nome);
  const saida = path.join(destino, nome);
  await sharp(entrada)
    .resize({ height: ALTURA, withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toFile(saida);
  antes += fs.statSync(entrada).size;
  depois += fs.statSync(saida).size;
}

const kb = (n) => Math.round(n / 1024);
console.log(`${arquivos.length} miniaturas: ${kb(antes)} KB -> ${kb(depois)} KB (${Math.round((1 - depois / antes) * 100)}% menor)`);
