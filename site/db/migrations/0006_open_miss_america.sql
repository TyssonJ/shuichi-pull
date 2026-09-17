CREATE TYPE "public"."resultado_partida" AS ENUM('vitoria_alunos', 'vitoria_mestre', 'tragedia');--> statement-breakpoint
CREATE TYPE "public"."tipo_avaliacao" AS ENUM('like', 'dislike');--> statement-breakpoint
CREATE TABLE "partida_avaliacoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"partida_id" integer NOT NULL,
	"avaliador_discord_id" text NOT NULL,
	"avaliado_discord_id" text NOT NULL,
	"tipo" "tipo_avaliacao" NOT NULL,
	"comentario" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "partida_avaliacao_unica" UNIQUE("partida_id","avaliador_discord_id","avaliado_discord_id")
);
--> statement-breakpoint
ALTER TABLE "partidas" ADD COLUMN "capa_url" text;--> statement-breakpoint
ALTER TABLE "partidas" ADD COLUMN "capitulo" text;--> statement-breakpoint
ALTER TABLE "partidas" ADD COLUMN "blackened" text;--> statement-breakpoint
ALTER TABLE "partidas" ADD COLUMN "mvp_discord_id" text;--> statement-breakpoint
ALTER TABLE "partidas" ADD COLUMN "resultado" "resultado_partida";--> statement-breakpoint
ALTER TABLE "partida_avaliacoes" ADD CONSTRAINT "partida_avaliacoes_partida_id_partidas_id_fk" FOREIGN KEY ("partida_id") REFERENCES "public"."partidas"("id") ON DELETE cascade ON UPDATE no action;