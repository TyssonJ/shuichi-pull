import fs from 'node:fs';
import path from 'node:path';
import { carregarFaqEn } from './faq-en';

// Congela a estrutura do FAQ do guidebook em content/faq.json, para o site
// nao depender do markdown em tempo de build.
if (process.argv[1]?.endsWith('ingerir-faq.ts')) {
  const faq = carregarFaqEn();
  const destino = path.join(process.cwd(), 'content', 'faq.json');
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, JSON.stringify(faq, null, 2), 'utf-8');
  console.log(`${faq.length} perguntas gravadas em ${destino}`);
}
