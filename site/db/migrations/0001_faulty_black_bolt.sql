CREATE TABLE "itens_extras" (
	"id" text PRIMARY KEY NOT NULL,
	"nome_pt" text NOT NULL,
	"nome_en" text NOT NULL,
	"categoria_pt" text NOT NULL,
	"categoria_en" text NOT NULL,
	"raridade_pt" text NOT NULL,
	"raridade_en" text NOT NULL,
	"nivel_raridade" integer NOT NULL,
	"peso" real,
	"icone" text,
	"descricao_pt" text,
	"autor" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "itens_removidos" (
	"item_id" text PRIMARY KEY NOT NULL,
	"autor" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
