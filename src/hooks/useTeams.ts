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
          console.log("Realtime event received:", payload);
          // Refetch everything to ensure proper sorting and mapping.
          // Alternatively, we could update state locally, but refetching ensures consistency for rank calculation.
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
