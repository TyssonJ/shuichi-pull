DO $$ BEGIN
 CREATE TYPE "public"."papel_adm" AS ENUM('adm', 'chefe');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "administradores" (
	"discord_id" text PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"papel" "papel_adm" NOT NULL,
	"promovido_por" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auditoria" (
	"id" serial PRIMARY KEY NOT NULL,
	"autor" text NOT NULL,
	"acao" text NOT NULL,
	"alvo" text NOT NULL,
	"valor_antigo" text,
	"valor_novo" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "codigos" (
	"codigo" text PRIMARY KEY NOT NULL,
	"recompensa" text NOT NULL,
	"descricao" text NOT NULL,
	"expira_em" text,
	"fonte" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "correcoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"colecao" text NOT NULL,
	"registro_id" text NOT NULL,
	"campo" text NOT NULL,
	"valor" text NOT NULL,
	"valor_base" text NOT NULL,
	"autor" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "correcoes_alvo_unico" UNIQUE("colecao","registro_id","campo")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "eventos" (
	"id" text PRIMARY KEY NOT NULL,
	"tipo" text NOT NULL,
	"titulo" text NOT NULL,
	"data" text NOT NULL,
	"ate" text,
	"destaque" boolean DEFAULT false NOT NULL,
	"autor" text NOT NULL,
	"resumo" text NOT NULL,
	"corpo" text NOT NULL
);
