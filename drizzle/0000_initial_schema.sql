-- Migración 0000: Esquema Inicial de Partidos y Eventos
-- Generado para Drizzle ORM / PostgreSQL

CREATE TABLE IF NOT EXISTS "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"local_team" varchar(100) NOT NULL,
	"away_team" varchar(100) NOT NULL,
	"status" varchar(50) DEFAULT 'scheduled' NOT NULL,
	"local_score" integer DEFAULT 0 NOT NULL,
	"away_score" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "match_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_id" integer NOT NULL,
	"minute" integer NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"team" varchar(10) NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "match_events" ADD CONSTRAINT "match_events_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
