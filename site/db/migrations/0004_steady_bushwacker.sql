CREATE TYPE "public"."status_partida" AS ENUM('agendada', 'finalizada', 'cancelada');--> statement-breakpoint
CREATE TABLE "partida_participantes" (
	"id" serial PRIMARY KEY NOT NULL,
	"partida_id" integer NOT NULL,
	"discord_id" text NOT NULL,
	"personagem_id" text,
	"entrada_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "partida_participante_unico" UNIQUE("partida_id","discord_id")
);
--> statement-breakpoint
CREATE TABLE "partidas" (
	"id" serial PRIMARY KEY NOT NULL,
	"titulo" text NOT NULL,
	"host_discord_id" text NOT NULL,
	"data_hora" timestamp with time zone NOT NULL,
	"regras" text,
	"status" "status_partida" DEFAULT 'agendada' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "partida_participantes" ADD CONSTRAINT "partida_participantes_partida_id_partidas_id_fk" FOREIGN KEY ("partida_id") REFERENCES "public"."partidas"("id") ON DELETE cascade ON UPDATE no action;