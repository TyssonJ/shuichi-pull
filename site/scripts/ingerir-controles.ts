import fs from 'node:fs';
import path from 'node:path';
import { carregarControlesEn } from './controles-en';

// Congela a estrutura do guidebook em content/controles.json.
if (process.argv[1]?.endsWith('ingerir-controles.ts')) {
  const dados = carregarControlesEn();
  const destino = path.join(process.cwd(), 'content', 'controles.json');
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, JSON.stringify(dados, null, 2), 'utf-8');
  console.log(
    `${dados.tabelas.length} tabelas e ${dados.cards.length} cards gravados em ${destino}`
  );
}
