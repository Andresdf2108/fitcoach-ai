CREATE TABLE IF NOT EXISTS nutrition_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id    UUID NOT NULL,
  meal_type     TEXT DEFAULT 'snack' CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_description TEXT,
  calories      INTEGER,
  protein_g     NUMERIC(6,1),
  carbs_g       NUMERIC(6,1),
  fat_g         NUMERIC(6,1),
  fiber_g       NUMERIC(6,1),
  ai_notes      TEXT,
  logged_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nutrition_logs_trainee
  ON nutrition_logs (trainee_id, logged_at DESC);

ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;

-- Trainees manage their own logs
CREATE POLICY "trainees_own_nutrition" ON nutrition_logs
  FOR ALL USING (auth.uid() = trainee_id);

-- Trainers can read their clients' logs
CREATE POLICY "trainers_view_client_nutrition" ON nutrition_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trainees
      WHERE trainees.id = nutrition_logs.trainee_id
        AND trainees.trainer_id = auth.uid()
    )
  );
