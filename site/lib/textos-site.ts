/**
 * Textos das páginas que o ADM pode reescrever sem mexer em código: títulos e
 * introduções. O padrão mora aqui (é o texto que já estava nas páginas); o que
 * o ADM salva vai pra tabela `configuracoes` com a chave `texto.<chave>`.
 * Texto salvo vazio = volta pro padrão.
 *
 * Um texto pode ter variáveis entre chaves — {total}, {jogos}… — que a página
 * preenche com o número real, pra frase não ficar desatualizada quando o ADM
 * cria ou tira itens.
 */

export type TextoEditavel = {
  chave: string;
  rotulo: string;
  /** Rota pública onde o texto aparece. */
  pagina: string;
  padrao: string;
  /** Variáveis que a página preenche (documentadas no editor). */
  variaveis?: string[];
  longo?: boolean;
  max: number;
};

export const TEXTOS_SITE: TextoEditavel[] = [
  { chave: 'home.kicker', rotulo: 'Chamada acima do título', pagina: '/', padrao: 'ARQUIVO DA COMUNIDADE BR/PT', max: 60 },
  {
    chave: 'home.subtitulo', rotulo: 'Frase de apresentação', pagina: '/', longo: true, max: 240,
    padrao: 'Tudo sobre o Shinri Trial, o Danganronpa Online do Garry\'s Mod, em português.',
  },
  { chave: 'home.botao', rotulo: 'Botão principal', pagina: '/', padrao: 'NUNCA JOGUEI — COMEÇAR AQUI', max: 50 },
  {
    chave: 'home.elenco', rotulo: 'Faixa "Elenco"', pagina: '/', variaveis: ['total'], max: 160,
    padrao: '{total} alunos: atributos, velocidade, itens iniciais e dicas de RP.',
  },
  {
    chave: 'home.itens', rotulo: 'Faixa "Itens"', pagina: '/', variaveis: ['total'], max: 160,
    padrao: '{total} itens: peso, raridade, onde spawnam e o que craftam.',
  },
  {
    chave: 'home.mapa', rotulo: 'Faixa "Mapa"', pagina: '/', max: 160,
    padrao: 'Cada local da academia, o que spawna lá e para onde conecta.',
  },
  {
    chave: 'elenco.introducao', rotulo: 'Introdução do Elenco', pagina: '/elenco/', variaveis: ['total', 'jogos'], max: 200,
    padrao: '{total} alunos, de {jogos} jogos.',
  },
  { chave: 'itens.titulo', rotulo: 'Título da página de Itens', pagina: '/itens/', padrao: 'COFRE DE EVIDÊNCIAS', max: 60 },
  {
    chave: 'itens.introducao', rotulo: 'Introdução dos Itens', pagina: '/itens/', variaveis: ['total'], max: 200,
    padrao: '{total} itens catalogados: peso, raridade, receita e onde cada um aparece.',
  },
  {
    chave: 'mapa.introducao', rotulo: 'Introdução do Mapa', pagina: '/mapa/', variaveis: ['locais', 'loot'], max: 200,
    padrao: '{locais} locais da academia. {loot} têm loot mapeado.',
  },
  {
    chave: 'faq.introducao', rotulo: 'Introdução do FAQ', pagina: '/faq/', variaveis: ['total'], max: 200,
    padrao: '{total} perguntas respondidas, em português.',
  },
  {
    chave: 'mecanicas.introducao', rotulo: 'Introdução das Mecânicas', pagina: '/mecanicas/', variaveis: ['total'], max: 200,
    padrao: 'Todas as teclas e {total} mecânicas explicadas, em português.',
  },
  {
    chave: 'eventos.introducao', rotulo: 'Introdução dos Eventos', pagina: '/eventos/', longo: true, max: 400,
    padrao: 'Eventos, notícias e mudanças no site, escritos pela administração. Não é fonte oficial de anúncios do Shinri Trial — para isso, o Discord oficial.',
  },
  {
    chave: 'codigos.introducao', rotulo: 'Introdução dos Códigos', pagina: '/codigos/', longo: true, max: 400,
    padrao: 'Códigos promocionais do Shinri Trial, com os que ainda funcionam separados dos que já venceram. O prazo é conferido no seu navegador, então a etiqueta continua certa mesmo que o site não seja republicado.',
  },
];

export const PREFIXO_TEXTO = 'texto.';

export type ChaveTexto = (typeof TEXTOS_SITE)[number]['chave'];

export function definicaoDoTexto(chave: string): TextoEditavel | undefined {
  return TEXTOS_SITE.find((t) => t.chave === chave);
}

/** Troca {variavel} pelo valor; variável desconhecida fica como está, pra
 * erro de digitação do ADM aparecer na prévia em vez de sumir. */
export function preencherVariaveis(texto: string, variaveis: Record<string, string | number> = {}): string {
  return texto.replace(/\{(\w+)\}/g, (inteiro, nome: string) =>
    nome in variaveis ? String(variaveis[nome]) : inteiro);
}

/** Cria o leitor de textos a partir do mapa de configurações. */
export function criarTextos(config: Record<string, string>) {
  return function texto(chave: string, variaveis?: Record<string, string | number>): string {
    const definicao = definicaoDoTexto(chave);
    const salvo = config[PREFIXO_TEXTO + chave]?.trim();
    return preencherVariaveis(salvo || definicao?.padrao || '', variaveis);
  };
}

export type Resultado = { ok: true; valor: string } | { ok: false; erro: string };

/** Vazio é válido: significa "voltar ao padrão". */
export function validarTexto(chave: string, entrada: string): Resultado {
  const definicao = definicaoDoTexto(chave);
  if (!definicao) return { ok: false, erro: 'Esse texto não é editável.' };
  const valor = entrada.replace(/\r\n/g, '\n').trim();
  if (valor.length > definicao.max) return { ok: false, erro: `Passa de ${definicao.max} caracteres.` };
  return { ok: true, valor };
}
