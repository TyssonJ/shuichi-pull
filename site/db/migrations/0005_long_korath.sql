CREATE TABLE "evento_comentarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"evento_id" text NOT NULL,
	"discord_id" text NOT NULL,
	"texto" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "evento_comentarios" ADD CONSTRAINT "evento_comentarios_evento_id_eventos_id_fk" FOREIGN KEY ("evento_id") REFERENCES "public"."eventos"("id") ON DELETE cascade ON UPDATE no action;