const fs = require('fs');

let app = fs.readFileSync('./src/App.tsx', 'utf-8');

// 1. Imports
app = app.replace('import { INITIAL_TEAMS } from "./data";', 
`import { INITIAL_TEAMS } from "./data";
import { useTeams } from "./hooks/useTeams";
import { teamService } from "./services/teamService";
import { supabase } from "./lib/supabase";`);

// 2. Remove local teams state and add useTeams
app = app.replace('const [teams, setTeams] = useState<Team[]>([]);', 
`const { teams, loading: teamsLoading, error: teamsError, refetch: refetchTeams } = useTeams();`);

// 3. Remove useEffect for local teams
const localTeamsEffect = `  // Load teams from localStorage on initial render, fallback to initial dataset
  useEffect(() => {
    try {
      const savedTeams = localStorage.getItem("simulink_101_teams");
      if (savedTeams) {
        setTeams(JSON.parse(savedTeams));
      } else {
        setTeams(INITIAL_TEAMS);
        localStorage.setItem("simulink_101_teams", JSON.stringify(INITIAL_TEAMS));
      }
    } catch (e) {
      setTeams(INITIAL_TEAMS);
    }
  }, []);`;

app = app.replace(localTeamsEffect, '');

// 4. Update Auth UseEffect
const localUserEffect = `  // Load user session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("simulink_101_user");
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Failed to load user session", e);
    }
  }, []);`;

app = app.replace(localUserEffect, `  // Load user session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("simulink_101_user");
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Failed to load user session", e);
    }

    // Check supabase auth for admin
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentUser({ role: "admin", name: "Admin" });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setCurrentUser({ role: "admin", name: "Admin" });
      } else {
        // If they logout of supabase, only clear if they were admin
        setCurrentUser((prev) => prev.role === "admin" ? { role: "viewer" } : prev);
      }
    });

    return () => subscription.unsubscribe();
  }, []);`);

// 5. Update handleLoginSubmit (async)
app = app.replace('const handleLoginSubmit = (e: React.FormEvent) => {', 'const handleLoginSubmit = async (e: React.FormEvent) => {');

// 6. Update Admin check inside handleLoginSubmit
const adminCheck = `    // 1. Check Admin
    if (cleanUser === "admin") {
      if (cleanPass === "pelsadmin@123") {
        const adminUser = { role: "admin" as const, name: "Admin" };
        setCurrentUser(adminUser);
        localStorage.setItem("simulink_101_user", JSON.stringify(adminUser));
        setLoginSuccess(true);
        setTimeout(() => {
          setIsLoginModalOpen(false);
          setLoginSuccess(false);
          setLoginUsername("");
          setLoginPassword("");
        }, 1000);
        return;
      } else {
        setLoginError("Incorrect Admin password.");
        return;
      }
    }`;

app = app.replace(adminCheck, `    // 1. Check Admin (via Supabase or fallback string check for email pattern)
    if (cleanUser === "admin" || cleanUser.includes("@")) {
      try {
        const emailToUse = cleanUser === "admin" ? "admin@simulink101.com" : cleanUser;
        const { error } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: loginPassword, // use original case for pass
        });
        
        if (error) {
          if (cleanUser.includes("@")) {
            setLoginError(error.message);
            return;
          }
          // If they just typed "admin", maybe let it fall through or show error.
          setLoginError("Incorrect admin credentials (Supabase Auth).");
          return;
        }

        setLoginSuccess(true);
        setTimeout(() => {
          setIsLoginModalOpen(false);
          setLoginSuccess(false);
          setLoginUsername("");
          setLoginPassword("");
        }, 1000);
        return;
      } catch (err: any) {
        setLoginError("Login failed.");
        return;
      }
    }`);

// 7. Update handleLogout
const handleLogoutLogic = `  const handleLogout = () => {
    const defaultUser = { role: "viewer" as const };
    setCurrentUser(defaultUser);
    localStorage.removeItem("simulink_101_user");
    setSelectedTeam(null);
  };`;

app = app.replace(handleLogoutLogic, `  const handleLogout = async () => {
    if (currentUser.role === "admin") {
      await supabase.auth.signOut();
    }
    const defaultUser = { role: "viewer" as const };
    setCurrentUser(defaultUser);
    localStorage.removeItem("simulink_101_user");
    setSelectedTeam(null);
  };`);

// 8. Update saveTeams function
const saveTeamsFunc = `  // Sync teams with localStorage whenever they change
  const saveTeams = (updatedTeams: Team[]) => {
    setTeams(updatedTeams);
    try {
      localStorage.setItem("simulink_101_teams", JSON.stringify(updatedTeams));
    } catch (e) {
      console.error("Failed to save teams to storage", e);
    }
  };`;
app = app.replace(saveTeamsFunc, ``); // completely remove it

// 9. Update handleRegisterTeam
const handleRegisterTeamFull = `  // Add a newly registered team directly from Leaderboard
  const handleRegisterTeam = (newTeamData: {
    name: string;
    institution: string;
    modelDesign: number;
    simulationAccuracy: number;
    systemPerformance: number;
    innovation: number;
    technicalApproach: number;
    resultAnalysis: number;
    presentation: number;
    tags: string[];
  }) => {
    const totalPoints =
      newTeamData.modelDesign +
      newTeamData.simulationAccuracy +
      newTeamData.systemPerformance +
      newTeamData.innovation +
      newTeamData.technicalApproach +
      newTeamData.resultAnalysis +
      newTeamData.presentation;

    // Create team object
    const newTeam: Team = {
      id: \`team-\${Date.now()}\`,
      rank: 0, // calculated below
      name: newTeamData.name,
      institution: newTeamData.institution,
      totalPoints,
      status: "Telemetry calibrated. Controller gains within optimal boundaries.",
      metrics: {
        modelDesign: newTeamData.modelDesign,
        simulationAccuracy: newTeamData.simulationAccuracy,
        systemPerformance: newTeamData.systemPerformance,
        innovation: newTeamData.innovation,
        technicalApproach: newTeamData.technicalApproach,
        resultAnalysis: newTeamData.resultAnalysis,
        presentation: newTeamData.presentation,
      },
      lastUpdated: "Registered just now",
      runHistory: [
        { run: 1, score: Math.round(totalPoints * 0.8) },
        { run: 2, score: Math.round(totalPoints * 0.95) },
        { run: 3, score: totalPoints },
      ],
      tags: newTeamData.tags,
    };

    // Recalculate ranks among all teams
    const allTeams = [...teams, newTeam];
    const sortedTeams = allTeams.sort((a, b) => b.totalPoints - a.totalPoints);
    const rankedTeams = sortedTeams.map((t, idx) => ({
      ...t,
      rank: idx + 1,
    }));

    saveTeams(rankedTeams);
  };`;

app = app.replace(handleRegisterTeamFull, `  // Add a newly registered team directly from Leaderboard
  const handleRegisterTeam = async (newTeamData: {
    name: string;
    institution: string;
    modelDesign: number;
    simulationAccuracy: number;
    systemPerformance: number;
    innovation: number;
    technicalApproach: number;
    resultAnalysis: number;
    presentation: number;
    tags: string[];
  }) => {
    const totalPoints =
      newTeamData.modelDesign +
      newTeamData.simulationAccuracy +
      newTeamData.systemPerformance +
      newTeamData.innovation +
      newTeamData.technicalApproach +
      newTeamData.resultAnalysis +
      newTeamData.presentation;

    const newTeam = {
      name: newTeamData.name,
      institution: newTeamData.institution,
      totalPoints,
      status: "Telemetry calibrated. Controller gains within optimal boundaries.",
      metrics: {
        modelDesign: newTeamData.modelDesign,
        simulationAccuracy: newTeamData.simulationAccuracy,
        systemPerformance: newTeamData.systemPerformance,
        innovation: newTeamData.innovation,
        technicalApproach: newTeamData.technicalApproach,
        resultAnalysis: newTeamData.resultAnalysis,
        presentation: newTeamData.presentation,
      },
      runHistory: [
        { run: 1, score: Math.round(totalPoints * 0.8) },
        { run: 2, score: Math.round(totalPoints * 0.95) },
        { run: 3, score: totalPoints },
      ],
      tags: newTeamData.tags,
    };

    try {
      await teamService.createTeam(newTeam);
      // Supabase realtime will fetch it
    } catch (err) {
      console.error(err);
      alert("Failed to create team.");
    }
  };`);

// 10. Update handleUpdateMetrics
const handleUpdateMetricsFull = `  // Handle score adjusters in telemetry details screen
  const handleUpdateMetrics = (teamId: string, updatedMetrics: Team["metrics"]) => {
    const totalPoints =
      updatedMetrics.modelDesign +
      updatedMetrics.simulationAccuracy +
      updatedMetrics.systemPerformance +
      updatedMetrics.innovation +
      updatedMetrics.technicalApproach +
      updatedMetrics.resultAnalysis +
      updatedMetrics.presentation;

    const updatedTeams = teams.map((t) => {
      if (t.id === teamId) {
        return {
          ...t,
          metrics: updatedMetrics,
          totalPoints,
          lastUpdated: "Calibrated just now",
        };
      }
      return t;
    });

    // Re-rank
    const sortedTeams = updatedTeams.sort((a, b) => b.totalPoints - a.totalPoints);
    const rankedTeams = sortedTeams.map((t, idx) => ({
      ...t,
      rank: idx + 1,
    }));

    saveTeams(rankedTeams);

    // Sync selected team state as well so UI updates immediately
    const updatedSelectedTeam = rankedTeams.find((t) => t.id === teamId);
    if (updatedSelectedTeam) {
      setSelectedTeam(updatedSelectedTeam);
    }
  };`;

app = app.replace(handleUpdateMetricsFull, `  // Handle score adjusters in telemetry details screen
  const handleUpdateMetrics = async (teamId: string, updatedMetrics: Team["metrics"]) => {
    try {
      await teamService.updateTeamScores(teamId, updatedMetrics);
      // Let realtime update the selected team if needed, but we can optimistically update
      const totalPoints =
        updatedMetrics.modelDesign +
        updatedMetrics.simulationAccuracy +
        updatedMetrics.systemPerformance +
        updatedMetrics.innovation +
        updatedMetrics.technicalApproach +
        updatedMetrics.resultAnalysis +
        updatedMetrics.presentation;
        
      setSelectedTeam(prev => prev && prev.id === teamId ? {
        ...prev,
        metrics: updatedMetrics,
        totalPoints
      } : prev);
    } catch (err) {
      console.error(err);
      alert("Failed to update team metrics.");
    }
  };`);

// 11. handleResetChallenge
const handleResetFull = `  // Clear local storage and reset back to initial setup
  const handleResetChallenge = () => {
    if (window.confirm("Are you sure you want to restore the default challenge leaderboard? All custom teams will be reset.")) {
      saveTeams(INITIAL_TEAMS);
      setSelectedTeam(null);
    }
  };`;

app = app.replace(handleResetFull, `  // Delete a team (since reset challenge is removed/replaced with delete capability if needed, or we just keep a manual delete here)
  const handleDeleteTeam = async (teamId: string) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      try {
        await teamService.deleteTeam(teamId);
        if (selectedTeam?.id === teamId) {
          setSelectedTeam(null);
        }
      } catch(err) {
        console.error(err);
        alert("Failed to delete team");
      }
    }
  };
  
  // Seed initial dataset (since old reset behavior was just clearing localstorage)
  const handleResetChallenge = async () => {
    if (window.confirm("This will add the default teams to Supabase. Proceed?")) {
      for (const t of INITIAL_TEAMS) {
         await teamService.createTeam(t);
      }
    }
  };`);

fs.writeFileSync('./src/App.tsx', app);
console.log("App.tsx refactored successfully!");
