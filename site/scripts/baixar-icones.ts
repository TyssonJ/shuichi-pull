import fs from 'node:fs';
import path from 'node:path';
import { traduzirRuEn } from '../lib/glossario';

/**
 * Os icones dos itens sao servidos pelo guidebook do Kirigiri Press, nomeados
 * pelo nome russo do item. Alguns itens usam um nome diferente no arquivo:
 * icon-map.json faz esse de-para.
 */
const BASE = 'https://kirigiris.press/guidebook/assets/icons/items';
const RAIZ = path.join(process.cwd(), '..', 'kirigiris-guidebook', '_raw', 'data');
const DESTINO = path.join(process.cwd(), '..', 'assets', 'icones');
const AGENTE = 'ShuichiPull/1.0 (site comunitario BR/PT; contato via repositorio)';

const PAUSA_MS = 120;
const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function gerarId(texto: string): string {
  return texto
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function main() {
  const dados = JSON.parse(fs.readFileSync(path.join(RAIZ, 'en', 'data.json'), 'utf-8')) as {
    items: { name: string; id?: string }[];
  };
  const apelidos = JSON.parse(
    fs.readFileSync(path.join(RAIZ, 'icon-map.json'), 'utf-8')
  ) as Record<string, string>;

  fs.mkdirSync(DESTINO, { recursive: true });
  const semIcone: string[] = [];
  let baixados = 0;

  for (const item of dados.items) {
    const id = gerarId(item.id ?? traduzirRuEn(item.name, 'items'));
    const destino = path.join(DESTINO, `${id}.png`);
    if (fs.existsSync(destino)) { baixados++; continue; }

    const nomeArquivo = apelidos[item.name] ?? item.name;
    const url = `${BASE}/${encodeURIComponent(nomeArquivo)}.png`;

    try {
      const r = await fetch(url, { headers: { 'User-Agent': AGENTE } });
      const tipo = r.headers.get('content-type') ?? '';
      // O site devolve o HTML da SPA quando o arquivo nao existe.
      if (!r.ok || !tipo.startsWith('image/')) { semIcone.push(id); continue; }

      fs.writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
      baixados++;
      await espera(PAUSA_MS);
    } catch {
      semIcone.push(id);
    }
  }

  console.log(`${baixados} icones em ${DESTINO}`);
  if (semIcone.length) console.log(`sem icone (${semIcone.length}): ${semIcone.join(', ')}`);
}

if (process.argv[1]?.endsWith('baixar-icones.ts')) main();
