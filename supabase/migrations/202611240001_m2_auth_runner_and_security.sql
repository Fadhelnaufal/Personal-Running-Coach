-- Milestone 2: Authentication, Security Foundation, Runner Profile, and Goals
-- Strictly scoped to M2 tables: runner_profiles, runner_goals, oauth_states, audit_logs.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Shared updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 1. runner_profiles
CREATE TABLE IF NOT EXISTS public.runner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  timezone_name text NOT NULL DEFAULT 'UTC',
  experience_level text CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  preferred_distance_unit text NOT NULL DEFAULT 'km' CHECK (preferred_distance_unit IN ('km', 'mi')),
  preferred_pace_unit text NOT NULL DEFAULT 'min_per_km' CHECK (preferred_pace_unit IN ('min_per_km', 'min_per_mile')),
  weekly_running_days smallint CHECK (weekly_running_days BETWEEN 1 AND 7),
  preferred_training_days smallint[],
  unavailable_days smallint[],
  recent_weekly_distance_m numeric CHECK (recent_weekly_distance_m IS NULL OR recent_weekly_distance_m >= 0),
  longest_recent_run_m numeric CHECK (longest_recent_run_m IS NULL OR longest_recent_run_m >= 0),
  easy_pace_sec_per_km integer CHECK (easy_pace_sec_per_km IS NULL OR easy_pace_sec_per_km > 0),
  threshold_pace_sec_per_km integer CHECK (threshold_pace_sec_per_km IS NULL OR threshold_pace_sec_per_km > 0),
  resting_hr_bpm smallint CHECK (resting_hr_bpm IS NULL OR resting_hr_bpm BETWEEN 30 AND 130),
  max_hr_bpm smallint CHECK (max_hr_bpm IS NULL OR max_hr_bpm BETWEEN 100 AND 230),
  lthr_bpm smallint CHECK (lthr_bpm IS NULL OR lthr_bpm BETWEEN 90 AND 220),
  hr_zones jsonb,
  weight_kg numeric CHECK (weight_kg IS NULL OR weight_kg > 0),
  injury_history jsonb,
  notes text,
  profile_completed_at timestamptz,
  baseline_updated_at timestamptz,
  baseline_source text CHECK (baseline_source IN ('manual', 'strava_derived', 'mixed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT runner_profiles_hr_bounds_check CHECK (
    max_hr_bpm IS NULL OR resting_hr_bpm IS NULL OR max_hr_bpm > resting_hr_bpm
  ),
  CONSTRAINT runner_profiles_preferred_days_check CHECK (
    preferred_training_days IS NULL OR (
      preferred_training_days <@ ARRAY[1,2,3,4,5,6,7]::smallint[]
    )
  ),
  CONSTRAINT runner_profiles_unavailable_days_check CHECK (
    unavailable_days IS NULL OR (
      unavailable_days <@ ARRAY[1,2,3,4,5,6,7]::smallint[]
    )
  )
);

CREATE TRIGGER set_runner_profiles_updated_at
  BEFORE UPDATE ON public.runner_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. runner_goals
CREATE TABLE IF NOT EXISTS public.runner_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type text NOT NULL CHECK (goal_type IN ('5k', '10k', 'half_marathon', 'marathon', 'custom')),
  title text NOT NULL CHECK (char_length(trim(title)) > 0),
  target_distance_m numeric NOT NULL CHECK (target_distance_m > 0),
  target_time_sec integer CHECK (target_time_sec IS NULL OR target_time_sec > 0),
  race_date date,
  priority text NOT NULL CHECK (priority IN ('primary', 'secondary')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT runner_goals_id_user_unique UNIQUE (id, user_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS runner_goals_one_active_primary_idx
  ON public.runner_goals (user_id)
  WHERE priority = 'primary' AND status = 'active';

CREATE INDEX IF NOT EXISTS runner_goals_user_status_idx
  ON public.runner_goals (user_id, status, priority);

CREATE TRIGGER set_runner_goals_updated_at
  BEFORE UPDATE ON public.runner_goals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. oauth_states (server-only table; zero policies for anon/authenticated)
CREATE TABLE IF NOT EXISTS public.oauth_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'strava',
  state_hash text NOT NULL UNIQUE,
  redirect_path text,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. audit_logs (read-only for owner; server-controlled inserts)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  before_snapshot jsonb,
  after_snapshot jsonb,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_user_created_idx
  ON public.audit_logs (user_id, created_at DESC);

-- Enable Row Level Security on all tables
ALTER TABLE public.runner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.runner_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for runner_profiles
CREATE POLICY runner_profiles_select_own ON public.runner_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY runner_profiles_insert_own ON public.runner_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY runner_profiles_update_own ON public.runner_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY runner_profiles_delete_own ON public.runner_profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Policies for runner_goals
CREATE POLICY runner_goals_select_own ON public.runner_goals
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY runner_goals_insert_own ON public.runner_goals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY runner_goals_update_own ON public.runner_goals
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY runner_goals_delete_own ON public.runner_goals
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Policies for audit_logs (SELECT only for owner; mutations via service_role only)
CREATE POLICY audit_logs_select_own ON public.audit_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- No policies on oauth_states (service_role only)

-- Atomic RPC to switch/activate a primary goal without partial-unique race conflicts
CREATE OR REPLACE FUNCTION public.activate_primary_goal(
  p_user_id uuid,
  p_goal_id uuid
)
RETURNS public.runner_goals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_goal public.runner_goals;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Forbidden: cannot modify another user goal';
  END IF;

  SELECT * INTO v_goal
  FROM public.runner_goals
  WHERE id = p_goal_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Goal not found for user';
  END IF;

  UPDATE public.runner_goals
  SET status = 'archived'
  WHERE user_id = p_user_id
    AND priority = 'primary'
    AND status = 'active'
    AND id <> p_goal_id;

  UPDATE public.runner_goals
  SET priority = 'primary',
      status = 'active'
  WHERE id = p_goal_id
    AND user_id = p_user_id
  RETURNING * INTO v_goal;

  RETURN v_goal;
END;
$$;
