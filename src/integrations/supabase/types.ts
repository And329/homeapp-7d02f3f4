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
      admin_blog_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          meta_description: string | null
          published_at: string | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          published_at?: string | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          published_at?: string | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_news_articles: {
        Row: {
          author_id: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          meta_description: string | null
          published_at: string | null
          slug: string
          source: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          published_at?: string | null
          slug: string
          source?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          published_at?: string | null
          slug?: string
          source?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          meta_description: string | null
          published_at: string | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          published_at?: string | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          published_at?: string | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          author_id: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          meta_description: string | null
          published_at: string | null
          slug: string
          source: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          published_at?: string | null
          slug: string
          source?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          published_at?: string | null
          slug?: string
          source?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          amenities: Json | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          description: string | null
          id: number
          images: Json | null
          is_hot_deal: boolean | null
          latitude: number | null
          location: string | null
          longitude: number | null
          price: number | null
          title: string | null
          type: string | null
        }
        Insert: {
          amenities?: Json | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          description?: string | null
          id?: number
          images?: Json | null
          is_hot_deal?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          price?: number | null
          title?: string | null
          type?: string | null
        }
        Update: {
          amenities?: Json | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          description?: string | null
          id?: number
          images?: Json | null
          is_hot_deal?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          price?: number | null
          title?: string | null
          type?: string | null
        }
        Relationships: []
      }
      property_requests: {
        Row: {
          amenities: Json | null
          approved_at: string | null
          approved_by: string | null
          bathrooms: number | null
          bedrooms: number | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          images: Json | null
          latitude: number | null
          location: string | null
          longitude: number | null
          price: number
          property_type: string | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amenities?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          price: number
          property_type?: string | null
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amenities?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          price?: number
          property_type?: string | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string | null
          description: string | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_property_request: {
        Args: { request_id: string }
        Returns: string
      }
      delete_setting: {
        Args: { setting_key: string }
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_setting: {
        Args: { setting_key: string }
        Returns: string
      }
      upsert_setting: {
        Args: { setting_key: string; setting_value: string }
        Returns: undefined
      }
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
