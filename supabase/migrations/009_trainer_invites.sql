CREATE TABLE IF NOT EXISTS trainer_invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id  UUID NOT NULL,
  lead_id     UUID,
  email       TEXT,
  full_name   TEXT,
  token       TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  used_at     TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trainer_invites_token ON trainer_invites (token);
CREATE INDEX IF NOT EXISTS idx_trainer_invites_trainer ON trainer_invites (trainer_id);

ALTER TABLE trainer_invites ENABLE ROW LEVEL SECURITY;

-- Trainers can manage their own invites
CREATE POLICY "trainers_own_invites" ON trainer_invites
  FOR ALL USING (auth.uid() = trainer_id);

-- Anyone can read an invite by token (for the join page)
CREATE POLICY "public_read_by_token" ON trainer_invites
  FOR SELECT USING (true);
