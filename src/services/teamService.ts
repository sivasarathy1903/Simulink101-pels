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

export function calcTaskTotal(metrics: TeamMetrics, taskPrefix: "t1" | "t2" | "t3"): number {
  const topology = Number(metrics[`${taskPrefix}_topology` as keyof TeamMetrics]) || 0;
  const calc = Number(metrics[`${taskPrefix}_calc` as keyof TeamMetrics]) || 0;
  const model = Number(metrics[`${taskPrefix}_model` as keyof TeamMetrics]) || 0;
  const perf = Number(metrics[`${taskPrefix}_perf` as keyof TeamMetrics]) || 0;
  const eff = Number(metrics[`${taskPrefix}_eff` as keyof TeamMetrics]) || 0;
  const report = Number(metrics[`${taskPrefix}_report` as keyof TeamMetrics]) || 0;

  const newTotal = topology + calc + model + perf + eff + report;
  if (newTotal > 0) return newTotal;

  // Fallback to legacy fields
  const circuit = Number(metrics[`${taskPrefix}_circuit` as keyof TeamMetrics]) || 0;
  const legacyReport = Number(metrics[`${taskPrefix}_report` as keyof TeamMetrics]) || 0;
  const result = Number(metrics[`${taskPrefix}_result` as keyof TeamMetrics]) || 0;
  return circuit + legacyReport + result;
}

export function calcTotalPoints(metrics: TeamMetrics): number {
  return calcTaskTotal(metrics, "t1") + calcTaskTotal(metrics, "t2") + calcTaskTotal(metrics, "t3");
}

// Convert from DB row to application model
export function mapRowToTeam(row: SupabaseTeamRow, index: number): Team {
  // Parse members from row or tags array
  let parsedMembers = (row.metrics as any)?.membersList;
  if (!parsedMembers && row.tags && row.tags.length > 0) {
    parsedMembers = row.tags.map(t => {
      if (t.includes("(") && t.includes(")")) {
        const parts = t.split("(");
        const name = parts[0].trim();
        const sub = parts[1].replace(")", "").trim();
        const subParts = sub.split("-");
        return { name, dept: subParts[0]?.trim() || "", year: subParts[1]?.trim() || "" };
      }
      return { name: t, dept: "", year: "" };
    });
  }

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
    members: parsedMembers || [],
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
  },

  async loginTeam(name: string, password: string): Promise<Team | null> {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .ilike("name", name)
      .single();

    if (error || !data) {
      return null;
    }

    const teamRow = data as SupabaseTeamRow;
    if (teamRow.metrics?.password === password) {
      return mapRowToTeam(teamRow, 0);
    }
    return null;
  },

  async getTeamSubmissions(teamId: string): Promise<Record<string, { link: string; submittedAt?: string }>> {
    const submissionsMap: Record<string, { link: string; submittedAt?: string }> = {};

    // 1. Fetch from submissions table
    const { data: subData, error: subErr } = await supabase
      .from("submissions")
      .select("task_key, drive_link, updated_at, created_at")
      .eq("team_id", teamId);
      
    if (!subErr && subData) {
      subData.forEach(row => {
        const timeVal = row.updated_at || row.created_at;
        const subObj = { link: row.drive_link, submittedAt: timeVal };
        submissionsMap[row.task_key] = subObj;

        const num = row.task_key.includes("1") ? 1 : row.task_key.includes("2") ? 2 : row.task_key.includes("3") ? 3 : 0;
        if (num > 0) {
          submissionsMap[`task${num}Link`] = subObj;
          submissionsMap[`task${num}`] = subObj;
          submissionsMap[`t${num}`] = subObj;
        }
      });
    }

    // 2. Fetch from team metrics row for backup
    const { data: teamData } = await supabase
      .from("teams")
      .select("metrics, last_updated")
      .eq("id", teamId)
      .single();

    if (teamData?.metrics) {
      const m = teamData.metrics;
      [1, 2, 3].forEach(num => {
        const keys = [`task${num}Link`, `task${num}`, `t${num}`, `t${num}_link`, ...(num === 1 ? ["driveLink"] : [])];
        for (const k of keys) {
          if (m[k] && typeof m[k] === "string" && (m[k] as string).trim()) {
            const linkVal = (m[k] as string).trim();
            const timeVal = (m[`${k}_submittedAt`] as string) || (m[`task${num}Link_submittedAt`] as string) || (m[`task${num}_submittedAt`] as string) || (m[`t${num}_submittedAt`] as string) || teamData.last_updated;
            const subObj = { link: linkVal, submittedAt: timeVal };
            submissionsMap[`task${num}Link`] = subObj;
            submissionsMap[`task${num}`] = subObj;
            submissionsMap[`t${num}`] = subObj;
            break;
          }
        }
      });
    }

    return submissionsMap;
  },

  async updateTeamSubmission(teamId: string, taskKey: string, driveLink: string): Promise<void> {
    const nowIso = new Date().toISOString();
    const taskNum = taskKey.includes("1") ? 1 : taskKey.includes("2") ? 2 : taskKey.includes("3") ? 3 : 1;

    // 1. Save to submissions table
    const { error: subErr } = await supabase
      .from("submissions")
      .upsert({
        team_id: teamId,
        task_key: taskKey,
        drive_link: driveLink,
        updated_at: nowIso,
      }, { onConflict: "team_id,task_key" });

    if (subErr) {
      console.warn("Submissions table write note:", subErr.message);
    }

    // 2. Also update team metrics in teams table (saves all alias keys!)
    const { data: teamRow } = await supabase
      .from("teams")
      .select("metrics")
      .eq("id", teamId)
      .single();

    if (teamRow) {
      const updatedMetrics = {
        ...(teamRow.metrics || {}),
        [taskKey]: driveLink,
        [`task${taskNum}Link`]: driveLink,
        [`task${taskNum}`]: driveLink,
        [`t${taskNum}`]: driveLink,
        [`t${taskNum}_link`]: driveLink,
        ...(taskNum === 1 ? { driveLink: driveLink } : {}),
        [`${taskKey}_submittedAt`]: nowIso,
        [`task${taskNum}Link_submittedAt`]: nowIso,
        [`task${taskNum}_submittedAt`]: nowIso,
        [`t${taskNum}_submittedAt`]: nowIso,
      };

      const { error: teamErr } = await supabase
        .from("teams")
        .update({ metrics: updatedMetrics, last_updated: "Just now" })
        .eq("id", teamId);

      if (teamErr) {
        console.error("Error updating team metrics submission:", teamErr.message);
      }
    }
  }
};
