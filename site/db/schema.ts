import { pgTable, pgEnum, serial, text, boolean, integer, real, timestamp, unique, jsonb, primaryKey } from 'drizzle-orm/pg-core';
import type { Craft, Spawn } from '../lib/schema-itens';
import type { Etiqueta } from '../lib/schema';

export const papelAdm = pgEnum('papel_adm', ['adm', 'chefe']);

// Configuração de exibição do site, editável pelo ADM sem mexer em código —
// chave/valor genérico pra não precisar de migração a cada novo toggle.
// Valor é sempre texto; quem lê decide como interpretar ('true'/'false' etc).
export const configuracoes = pgTable('configuracoes', {
  chave: text('chave').primaryKey(),
  valor: text('valor').notNull(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
});

export const administradores = pgTable('administradores', {
  discordId: text('discord_id').primaryKey(),
  nome: text('nome').notNull(),
  papel: papelAdm('papel').notNull(),
  promovidoPor: text('promovido_por'),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
});

export const eventos = pgTable('eventos', {
  id: text('id').primaryKey(),
  tipo: text('tipo').notNull(),
  titulo: text('titulo').notNull(),
  data: text('data').notNull(),
  ate: text('ate'),
  destaque: boolean('destaque').notNull().default(false),
  autor: text('autor').notNull(),
  resumo: text('resumo').notNull(),
  corpo: text('corpo').notNull(),
  imagemUrl: text('imagem_url'),
});

export const codigos = pgTable('codigos', {
  codigo: text('codigo').primaryKey(),
  recompensa: text('recompensa').notNull(),
  descricao: text('descricao').notNull(),
  expiraEm: text('expira_em'),
  fonte: text('fonte'),
  iconeUrl: text('icone_url'),
});

export const correcoes = pgTable('correcoes', {
  id: serial('id').primaryKey(),
  colecao: text('colecao').notNull(),
  registroId: text('registro_id').notNull(),
  campo: text('campo').notNull(),
  valor: text('valor').notNull(),
  valorBase: text('valor_base').notNull(),
  autor: text('autor').notNull(),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ([
  unique('correcoes_alvo_unico').on(t.colecao, t.registroId, t.campo),
]));

// Item criado por um ADM direto no painel, fora da extração do guidebook —
// mesmo formato de site/lib/schema-itens.ts (Item), achatado em colunas.
export const itensExtras = pgTable('itens_extras', {
  id: text('id').primaryKey(),
  nomePt: text('nome_pt').notNull(),
  nomeEn: text('nome_en').notNull(),
  categoriaPt: text('categoria_pt').notNull(),
  categoriaEn: text('categoria_en').notNull(),
  raridadePt: text('raridade_pt').notNull(),
  raridadeEn: text('raridade_en').notNull(),
  nivelRaridade: integer('nivel_raridade').notNull(),
  peso: real('peso'),
  icone: text('icone'),
  descricaoPt: text('descricao_pt'),
  // Campos do item completo — todos opcionais pra não invalidar os extras
  // que já existem (criados só com o formulário rápido).
  ramoPt: text('ramo_pt'),
  ramoEn: text('ramo_en'),
  descricaoEn: text('descricao_en'),
  efeitoPt: text('efeito_pt'),
  efeitoEn: text('efeito_en'),
  lojaVendedor: text('loja_vendedor'),
  lojaPreco: integer('loja_preco'),
  craft: jsonb('craft').$type<Craft>(),
  spawns: jsonb('spawns').$type<Spawn[]>(),
  autor: text('autor').notNull(),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
});

// Esconde um item do guidebook (data/itens.json) sem apagar o dado-fonte —
// só a presença da linha aqui já vale como "removido".
export const itensRemovidos = pgTable('itens_removidos', {
  itemId: text('item_id').primaryKey(),
  autor: text('autor').notNull(),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
});

// Mesma lógica de itensExtras/itensRemovidos, para personagens criados ou
// escondidos direto no painel — achatado a partir de site/lib/schema.ts
// (Personagem). Etiquetas e o perfil expandido (personalidade/aparência/
// história/segredo) ficam de fora do formulário rápido do ADM.
export const personagensExtras = pgTable('personagens_extras', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull(),
  talentoPt: text('talento_pt').notNull(),
  talentoEn: text('talento_en').notNull(),
  descricaoPt: text('descricao_pt').notNull(),
  descricaoEn: text('descricao_en').notNull(),
  jogo: text('jogo').notNull(),
  velocidade: integer('velocidade').notNull(),
  mochila: integer('mochila').notNull(),
  percepcao: integer('percepcao').notNull(),
  vida: integer('vida').notNull(),
  sprite: text('sprite'),
  etiquetas: jsonb('etiquetas').$type<Etiqueta[]>(),
  personalidade: text('personalidade'),
  aparencia: text('aparencia'),
  historia: text('historia'),
  segredo: text('segredo'),
  autor: text('autor').notNull(),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
});

export const personagensRemovidos = pgTable('personagens_removidos', {
  personagemId: text('personagem_id').primaryKey(),
  autor: text('autor').notNull(),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
});

// Conta de qualquer visitante que entra com Discord — separada de
// `administradores`: toda conta de ADM também é uma conta de usuário, mas a
// grande maioria das contas aqui nunca vai virar ADM. `garantir()` no
// repositório cria a linha no primeiro login e atualiza nome/avatar do
// Discord a cada visita à página de conta, sem mexer em uuidGmod/mains.
export const statusUuid = pgEnum('status_uuid', ['pendente', 'aprovado', 'banido']);

export const usuarios = pgTable('usuarios', {
  discordId: text('discord_id').primaryKey(),
  discordNome: text('discord_nome').notNull(),
  discordAvatar: text('discord_avatar'),
  uuidGmod: text('uuid_gmod'),
  uuidStatus: statusUuid('uuid_status').notNull().default('pendente'),
  podeSerHost: boolean('pode_ser_host').notNull().default(true),
  mains: text('mains').array().notNull().default([]),
  // Personalização do perfil público. Nulo = padrão do site (sem descrição,
  // banner "terminal"). bannerTipo/bannerValor são validados em
  // lib/perfil-visual.ts antes de gravar.
  bio: text('bio'),
  bannerTipo: text('banner_tipo'),
  bannerValor: text('banner_valor'),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
});

export const statusPartida = pgEnum('status_partida', ['agendada', 'finalizada', 'cancelada']);

// Organização de partida: quem é o host, quando é, as regras — e quem
// participa é a tabela partidaParticipantes logo abaixo, porque uma partida
// tem vários participantes e um participante entra em várias partidas.
export const resultadoPartida = pgEnum('resultado_partida', ['vitoria_alunos', 'vitoria_mestre', 'tragedia']);

export const partidas = pgTable('partidas', {
  id: serial('id').primaryKey(),
  titulo: text('titulo').notNull(),
  hostDiscordId: text('host_discord_id').notNull(),
  dataHora: timestamp('data_hora', { withTimezone: true }).notNull(),
  regras: text('regras'),
  capaUrl: text('capa_url'),
  // Quantos titulares a partida comporta (o Shinri Trial padrão é 16).
  vagas: integer('vagas').notNull().default(16),
  status: statusPartida('status').notNull().default('agendada'),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  // Relatório pós-partida (AAR), preenchido pelo host ao finalizar — todos
  // opcionais porque uma partida pode ser marcada finalizada sem relatório.
  // O detalhe por capítulo (quem matou/morreu/ficou AFK em cada um) vive em
  // partidaCapitulos, abaixo — capitulo/blackened aqui viraram um resumo
  // geral só pra quem não quer preencher capítulo por capítulo.
  capitulo: text('capitulo'),
  blackened: text('blackened'),
  mvpDiscordIds: text('mvp_discord_ids').array().notNull().default([]),
  resultado: resultadoPartida('resultado'),
});

// Um participante só pode entrar numa vez em cada partida (índice único em
// partidaId+discordId) — entrar de novo com outro personagem primeiro sai
// da entrada anterior.
export const tipoParticipante = pgEnum('tipo_participante', ['participante', 'reserva']);

export const partidaParticipantes = pgTable('partida_participantes', {
  id: serial('id').primaryKey(),
  partidaId: integer('partida_id').notNull().references(() => partidas.id, { onDelete: 'cascade' }),
  discordId: text('discord_id').notNull(),
  personagemId: text('personagem_id'),
  tipo: tipoParticipante('tipo').notNull().default('participante'),
  entradaEm: timestamp('entrada_em', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ([
  unique('partida_participante_unico').on(t.partidaId, t.discordId),
]));

// Registro por capítulo, preenchido pelo host no relatório pós-partida —
// uma partida pode ter vários capítulos, cada um com seu próprio
// assassino/vítima revelados (ou nenhum, se ninguém matou naquele capítulo).
export const partidaCapitulos = pgTable('partida_capitulos', {
  id: serial('id').primaryKey(),
  partidaId: integer('partida_id').notNull().references(() => partidas.id, { onDelete: 'cascade' }),
  numero: integer('numero').notNull(),
  assassinoDiscordId: text('assassino_discord_id'),
  vitimaDiscordId: text('vitima_discord_id'),
  afk: text('afk').array().notNull().default([]),
}, (t) => ([
  unique('partida_capitulo_unico').on(t.partidaId, t.numero),
]));

// Comentário de qualquer usuário logado num evento/notícia. `eventoId`
// referencia `eventos.id` com cascade: se o evento sai, os comentários somem
// junto — não faz sentido guardar comentário órfão.
export const eventoComentarios = pgTable('evento_comentarios', {
  id: serial('id').primaryKey(),
  eventoId: text('evento_id').notNull().references(() => eventos.id, { onDelete: 'cascade' }),
  discordId: text('discord_id').notNull(),
  texto: text('texto').notNull(),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
});

export const tipoAvaliacao = pgEnum('tipo_avaliacao', ['like', 'dislike']);

// Avaliação de um participante sobre outro, numa partida finalizada —
// like/dislike + comentário breve de RP. Um avaliador só avalia cada colega
// uma vez por partida (índice único); avaliar de novo substitui a anterior.
export const partidaAvaliacoes = pgTable('partida_avaliacoes', {
  id: serial('id').primaryKey(),
  partidaId: integer('partida_id').notNull().references(() => partidas.id, { onDelete: 'cascade' }),
  avaliadorDiscordId: text('avaliador_discord_id').notNull(),
  avaliadoDiscordId: text('avaliado_discord_id').notNull(),
  tipo: tipoAvaliacao('tipo').notNull(),
  comentario: text('comentario'),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ([
  unique('partida_avaliacao_unica').on(t.partidaId, t.avaliadorDiscordId, t.avaliadoDiscordId),
]));

export const auditoria = pgTable('auditoria', {
  id: serial('id').primaryKey(),
  autor: text('autor').notNull(),
  acao: text('acao').notNull(),
  alvo: text('alvo').notNull(),
  valorAntigo: text('valor_antigo'),
  valorNovo: text('valor_novo'),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
});

// Conteúdo textual criado pelo ADM que não vem do guidebook (hoje: perguntas
// do FAQ e cards de mecânica). `dados` guarda os campos da coleção (FAQ:
// secao/pergunta/resposta; controles: grupo/titulo/texto). A validação mora
// em lib/adm/conteudo.ts — o banco só guarda.
export const conteudoExtras = pgTable('conteudo_extras', {
  colecao: text('colecao').notNull(),
  id: text('id').notNull(),
  dados: jsonb('dados').$type<Record<string, string>>().notNull(),
  autor: text('autor').notNull(),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ([
  primaryKey({ columns: [t.colecao, t.id] }),
]));

// Esconde um registro do guidebook (pergunta do FAQ, card de mecânica) sem
// apagar o original — restaurável, igual a itens_removidos/personagens_removidos.
export const conteudoRemovidos = pgTable('conteudo_removidos', {
  colecao: text('colecao').notNull(),
  registroId: text('registro_id').notNull(),
  autor: text('autor').notNull(),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ([
  primaryKey({ columns: [t.colecao, t.registroId] }),
]));
