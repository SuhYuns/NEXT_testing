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
          access: string | null
          id: string | null
          idx: number
          name: string
          pwd: string | null
          recentDate: string | null
          state: string | null
          subscribe: string | null
          target: string | null
          url: string | null
        }
        Insert: {
          access?: string | null
          id?: string | null
          idx?: number
          name: string
          pwd?: string | null
          recentDate?: string | null
          state?: string | null
          subscribe?: string | null
          target?: string | null
          url?: string | null
        }
        Update: {
          access?: string | null
          id?: string | null
          idx?: number
          name?: string
          pwd?: string | null
          recentDate?: string | null
          state?: string | null
          subscribe?: string | null
          target?: string | null
          url?: string | null
        }
        Relationships: []
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
      location: {
        Row: {
          address: string | null
          description: string | null
          idx: number
          name: string
        }
        Insert: {
          address?: string | null
          description?: string | null
          idx?: number
          name: string
        }
        Update: {
          address?: string | null
          description?: string | null
          idx?: number
          name?: string
        }
        Relationships: []
      }
      member: {
        Row: {
          gmail: string | null
          idx: number
          isManager: boolean | null
          name: string
          note: string | null
          rank: string | null
          state: boolean | null
          track: string | null
        }
        Insert: {
          gmail?: string | null
          idx?: number
          isManager?: boolean | null
          name: string
          note?: string | null
          rank?: string | null
          state?: boolean | null
          track?: string | null
        }
        Update: {
          gmail?: string | null
          idx?: number
          isManager?: boolean | null
          name?: string
          note?: string | null
          rank?: string | null
          state?: boolean | null
          track?: string | null
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
      profiles: {
        Row: {
          code: string | null
          created_at: string | null
          current_seat: string | null
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
      subscribe: {
        Row: {
          accIdx: number
          end: string | null
          idx: number
          price: number | null
          state: boolean | null
          term: number | null
          time: number | null
        }
        Insert: {
          accIdx: number
          end?: string | null
          idx?: number
          price?: number | null
          state?: boolean | null
          term?: number | null
          time?: number | null
        }
        Update: {
          accIdx?: number
          end?: string | null
          idx?: number
          price?: number | null
          state?: boolean | null
          term?: number | null
          time?: number | null
        }
        Relationships: []
      }
      subscribe_history: {
        Row: {
          accIdx: number | null
          detail: string | null
          idx: number
          price: number | null
          startEnd: string | null
          startTime: string
        }
        Insert: {
          accIdx?: number | null
          detail?: string | null
          idx?: number
          price?: number | null
          startEnd?: string | null
          startTime: string
        }
        Update: {
          accIdx?: number | null
          detail?: string | null
          idx?: number
          price?: number | null
          startEnd?: string | null
          startTime?: string
        }
        Relationships: []
      }
      supplies: {
        Row: {
          checkDate: string | null
          idx: number
          img: string | null
          isLabel: boolean | null
          item: string | null
          location: number | null
          memo: string | null
          model: number | null
          serialNumber: string
          status: string | null
          type: string | null
          user: number | null
        }
        Insert: {
          checkDate?: string | null
          idx?: number
          img?: string | null
          isLabel?: boolean | null
          item?: string | null
          location?: number | null
          memo?: string | null
          model?: number | null
          serialNumber: string
          status?: string | null
          type?: string | null
          user?: number | null
        }
        Update: {
          checkDate?: string | null
          idx?: number
          img?: string | null
          isLabel?: boolean | null
          item?: string | null
          location?: number | null
          memo?: string | null
          model?: number | null
          serialNumber?: string
          status?: string | null
          type?: string | null
          user?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "supplies_location_fkey"
            columns: ["location"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["idx"]
          },
          {
            foreignKeyName: "supplies_model_fkey"
            columns: ["model"]
            isOneToOne: false
            referencedRelation: "supplies_model"
            referencedColumns: ["idx"]
          },
          {
            foreignKeyName: "supplies_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "member"
            referencedColumns: ["idx"]
          },
        ]
      }
      supplies_history: {
        Row: {
          date: string
          detail: string | null
          handler: string | null
          idx: number
          note: string | null
          supIdx: number | null
        }
        Insert: {
          date: string
          detail?: string | null
          handler?: string | null
          idx?: number
          note?: string | null
          supIdx?: number | null
        }
        Update: {
          date?: string
          detail?: string | null
          handler?: string | null
          idx?: number
          note?: string | null
          supIdx?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "supplies_history_supIdx_fkey"
            columns: ["supIdx"]
            isOneToOne: false
            referencedRelation: "supplies"
            referencedColumns: ["idx"]
          },
        ]
      }
      supplies_model: {
        Row: {
          idx: number
          name: string
          url: string | null
        }
        Insert: {
          idx?: number
          name: string
          url?: string | null
        }
        Update: {
          idx?: number
          name?: string
          url?: string | null
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