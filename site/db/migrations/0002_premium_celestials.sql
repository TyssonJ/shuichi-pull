CREATE TABLE "personagens_extras" (
	"id" text PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"talento_pt" text NOT NULL,
	"talento_en" text NOT NULL,
	"descricao_pt" text NOT NULL,
	"descricao_en" text NOT NULL,
	"jogo" text NOT NULL,
	"velocidade" integer NOT NULL,
	"mochila" integer NOT NULL,
	"percepcao" integer NOT NULL,
	"vida" integer NOT NULL,
	"sprite" text,
	"autor" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personagens_removidos" (
	"personagem_id" text PRIMARY KEY NOT NULL,
	"autor" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
