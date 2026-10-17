-- Migración 0001: Evolución del Esquema (Requisito 4)
-- Agrega columna 'period' a matches y detalles ampliados a match_events

ALTER TABLE "matches" ADD COLUMN IF NOT EXISTS "period" varchar(50) DEFAULT 'first_half' NOT NULL;
--> statement-breakpoint
ALTER TABLE "match_events" ADD COLUMN IF NOT EXISTS "player_name" varchar(100);
--> statement-breakpoint
ALTER TABLE "match_events" ADD COLUMN IF NOT EXISTS "card_type" varchar(20) DEFAULT 'none';
--> statement-breakpoint
ALTER TABLE "match_events" ADD COLUMN IF NOT EXISTS "extra_info" varchar(255);
