export type Json =
  | boolean
  | null
  | number
  | string
  | Json[]
  | { [key: string]: Json | undefined };

export type Database = {
  public: {
    CompositeTypes: Record<string, never>;
    Enums: Record<string, never>;
    Functions: Record<string, never>;
    Tables: {
      batches: {
        Insert: {
          created_at?: string | null;
          customer_id?: string | null;
          delivered_at?: string | null;
          delivery_date: string;
          icp_id?: string | null;
          id?: string;
          notes?: string | null;
          status?: "archived" | "delivered" | "draft" | "ready" | "researching" | null;
          total_leads?: number | null;
          verified_emails?: number | null;
        };
        Relationships: [
          {
            columns: ["customer_id"];
            foreignKeyName: "batches_customer_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "customers";
          },
          {
            columns: ["icp_id"];
            foreignKeyName: "batches_icp_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "icps";
          },
        ];
        Row: {
          created_at: string | null;
          customer_id: string | null;
          delivered_at: string | null;
          delivery_date: string;
          icp_id: string | null;
          id: string;
          notes: string | null;
          status: "archived" | "delivered" | "draft" | "ready" | "researching" | null;
          total_leads: number | null;
          verified_emails: number | null;
        };
        Update: {
          created_at?: string | null;
          customer_id?: string | null;
          delivered_at?: string | null;
          delivery_date?: string;
          icp_id?: string | null;
          id?: string;
          notes?: string | null;
          status?: "archived" | "delivered" | "draft" | "ready" | "researching" | null;
          total_leads?: number | null;
          verified_emails?: number | null;
        };
      };
      customers: {
        Insert: {
          cancelled_at?: string | null;
          company_name?: string | null;
          created_at?: string | null;
          email: string;
          full_name?: string | null;
          id?: string;
          notes?: string | null;
          plan?: "design_partner" | "growth" | "scale" | "starter" | null;
          signup_date?: string | null;
          status?: "active" | "cancelled" | "churned" | "paused" | "pending" | null;
          billing_customer_id?: string | null;
          billing_subscription_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
        Row: {
          cancelled_at: string | null;
          company_name: string | null;
          created_at: string | null;
          email: string;
          full_name: string | null;
          id: string;
          notes: string | null;
          plan: "design_partner" | "growth" | "scale" | "starter" | null;
          signup_date: string | null;
          status: "active" | "cancelled" | "churned" | "paused" | "pending" | null;
          billing_customer_id: string | null;
          billing_subscription_id: string | null;
          updated_at: string | null;
        };
        Update: {
          cancelled_at?: string | null;
          company_name?: string | null;
          created_at?: string | null;
          email?: string;
          full_name?: string | null;
          id?: string;
          notes?: string | null;
          plan?: "design_partner" | "growth" | "scale" | "starter" | null;
          signup_date?: string | null;
          status?: "active" | "cancelled" | "churned" | "paused" | "pending" | null;
          billing_customer_id?: string | null;
          billing_subscription_id?: string | null;
          updated_at?: string | null;
        };
      };
      feedback: {
        Insert: {
          comment?: string | null;
          created_at?: string | null;
          customer_id?: string | null;
          id?: string;
          lead_id?: string | null;
          rating?: "negative" | "positive" | null;
        };
        Relationships: [
          {
            columns: ["customer_id"];
            foreignKeyName: "feedback_customer_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "customers";
          },
          {
            columns: ["lead_id"];
            foreignKeyName: "feedback_lead_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "leads";
          },
        ];
        Row: {
          comment: string | null;
          created_at: string | null;
          customer_id: string | null;
          id: string;
          lead_id: string | null;
          rating: "negative" | "positive" | null;
        };
        Update: {
          comment?: string | null;
          created_at?: string | null;
          customer_id?: string | null;
          id?: string;
          lead_id?: string | null;
          rating?: "negative" | "positive" | null;
        };
      };
      icps: {
        Insert: {
          brand_voice?: "casual" | "direct" | "professional" | null;
          company_size_max?: number | null;
          company_size_min?: number | null;
          created_at?: string | null;
          customer_id?: string | null;
          exclusions?: string[] | null;
          geographies?: string[] | null;
          id?: string;
          is_active?: boolean | null;
          name?: string | null;
          product_description: string;
          signals?: string[] | null;
          target_industries?: string[] | null;
          target_titles?: string[] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            columns: ["customer_id"];
            foreignKeyName: "icps_customer_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "customers";
          },
        ];
        Row: {
          brand_voice: "casual" | "direct" | "professional" | null;
          company_size_max: number | null;
          company_size_min: number | null;
          created_at: string | null;
          customer_id: string | null;
          exclusions: string[] | null;
          geographies: string[] | null;
          id: string;
          is_active: boolean | null;
          name: string | null;
          product_description: string;
          signals: string[] | null;
          target_industries: string[] | null;
          target_titles: string[] | null;
          updated_at: string | null;
        };
        Update: {
          brand_voice?: "casual" | "direct" | "professional" | null;
          company_size_max?: number | null;
          company_size_min?: number | null;
          created_at?: string | null;
          customer_id?: string | null;
          exclusions?: string[] | null;
          geographies?: string[] | null;
          id?: string;
          is_active?: boolean | null;
          name?: string | null;
          product_description?: string;
          signals?: string[] | null;
          target_industries?: string[] | null;
          target_titles?: string[] | null;
          updated_at?: string | null;
        };
      };
      leads: {
        Insert: {
          batch_id?: string | null;
          company_location?: string | null;
          company_name: string;
          company_size?: number | null;
          created_at?: string | null;
          current_title: string;
          email?: string | null;
          email_status?: "pattern_based" | "risky" | "unverified" | "verified" | null;
          fit_score?: number | null;
          full_name: string;
          id?: string;
          linkedin_url?: string | null;
          opener_a?: string | null;
          opener_a_signal?: string | null;
          opener_b?: string | null;
          opener_b_signal?: string | null;
          opener_c?: string | null;
          opener_c_signal?: string | null;
          recommended_opener?: "a" | "b" | "c" | null;
          recommended_reason?: string | null;
          trigger_signals?: string[] | null;
          why_this_lead?: string | null;
        };
        Relationships: [
          {
            columns: ["batch_id"];
            foreignKeyName: "leads_batch_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "batches";
          },
        ];
        Row: {
          batch_id: string | null;
          company_location: string | null;
          company_name: string;
          company_size: number | null;
          created_at: string | null;
          current_title: string;
          email: string | null;
          email_status: "pattern_based" | "risky" | "unverified" | "verified" | null;
          fit_score: number | null;
          full_name: string;
          id: string;
          linkedin_url: string | null;
          opener_a: string | null;
          opener_a_signal: string | null;
          opener_b: string | null;
          opener_b_signal: string | null;
          opener_c: string | null;
          opener_c_signal: string | null;
          recommended_opener: "a" | "b" | "c" | null;
          recommended_reason: string | null;
          trigger_signals: string[] | null;
          why_this_lead: string | null;
        };
        Update: {
          batch_id?: string | null;
          company_location?: string | null;
          company_name?: string;
          company_size?: number | null;
          created_at?: string | null;
          current_title?: string;
          email?: string | null;
          email_status?: "pattern_based" | "risky" | "unverified" | "verified" | null;
          fit_score?: number | null;
          full_name?: string;
          id?: string;
          linkedin_url?: string | null;
          opener_a?: string | null;
          opener_a_signal?: string | null;
          opener_b?: string | null;
          opener_b_signal?: string | null;
          opener_c?: string | null;
          opener_c_signal?: string | null;
          recommended_opener?: "a" | "b" | "c" | null;
          recommended_reason?: string | null;
          trigger_signals?: string[] | null;
          why_this_lead?: string | null;
        };
      };
      sample_requests: {
        Insert: {
          company?: string | null;
          company_size?: string | null;
          created_at?: string | null;
          delivered_at?: string | null;
          email: string;
          frustration?: string | null;
          full_name: string;
          geography?: string | null;
          id?: string;
          industry?: string | null;
          notes?: string | null;
          status?: "converted" | "declined" | "delivered" | "pending" | "researching" | null;
          target_role?: string | null;
        };
        Relationships: [];
        Row: {
          company: string | null;
          company_size: string | null;
          created_at: string | null;
          delivered_at: string | null;
          email: string;
          frustration: string | null;
          full_name: string;
          geography: string | null;
          id: string;
          industry: string | null;
          notes: string | null;
          status: "converted" | "declined" | "delivered" | "pending" | "researching" | null;
          target_role: string | null;
        };
        Update: {
          company?: string | null;
          company_size?: string | null;
          created_at?: string | null;
          delivered_at?: string | null;
          email?: string;
          frustration?: string | null;
          full_name?: string;
          geography?: string | null;
          id?: string;
          industry?: string | null;
          notes?: string | null;
          status?: "converted" | "declined" | "delivered" | "pending" | "researching" | null;
          target_role?: string | null;
        };
      };
    };
    Views: Record<string, never>;
  };
};
