export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      answers: {
        Row: {
          communication_score: number | null
          completeness_score: number | null
          confidence_score: number | null
          created_at: string
          feedback: string | null
          id: string
          model_answer: string | null
          position: number
          question_id: number
          session_id: string
          technical_score: number | null
          time_taken_seconds: number
          timed_out: boolean
          user_id: string
          user_text: string
        }
        Insert: {
          communication_score?: number | null
          completeness_score?: number | null
          confidence_score?: number | null
          created_at?: string
          feedback?: string | null
          id?: string
          model_answer?: string | null
          position: number
          question_id: number
          session_id: string
          technical_score?: number | null
          time_taken_seconds?: number
          timed_out?: boolean
          user_id: string
          user_text: string
        }
        Update: {
          communication_score?: number | null
          completeness_score?: number | null
          confidence_score?: number | null
          created_at?: string
          feedback?: string | null
          id?: string
          model_answer?: string | null
          position?: number
          question_id?: number
          session_id?: string
          technical_score?: number | null
          time_taken_seconds?: number
          timed_out?: boolean
          user_id?: string
          user_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ats_reports: {
        Row: {
          ats_score: number
          breakdown: Json
          created_at: string
          file_name: string
          id: string
          suggestions: Json
          user_id: string
        }
        Insert: {
          ats_score: number
          breakdown?: Json
          created_at?: string
          file_name: string
          id?: string
          suggestions?: Json
          user_id: string
        }
        Update: {
          ats_score?: number
          breakdown?: Json
          created_at?: string
          file_name?: string
          id?: string
          suggestions?: Json
          user_id?: string
        }
        Relationships: []
      }
      badge_attempts: {
        Row: {
          created_at: string
          id: string
          newly_earned: boolean
          scores: Json
          skipped_count: number
          top_trait: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          newly_earned?: boolean
          scores?: Json
          skipped_count?: number
          top_trait: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          newly_earned?: boolean
          scores?: Json
          skipped_count?: number
          top_trait?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      interview_role_config: {
        Row: {
          description: string
          role: string
          rounds: Json
          sort_order: number
          title: string
          updated_at: string
          uses_code: boolean
        }
        Insert: {
          description: string
          role: string
          rounds: Json
          sort_order?: number
          title: string
          updated_at?: string
          uses_code?: boolean
        }
        Update: {
          description?: string
          role?: string
          rounds?: Json
          sort_order?: number
          title?: string
          updated_at?: string
          uses_code?: boolean
        }
        Relationships: []
      }
      performance_snapshots: {
        Row: {
          ats_last_score: number | null
          avg_communication: number | null
          avg_completeness: number | null
          avg_confidence: number | null
          avg_technical: number | null
          id: string
          interviews_taken: number
          readiness_score: number
          snapshot_date: string
          topics_covered: Json
          user_id: string
        }
        Insert: {
          ats_last_score?: number | null
          avg_communication?: number | null
          avg_completeness?: number | null
          avg_confidence?: number | null
          avg_technical?: number | null
          id?: string
          interviews_taken?: number
          readiness_score?: number
          snapshot_date?: string
          topics_covered?: Json
          user_id: string
        }
        Update: {
          ats_last_score?: number | null
          avg_communication?: number | null
          avg_completeness?: number | null
          avg_confidence?: number | null
          avg_technical?: number | null
          id?: string
          interviews_taken?: number
          readiness_score?: number
          snapshot_date?: string
          topics_covered?: Json
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          additional_links: Json
          additional_skills: Json
          archetype: string | null
          avatar_url: string | null
          certificates: Json
          city: string | null
          college: string | null
          core_subjects: Json
          country: string | null
          course: string | null
          created_at: string
          degree: string | null
          gender: string | null
          graduation_year: string | null
          id: string
          linkedin_url: string | null
          name: string
          onboarded_at: string | null
          personality_answers: Json
          phone: string | null
          preferred_languages: Json
          programming_languages: Json
          projects: Json
          specialization: string | null
          stat_adaptability: number
          stat_focus: number
          stat_resilience: number
          state: string | null
          target_role: string | null
          tour_completed: boolean
          tour_prompted: boolean
          ui_language: string
          year_of_study: string | null
        }
        Insert: {
          additional_links?: Json
          additional_skills?: Json
          archetype?: string | null
          avatar_url?: string | null
          certificates?: Json
          city?: string | null
          college?: string | null
          core_subjects?: Json
          country?: string | null
          course?: string | null
          created_at?: string
          degree?: string | null
          gender?: string | null
          graduation_year?: string | null
          id: string
          linkedin_url?: string | null
          name?: string
          onboarded_at?: string | null
          personality_answers?: Json
          phone?: string | null
          preferred_languages?: Json
          programming_languages?: Json
          projects?: Json
          specialization?: string | null
          stat_adaptability?: number
          stat_focus?: number
          stat_resilience?: number
          state?: string | null
          target_role?: string | null
          tour_completed?: boolean
          tour_prompted?: boolean
          ui_language?: string
          year_of_study?: string | null
        }
        Update: {
          additional_links?: Json
          additional_skills?: Json
          archetype?: string | null
          avatar_url?: string | null
          certificates?: Json
          city?: string | null
          college?: string | null
          core_subjects?: Json
          country?: string | null
          course?: string | null
          created_at?: string
          degree?: string | null
          gender?: string | null
          graduation_year?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string
          onboarded_at?: string | null
          personality_answers?: Json
          phone?: string | null
          preferred_languages?: Json
          programming_languages?: Json
          projects?: Json
          specialization?: string | null
          stat_adaptability?: number
          stat_focus?: number
          stat_resilience?: number
          state?: string | null
          target_role?: string | null
          tour_completed?: boolean
          tour_prompted?: boolean
          ui_language?: string
          year_of_study?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_option: number | null
          created_at: string
          difficulty: string
          id: number
          language: string
          options: Json | null
          role: string
          sample_answer: string
          source: string
          tags: Json
          text: string
          topic: string
          type: string
        }
        Insert: {
          correct_option?: number | null
          created_at?: string
          difficulty: string
          id?: number
          language?: string
          options?: Json | null
          role?: string
          sample_answer: string
          source: string
          tags?: Json
          text: string
          topic: string
          type: string
        }
        Update: {
          correct_option?: number | null
          created_at?: string
          difficulty?: string
          id?: number
          language?: string
          options?: Json | null
          role?: string
          sample_answer?: string
          source?: string
          tags?: Json
          text?: string
          topic?: string
          type?: string
        }
        Relationships: []
      }
      roadmap_items: {
        Row: {
          action: string
          created_at: string
          id: string
          practice_question_ids: Json
          priority: number
          resources: Json
          role: string
          status: string
          title: string
          topic: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          practice_question_ids?: Json
          priority?: number
          resources?: Json
          role: string
          status?: string
          title: string
          topic: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          practice_question_ids?: Json
          priority?: number
          resources?: Json
          role?: string
          status?: string
          title?: string
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      roadmaps: {
        Row: {
          created_at: string
          id: string
          items: Json
          role: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json
          role: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          role?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmaps_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          ended_at: string | null
          id: string
          languages: Json
          overall_score: number | null
          question_ids: Json
          role: string
          round_type: string
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          ended_at?: string | null
          id?: string
          languages?: Json
          overall_score?: number | null
          question_ids?: Json
          role: string
          round_type: string
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          ended_at?: string | null
          id?: string
          languages?: Json
          overall_score?: number | null
          question_ids?: Json
          role?: string
          round_type?: string
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      skill_gaps: {
        Row: {
          created_at: string
          id: string
          session_id: string | null
          severity: string
          skill_name: string
          source: string
          topic: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_id?: string | null
          severity: string
          skill_name: string
          source?: string
          topic: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string | null
          severity?: string
          skill_name?: string
          source?: string
          topic?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_gaps_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          best_scores: Json
          curious_mind: boolean
          earned: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          best_scores?: Json
          curious_mind?: boolean
          earned?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          best_scores?: Json
          curious_mind?: boolean
          earned?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
