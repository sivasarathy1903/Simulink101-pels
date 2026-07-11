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
import LeaderboardTable from "./components/LeaderboardTable";
import TeamTelemetryDetails from "./components/TeamTelemetryDetails";

export default function App() {
  const [currentTab, setCurrentTab] = useState<"home" | "leaderboard">("home");
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Auth States
  const [currentUser, setCurrentUser] = useState<{ role: "admin" | "team" | "viewer"; teamId?: string; name?: string }>({
    role: "viewer"
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Load teams from localStorage on initial render, fallback to initial dataset
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
  }, []);

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
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const cleanUser = loginUsername.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    if (!cleanUser || !cleanPass) {
      setLoginError("Please enter both username and password.");
      return;
    }

    // 1. Check Admin
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
    }

    // 2. Check Team credentials
    const matchingTeam = teams.find((t) => {
      const teamClean = t.name.replace(/\s+/g, "").toLowerCase();
      const teamExact = t.name.trim().toLowerCase();
      return teamClean === cleanUser || teamExact === cleanUser;
    });

    if (matchingTeam) {
      // Expected password: "lowercase_teamname_without_spaces" + "123"
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
        setLoginError(`Incorrect password for team "${matchingTeam.name}". Password format is: lowercase teamname with no spaces + "123" (e.g. "${matchingTeam.name.replace(/\s+/g, "").toLowerCase()}123").`);
        return;
      }
    }

    setLoginError("Username not recognized. Use 'admin' or your exact registered team name.");
  };

  const handleLogout = () => {
    const defaultUser = { role: "viewer" as const };
    setCurrentUser(defaultUser);
    localStorage.removeItem("simulink_101_user");
    setSelectedTeam(null);
  };

  // Sync teams with localStorage whenever they change
  const saveTeams = (updatedTeams: Team[]) => {
    setTeams(updatedTeams);
    try {
      localStorage.setItem("simulink_101_teams", JSON.stringify(updatedTeams));
    } catch (e) {
      console.error("Failed to save teams to storage", e);
    }
  };

  // Add a newly registered team directly from Leaderboard
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
      id: `team-${Date.now()}`,
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
  };

  // Handle score adjusters in telemetry details screen
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
  };

  // Clear local storage and reset back to initial setup
  const handleResetChallenge = () => {
    if (window.confirm("Are you sure you want to restore the default challenge leaderboard? All custom teams will be reset.")) {
      saveTeams(INITIAL_TEAMS);
      setSelectedTeam(null);
    }
  };

  const scrollToInitialize = () => {
    const section = document.getElementById("master-simulation-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

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
              <span className="font-display font-black text-lg text-white leading-none tracking-tight group-hover:text-primary-red transition-colors">
                SIMULINK 101
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
                  const myTeam = teams.find(t => t.id === currentUser.teamId);
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
            {/* Active Session Status badge */}
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

            {/* Admin only: Reset DB */}
            {currentUser.role === "admin" && (
              <button
                onClick={handleResetChallenge}
                className="hidden md:block font-mono text-[10px] text-white/30 hover:text-primary-red border border-white/5 hover:border-primary-red/20 px-2.5 py-1 rounded transition-all cursor-pointer"
                title="Restore default database"
              >
                RESET DB
              </button>
            )}

            {/* Log in / Log out main action */}
            {currentUser.role !== "viewer" ? (
              <button
                onClick={handleLogout}
                className="font-mono text-[10px] font-bold text-white/70 hover:text-primary-red border border-white/10 hover:border-primary-red/25 bg-white/5 px-3 py-1.5 rounded-sm flex items-center gap-1.5 transition-all cursor-pointer"
                title="Log out of system"
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
          
          {/* Selected Team Details View Override */}
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

                  {/* High-Fidelity Interactive Block Diagram & Flowing Electric Signal Waves */}
                  <svg className="absolute inset-0 w-full h-full opacity-60 hidden lg:block" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#E31E24" stopOpacity="0" />
                        <stop offset="50%" stopColor="#E31E24" stopOpacity="1" />
                        <stop offset="100%" stopColor="#E31E24" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Circuit Waveform Path 1 (Top Left Sine Sweep) */}
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

                    {/* Circuit Waveform Path 2 (Closed Feedback Loop Bottom Right) */}
                    <path
                      d="M -50 550 C 300 450, 600 680, 1100 520 S 1600 400, 2100 580"
                      fill="none"
                      stroke="rgba(255,255,255,0.02)"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M -50 550 C 300 450, 600 680, 1100 520 S 1600 400, 2100 580"
                      fill="none"
                      stroke="rgba(227, 30, 36, 0.4)"
                      strokeWidth="3"
                      strokeDasharray="100, 400"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values="0; 500"
                        dur="8s"
                        repeatCount="indefinite"
                      />
                    </path>
                  </svg>

                  {/* Interconnected floating block diagram nodes */}
                  <div className="absolute inset-0 z-10 pointer-events-none hidden lg:block">
                    
                    {/* Node 1: SINE WAVE generator */}
                    <motion.div 
                      initial={{ opacity: 0, x: -40 }}
                      animate={{ opacity: 0.65, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className="absolute top-[28%] left-[10%] glass-panel border border-white/10 w-44 p-3 rounded-sm flex items-center gap-3"
                    >
                      <div className="h-7 w-7 rounded bg-primary-red/10 border border-primary-red/20 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-primary-red animate-pulse" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-mono text-[8px] text-white/40 block leading-none font-bold">SOURCE_01</span>
                        <span className="font-mono text-xs text-white">SINE WAVE SIG</span>
                      </div>
                    </motion.div>

                    {/* Node 2: CLOSED LOOP PID */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 0.75, scale: 1 }}
                      transition={{ delay: 0.7, duration: 0.8 }}
                      className="absolute top-[21%] left-[38%] glass-panel border border-primary-red/20 shadow-md shadow-primary-red/5 w-48 p-3 rounded-sm flex items-center gap-3"
                    >
                      <div className="h-7 w-7 rounded bg-primary-red/20 border border-primary-red/40 flex items-center justify-center">
                        <Cpu className="h-4 w-4 text-primary-red" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-mono text-[8px] text-primary-red font-bold uppercase tracking-wide">PID_GAINS [ACTIVE]</span>
                        <span className="font-mono text-xs text-white">CLOSED_LOOP_SYS</span>
                      </div>
                    </motion.div>

                    {/* Node 3: INVERTER PLANT */}
                    <motion.div 
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 0.65, x: 0 }}
                      transition={{ delay: 0.9, duration: 0.8 }}
                      className="absolute top-[48%] right-[14%] glass-panel border border-white/10 w-48 p-3 rounded-sm flex items-center gap-3"
                    >
                      <div className="h-7 w-7 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-yellow-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-mono text-[8px] text-white/40 block leading-none font-bold">LCL CONVERTER</span>
                        <span className="font-mono text-xs text-white">INVERTER_PLANT</span>
                      </div>
                    </motion.div>

                    {/* Direct signal line connecting pulse */}
                    <div className="absolute top-[calc(28%+16px)] left-[calc(10%+176px)] w-[16vw] h-0.5 bg-white/10">
                      <div className="absolute top-0 h-full w-12 bg-gradient-to-r from-transparent via-primary-red to-transparent animate-pulse-signal" style={{ animation: "pulse-signal 3s infinite linear" }} />
                    </div>

                    <div className="absolute top-[calc(21%+24px)] left-[calc(38%+192px)] w-[26vw] h-0.5 bg-white/10 transform rotate-12 origin-left">
                      <div className="absolute top-0 h-full w-12 bg-gradient-to-r from-transparent via-primary-red to-transparent" style={{ animation: "pulse-signal 4s infinite linear", animationDelay: "1.5s" }} />
                    </div>

                  </div>
                </div>

                {/* Center Hero PELS Logo & Text */}
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

                  <motion.h1 
                    initial={{ y: 25, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
                    className="font-display font-black text-5xl md:text-[88px] text-white tracking-tighter leading-none mb-6 drop-shadow-2xl"
                  >
                    SIMULINK 101
                  </motion.h1>

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

              {/* Overview Section: Master the Simulation */}
              <section id="master-simulation-section" className="py-24 px-6 md:px-12 bg-[#0A0A0A] relative z-10 border-t border-white/5 scroll-mt-12">
                <div className="max-w-[1440px] mx-auto">
                  
                  {/* Title Header with viewing link */}
                  <div className="flex flex-col md:flex-row items-end justify-between mb-12 border-b border-white/10 pb-6">
                    <div>
                      <span className="font-mono text-xs text-primary-red block mb-2 uppercase tracking-widest font-bold">INITIALIZATION SEQUENCE</span>
                      <h2 className="font-display font-extrabold text-3xl md:text-5xl text-white tracking-tight">
                        MASTER THE CHALLENGE
                      </h2>
                    </div>
                    <button 
                      onClick={() => setCurrentTab("leaderboard")}
                      className="font-mono text-xs text-white/60 hover:text-primary-red transition-colors flex items-center gap-2 mt-4 md:mt-0 cursor-pointer group"
                    >
                      VIEW LEADERBOARD STANDINGS <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Bento Grid layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    {/* Card 1: Module 01 */}
                    <div className="glass-panel rounded-lg p-6 relative group transition-all duration-500 overflow-hidden min-h-[260px] flex flex-col justify-between border border-white/10">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                        <GitFork className="h-32 w-32 text-white" />
                      </div>
                      
                      <div className="font-mono text-xs text-primary-red mb-auto flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary-red rounded-full"></span>
                        MODULE 01
                      </div>
                      
                      <div className="mt-8">
                        <Network className="h-8 w-8 text-white mb-3" />
                        <h3 className="font-sans font-bold text-lg text-white mb-1">Simulation Challenge</h3>
                        <p className="font-mono text-xs text-white/60 leading-relaxed">
                          Complex topology modeling and rapid transient analysis under strict time constraints.
                        </p>
                      </div>
                    </div>

                    {/* Card 2: Module 02 */}
                    <div className="glass-panel rounded-lg p-6 relative group transition-all duration-500 overflow-hidden min-h-[260px] flex flex-col justify-between border border-white/10">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                        <Cpu className="h-32 w-32 text-white" />
                      </div>

                      <div className="font-mono text-xs text-white/50 mb-auto flex items-center gap-2 group-hover:text-primary-red transition-colors">
                        <span className="w-2 h-2 bg-white/40 group-hover:bg-primary-red transition-colors rounded-full"></span>
                        MODULE 02
                      </div>

                      <div className="mt-8">
                        <Wrench className="h-8 w-8 text-white mb-3" />
                        <h3 className="font-sans font-bold text-lg text-white mb-1">Engineering Thinking</h3>
                        <p className="font-mono text-xs text-white/60 leading-relaxed">
                          Analytical problem solving mirroring real-world power converter design dilemmas.
                        </p>
                      </div>
                    </div>

                    {/* Card 3: Metrics_Sys (Double width card) */}
                    <div className="glass-panel rounded-lg p-6 relative group transition-all duration-500 overflow-hidden min-h-[260px] flex flex-col lg:col-span-2 justify-between border border-white/10 bg-gradient-to-br from-white/[0.015] to-transparent">
                      
                      <div className="font-mono text-xs text-white/50 mb-auto flex items-center gap-2 group-hover:text-primary-red transition-colors">
                        <span className="w-2 h-2 bg-white/40 group-hover:bg-primary-red transition-colors rounded-full"></span>
                        METRICS_SYS
                      </div>

                      <div className="mt-8 flex flex-col md:flex-row gap-6 justify-between items-end">
                        <div className="max-w-xs">
                          <CheckSquare className="h-8 w-8 text-white mb-3" />
                          <h3 className="font-sans font-bold text-lg text-white mb-1">Category-Based Scoring</h3>
                          <p className="font-mono text-xs text-white/60 leading-relaxed">
                            Precision, efficiency, and robustness are evaluated independently for comprehensive ranking.
                          </p>
                        </div>

                        {/* Interactive telemetry bar visualizer */}
                        <div className="flex flex-col gap-2.5 w-full md:w-1/2">
                          
                          {/* Accuracy Bar */}
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[10px] text-white/50 w-8">ACC</span>
                            <div className="flex-grow h-2.5 bg-white/10 flex gap-[1.5px] p-[1.5px] rounded-sm">
                              {Array.from({ length: 10 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-full flex-1 rounded-[1px] ${
                                    i < 8 ? "bg-primary-red shadow-sm" : "bg-white/10"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-mono text-[10px] text-primary-red font-bold w-6 text-right">80%</span>
                          </div>

                          {/* Speed Bar */}
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[10px] text-white/50 w-8">SPD</span>
                            <div className="flex-grow h-2.5 bg-white/10 flex gap-[1.5px] p-[1.5px] rounded-sm">
                              {Array.from({ length: 10 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-full flex-1 rounded-[1px] ${
                                    i < 6 ? "bg-primary-red shadow-sm" : "bg-white/10"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-mono text-[10px] text-primary-red font-bold w-6 text-right">60%</span>
                          </div>

                          {/* Efficiency Bar */}
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[10px] text-white/50 w-8">EFF</span>
                            <div className="flex-grow h-2.5 bg-white/10 flex gap-[1.5px] p-[1.5px] rounded-sm">
                              {Array.from({ length: 10 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-full flex-1 rounded-[1px] ${
                                    i < 9 ? "bg-primary-red shadow-sm" : "bg-white/10"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-mono text-[10px] text-primary-red font-bold w-6 text-right">90%</span>
                          </div>

                        </div>
                      </div>

                    </div>

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
                teams={teams}
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
            SIMULINK 101 <span className="text-[9px] font-mono text-primary-red font-normal bg-primary-red/10 border border-primary-red/20 px-1.5 py-0.5 rounded">v2.0</span>
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!loginSuccess) setIsLoginModalOpen(false);
              }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Body */}
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
                <span className="font-mono text-[9px] text-primary-red uppercase tracking-widest font-bold">WELCOME TO SIMULINK 101</span>
                <h3 className="font-display font-extrabold text-xl text-white mt-1">
                  SECURE SIGN IN
                </h3>
                <p className="font-mono text-[10px] text-white/50 mt-1">
                  Access the leaderboards and team metrics securely.
                </p>
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
                  <p className="font-mono text-xs text-white/60 mt-1">
                    Establishing secure simulation link...
                  </p>
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

    </div>
  );
}
