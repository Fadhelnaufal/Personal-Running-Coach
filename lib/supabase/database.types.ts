export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      runner_profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string | null;
          timezone_name: string;
          experience_level: "beginner" | "intermediate" | "advanced" | null;
          preferred_distance_unit: "km" | "mi";
          preferred_pace_unit: "min_per_km" | "min_per_mile";
          weekly_running_days: number | null;
          preferred_training_days: number[] | null;
          unavailable_days: number[] | null;
          recent_weekly_distance_m: number | null;
          longest_recent_run_m: number | null;
          easy_pace_sec_per_km: number | null;
          threshold_pace_sec_per_km: number | null;
          resting_hr_bpm: number | null;
          max_hr_bpm: number | null;
          lthr_bpm: number | null;
          hr_zones: Json | null;
          weight_kg: number | null;
          injury_history: Json | null;
          notes: string | null;
          profile_completed_at: string | null;
          baseline_updated_at: string | null;
          baseline_source: "manual" | "strava_derived" | "mixed" | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string | null;
          timezone_name?: string;
          experience_level?: "beginner" | "intermediate" | "advanced" | null;
          preferred_distance_unit?: "km" | "mi";
          preferred_pace_unit?: "min_per_km" | "min_per_mile";
          weekly_running_days?: number | null;
          preferred_training_days?: number[] | null;
          unavailable_days?: number[] | null;
          recent_weekly_distance_m?: number | null;
          longest_recent_run_m?: number | null;
          easy_pace_sec_per_km?: number | null;
          threshold_pace_sec_per_km?: number | null;
          resting_hr_bpm?: number | null;
          max_hr_bpm?: number | null;
          lthr_bpm?: number | null;
          hr_zones?: Json | null;
          weight_kg?: number | null;
          injury_history?: Json | null;
          notes?: string | null;
          profile_completed_at?: string | null;
          baseline_updated_at?: string | null;
          baseline_source?: "manual" | "strava_derived" | "mixed" | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["runner_profiles"]["Insert"]>;
        Relationships: [];
      };
      runner_goals: {
        Row: {
          id: string;
          user_id: string;
          goal_type: "5k" | "10k" | "half_marathon" | "marathon" | "custom";
          title: string;
          target_distance_m: number;
          target_time_sec: number | null;
          race_date: string | null;
          priority: "primary" | "secondary";
          status: "active" | "achieved" | "archived";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal_type: "5k" | "10k" | "half_marathon" | "marathon" | "custom";
          title: string;
          target_distance_m: number;
          target_time_sec?: number | null;
          race_date?: string | null;
          priority: "primary" | "secondary";
          status?: "active" | "achieved" | "archived";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["runner_goals"]["Insert"]>;
        Relationships: [];
      };
      oauth_states: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          state_hash: string;
          redirect_path: string | null;
          expires_at: string;
          consumed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider?: string;
          state_hash: string;
          redirect_path?: string | null;
          expires_at: string;
          consumed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["oauth_states"]["Insert"]>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          actor_user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          before_snapshot: Json | null;
          after_snapshot: Json | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          actor_user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          before_snapshot?: Json | null;
          after_snapshot?: Json | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      activate_primary_goal: {
        Args: {
          p_user_id: string;
          p_goal_id: string;
        };
        Returns: Database["public"]["Tables"]["runner_goals"]["Row"];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type RunnerProfileRow = Database["public"]["Tables"]["runner_profiles"]["Row"];
export type RunnerGoalRow = Database["public"]["Tables"]["runner_goals"]["Row"];
export type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];
