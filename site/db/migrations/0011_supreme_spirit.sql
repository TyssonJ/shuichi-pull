CREATE TABLE "conteudo_extras" (
	"colecao" text NOT NULL,
	"id" text NOT NULL,
	"dados" jsonb NOT NULL,
	"autor" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conteudo_extras_colecao_id_pk" PRIMARY KEY("colecao","id")
);
--> statement-breakpoint
CREATE TABLE "conteudo_removidos" (
	"colecao" text NOT NULL,
	"registro_id" text NOT NULL,
	"autor" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conteudo_removidos_colecao_registro_id_pk" PRIMARY KEY("colecao","registro_id")
);
--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "banner_tipo" text;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "banner_valor" text;