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
      transactions: {
        Row: {
          id: string
          created_at: string
          user_id: string
          amount: number
          description: string
          category_id: string
          date: string
          payment_method: string
          recurring: boolean
          recurring_interval: string | null
          notes: string | null
          receipt_image_url: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          amount: number
          description: string
          category_id: string
          date: string
          payment_method: string
          recurring?: boolean
          recurring_interval?: string | null
          notes?: string | null
          receipt_image_url?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          amount?: number
          description?: string
          category_id?: string
          date?: string
          payment_method?: string
          recurring?: boolean
          recurring_interval?: string | null
          notes?: string | null
          receipt_image_url?: string | null
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          icon: string
          color: string
          type: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          icon: string
          color: string
          type: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          icon?: string
          color?: string
          type?: string
          updated_at?: string
        }
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
  }
} 