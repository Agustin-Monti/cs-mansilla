export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      players: {
        Row: {
          id: string;
          auth_user_id: string | null;
          steam_id: string | null;
          steam_username: string;
          display_name: string | null;
          avatar_url: string | null;
          role: "member" | "admin" | "founder";
          joined_at: string;
          active: boolean;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          steam_id?: string | null;
          steam_username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: "member" | "admin" | "founder";
          joined_at?: string;
          active?: boolean;
        };
        Update: {
          id?: string;
          auth_user_id?: string | null;
          steam_id?: string | null;
          steam_username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: "member" | "admin" | "founder";
          joined_at?: string;
          active?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "players_auth_user_id_fkey";
            columns: ["auth_user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      player_stats: {
        Row: {
          player_id: string;
          kills: number;
          deaths: number;
          assists: number;
          headshots: number;
          wins: number;
          losses: number;
          mvps: number;
          matches_played: number;
          updated_at: string;
          // Leetify
          premier_rank: number | null;
          leetify_rating: number | null;
          aim: number | null;
          positioning: number | null;
          utility: number | null;
          preaim: number | null;
          reaction_time_ms: number | null;
          accuracy_head: number | null;
          winrate: number | null;
          leetify_id: string | null;
          leetify_synced_at: string | null;
          leetify_available: boolean | null;
          playtime_hours: number | null;
        };
        Insert: {
          player_id: string;
          kills?: number;
          deaths?: number;
          assists?: number;
          headshots?: number;
          wins?: number;
          losses?: number;
          mvps?: number;
          matches_played?: number;
          updated_at?: string;
          premier_rank?: number | null;
          leetify_rating?: number | null;
          aim?: number | null;
          positioning?: number | null;
          utility?: number | null;
          preaim?: number | null;
          reaction_time_ms?: number | null;
          accuracy_head?: number | null;
          winrate?: number | null;
          leetify_id?: string | null;
          leetify_synced_at?: string | null;
          leetify_available?: boolean | null;
          playtime_hours?: number | null;
        };
        Update: {
          player_id?: string;
          kills?: number;
          deaths?: number;
          assists?: number;
          headshots?: number;
          wins?: number;
          losses?: number;
          mvps?: number;
          matches_played?: number;
          updated_at?: string;
          premier_rank?: number | null;
          leetify_rating?: number | null;
          aim?: number | null;
          positioning?: number | null;
          utility?: number | null;
          preaim?: number | null;
          reaction_time_ms?: number | null;
          accuracy_head?: number | null;
          winrate?: number | null;
          leetify_id?: string | null;
          leetify_synced_at?: string | null;
          leetify_available?: boolean | null;
          playtime_hours?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "player_stats_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: true;
            referencedRelation: "players";
            referencedColumns: ["id"];
          }
        ];
      };
      matches: {
        Row: {
          id: string;
          map: string;
          score_team: number;
          score_enemy: number;
          mvp_player_id: string | null;
          played_at: string;
          notes: string | null;
          leetify_match_id: string | null;   // ← NUEVO
        };
        Insert: {
          id?: string;
          map: string;
          score_team: number;
          score_enemy: number;
          mvp_player_id?: string | null;
          played_at?: string;
          notes?: string | null;
          leetify_match_id?: string | null;  // ← NUEVO
        };
        Update: {
          id?: string;
          map?: string;
          score_team?: number;
          score_enemy?: number;
          mvp_player_id?: string | null;
          played_at?: string;
          notes?: string | null;
          leetify_match_id?: string | null;  // ← NUEVO
        };
        Relationships: [
          {
            foreignKeyName: "matches_mvp_player_id_fkey";
            columns: ["mvp_player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          }
        ];
      };
      match_players: {
        Row: {
          match_id: string;
          player_id: string;
          kills: number;
          deaths: number;
          assists: number;
          headshots: number;
        };
        Insert: {
          match_id: string;
          player_id: string;
          kills?: number;
          deaths?: number;
          assists?: number;
          headshots?: number;
        };
        Update: {
          match_id?: string;
          player_id?: string;
          kills?: number;
          deaths?: number;
          assists?: number;
          headshots?: number;
        };
        Relationships: [
          {
            foreignKeyName: "match_players_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_players_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};