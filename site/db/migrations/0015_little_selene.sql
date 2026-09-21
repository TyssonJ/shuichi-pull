CREATE TABLE "cargos" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"cor" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cargos_nome_unico" UNIQUE("nome")
);
--> statement-breakpoint
CREATE TABLE "conquistas" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"descricao_curta" text NOT NULL,
	"descricao_longa" text DEFAULT '' NOT NULL,
	"icone_url" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "midias" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"discord_id" text NOT NULL,
	"tipo" text NOT NULL,
	"tipo_mime" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "midias_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "usuario_cargos" (
	"discord_id" text NOT NULL,
	"cargo_id" integer NOT NULL,
	"concedido_por" text NOT NULL,
	"concedido_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuario_cargos_discord_id_cargo_id_pk" PRIMARY KEY("discord_id","cargo_id")
);
--> statement-breakpoint
CREATE TABLE "usuario_conquistas" (
	"discord_id" text NOT NULL,
	"conquista_id" integer NOT NULL,
	"concedida_por" text NOT NULL,
	"motivo" text,
	"concedida_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuario_conquistas_discord_id_conquista_id_pk" PRIMARY KEY("discord_id","conquista_id")
);
--> statement-breakpoint
ALTER TABLE "usuario_cargos" ADD CONSTRAINT "usuario_cargos_cargo_id_cargos_id_fk" FOREIGN KEY ("cargo_id") REFERENCES "public"."cargos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuario_conquistas" ADD CONSTRAINT "usuario_conquistas_conquista_id_conquistas_id_fk" FOREIGN KEY ("conquista_id") REFERENCES "public"."conquistas"("id") ON DELETE cascade ON UPDATE no action;