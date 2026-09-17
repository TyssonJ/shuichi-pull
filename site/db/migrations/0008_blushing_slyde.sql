CREATE TYPE "public"."status_uuid" AS ENUM('pendente', 'aprovado', 'banido');--> statement-breakpoint
CREATE TYPE "public"."tipo_participante" AS ENUM('participante', 'reserva');--> statement-breakpoint
CREATE TABLE "configuracoes" (
	"chave" text PRIMARY KEY NOT NULL,
	"valor" text NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partida_capitulos" (
	"id" serial PRIMARY KEY NOT NULL,
	"partida_id" integer NOT NULL,
	"numero" integer NOT NULL,
	"assassino_discord_id" text,
	"vitima_discord_id" text,
	"afk" text[] DEFAULT '{}' NOT NULL,
	CONSTRAINT "partida_capitulo_unico" UNIQUE("partida_id","numero")
);
--> statement-breakpoint
ALTER TABLE "partida_participantes" ADD COLUMN "tipo" "tipo_participante" DEFAULT 'participante' NOT NULL;--> statement-breakpoint
ALTER TABLE "partidas" ADD COLUMN "mvp_discord_ids" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "uuid_status" "status_uuid" DEFAULT 'pendente' NOT NULL;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "pode_ser_host" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "partida_capitulos" ADD CONSTRAINT "partida_capitulos_partida_id_partidas_id_fk" FOREIGN KEY ("partida_id") REFERENCES "public"."partidas"("id") ON DELETE cascade ON UPDATE no action;