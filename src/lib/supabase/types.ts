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
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          university: string | null;
          email: string | null;
          created_at: string;
          verification_status: string;
          role: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          university?: string | null;
          email?: string | null;
          created_at?: string;
          verification_status?: string;
          role?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          university?: string | null;
          email?: string | null;
          created_at?: string;
          verification_status?: string;
          role?: string;
        };
        Relationships: [];
      };
      papers: {
        Row: {
          id: string;
          title: string;
          paper_author: string | null;
          abstract: string | null;
          file_url: string;
          author_id: string;
          created_at: string;
          keywords: string | null;
          doi: string | null;
          status: string;
          view_count: number;
          download_count: number;
        };
        Insert: {
          id?: string;
          title: string;
          paper_author?: string | null;
          abstract?: string | null;
          file_url: string;
          author_id: string;
          created_at?: string;
          keywords?: string | null;
          doi?: string | null;
          status?: string;
          view_count?: number;
          download_count?: number;
        };
        Update: {
          id?: string;
          title?: string;
          paper_author?: string | null;
          abstract?: string | null;
          file_url?: string;
          author_id?: string;
          created_at?: string;
          keywords?: string | null;
          doi?: string | null;
          status?: string;
          view_count?: number;
          download_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "papers_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

