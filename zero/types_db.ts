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
          thumbnail?: string | null
          title?: string
          topics?: string
          views?: number | null
          writer?: string | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
