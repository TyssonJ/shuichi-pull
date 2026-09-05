import fs from 'node:fs';
import path from 'node:path';

/**
 * O FAQ do guidebook e markdown puro: "# " abre secao, "## " abre pergunta e
 * o que vem depois e a resposta. Este parser so extrai a estrutura em ingles;
 * o portugues fica em content/faq.pt.json, editavel por ADM.
 */
export type PerguntaEn = { secao: string; pergunta: string; resposta: string };

export function extrairFaq(markdown: string): PerguntaEn[] {
  const linhas = markdown.split(/\r?\n/);
  const saida: PerguntaEn[] = [];
  let secao = '';
  let atual: PerguntaEn | null = null;
  const corpo: string[] = [];

  const fechar = () => {
    if (!atual) return;
    atual.resposta = corpo.join('\n').trim();
    if (atual.resposta) saida.push(atual);
    corpo.length = 0;
  };

  for (const linha of linhas) {
    const secaoNova = /^# (.+)$/.exec(linha);
    const perguntaNova = /^## (.+)$/.exec(linha);

    if (secaoNova) {
      fechar();
      atual = null;
      // A primeira "# " é o título do arquivo, não uma seção do FAQ.
      secao = /^\d+\s*-/.test(secaoNova[1]) ? '' : secaoNova[1].trim();
    } else if (perguntaNova) {
      fechar();
      atual = { secao, pergunta: perguntaNova[1].trim(), resposta: '' };
    } else if (atual) {
      corpo.push(linha);
    }
  }
  fechar();

  return saida;
}

export function carregarFaqEn(): PerguntaEn[] {
  const caminho = path.join(process.cwd(), '..', 'kirigiris-guidebook', '13-faq.md');
  return extrairFaq(fs.readFileSync(caminho, 'utf-8'));
}
