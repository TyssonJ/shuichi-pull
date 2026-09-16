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

export const auditoria = pgTable('auditoria', {
  id: serial('id').primaryKey(),
  autor: text('autor').notNull(),
  acao: text('acao').notNull(),
  alvo: text('alvo').notNull(),
  valorAntigo: text('valor_antigo'),
  valorNovo: text('valor_novo'),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
});
