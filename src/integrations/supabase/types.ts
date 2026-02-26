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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      coaches: {
        Row: {
          availability: string | null
          bio: string | null
          country: string | null
          created_at: string
          created_by: string | null
          email: string | null
          experience: string | null
          id: string
          linkedin: string | null
          name: string
          organization: string | null
          phone: string | null
          photo_url: string | null
          preferred_client_type: string | null
          preferred_communication: string | null
          specialization: string | null
          status: string
          updated_at: string
        }
        Insert: {
          availability?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          experience?: string | null
          id?: string
          linkedin?: string | null
          name: string
          organization?: string | null
          phone?: string | null
          photo_url?: string | null
          preferred_client_type?: string | null
          preferred_communication?: string | null
          specialization?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          availability?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          experience?: string | null
          id?: string
          linkedin?: string | null
          name?: string
          organization?: string | null
          phone?: string | null
          photo_url?: string | null
          preferred_client_type?: string | null
          preferred_communication?: string | null
          specialization?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      entrepreneurs: {
        Row: {
          about_entrepreneur: string | null
          business_description: string | null
          business_name: string
          coaching_needs: string | null
          competition: string | null
          country: string
          created_at: string
          created_by: string | null
          education_background: string | null
          email: string | null
          employees_fulltime: number | null
          employees_parttime: number | null
          financial_recording_method: string | null
          financials: string | null
          funding_needs: string | null
          gender: string
          id: string
          impact: string | null
          industry_analysis: string | null
          linkedin: string | null
          main_challenge: string | null
          market_size: string | null
          name: string
          next_of_kin: string | null
          opportunities: string | null
          phone: string | null
          photo_url: string | null
          pitch_deck_url: string | null
          pitch_summary: string | null
          preferred_communication: string | null
          products_services: string | null
          program_id: string | null
          revenue: string | null
          sector: string
          stage: string
          status: string
          team_size: number | null
          top_challenges: string | null
          updated_at: string
          video_url: string | null
          website: string | null
          year_founded: number | null
        }
        Insert: {
          about_entrepreneur?: string | null
          business_description?: string | null
          business_name: string
          coaching_needs?: string | null
          competition?: string | null
          country: string
          created_at?: string
          created_by?: string | null
          education_background?: string | null
          email?: string | null
          employees_fulltime?: number | null
          employees_parttime?: number | null
          financial_recording_method?: string | null
          financials?: string | null
          funding_needs?: string | null
          gender: string
          id?: string
          impact?: string | null
          industry_analysis?: string | null
          linkedin?: string | null
          main_challenge?: string | null
          market_size?: string | null
          name: string
          next_of_kin?: string | null
          opportunities?: string | null
          phone?: string | null
          photo_url?: string | null
          pitch_deck_url?: string | null
          pitch_summary?: string | null
          preferred_communication?: string | null
          products_services?: string | null
          program_id?: string | null
          revenue?: string | null
          sector: string
          stage: string
          status?: string
          team_size?: number | null
          top_challenges?: string | null
          updated_at?: string
          video_url?: string | null
          website?: string | null
          year_founded?: number | null
        }
        Update: {
          about_entrepreneur?: string | null
          business_description?: string | null
          business_name?: string
          coaching_needs?: string | null
          competition?: string | null
          country?: string
          created_at?: string
          created_by?: string | null
          education_background?: string | null
          email?: string | null
          employees_fulltime?: number | null
          employees_parttime?: number | null
          financial_recording_method?: string | null
          financials?: string | null
          funding_needs?: string | null
          gender?: string
          id?: string
          impact?: string | null
          industry_analysis?: string | null
          linkedin?: string | null
          main_challenge?: string | null
          market_size?: string | null
          name?: string
          next_of_kin?: string | null
          opportunities?: string | null
          phone?: string | null
          photo_url?: string | null
          pitch_deck_url?: string | null
          pitch_summary?: string | null
          preferred_communication?: string | null
          products_services?: string | null
          program_id?: string | null
          revenue?: string | null
          sector?: string
          stage?: string
          status?: string
          team_size?: number | null
          top_challenges?: string | null
          updated_at?: string
          video_url?: string | null
          website?: string | null
          year_founded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "entrepreneurs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          coach_id: string
          created_at: string
          created_by: string | null
          entrepreneur_id: string
          id: string
          notes: string | null
          program_id: string | null
          request_id: string | null
          status: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          created_by?: string | null
          entrepreneur_id: string
          id?: string
          notes?: string | null
          program_id?: string | null
          request_id?: string | null
          status?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          created_by?: string | null
          entrepreneur_id?: string
          id?: string
          notes?: string | null
          program_id?: string | null
          request_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_entrepreneur_id_fkey"
            columns: ["entrepreneur_id"]
            isOneToOne: false
            referencedRelation: "entrepreneurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "matching_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      matching_requests: {
        Row: {
          created_at: string
          entrepreneur_selections: Json | null
          id: string
          message: string | null
          requester_email: string
          requester_name: string
          requester_organization: string | null
          requester_role: string
          status: string
          support_description: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          entrepreneur_selections?: Json | null
          id?: string
          message?: string | null
          requester_email: string
          requester_name: string
          requester_organization?: string | null
          requester_role: string
          status?: string
          support_description?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          entrepreneur_selections?: Json | null
          id?: string
          message?: string | null
          requester_email?: string
          requester_name?: string
          requester_organization?: string | null
          requester_role?: string
          status?: string
          support_description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          coach_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          coach_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          coach_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      program_coaches: {
        Row: {
          coach_id: string
          created_at: string
          id: string
          program_id: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          id?: string
          program_id: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          id?: string
          program_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_coaches_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_coaches_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_track_notes: {
        Row: {
          author_id: string | null
          created_at: string
          id: string
          note: string
          project_id: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          id?: string
          note: string
          project_id: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          id?: string
          note?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_track_notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          coach_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          entrepreneur_id: string | null
          id: string
          match_id: string | null
          name: string
          program_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          coach_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          entrepreneur_id?: string | null
          id?: string
          match_id?: string | null
          name: string
          program_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          coach_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          entrepreneur_id?: string | null
          id?: string
          match_id?: string | null
          name?: string
          program_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_entrepreneur_id_fkey"
            columns: ["entrepreneur_id"]
            isOneToOne: false
            referencedRelation: "entrepreneurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          file_type: string | null
          file_url: string
          id: string
          program_id: string | null
          title: string
          updated_at: string
          uploaded_by: string | null
          visibility: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          program_id?: string | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
          visibility?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          program_id?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          program_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          program_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          program_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_signup_eligibility: { Args: { check_email: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "staff" | "program_admin" | "coach"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "program_admin", "coach"],
    },
  },
} as const
