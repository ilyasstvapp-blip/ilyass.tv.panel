-- Add YSScores integration fields to live_events table
ALTER TABLE live_events
  ADD COLUMN IF NOT EXISTS match_id bigint UNIQUE,
  ADD COLUMN IF NOT EXISTS is_live boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS event_status text NOT NULL DEFAULT 'UPCOMING',
  ADD COLUMN IF NOT EXISTS package_id uuid REFERENCES packages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_live_events_match_id ON live_events(match_id);
CREATE INDEX IF NOT EXISTS idx_live_events_event_status ON live_events(event_status);
CREATE INDEX IF NOT EXISTS idx_live_events_is_live ON live_events(is_live);
