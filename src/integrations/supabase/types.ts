export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bets: {
        Row: {
          bet_on: 'pending' | 'home_win' | 'draw' | 'away_win'
          game_id: number
          id: number
          odds: number
          placed_at: string
          potential_winnings: number
          stake: number
          status: 'active' | 'won' | 'lost'
          user_id: string
        }
        Insert: {
          bet_on?: 'pending' | 'home_win' | 'draw' | 'away_win'
          game_id: number
          id?: number
          odds: number
          placed_at?: string
          potential_winnings: number
          stake: number
          status?: 'active' | 'won' | 'lost'
          user_id: string
        }
        Update: {
          bet_on?: 'pending' | 'home_win' | 'draw' | 'away_win'
          game_id?: number
          id?: number
          odds?: number
          placed_at?: string
          potential_winnings?: number
          stake?: number
          status?: 'active' | 'won' | 'lost'
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'bets_game_id_fkey'
            columns: ['game_id']
            isOneToOne: false
            referencedRelation: 'games'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bets_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      games: {
        Row: {
          away_team_id: number
          away_team_score: number | null
          home_team_id: number
          home_team_score: number | null
          id: number
          league_id: number
          match_date: string
          odds_draw: number
          odds_home_win: number
          odds_away_win: number
          status: 'upcoming' | 'live' | 'finished'
        }
        Insert: {
          away_team_id: number
          away_team_score?: number | null
          home_team_id: number
          home_team_score?: number | null
          id?: number
          league_id: number
          match_date: string
          odds_draw: number
          odds_home_win: number
          odds_away_win: number
          status?: 'upcoming' | 'live' | 'finished'
        }
        Update: {
          away_team_id?: number
          away_team_score?: number | null
          home_team_id?: number
          home_team_score?: number | null
          id?: number
          league_id?: number
          match_date?: string
          odds_draw?: number
          odds_home_win?: number
          odds_away_win?: number
          status?: 'upcoming' | 'live' | 'finished'
        }
        Relationships: [
          {
            foreignKeyName: 'games_away_team_id_fkey'
            columns: ['away_team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'games_home_team_id_fkey'
            columns: ['home_team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'games_league_id_fkey'
            columns: ['league_id']
            isOneToOne: false
            referencedRelation: 'leagues'
            referencedColumns: ['id']
          }
        ]
      }
      leagues: {
        Row: {
          country: string
          id: number
          name: string
        }
        Insert: {
          country: string
          id?: number
          name: string
        }
        Update: {
          country?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          id: string
          user_id: string
          type: 'deposit' | 'subscription'
          amount: number
          status: 'pending' | 'completed' | 'failed'
          transaction_id: string | null
          phone_number: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          type: 'deposit' | 'subscription'
          amount: number
          status: 'pending' | 'completed' | 'failed'
          transaction_id?: string | null
          phone_number: string
          description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'deposit' | 'subscription'
          amount?: number
          status?: 'pending' | 'completed' | 'failed'
          transaction_id?: string | null
          phone_number?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payment_transactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      profiles: {
        Row: {
          daily_access_granted_until: string | null
          email: string
          id: string
          username: string
          wallet_balance: number
        }
        Insert: {
          daily_access_granted_until?: string | null
          email: string
          id: string
          username: string
          wallet_balance?: number
        }
        Update: {
          daily_access_granted_until?: string | null
          email?: string
          id?: string
          username?: string
          wallet_balance?: number
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      teams: {
        Row: {
          id: number
          league_id: number
          name: string
        }
        Insert: {
          id?: number
          league_id: number
          name: string
        }
        Update: {
          id?: number
          league_id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: 'teams_league_id_fkey'
            columns: ['league_id']
            isOneToOne: false
            referencedRelation: 'leagues'
            referencedColumns: ['id']
          }
        ]
      }
      transactions: {
        Row: {
          amount: number
          description: string
          id: number
          type: 'deposit' | 'withdrawal' | 'bet' | 'subscription'
          user_id: string
        }
        Insert: {
          amount: number
          description: string
          id?: number
          type: 'deposit' | 'withdrawal' | 'bet' | 'subscription'
          user_id: string
        }
        Update: {
          amount?: number
          description?: string
          id?: number
          type?: 'deposit' | 'withdrawal' | 'bet' | 'subscription'
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      user_roles: {
        Row: {
          id: number
          role: 'admin' | 'user'
          user_id: string
        }
        Insert: {
          id?: number
          role: 'admin' | 'user'
          user_id: string
        }
        Update: {
          id?: number
          role?: 'admin' | 'user'
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_roles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
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
      app_role: ["admin", "user"],
      bet_status: ["active", "won", "lost"],
      game_result: ["home_win", "draw", "away_win", "pending"],
      game_status: ["upcoming", "live", "finished"],
    },
  },
} as const
