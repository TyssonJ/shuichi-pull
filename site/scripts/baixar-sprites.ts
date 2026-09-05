import fs from 'node:fs';
import path from 'node:path';
import { escolherSprite } from './escolher-sprite';

/**
 * Baixa um sprite por personagem da Danganronpa Fandom wiki — a mesma fonte
 * dos sprites que ja estavam em assets/. Um arquivo por pessoa, para a ficha
 * e a listagem nao ficarem so de silhueta.
 */

const API = 'https://danganronpa.fandom.com/api.php';
const DESTINO = path.join(process.cwd(), '..', 'assets', 'sprites', 'elenco');
const AGENTE = 'ShuichiPull/1.0 (site comunitario BR/PT; contato via repositorio)';

const PAUSA_MS = 250;
const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function api(params: Record<string, string>): Promise<any> {
  const url = `${API}?${new URLSearchParams({ ...params, format: 'json' })}`;
  const r = await fetch(url, { headers: { 'User-Agent': AGENTE } });
  if (!r.ok) throw new Error(`${r.status} em ${url}`);
  return r.json();
}

async function procurar(termo: string): Promise<string[]> {
  const r = await api({
    action: 'query', list: 'search', srsearch: termo,
    srnamespace: '6', srlimit: '50',
  });
  return (r.query?.search ?? []).map((s: { title: string }) => s.title);
}

async function urlDoArquivo(titulo: string): Promise<string | null> {
  const r = await api({
    action: 'query', titles: `File:${titulo}`, prop: 'imageinfo', iiprop: 'url',
  });
  const paginas = r.query?.pages ?? {};
  for (const p of Object.values(paginas) as any[]) {
    const u = p.imageinfo?.[0]?.url;
    if (u) return u.split('/revision/')[0];
  }
  return null;
}

/** Tenta varias formulacoes ate achar um sprite utilizavel. */
async function acharSprite(nome: string, jogo: string): Promise<string | null> {
  for (const termo of [
    `${nome} Halfbody Sprite`,
    `${nome} Bustup Sprite`,
    `${nome} Sprite`,
  ]) {
    const escolhido = escolherSprite(await procurar(termo), nome, jogo);
    await espera(PAUSA_MS);
    if (escolhido) return escolhido;
  }
  return null;
}

async function main() {
  const elenco = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data', 'personagens.json'), 'utf-8')
  ) as { id: string; nome: string; jogo: string }[];

  fs.mkdirSync(DESTINO, { recursive: true });

  let baixados = 0;
  const semSprite: string[] = [];

  for (const p of elenco) {
    const destino = path.join(DESTINO, `${p.id}.png`);
    if (fs.existsSync(destino)) { baixados++; continue; }

    try {
      const titulo = await acharSprite(p.nome, p.jogo);
      if (!titulo) { semSprite.push(p.id); console.log(`  -- ${p.id}: nada na wiki`); continue; }

      const url = await urlDoArquivo(titulo);
      if (!url) { semSprite.push(p.id); continue; }

      const resposta = await fetch(url, { headers: { 'User-Agent': AGENTE } });
      if (!resposta.ok) { semSprite.push(p.id); continue; }

      fs.writeFileSync(destino, Buffer.from(await resposta.arrayBuffer()));
      baixados++;
      console.log(`  ok ${p.id} <- ${titulo}`);
      await espera(PAUSA_MS);
    } catch (erro) {
      semSprite.push(p.id);
      console.log(`  !! ${p.id}: ${(erro as Error).message}`);
    }
  }

  console.log(`\n${baixados} sprites em ${DESTINO}`);
  if (semSprite.length) console.log(`sem sprite (${semSprite.length}): ${semSprite.join(', ')}`);
}

if (process.argv[1]?.endsWith('baixar-sprites.ts')) main();
