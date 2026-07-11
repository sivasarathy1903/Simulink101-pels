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

// Convert from DB row to application model
export function mapRowToTeam(row: SupabaseTeamRow, index: number): Team {
  return {
    id: row.id,
    rank: index + 1, // dynamically calculated based on order
    name: row.name,
    institution: row.institution,
    totalPoints: row.total_points,
    status: row.status || "",
    metrics: row.metrics || {
      modelDesign: 0,
      simulationAccuracy: 0,
      systemPerformance: 0,
      innovation: 0,
      technicalApproach: 0,
      resultAnalysis: 0,
      presentation: 0,
    },
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
    const newTeamRow = {
      name: team.name,
      institution: team.institution || "",
      total_points: team.totalPoints || 0,
      status: team.status || "Newly created",
      metrics: team.metrics || {
        modelDesign: 0,
        simulationAccuracy: 0,
        systemPerformance: 0,
        innovation: 0,
        technicalApproach: 0,
        resultAnalysis: 0,
        presentation: 0,
      },
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
    // Calculate total points
    const totalPoints = Object.values(metrics).reduce((sum, value) => sum + (value || 0), 0);

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

  async deleteTeam(id: string): Promise<void> {
    const { error } = await supabase.from("teams").delete().eq("id", id);
    if (error) {
      console.error("Error deleting team:", error);
      throw error;
    }
  }
};
