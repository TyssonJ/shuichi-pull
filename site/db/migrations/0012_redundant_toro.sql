ALTER TYPE "public"."status_partida" ADD VALUE 'em_andamento' BEFORE 'finalizada';--> statement-breakpoint
ALTER TABLE "partida_avaliacoes" ALTER COLUMN "tipo" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "partida_avaliacoes" ADD COLUMN "estrelas" integer;--> statement-breakpoint
UPDATE "partida_avaliacoes" SET "estrelas" = CASE WHEN "tipo" = 'like' THEN 5 ELSE 1 END;--> statement-breakpoint
ALTER TABLE "partida_avaliacoes" ALTER COLUMN "estrelas" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "partida_participantes" ADD COLUMN "convidado" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "partidas" ADD COLUMN "iniciada_em" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "partidas" ADD COLUMN "finalizada_em" timestamp with time zone;