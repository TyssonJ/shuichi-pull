CREATE TABLE "usuarios" (
	"discord_id" text PRIMARY KEY NOT NULL,
	"discord_nome" text NOT NULL,
	"discord_avatar" text,
	"uuid_gmod" text,
	"mains" text[] DEFAULT '{}' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
