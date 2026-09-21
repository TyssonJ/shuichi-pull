ALTER TABLE "itens_extras" ADD COLUMN "ramo_pt" text;--> statement-breakpoint
ALTER TABLE "itens_extras" ADD COLUMN "ramo_en" text;--> statement-breakpoint
ALTER TABLE "itens_extras" ADD COLUMN "descricao_en" text;--> statement-breakpoint
ALTER TABLE "itens_extras" ADD COLUMN "efeito_pt" text;--> statement-breakpoint
ALTER TABLE "itens_extras" ADD COLUMN "efeito_en" text;--> statement-breakpoint
ALTER TABLE "itens_extras" ADD COLUMN "loja_vendedor" text;--> statement-breakpoint
ALTER TABLE "itens_extras" ADD COLUMN "loja_preco" integer;--> statement-breakpoint
ALTER TABLE "itens_extras" ADD COLUMN "craft" jsonb;--> statement-breakpoint
ALTER TABLE "itens_extras" ADD COLUMN "spawns" jsonb;--> statement-breakpoint
ALTER TABLE "partidas" ADD COLUMN "vagas" integer DEFAULT 16 NOT NULL;--> statement-breakpoint
ALTER TABLE "personagens_extras" ADD COLUMN "etiquetas" jsonb;--> statement-breakpoint
ALTER TABLE "personagens_extras" ADD COLUMN "personalidade" text;--> statement-breakpoint
ALTER TABLE "personagens_extras" ADD COLUMN "aparencia" text;--> statement-breakpoint
ALTER TABLE "personagens_extras" ADD COLUMN "historia" text;--> statement-breakpoint
ALTER TABLE "personagens_extras" ADD COLUMN "segredo" text;