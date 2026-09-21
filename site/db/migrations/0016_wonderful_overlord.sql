CREATE TABLE "perfil_estilos" (
	"discord_id" text PRIMARY KEY NOT NULL,
	"publicado" jsonb,
	"pendente" jsonb,
	"status" text DEFAULT 'nenhum' NOT NULL,
	"motivo_rejeicao" text,
	"enviado_em" timestamp with time zone,
	"revisado_por" text,
	"revisado_em" timestamp with time zone,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
