// Gera data/cores-personagens.json: a cor dominante do sprite de cada personagem,
// usada pra colorir a menção (@personagem) no chat. Roda uma vez e o resultado
// vai pro repositório — os sprites não existem dentro da função serverless.
//
//   node scripts/gerar-cores-personagens.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const pasta = path.join(process.cwd(), 'public', 'sprites', 'elenco');
const destino = path.join(process.cwd(), 'data', 'cores-personagens.json');
const BALDES = 24;

function paraHex([r, g, b]) {
  return '#' + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');
}

function hsv(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max / 255 };
}

async function corDominante(arquivo) {
  const { data, info } = await sharp(arquivo)
    .resize(48, 48, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const baldes = Array.from({ length: BALDES }, () => ({ peso: 0, r: 0, g: 0, b: 0 }));
  const media = { n: 0, r: 0, g: 0, b: 0 };
  for (let i = 0; i < data.length; i += info.channels) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a < 200) continue;
    media.n += 1; media.r += r; media.g += g; media.b += b;
    const { h, s, v } = hsv(r, g, b);
    // Cinza, branco e preto não caracterizam ninguém: o que marca é a cor viva.
    if (s < 0.35 || v < 0.3) continue;
    const balde = baldes[Math.floor(h / (360 / BALDES)) % BALDES];
    const peso = s * s * v;
    balde.peso += peso; balde.r += r * peso; balde.g += g * peso; balde.b += b * peso;
  }

  const melhor = baldes.reduce((a, b) => (b.peso > a.peso ? b : a));
  if (melhor.peso > 0) return paraHex([melhor.r / melhor.peso, melhor.g / melhor.peso, melhor.b / melhor.peso]);
  return media.n > 0 ? paraHex([media.r / media.n, media.g / media.n, media.b / media.n]) : null;
}

const cores = {};
for (const nome of fs.readdirSync(pasta).filter((a) => a.endsWith('.webp')).sort()) {
  const cor = await corDominante(path.join(pasta, nome));
  if (cor) cores[nome.replace(/\.webp$/, '')] = cor;
}
fs.writeFileSync(destino, JSON.stringify(cores, null, 2) + '\n');
console.log(`${Object.keys(cores).length} cores gravadas em ${path.relative(process.cwd(), destino)}`);
