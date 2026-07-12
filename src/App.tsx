import React, { useState, useEffect } from "react";
import {
  Trophy,
  Info,
  ArrowDown,
  ArrowRight,
  GitFork,
  Cpu,
  Network,
  Wrench,
  CheckSquare,
  Sparkles,
  Gauge,
  UserCheck,
  ShieldAlert,
  Sliders,
  FileCheck,
  Zap,
  Activity,
  Heart,
  Lock,
  Unlock,
  LogIn,
  LogOut,
  Key,
  User,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Team } from "./types";
import { INITIAL_TEAMS } from "./data";
import { useTeams } from "./hooks/useTeams";
import { teamService } from "./services/teamService";
import { supabase } from "./lib/supabase";
import LeaderboardTable from "./components/LeaderboardTable";
import TeamTelemetryDetails from "./components/TeamTelemetryDetails";

interface EventConfig {
  task1Released: boolean;
  task1Link: string;
  task2Released: boolean;
  task2Link: string;
  task3Released: boolean;
  task3Link: string;
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<"home" | "leaderboard">("home");
  const { teams, loading: teamsLoading, error: teamsError, refetch: refetchTeams } = useTeams();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Selected Task to show details in submission modal
  const [selectedTask, setSelectedTask] = useState<{
    title: string;
    released: boolean;
    link: string;
    description: string;
  } | null>(null);

  // Auth States
  const [currentUser, setCurrentUser] = useState<{ role: "admin" | "team" | "viewer"; teamId?: string; name?: string }>({
    role: "viewer"
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Load user session on mount
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
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const cleanUser = loginUsername.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    if (!cleanUser || !cleanPass) {
      setLoginError("Please enter both username and password.");
      return;
    }

    // 1. Check Admin (via Supabase or fallback string check for email pattern)
    if (cleanUser === "admin" || cleanUser.includes("@")) {
      try {
        const emailToUse = cleanUser === "admin" ? "admin@simulink101.com" : cleanUser;
        const { error } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: loginPassword,
        });
        
        if (error) {
          if (cleanUser.includes("@")) {
            setLoginError(error.message);
            return;
          }
          setLoginError("Incorrect admin credentials.");
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
    }

    // 2. Check Team credentials
    const matchingTeam = teams.find((t) => {
      const teamClean = t.name.replace(/\s+/g, "").toLowerCase();
      const teamExact = t.name.trim().toLowerCase();
      return teamClean === cleanUser || teamExact === cleanUser;
    });

    if (matchingTeam) {
      const expectedPass = matchingTeam.name.replace(/\s+/g, "").toLowerCase() + "123";
      if (cleanPass === expectedPass) {
        const teamUser = { role: "team" as const, teamId: matchingTeam.id, name: matchingTeam.name };
        setCurrentUser(teamUser);
        localStorage.setItem("simulink_101_user", JSON.stringify(teamUser));
        setLoginSuccess(true);
        setTimeout(() => {
          setIsLoginModalOpen(false);
          setLoginSuccess(false);
          setLoginUsername("");
          setLoginPassword("");
        }, 1000);
        return;
      } else {
        setLoginError(`Incorrect password. Password format is: lowercase teamname without spaces + "123".`);
        return;
      }
    }

    setLoginError("Username not recognized. Use 'admin' or your exact registered team name.");
  };

  const handleLogout = async () => {
    if (currentUser.role === "admin") {
      await supabase.auth.signOut();
    }
    const defaultUser = { role: "viewer" as const };
    setCurrentUser(defaultUser);
    localStorage.removeItem("simulink_101_user");
    setSelectedTeam(null);
  };

  // Add a newly registered team directly from Leaderboard
  const handleRegisterTeam = async (newTeamData: {
    name: string;
    institution: string;
    circuitDesign: number;
    reportSubmission: number;
    result: number;
    tags: string[];
  }) => {
    const totalPoints =
      newTeamData.circuitDesign +
      newTeamData.reportSubmission +
      newTeamData.result;

    const newTeam = {
      name: newTeamData.name,
      institution: newTeamData.institution,
      totalPoints,
      status: "Calibrated",
      metrics: {
        circuitDesign: newTeamData.circuitDesign,
        reportSubmission: newTeamData.reportSubmission,
        result: newTeamData.result,
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
    } catch (err) {
      console.error(err);
      alert("Failed to create team.");
    }
  };

  // Handle manual marks updates in details screen
  const handleUpdateMetrics = async (teamId: string, updatedMetrics: Team["metrics"]) => {
    try {
      await teamService.updateTeamScores(teamId, updatedMetrics);
      const totalPoints =
        (updatedMetrics.circuitDesign || 0) +
        (updatedMetrics.reportSubmission || 0) +
        (updatedMetrics.result || 0);
        
      setSelectedTeam(prev => prev && prev.id === teamId ? {
        ...prev,
        metrics: updatedMetrics,
        totalPoints
      } : prev);
    } catch (err) {
      console.error(err);
      alert("Failed to update team metrics.");
    }
  };

  // Reset/Seed initial database
  const handleResetChallenge = async () => {
    if (window.confirm("This will add the default teams to Supabase. Proceed?")) {
      for (const t of INITIAL_TEAMS) {
         await teamService.createTeam(t);
      }
    }
  };

  const scrollToInitialize = () => {
    const section = document.getElementById("master-simulation-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Parse event configuration from special team __EVENT_CONFIG__
  const configTeam = teams.find(t => t.name === "__EVENT_CONFIG__");
  const task1Released = configTeam?.metrics?.task1Released ?? false;
  const task2Released = configTeam?.metrics?.task2Released ?? false;
  const task3Released = configTeam?.metrics?.task3Released ?? false;
  const task1Link = configTeam?.metrics?.task1Link ?? "";
  const task2Link = configTeam?.metrics?.task2Link ?? "";
  const task3Link = configTeam?.metrics?.task3Link ?? "";

  const handleUpdateConfig = async (newConfig: any) => {
    try {
      if (configTeam) {
        await teamService.updateTeamScores(configTeam.id, newConfig);
      } else {
        await teamService.createTeam({
          name: "__EVENT_CONFIG__",
          institution: "SYSTEM",
          totalPoints: 0,
          status: "CONFIG",
          metrics: newConfig,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter out config team from normal lists
  const filteredTeams = teams.filter(t => t.name !== "__EVENT_CONFIG__");

  return (
    <div className="bg-[#0A0A0A] text-white engineering-grid min-h-screen selection:bg-primary-red selection:text-white flex flex-col justify-between overflow-x-hidden">
      
      {/* 1. Global Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0A0A0A]/85 backdrop-blur-xl border-b border-white/10 shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center px-6 md:px-12 py-4 w-full max-w-[1440px] mx-auto">
          
          {/* Logo & Branding */}
          <div 
            onClick={() => { setCurrentTab("home"); setSelectedTeam(null); }} 
            className="flex items-center gap-4 cursor-pointer group"
          >
            <img
              alt="IEEE PELS Logo"
              className="h-10 w-10 object-contain rounded-full border border-white/5 group-hover:border-primary-red/30 transition-colors"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhT7QIUE14McBjVbaSVgLbQU9Rskq807b4yTeIq433ZYqnXk0jH5wCkIHv7aFintnvmMEPMB8U6dzNDoCltxJIlTa1QfcbTFv-BMzBuvE-m-GH5LG8dcz-njxhfytuRde4mq-BPrltR_gDGpVQ7dZuCNEtLZy3K7ttEPoq6_sas0yedeCB344eHCiEQx9EOWuuiE-CXTRnBmGJqnhwcoFV2fUFiWM_YObS8Q1g-wvE74BsUdQU2Ic2Xg-kKlB3ZqJj3uA"
            />
            <div className="flex flex-col">
              <span className="font-display font-black text-lg text-white leading-none tracking-tight group-hover:text-primary-red transition-colors uppercase">
                SIMVERSE
              </span>
              <span className="font-mono text-[9px] text-white/40 tracking-wider">
                IEEE POWER ELECTRONICS SOCIETY
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <div className="flex items-center gap-1.5 md:gap-3">
            <button
              onClick={() => { setCurrentTab("home"); setSelectedTeam(null); }}
              className={`font-mono text-[11px] font-bold tracking-wider px-3 py-1.5 rounded transition-all cursor-pointer ${
                currentTab === "home" && !selectedTeam
                  ? "text-primary-red border-b-2 border-primary-red rounded-none"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              HOME
            </button>
            <button
              onClick={() => { setCurrentTab("leaderboard"); setSelectedTeam(null); }}
              className={`font-mono text-[11px] font-bold tracking-wider px-3 py-1.5 rounded transition-all cursor-pointer ${
                (currentTab === "leaderboard" || selectedTeam) && selectedTeam?.id !== currentUser.teamId
                  ? "text-primary-red border-b-2 border-primary-red rounded-none"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              LIVE LEADERBOARD
            </button>
            {currentUser.role === "team" && (
              <button
                onClick={() => {
                  const myTeam = filteredTeams.find(t => t.id === currentUser.teamId);
                  if (myTeam) {
                    setSelectedTeam(myTeam);
                    setCurrentTab("leaderboard");
                  }
                }}
                className={`font-mono text-[11px] font-bold tracking-wider px-3 py-1.5 rounded transition-all cursor-pointer ${
                  selectedTeam?.id === currentUser.teamId
                    ? "text-primary-red border-b-2 border-primary-red rounded-none font-extrabold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                MY TEAM SCORES
              </button>
            )}
          </div>

          {/* Authentication & Admin controls */}
          <div className="flex items-center gap-3">
            {currentUser.role === "admin" && (
              <div className="hidden sm:flex items-center gap-1.5 bg-primary-red/10 border border-primary-red/30 px-2.5 py-1 rounded-sm font-mono text-[10px] text-primary-red">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-red animate-ping" />
                <span className="font-bold">ADMIN ACTIVE</span>
              </div>
            )}
            
            {currentUser.role === "team" && (
              <div className="hidden sm:flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 px-2.5 py-1 rounded-sm font-mono text-[10px] text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="font-bold uppercase tracking-tight truncate max-w-[120px]">
                  TEAM: {currentUser.name}
                </span>
              </div>
            )}

            {currentUser.role === "admin" && (
              <button
                onClick={handleResetChallenge}
                className="hidden md:block font-mono text-[10px] text-white/30 hover:text-primary-red border border-white/5 hover:border-primary-red/20 px-2.5 py-1 rounded transition-all cursor-pointer"
                title="Restore default database"
              >
                RESET DB
              </button>
            )}

            {currentUser.role !== "viewer" ? (
              <button
                onClick={handleLogout}
                className="font-mono text-[10px] font-bold text-white/70 hover:text-primary-red border border-white/10 hover:border-primary-red/25 bg-white/5 px-3 py-1.5 rounded-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">LOG OUT</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setLoginError("");
                  setLoginUsername("");
                  setLoginPassword("");
                  setIsLoginModalOpen(true);
                }}
                className="font-mono text-[10px] font-bold text-white bg-primary-red hover:bg-primary-red/80 px-3 py-1.5 rounded-sm flex items-center gap-1.5 transition-all shadow-md shadow-primary-red/10 cursor-pointer"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>LOG IN</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* 2. Main Tab Router with Transitions */}
      <main className="flex-grow pt-12">
        <AnimatePresence mode="wait">
          
          {selectedTeam ? (
            <motion.div
              key="team-details"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <TeamTelemetryDetails
                team={selectedTeam}
                onBack={() => setSelectedTeam(null)}
                onUpdateMetrics={handleUpdateMetrics}
                isAdmin={currentUser.role === "admin"}
              />
            </motion.div>
          ) : currentTab === "home" ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Home hero section */}
              <section className="relative min-h-[92vh] flex flex-col justify-center items-center py-24 px-4 md:px-8 overflow-hidden">
                
                {/* ADVANCED DYNAMIC BACKGROUND ANIMATIONS & SIGNAL SVG GRID */}
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                  
                  {/* Glowing ambient background orbs */}
                  <motion.div
                    animate={{
                      scale: [1, 1.15, 1],
                      opacity: [0.4, 0.6, 0.4],
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute top-[15%] left-[25%] -translate-x-1/2 w-[550px] h-[550px] bg-primary-red/[0.04] rounded-full filter blur-[100px]"
                  />
                  
                  <motion.div
                    animate={{
                      scale: [1.1, 0.9, 1.1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute bottom-[10%] right-[20%] w-[450px] h-[450px] bg-yellow-500/[0.02] rounded-full filter blur-[90px]"
                  />

                  {/* Sweep-Line Matrix Grid Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]">
                    <motion.div 
                      animate={{ y: ["0%", "100%"] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary-red/10 to-transparent"
                    />
                  </div>

                  {/* High-Fidelity SVG Electric Signal Waves */}
                  <svg className="absolute inset-0 w-full h-full opacity-60 hidden lg:block" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#E31E24" stopOpacity="0" />
                        <stop offset="50%" stopColor="#E31E24" stopOpacity="1" />
                        <stop offset="100%" stopColor="#E31E24" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    <path
                      d="M -100 200 Q 150 120 400 250 T 900 200 T 1400 300 T 2000 150"
                      fill="none"
                      stroke="rgba(255,255,255,0.03)"
                      strokeWidth="2"
                    />
                    <path
                      d="M -100 200 Q 150 120 400 250 T 900 200 T 1400 300 T 2000 150"
                      fill="none"
                      stroke="url(#glow-grad)"
                      strokeWidth="3.5"
                      strokeDasharray="180, 500"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values="0; -680"
                        dur="6s"
                        repeatCount="indefinite"
                      />
                    </path>
                  </svg>
                </div>

                {/* Center Hero Logo & Trendy Uppercase Goofy Animation Text */}
                <div className="relative z-20 text-center flex flex-col items-center max-w-4xl mt-6 px-4">
                  <motion.div 
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-8"
                  >
                    <img
                      alt="IEEE PELS SSN Logo"
                      className="h-28 w-28 object-contain mx-auto mb-4 rounded-full shadow-2xl shadow-primary-red/15 border border-white/10 p-0.5"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWFhypqX49CLE1dA5h3Oo_p3Npdqs-zfB5A4aibOI5YUyN8LXhfqByUJrbE1xMNSFe3OI32os9ob8caLvQw8Z6DUhISk5_OZONeWi6w0dBmrsPu-5ljDhj3-YmMjT6QejkL6RMH4BV7ihr0d2_cUae1BKjVz1LX3i6ncb-mBoZBzBGFkocvzdJobfcDsdL2DFCQ2o54PskiTpKDIwdjMfm2JbpKiVDyESbWX6H92vW3nu4vuBoVdG3gi0MhS2zksFiIJA"
                    />
                  </motion.div>

                  {/* Trendy Goofy Wavy SIMVERSE Header Text */}
                  <div className="flex justify-center gap-1.5 md:gap-3 select-none mb-6">
                    {"SIMVERSE".split("").map((char, index) => (
                      <motion.span
                        key={index}
                        className="font-display font-black text-6xl md:text-[96px] text-white tracking-tighter leading-none inline-block drop-shadow-[0_0_15px_rgba(227,30,36,0.6)]"
                        animate={{
                          y: [0, -18, 0],
                          rotate: [0, index % 2 === 0 ? 8 : -8, 0],
                          color: ["#FFFFFF", "#E31E24", "#FFFFFF"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse",
                          delay: index * 0.15,
                          ease: "easeInOut",
                        }}
                      >
                        {char}
                      </motion.span>
                    ))}
                  </div>

                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
                    className="font-sans text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed text-base md:text-lg"
                  >
                    An IEEE Power Electronics Society simulation challenge designed to test participants' knowledge, problem-solving skills, and practical simulation expertise using MATLAB Simulink.
                  </motion.p>

                  <motion.div 
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.7 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto px-4"
                  >
                    <button
                      onClick={() => setCurrentTab("leaderboard")}
                      className="btn-primary-gradient text-white font-mono text-xs font-bold tracking-widest px-8 py-4 rounded-sm transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2 group cursor-pointer hover:scale-[1.03]"
                    >
                      <Trophy className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      VIEW LIVE LEADERBOARD
                    </button>
                    <button
                      onClick={scrollToInitialize}
                      className="glass-panel text-white font-mono text-xs font-bold tracking-widest px-8 py-4 rounded-sm hover:bg-white/10 border border-white/15 transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Info className="h-4 w-4 text-primary-red" />
                      LEARN CHALLENGE INFO
                    </button>
                  </motion.div>
                </div>

                {/* Scroll Indicator */}
                <div 
                  onClick={scrollToInitialize}
                  className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <span className="font-mono text-[9px] text-white/50 mb-2 uppercase tracking-widest">SCROLL TO SYSTEM OVERVIEW</span>
                  <ArrowDown className="h-4 w-4 text-primary-red animate-bounce" />
                </div>
              </section>

              {/* Overview Section: Phase to challenge */}
              <section id="master-simulation-section" className="py-24 px-6 md:px-12 bg-[#0A0A0A] relative z-10 border-t border-white/5 scroll-mt-12">
                <div className="max-w-[1440px] mx-auto">
                  
                  <div className="flex flex-col md:flex-row items-end justify-between mb-12 border-b border-white/10 pb-6">
                    <div>
                      <span className="font-mono text-xs text-primary-red block mb-2 uppercase tracking-widest font-bold">CHALLENGE TRACK</span>
                      <h2 className="font-display font-extrabold text-3xl md:text-5xl text-white tracking-tight">
                        Phase to challenge
                      </h2>
                    </div>
                    <button 
                      onClick={() => setCurrentTab("leaderboard")}
                      className="font-mono text-xs text-white/60 hover:text-primary-red transition-colors flex items-center gap-2 mt-4 md:mt-0 cursor-pointer group"
                    >
                      VIEW LEADERBOARD STANDINGS <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Admin Event controls */}
                  {currentUser.role === "admin" && (
                    <div className="glass-panel p-6 rounded-lg border-primary-red/30 mb-12 max-w-4xl mx-auto">
                      <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                        <Sliders className="h-5 w-5 text-primary-red" />
                        <h3 className="font-mono text-xs font-bold uppercase text-white">SIMVERSE EVENT CONTROLS (ADMIN)</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Task 1 Control */}
                        <div className="flex flex-col gap-3 p-4 bg-white/5 border border-white/10 rounded">
                          <span className="font-mono text-xs text-white/70">TASK 1 CONTROL</span>
                          <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-white">
                            <input
                              type="checkbox"
                              checked={task1Released}
                              onChange={async (e) => {
                                await handleUpdateConfig({
                                  ...configTeam?.metrics,
                                  task1Released: e.target.checked
                                });
                              }}
                              className="accent-primary-red"
                            />
                            RELEASE TASK 1
                          </label>
                          <input
                            type="text"
                            placeholder="Drive Link for Task 1"
                            value={task1Link}
                            onChange={async (e) => {
                              await handleUpdateConfig({
                                ...configTeam?.metrics,
                                task1Link: e.target.value
                              });
                            }}
                            className="bg-[#0A0A0A] border border-white/10 text-xs px-2 py-1.5 rounded outline-none focus:border-primary-red text-white"
                          />
                        </div>

                        {/* Task 2 Control */}
                        <div className="flex flex-col gap-3 p-4 bg-white/5 border border-white/10 rounded">
                          <span className="font-mono text-xs text-white/70">TASK 2 CONTROL</span>
                          <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-white">
                            <input
                              type="checkbox"
                              checked={task2Released}
                              onChange={async (e) => {
                                await handleUpdateConfig({
                                  ...configTeam?.metrics,
                                  task2Released: e.target.checked
                                });
                              }}
                              className="accent-primary-red"
                            />
                            RELEASE TASK 2
                          </label>
                          <input
                            type="text"
                            placeholder="Drive Link for Task 2"
                            value={task2Link}
                            onChange={async (e) => {
                              await handleUpdateConfig({
                                ...configTeam?.metrics,
                                task2Link: e.target.value
                              });
                            }}
                            className="bg-[#0A0A0A] border border-white/10 text-xs px-2 py-1.5 rounded outline-none focus:border-primary-red text-white"
                          />
                        </div>

                        {/* Task 3 Control */}
                        <div className="flex flex-col gap-3 p-4 bg-white/5 border border-white/10 rounded">
                          <span className="font-mono text-xs text-white/70">TASK 3 CONTROL</span>
                          <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-white">
                            <input
                              type="checkbox"
                              checked={task3Released}
                              onChange={async (e) => {
                                await handleUpdateConfig({
                                  ...configTeam?.metrics,
                                  task3Released: e.target.checked
                                });
                              }}
                              className="accent-primary-red"
                            />
                            RELEASE TASK 3
                          </label>
                          <input
                            type="text"
                            placeholder="Drive Link for Task 3"
                            value={task3Link}
                            onChange={async (e) => {
                              await handleUpdateConfig({
                                ...configTeam?.metrics,
                                task3Link: e.target.value
                              });
                            }}
                            className="bg-[#0A0A0A] border border-white/10 text-xs px-2 py-1.5 rounded outline-none focus:border-primary-red text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Three task cards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Card 1: Task 1 */}
                    <motion.div
                      whileHover={task1Released ? { y: -6 } : {}}
                      onClick={() => {
                        if (task1Released) {
                          setSelectedTask({
                            title: "Task 1: Circuit Design",
                            released: true,
                            link: task1Link,
                            description: "Build the primary converter and feedback loop to stabilize grid voltage output."
                          });
                        }
                      }}
                      className={`glass-panel rounded-lg p-6 relative group transition-all duration-500 overflow-hidden min-h-[260px] flex flex-col justify-between border cursor-pointer ${
                        task1Released ? "border-primary-red/30 hover:border-primary-red" : "border-white/5 opacity-50 select-none"
                      }`}
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                        <Zap className="h-32 w-32 text-white" />
                      </div>
                      
                      <div className="font-mono text-xs text-primary-red mb-auto flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary-red rounded-full"></span>
                          TASK 1
                        </span>
                        {task1Released ? (
                          <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded">RELEASED</span>
                        ) : (
                          <span className="text-xs text-red-500 bg-red-500/10 px-2 py-0.5 rounded flex items-center gap-1"><Lock className="h-3 w-3" /> LOCKED</span>
                        )}
                      </div>
                      
                      <div className="mt-8">
                        <Cpu className="h-8 w-8 text-white mb-3" />
                        <h3 className="font-sans font-bold text-lg text-white mb-1">Circuit Design</h3>
                        <p className="font-mono text-xs text-white/60 leading-relaxed">
                          Build the primary converter and feedback loop to stabilize grid voltage output.
                        </p>
                      </div>
                    </motion.div>

                    {/* Card 2: Task 2 */}
                    <motion.div
                      whileHover={task2Released ? { y: -6 } : {}}
                      onClick={() => {
                        if (task2Released) {
                          setSelectedTask({
                            title: "Task 2: Simulation Accuracy",
                            released: true,
                            link: task2Link,
                            description: "Optimize dynamic filters and parameters to achieve near-zero voltage distortion."
                          });
                        }
                      }}
                      className={`glass-panel rounded-lg p-6 relative group transition-all duration-500 overflow-hidden min-h-[260px] flex flex-col justify-between border cursor-pointer ${
                        task2Released ? "border-primary-red/30 hover:border-primary-red" : "border-white/5 opacity-50 select-none"
                      }`}
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                        <Activity className="h-32 w-32 text-white" />
                      </div>
                      
                      <div className="font-mono text-xs text-primary-red mb-auto flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary-red rounded-full"></span>
                          TASK 2
                        </span>
                        {task2Released ? (
                          <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded">RELEASED</span>
                        ) : (
                          <span className="text-xs text-red-500 bg-red-500/10 px-2 py-0.5 rounded flex items-center gap-1"><Lock className="h-3 w-3" /> LOCKED</span>
                        )}
                      </div>
                      
                      <div className="mt-8">
                        <Gauge className="h-8 w-8 text-white mb-3" />
                        <h3 className="font-sans font-bold text-lg text-white mb-1">Simulation Accuracy</h3>
                        <p className="font-mono text-xs text-white/60 leading-relaxed">
                          Optimize dynamic filters and parameters to achieve near-zero voltage distortion.
                        </p>
                      </div>
                    </motion.div>

                    {/* Card 3: Task 3 */}
                    <motion.div
                      whileHover={task3Released ? { y: -6 } : {}}
                      onClick={() => {
                        if (task3Released) {
                          setSelectedTask({
                            title: "Task 3: Results Submission",
                            released: true,
                            link: task3Link,
                            description: "Submit final transient performance data and comprehensive evaluation report."
                          });
                        }
                      }}
                      className={`glass-panel rounded-lg p-6 relative group transition-all duration-500 overflow-hidden min-h-[260px] flex flex-col justify-between border cursor-pointer ${
                        task3Released ? "border-primary-red/30 hover:border-primary-red" : "border-white/5 opacity-50 select-none"
                      }`}
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                        <FileCheck className="h-32 w-32 text-white" />
                      </div>
                      
                      <div className="font-mono text-xs text-primary-red mb-auto flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary-red rounded-full"></span>
                          TASK 3
                        </span>
                        {task3Released ? (
                          <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded">RELEASED</span>
                        ) : (
                          <span className="text-xs text-red-500 bg-red-500/10 px-2 py-0.5 rounded flex items-center gap-1"><Lock className="h-3 w-3" /> LOCKED</span>
                        )}
                      </div>
                      
                      <div className="mt-8">
                        <Sparkles className="h-8 w-8 text-white mb-3" />
                        <h3 className="font-sans font-bold text-lg text-white mb-1">Results & Report</h3>
                        <p className="font-mono text-xs text-white/60 leading-relaxed">
                          Submit final transient performance data and comprehensive evaluation report.
                        </p>
                      </div>
                    </motion.div>

                  </div>
                </div>
              </section>

            </motion.div>
          ) : (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <LeaderboardTable
                teams={filteredTeams}
                onSelectTeam={(team) => setSelectedTeam(team)}
                onRegisterTeam={handleRegisterTeam}
                isAdmin={currentUser.role === "admin"}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* 3. Global Footer Component */}
      <footer className="w-full py-10 bg-black border-t border-white/10 mt-16 font-mono text-[11px] text-white/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-white font-bold tracking-widest flex items-center gap-2">
            SIMVERSE <span className="text-[9px] font-mono text-primary-red font-normal bg-primary-red/10 border border-primary-red/20 px-1.5 py-0.5 rounded">v1.0</span>
          </div>
          <div className="text-center md:text-left">
            © 2026 IEEE Power Electronics Society. All technical rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary-red transition-colors">Event Credits</a>
            <span>•</span>
            <a href="#" className="hover:text-primary-red transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-primary-red transition-colors font-semibold flex items-center gap-1"><Heart className="h-3 w-3 text-primary-red fill-primary-red" /> SSN</a>
          </div>
        </div>
      </footer>

      {/* 4. Secure Gateway Login Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!loginSuccess) setIsLoginModalOpen(false);
              }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md glass-panel border border-white/10 rounded-sm overflow-hidden p-8 z-10"
            >
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors cursor-pointer"
                disabled={loginSuccess}
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-center mb-6">
                <div className="h-10 w-10 bg-primary-red/15 border border-primary-red/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="h-5 w-5 text-primary-red" />
                </div>
                <span className="font-mono text-[9px] text-primary-red uppercase tracking-widest font-bold font-bold">WELCOME TO SIMVERSE</span>
                <h3 className="font-display font-extrabold text-xl text-white mt-1">
                  SECURE SIGN IN
                </h3>
              </div>

              {loginSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-6 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mb-3">
                    <UserCheck className="h-6 w-6 text-green-400" />
                  </div>
                  <h4 className="font-sans font-bold text-white text-base">AUTHENTICATION SUCCESSFUL</h4>
                </motion.div>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {loginError && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-primary-red/10 border border-primary-red/20 text-primary-red font-mono text-[11px] rounded-sm text-center leading-relaxed"
                    >
                      {loginError}
                    </motion.div>
                  )}

                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] text-white/60 block uppercase font-bold">
                      USERNAME / TEAM NAME
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
                      <input
                        type="text"
                        required
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        placeholder="e.g. admin or APEX DYNAMICS"
                        className="w-full bg-white/5 border border-white/10 rounded-sm py-2.5 pl-10 pr-4 text-xs text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-primary-red/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] text-white/60 block uppercase font-bold">
                      PASSWORD
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-sm py-2.5 pl-10 pr-4 text-xs text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-primary-red/50 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-primary-gradient text-white font-mono text-xs font-bold py-3 rounded-sm flex items-center justify-center gap-2 hover:scale-[1.01] transition-all cursor-pointer mt-2"
                  >
                    <LogIn className="h-4 w-4" />
                    AUTHENTICATE SESSION
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task Submission Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass-panel border border-white/10 rounded p-8 z-10 text-center"
            >
              <button
                onClick={() => setSelectedTask(null)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="h-12 w-12 bg-primary-red/15 border border-primary-red/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-primary-red" />
              </div>

              <span className="font-mono text-[9px] text-primary-red uppercase tracking-widest font-bold">SUBMISSION PORTAL</span>
              <h3 className="font-display font-extrabold text-2xl text-white mt-1 uppercase">
                {selectedTask.title}
              </h3>
              
              <p className="font-mono text-xs text-white/60 mt-3 max-w-sm mx-auto leading-relaxed">
                {selectedTask.description}
              </p>

              <div className="my-6 p-4 bg-white/5 border border-white/5 rounded-sm">
                <div className="text-sm text-white font-medium flex items-center justify-center gap-2">
                  <span>Get through this button to submit your work in proper way</span>
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    🚀
                  </motion.span>
                  <motion.span
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  >
                    📂
                  </motion.span>
                </div>
              </div>

              <a
                href={selectedTask.link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full inline-flex items-center justify-center gap-2 btn-primary-gradient text-white font-mono text-xs font-bold py-3.5 rounded-sm hover:scale-[1.01] transition-all ${
                  !selectedTask.link ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {selectedTask.link ? "SUBMIT TO GOOGLE DRIVE 📤" : "DRIVE LINK NOT CONFIGURED YET 🛑"}
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
