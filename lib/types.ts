export interface Alliance {
  id: string;
  name: string;
  created_at: string;
}

export type LeaderRole = "boss" | "helper";

export function roleLabel(role: LeaderRole): string {
  return role === "boss" ? "R5" : "R4";
}

export interface Leader {
  id: string;
  user_id: string;
  alliance_id: string;
  role: LeaderRole;
  created_at: string;
}

export interface Player {
  id: string;
  alliance_id: string;
  name: string;
  token: string;
  created_at: string;
  updated_at: string;
}

export interface PowerEntry {
  id: string;
  player_id: string;
  squad1: number;
  squad2: number;
  squad3: number;
  squad4: number;
  total_power: number;
  submitted_at: string;
}

export interface PlayerWithLatestEntry {
  id: string;
  alliance_id: string;
  name: string;
  token: string;
  created_at: string;
  updated_at: string;
  squad1: number | null;
  squad2: number | null;
  squad3: number | null;
  squad4: number | null;
  total_power: number | null;
  submitted_at: string | null;
  prev_total_power: number | null;
}
