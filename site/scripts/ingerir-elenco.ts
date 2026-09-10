import fs from 'node:fs';
import path from 'node:path';
import { traduzirRuEn } from '../lib/glossario';
import { extrairValor } from '../lib/atributos';
import {
  traduzirPt, talentoDoPersonagem, descricaoDoPersonagem, perfilExpandidoDoPersonagem,
} from '../lib/traducoes';
import { validarPersonagens, type Personagem, type Etiqueta } from '../lib/schema';
import { spriteDoPersonagem } from '../lib/sprites';

const BRUTO = path.join(
  process.cwd(), '..', 'kirigiris-guidebook', '_raw', 'data', 'en', 'data.json'
);

type FeatureBruta = { label: string; value: string; kind: string };
type PersonagemBruto = {
  name: string; talent: string; description: string; features: FeatureBruta[];
};
type JogoBruto = { game: string; characters: PersonagemBruto[] };

export function gerarId(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Atributos que pioram quando sobem (fome mais rápida, sono mais frequente).
const ETIQUETA_RUIM = /(faster|more often)/i;

export function ingerirElenco(): Personagem[] {
  const bruto = JSON.parse(fs.readFileSync(BRUTO, 'utf-8')) as { cast: JogoBruto[] };
  const saida: Personagem[] = [];

  // Dois nomes se repetem no elenco: a Mukuro disfarçada de Junko em DR1 e o
  // Impostor Supremo que se passa por Byakuya em DR2. São personagens distintos,
  // então o id de quem repete o nome leva o talento junto para não colidir.
  const quantosPorNome = new Map<string, number>();
  for (const jogo of bruto.cast) {
    for (const p of jogo.characters) {
      const nome = traduzirRuEn(p.name, 'characters');
      quantosPorNome.set(nome, (quantosPorNome.get(nome) ?? 0) + 1);
    }
  }

  for (const jogo of bruto.cast) {
    for (const p of jogo.characters) {
      const nome = traduzirRuEn(p.name, 'characters');
      const talentoEn = traduzirRuEn(p.talent, 'talents');

      let velocidade = 0, mochila = 0, percepcao = 0, vida = 100;
      const etiquetas: Etiqueta[] = [];

      for (const f of p.features) {
        const v = f.value;
        if (f.kind === 'speed') velocidade = extrairValor(v, 'speed') ?? velocidade;
        else if (f.kind === 'capacity') mochila = extrairValor(v, 'capacity') ?? mochila;
        else if (f.kind === 'attention') percepcao = extrairValor(v, 'attention') ?? percepcao;
        else if (f.kind === 'needs' && /HP/.test(v)) vida = Number(/(\d+)\s*HP/.exec(v)?.[1] ?? vida);
        else {
          etiquetas.push({
            en: v,
            pt: traduzirPt(v) ?? v,
            bom: !ETIQUETA_RUIM.test(v),
          });
        }
      }

      const id = (quantosPorNome.get(nome) ?? 0) > 1
        ? gerarId(`${nome} ${talentoEn}`)
        : gerarId(nome);
      saida.push({
        id,
        nome,
        talento: {
          en: talentoEn,
          pt: talentoDoPersonagem(id) ?? traduzirPt(talentoEn) ?? talentoEn,
        },
        descricao: {
          en: p.description,
          pt: descricaoDoPersonagem(id) ?? p.description,
        },
        jogo: jogo.game,
        velocidade, mochila, percepcao, vida,
        etiquetas,
        sprite: spriteDoPersonagem(id),
        traducaoRevisada: false,
        ...perfilExpandidoDoPersonagem(id),
      });
    }
  }

  return validarPersonagens(saida);
}

// Execução direta: `npx tsx scripts/ingerir-elenco.ts`
if (process.argv[1]?.endsWith('ingerir-elenco.ts')) {
  const elenco = ingerirElenco();
  const destino = path.join(process.cwd(), 'data', 'personagens.json');
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, JSON.stringify(elenco, null, 2), 'utf-8');
  console.log(`${elenco.length} personagens gravados em ${destino}`);
}
