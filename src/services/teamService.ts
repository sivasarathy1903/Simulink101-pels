import { supabase } from "../lib/supabase";
import { Team, TeamMetrics } from "../types";
import { INITIAL_TEAMS } from "../data";

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
    let supabaseTeams: Team[] = [];
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("total_points", { ascending: false });

      if (!error && data) {
        supabaseTeams = (data as SupabaseTeamRow[]).map((row, index) => mapRowToTeam(row, index));
      }
    } catch (err) {
      console.warn("Could not fetch teams from Supabase, falling back to INITIAL_TEAMS:", err);
    }

    const existingNames = new Set(supabaseTeams.map(t => t.name.trim().toUpperCase()));
    const missingFromSupabase = INITIAL_TEAMS.filter(t => !existingNames.has(t.name.trim().toUpperCase()));

    const combined = [...supabaseTeams, ...missingFromSupabase];
    combined.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

    return combined.map((t, index) => ({ ...t, rank: index + 1 }));
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
    const cleanName = name.trim().toUpperCase();

    // 1. Check Supabase
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .ilike("name", cleanName)
        .single();

      if (!error && data) {
        const teamRow = data as SupabaseTeamRow;
        if (teamRow.metrics?.password === password) {
          return mapRowToTeam(teamRow, 0);
        }
      }
    } catch {
      // Fallthrough
    }

    // 2. Check INITIAL_TEAMS fallback
    const fallbackTeam = INITIAL_TEAMS.find(t => t.name.trim().toUpperCase() === cleanName);
    if (fallbackTeam && fallbackTeam.metrics?.password === password) {
      return fallbackTeam;
    }

    return null;
  },

  async getTeamSubmissions(teamId: string): Promise<Record<string, { link: string; submittedAt?: string }>> {
    const submissionsMap: Record<string, { link: string; submittedAt?: string }> = {};

    // 0. Check localStorage backup first
    try {
      const localBackup = localStorage.getItem(`simverse_submissions_${teamId}`);
      if (localBackup) {
        const parsed = JSON.parse(localBackup);
        Object.assign(submissionsMap, parsed);
      }
    } catch (e) { /* ignore */ }

    // 1. Fetch from submissions table in Supabase (using exact column name submitted_at!)
    try {
      const { data: subData, error: subErr } = await supabase
        .from("submissions")
        .select("task_key, drive_link, submitted_at")
        .eq("team_id", teamId);
        
      if (!subErr && subData) {
        subData.forEach(row => {
          const timeVal = row.submitted_at;
          const linkVal = (row.drive_link || "").trim();
          if (linkVal) {
            const subObj = { link: linkVal, submittedAt: timeVal };
            submissionsMap[row.task_key] = subObj;

            const num = row.task_key.includes("1") ? 1 : row.task_key.includes("2") ? 2 : row.task_key.includes("3") ? 3 : 0;
            if (num > 0) {
              submissionsMap[`task${num}Link`] = subObj;
              submissionsMap[`task${num}`] = subObj;
              submissionsMap[`t${num}`] = subObj;
            }
          }
        });
      }
    } catch (e) { /* ignore */ }

    // 2. Fetch from team metrics row for backup
    try {
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
    } catch (e) { /* ignore */ }

    // Save latest to localStorage cache
    try {
      localStorage.setItem(`simverse_submissions_${teamId}`, JSON.stringify(submissionsMap));
    } catch (e) { /* ignore */ }

    return submissionsMap;
  },

  async getAllSubmissions(): Promise<Record<string, Record<string, { link: string; submittedAt?: string }>>> {
    const result: Record<string, Record<string, { link: string; submittedAt?: string }>> = {};
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("team_id, task_key, drive_link, submitted_at");

      if (!error && data) {
        data.forEach(row => {
          if (!result[row.team_id]) result[row.team_id] = {};
          const subObj = { link: row.drive_link, submittedAt: row.submitted_at };
          result[row.team_id][row.task_key] = subObj;

          const num = row.task_key.includes("1") ? 1 : row.task_key.includes("2") ? 2 : row.task_key.includes("3") ? 3 : 0;
          if (num > 0) {
            result[row.team_id][`task${num}Link`] = subObj;
            result[row.team_id][`task${num}`] = subObj;
            result[row.team_id][`t${num}`] = subObj;
          }
        });
      }
    } catch (e) { /* ignore */ }
    return result;
  },

  async updateTeamSubmission(teamId: string, taskKey: string, driveLink: string): Promise<void> {
    const nowIso = new Date().toISOString();
    const taskNum = taskKey.includes("1") ? 1 : taskKey.includes("2") ? 2 : taskKey.includes("3") ? 3 : 1;

    // 1. Update localStorage cache instantly
    try {
      const cacheKey = `simverse_submissions_${teamId}`;
      const existingStr = localStorage.getItem(cacheKey);
      const existing = existingStr ? JSON.parse(existingStr) : {};
      const subObj = { link: driveLink, submittedAt: nowIso };
      existing[taskKey] = subObj;
      existing[`task${taskNum}Link`] = subObj;
      existing[`task${taskNum}`] = subObj;
      existing[`t${taskNum}`] = subObj;
      localStorage.setItem(cacheKey, JSON.stringify(existing));
    } catch (e) { /* ignore */ }

    // 2. Save to submissions table in Supabase using exact submitted_at column!
    try {
      const { error: subErr } = await supabase
        .from("submissions")
        .upsert({
          team_id: teamId,
          task_key: taskKey,
          drive_link: driveLink,
          submitted_at: nowIso,
        }, { onConflict: "team_id,task_key" });

      if (subErr) {
        console.warn("Submissions table write note:", subErr.message);
      } else {
        console.log("Successfully saved submission link to Supabase for team:", teamId);
      }
    } catch (e) { /* ignore */ }

    // 3. Also update team metrics in teams table (saves all alias keys!)
    try {
      const { data: teamRow } = await supabase
        .from("teams")
        .select("metrics")
        .eq("id", teamId)
        .single();

      const updatedMetrics = {
        ...(teamRow?.metrics || {}),
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

      await supabase
        .from("teams")
        .update({ metrics: updatedMetrics, last_updated: "Just now" })
        .eq("id", teamId);
    } catch (e) { /* ignore */ }
  }
};
