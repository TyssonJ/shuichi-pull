CREATE TABLE "perfil_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"discord_id" text NOT NULL,
	"texto" text DEFAULT '' NOT NULL,
	"anexos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "perfil_posts_discord_idx" ON "perfil_posts" USING btree ("discord_id","criado_em");