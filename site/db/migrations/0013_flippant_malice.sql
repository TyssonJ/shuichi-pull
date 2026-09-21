ALTER TABLE "partida_avaliacoes" ALTER COLUMN "partida_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "partida_avaliacoes" ADD COLUMN "origem" text DEFAULT 'site' NOT NULL;--> statement-breakpoint
ALTER TABLE "partida_avaliacoes" ADD COLUMN "externo_id" text;--> statement-breakpoint
ALTER TABLE "partida_avaliacoes" ADD CONSTRAINT "partida_avaliacao_externa" UNIQUE("origem","externo_id");