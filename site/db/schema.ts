import { pgTable, pgEnum, serial, text, boolean, integer, real, timestamp, unique } from 'drizzle-orm/pg-core';

export const papelAdm = pgEnum('papel_adm', ['adm', 'chefe']);

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
});

export const codigos = pgTable('codigos', {
  codigo: text('codigo').primaryKey(),
  recompensa: text('recompensa').notNull(),
  descricao: text('descricao').notNull(),
  expiraEm: text('expira_em'),
  fonte: text('fonte'),
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
export const usuarios = pgTable('usuarios', {
  discordId: text('discord_id').primaryKey(),
  discordNome: text('discord_nome').notNull(),
  discordAvatar: text('discord_avatar'),
  uuidGmod: text('uuid_gmod'),
  mains: text('mains').array().notNull().default([]),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
});

export const statusPartida = pgEnum('status_partida', ['agendada', 'finalizada', 'cancelada']);

// Organização de partida: quem é o host, quando é, as regras — e quem
// participa é a tabela partidaParticipantes logo abaixo, porque uma partida
// tem vários participantes e um participante entra em várias partidas.
export const partidas = pgTable('partidas', {
  id: serial('id').primaryKey(),
  titulo: text('titulo').notNull(),
  hostDiscordId: text('host_discord_id').notNull(),
  dataHora: timestamp('data_hora', { withTimezone: true }).notNull(),
  regras: text('regras'),
  status: statusPartida('status').notNull().default('agendada'),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
});

// Um participante só pode entrar numa vez em cada partida (índice único em
// partidaId+discordId) — entrar de novo com outro personagem primeiro sai
// da entrada anterior.
export const partidaParticipantes = pgTable('partida_participantes', {
  id: serial('id').primaryKey(),
  partidaId: integer('partida_id').notNull().references(() => partidas.id, { onDelete: 'cascade' }),
  discordId: text('discord_id').notNull(),
  personagemId: text('personagem_id'),
  entradaEm: timestamp('entrada_em', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ([
  unique('partida_participante_unico').on(t.partidaId, t.discordId),
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

export const auditoria = pgTable('auditoria', {
  id: serial('id').primaryKey(),
  autor: text('autor').notNull(),
  acao: text('acao').notNull(),
  alvo: text('alvo').notNull(),
  valorAntigo: text('valor_antigo'),
  valorNovo: text('valor_novo'),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
});
