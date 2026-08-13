import { useState, useEffect } from "react";
import { Team } from "../types";
import { teamService, mapRowToTeam, SupabaseTeamRow } from "../services/teamService";
import { supabase } from "../lib/supabase";

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const fetchedTeams = await teamService.getTeams();
      setTeams(fetchedTeams);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();

    const channel = supabase
      .channel("teams-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teams" },
        (payload) => {
          console.log("Realtime event received (teams):", payload);
          fetchTeams();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions" },
        (payload) => {
          console.log("Realtime event received (submissions):", payload);
          // If a submission changes, just trigger a re-render/refetch of teams 
          // which will pass down new props and trigger the useEffect in TeamTelemetryDetails
          fetchTeams();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { teams, loading, error, refetch: fetchTeams };
}
