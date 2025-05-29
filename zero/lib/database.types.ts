export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      account: {
        Row: {
          description: string | null
          idx: string
          login_id: string | null
          login_pwd: string | null
          name: string
          recentChangeDate: string | null
          state: boolean | null
          url: string | null
        }
        Insert: {
          description?: string | null
          idx?: string
          login_id?: string | null
          login_pwd?: string | null
          name: string
          recentChangeDate?: string | null
          state?: boolean | null
          url?: string | null
        }
        Update: {
          description?: string | null
          idx?: string
          login_id?: string | null
          login_pwd?: string | null
          name?: string
          recentChangeDate?: string | null
          state?: boolean | null
          url?: string | null
        }
        Relationships: []
      }
      accountAccess: {
        Row: {
          account: string
          idx: string
          user: string
        }
        Insert: {
          account: string
          idx?: string
          user: string
        }
        Update: {
          account?: string
          idx?: string
          user?: string
        }
        Relationships: [
          {
            foreignKeyName: "accountAccess_account_fkey"
            columns: ["account"]
            isOneToOne: false
            referencedRelation: "account"
            referencedColumns: ["idx"]
          },
          {
            foreignKeyName: "accountAccess_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          asset_detail: string | null
          asset_img: string | null
          asset_memo: string | null
          asset_name: string
          check_date: string | null
          code: string
          id: string
          profile_user: string | null
          seat_user: string | null
          start_date: string | null
          state: boolean | null
        }
        Insert: {
          asset_detail?: string | null
          asset_img?: string | null
          asset_memo?: string | null
          asset_name: string
          check_date?: string | null
          code: string
          id?: string
          profile_user?: string | null
          seat_user?: string | null
          start_date?: string | null
          state?: boolean | null
        }
        Update: {
          asset_detail?: string | null
          asset_img?: string | null
          asset_memo?: string | null
          asset_name?: string
          check_date?: string | null
          code?: string
          id?: string
          profile_user?: string | null
          seat_user?: string | null
          start_date?: string | null
          state?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_profile_user_fkey"
            columns: ["profile_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_seat_user_fkey"
            columns: ["seat_user"]
            isOneToOne: false
            referencedRelation: "seats"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          content: string
          created_at: string
          id: string
          result: string | null
          status: number | null
          title: string
          writer: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          result?: string | null
          status?: number | null
          title: string
          writer?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          result?: string | null
          status?: number | null
          title?: string
          writer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_writer_fkey"
            columns: ["writer"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guideline: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          is_used: boolean
          title: string
          writer: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_used?: boolean
          title: string
          writer?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_used?: boolean
          title?: string
          writer?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          category: string
          content: string | null
          created_at: string | null
          id: string
          state: boolean
          thumbnail: string | null
          title: string
          topics: string
          views: number | null
          writer: string | null
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string | null
          id?: string
          state?: boolean
          thumbnail?: string | null
          title: string
          topics: string
          views?: number | null
          writer?: string | null
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string | null
          id?: string
          state?: boolean
          thumbnail?: string | null
          title?: string
          topics?: string
          views?: number | null
          writer?: string | null
        }
        Relationships: []
      }
      posts_history: {
        Row: {
          changes: Json
          id: string
          modified_at: string
          post_id: string | null
        }
        Insert: {
          changes: Json
          id?: string
          modified_at?: string
          post_id?: string | null
        }
        Update: {
          changes?: Json
          id?: string
          modified_at?: string
          post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_history_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          code: string | null
          created_at: string | null
          current_seat: string | null
          current_seat_until: string | null
          currentSeatLimit: string | null
          department: string | null
          id: string
          isinit: boolean | null
          ismanager: boolean | null
          isused: boolean | null
          name: string | null
          position: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          current_seat?: string | null
          current_seat_until?: string | null
          currentSeatLimit?: string | null
          department?: string | null
          id: string
          isinit?: boolean | null
          ismanager?: boolean | null
          isused?: boolean | null
          name?: string | null
          position?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          current_seat?: string | null
          current_seat_until?: string | null
          currentSeatLimit?: string | null
          department?: string | null
          id?: string
          isinit?: boolean | null
          ismanager?: boolean | null
          isused?: boolean | null
          name?: string | null
          position?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_seat_fkey"
            columns: ["current_seat"]
            isOneToOne: false
            referencedRelation: "seats"
            referencedColumns: ["id"]
          },
        ]
      }
      seats: {
        Row: {
          arrange: number | null
          created_at: string | null
          floor: string
          id: string
          seat_number: string
        }
        Insert: {
          arrange?: number | null
          created_at?: string | null
          floor: string
          id?: string
          seat_number: string
        }
        Update: {
          arrange?: number | null
          created_at?: string | null
          floor?: string
          id?: string
          seat_number?: string
        }
        Relationships: []
      }
      supplies_type: {
        Row: {
          code: string | null
          id: number
          name: string
          recentNum: number | null
        }
        Insert: {
          code?: string | null
          id?: number
          name: string
          recentNum?: number | null
        }
        Update: {
          code?: string | null
          id?: number
          name?: string
          recentNum?: number | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
