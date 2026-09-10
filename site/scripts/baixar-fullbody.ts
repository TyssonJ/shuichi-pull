import fs from 'node:fs';
import path from 'node:path';
import { escolherSprite } from './escolher-sprite';

/**
 * Baixa o sprite de corpo inteiro de cada personagem — o de meio-corpo continua
 * sendo o retrato da listagem, e este aparece so na ficha aberta, onde ha altura
 * para ele. Quem nao tem corpo inteiro na wiki fica de fora e a ficha cai no
 * sprite de sempre.
 */

const API = 'https://danganronpa.fandom.com/api.php';
const DESTINO = path.join(process.cwd(), '..', 'assets', 'sprites', 'fullbody');
const AGENTE = 'ShuichiPull/1.0 (site comunitario BR/PT; contato via repositorio)';

const PAUSA_MS = 250;
const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

type RespostaBusca = { query?: { search?: { title: string }[] } };
type RespostaArquivo = {
  query?: { pages?: Record<string, { imageinfo?: { url: string }[] }> };
};

async function api<T>(params: Record<string, string>): Promise<T> {
  const url = `${API}?${new URLSearchParams({ ...params, format: 'json' })}`;
  const r = await fetch(url, { headers: { 'User-Agent': AGENTE } });
  if (!r.ok) throw new Error(`${r.status} em ${url}`);
  return r.json() as Promise<T>;
}

async function procurar(termo: string): Promise<string[]> {
  const r = await api<RespostaBusca>({
    action: 'query', list: 'search', srsearch: termo,
    srnamespace: '6', srlimit: '50',
  });
  return (r.query?.search ?? []).map((s) => s.title);
}

async function urlDoArquivo(titulo: string): Promise<string | null> {
  const r = await api<RespostaArquivo>({
    action: 'query', titles: `File:${titulo}`, prop: 'imageinfo', iiprop: 'url',
  });
  for (const p of Object.values(r.query?.pages ?? {})) {
    const u = p.imageinfo?.[0]?.url;
    if (u) return u.split('/revision/')[0];
  }
  return null;
}

/** So aceita corpo inteiro: sem isso o resultado repetiria o meio-corpo. */
async function acharFullbody(nome: string, jogo: string): Promise<string | null> {
  for (const termo of [`"${nome}" Fullbody Sprite`, `${nome} Fullbody`]) {
    const escolhido = escolherSprite(await procurar(termo), nome, jogo, 'inteiro');
    await espera(PAUSA_MS);
    if (escolhido && /fullbody/i.test(escolhido)) return escolhido;
  }
  return null;
}

async function main() {
  const elenco = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data', 'personagens.json'), 'utf-8')
  ) as { id: string; nome: string; jogo: string }[];

  fs.mkdirSync(DESTINO, { recursive: true });

  const CAMINHO_FONTES = path.join(DESTINO, '_fontes.json');
  const fontes: Record<string, string> = fs.existsSync(CAMINHO_FONTES)
    ? JSON.parse(fs.readFileSync(CAMINHO_FONTES, 'utf-8'))
    : {};

  let baixados = 0;
  const semSprite: string[] = [];

  for (const p of elenco) {
    const destino = path.join(DESTINO, `${p.id}.png`);
    if (fs.existsSync(destino)) { baixados++; continue; }

    try {
      const titulo = await acharFullbody(p.nome, p.jogo);
      if (!titulo) { semSprite.push(p.id); continue; }

      const url = await urlDoArquivo(titulo);
      if (!url) { semSprite.push(p.id); continue; }

      const resposta = await fetch(url, { headers: { 'User-Agent': AGENTE } });
      if (!resposta.ok) { semSprite.push(p.id); continue; }

      fs.writeFileSync(destino, Buffer.from(await resposta.arrayBuffer()));
      fontes[p.id] = titulo;
      fs.writeFileSync(CAMINHO_FONTES, JSON.stringify(fontes, null, 2), 'utf-8');
      baixados++;
      console.log(`  ok ${p.id} <- ${titulo}`);
      await espera(PAUSA_MS);
    } catch (erro) {
      semSprite.push(p.id);
      console.log(`  !! ${p.id}: ${(erro as Error).message}`);
    }
  }

  console.log(`\n${baixados} sprites de corpo inteiro em ${DESTINO}`);
  if (semSprite.length) console.log(`sem corpo inteiro (${semSprite.length}): ${semSprite.join(', ')}`);
}

if (process.argv[1]?.endsWith('baixar-fullbody.ts')) main();
