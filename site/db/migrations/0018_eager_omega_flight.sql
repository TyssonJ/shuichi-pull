CREATE TABLE "chat_mensagens" (
	"id" serial PRIMARY KEY NOT NULL,
	"sala" text NOT NULL,
	"autor_discord_id" text NOT NULL,
	"texto" text DEFAULT '' NOT NULL,
	"anexos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_presenca" (
	"discord_id" text PRIMARY KEY NOT NULL,
	"sala" text NOT NULL,
	"visto_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "chat_mensagens_sala_idx" ON "chat_mensagens" USING btree ("sala","id");--> statement-breakpoint
CREATE INDEX "chat_mensagens_criado_idx" ON "chat_mensagens" USING btree ("criado_em");--> statement-breakpoint
CREATE INDEX "chat_mensagens_autor_idx" ON "chat_mensagens" USING btree ("autor_discord_id","criado_em");