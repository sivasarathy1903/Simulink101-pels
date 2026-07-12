import { supabase } from "../lib/supabase";
import { Team, TeamMetrics } from "../types";

export interface SupabaseTeamRow {
  id: string;
  name: string;
  institution: string;
  total_points: number;
  status: string;
  metrics: TeamMetrics;
  last_updated: string;
  run_history: { run: number; score: number }[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export function calcTotalPoints(metrics: TeamMetrics): number {
  return (
    (metrics.t1_circuit || 0) +
    (metrics.t1_report || 0) +
    (metrics.t1_result || 0) +
    (metrics.t2_circuit || 0) +
    (metrics.t2_report || 0) +
    (metrics.t2_result || 0) +
    (metrics.t3_circuit || 0) +
    (metrics.t3_report || 0) +
    (metrics.t3_result || 0)
  );
}

// Convert from DB row to application model
export function mapRowToTeam(row: SupabaseTeamRow, index: number): Team {
  return {
    id: row.id,
    rank: index + 1,
    name: row.name,
    institution: row.institution,
    totalPoints: row.total_points,
    status: row.status || "",
    metrics: row.metrics || {},
    lastUpdated: row.last_updated || "Just now",
    runHistory: row.run_history || [],
    tags: row.tags || [],
  };
}

export const teamService = {
  async getTeams(): Promise<Team[]> {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("total_points", { ascending: false });

    if (error) {
      console.error("Error fetching teams:", error);
      throw error;
    }

    return (data as SupabaseTeamRow[]).map((row, index) => mapRowToTeam(row, index));
  },

  async createTeam(team: Partial<Team>): Promise<Team | null> {
    const metrics = team.metrics || {};
    const totalPoints = team.name === "__EVENT_CONFIG__" ? 0 : calcTotalPoints(metrics);

    const newTeamRow = {
      name: team.name,
      institution: team.institution || "",
      total_points: team.totalPoints ?? totalPoints,
      status: team.status || "Registered",
      metrics,
      last_updated: "Just now",
      run_history: team.runHistory || [],
      tags: team.tags || [],
    };

    const { data, error } = await supabase
      .from("teams")
      .insert([newTeamRow])
      .select()
      .single();

    if (error) {
      console.error("Error creating team:", error);
      throw error;
    }

    return data ? mapRowToTeam(data as SupabaseTeamRow, 0) : null;
  },

  async updateTeamScores(id: string, metrics: TeamMetrics): Promise<void> {
    const totalPoints = calcTotalPoints(metrics);

    const { error } = await supabase
      .from("teams")
      .update({
        metrics,
        total_points: totalPoints,
        last_updated: "Just now",
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating team scores:", error);
      throw error;
    }
  },

  async updateTeamConfig(id: string, configMetrics: TeamMetrics): Promise<void> {
    // For config team — don't touch total_points
    const { error } = await supabase
      .from("teams")
      .update({ metrics: configMetrics })
      .eq("id", id);

    if (error) {
      console.error("Error updating config:", error);
      throw error;
    }
  },

  async deleteTeam(id: string): Promise<void> {
    const { error } = await supabase.from("teams").delete().eq("id", id);
    if (error) {
      console.error("Error deleting team:", error);
      throw error;
    }
  }
};
