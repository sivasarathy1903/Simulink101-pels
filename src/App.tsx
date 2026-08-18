import React, { useState, useEffect, useRef } from "react";
import {
  Trophy,
  Info,
  ArrowDown,
  ArrowRight,
  Cpu,
  Sparkles,
  Gauge,
  UserCheck,
  Sliders,
  FileCheck,
  Zap,
  Activity,
  Heart,
  Lock,
  LogIn,
  LogOut,
  Key,
  User,
  X,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Team } from "./types";
import { INITIAL_TEAMS } from "./data";
import { useTeams } from "./hooks/useTeams";
import { teamService, calcTotalPoints } from "./services/teamService";
import { supabase } from "./lib/supabase";
import LeaderboardTable from "./components/LeaderboardTable";
import TeamTelemetryDetails from "./components/TeamTelemetryDetails";
import TaskDetailPage, { TASK_CONFIGS } from "./components/TaskDetailPage";
import RulebookPage from "./components/RulebookPage";
import ResourcesPage from "./components/ResourcesPage";

export default function App() {
  const [currentTab, setCurrentTab] = useState<"home" | "tasks" | "leaderboard" | "rulebook" | "resources">("home");
  const [activeTaskNumber, setActiveTaskNumber] = useState<number | null>(null);
  const { teams } = useTeams();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const [selectedTask, setSelectedTask] = useState<{
    title: string;
    link: string;
    description: string;
  } | null>(null);

  // Auth States
  const [currentUser, setCurrentUser] = useState<{ role: "admin" | "viewer" | "team"; name?: string; teamId?: string }>({ role: "viewer" });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Canvas ref for particle background
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draft state for team link inputs (avoids read-only binding to teams state)
  const [draftLinks, setDraftLinks] = useState<Record<string, string>>({});
  // Which links have been submitted (locked / not in edit mode)
  const [submittedLinks, setSubmittedLinks] = useState<Record<string, string>>({});
  // Which tasks are currently saving
  const [savingLink, setSavingLink] = useState<Record<string, boolean>>({});

  // When team logs in, fetch their submissions from the new table
  useEffect(() => {
    if (currentUser.role === "team" && currentUser.teamId) {
      teamService.getTeamSubmissions(currentUser.teamId).then(submissions => {
        const existing = {
          task1Link: submissions["task1Link"] || "",
          task2Link: submissions["task2Link"] || "",
          task3Link: submissions["task3Link"] || "",
        };
        setDraftLinks(existing);
        // Mark already-submitted links as confirmed
        const confirmed: Record<string, string> = {};
        Object.entries(existing).forEach(([k, v]) => { if (v) confirmed[k] = v; });
        setSubmittedLinks(confirmed);
      });
    }
  }, [currentUser.teamId, currentUser.role]);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("simverse_user");
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
    } catch (e) { /* ignore */ }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setCurrentUser({ role: "admin", name: "Admin" });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setCurrentUser({ role: "admin", name: "Admin" });
      else setCurrentUser(prev => prev.role === "admin" ? { role: "viewer" } : prev);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Particle canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Particles
    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    // Grid lines
    const drawGrid = () => {
      ctx.strokeStyle = "rgba(255,255,255,0.025)";
      ctx.lineWidth = 1;
      const size = 60;
      for (let x = 0; x < canvas.width; x += size) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += size) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
    };

    // Flowing signal lines
    let t = 0;
    const drawSignal = (yBase: number, color: string, speed: number, amp: number) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      for (let x = 0; x <= canvas.width; x += 3) {
        const y = yBase + Math.sin((x / 180) + t * speed) * amp;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();

      // Glowing orb
      const grd = ctx.createRadialGradient(canvas.width * 0.25, canvas.height * 0.35, 0, canvas.width * 0.25, canvas.height * 0.35, 380);
      grd.addColorStop(0, "rgba(227,30,36,0.06)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Signal waves
      drawSignal(canvas.height * 0.3, "rgba(227,30,36,0.25)", 0.6, 30);
      drawSignal(canvas.height * 0.55, "rgba(255,255,255,0.08)", 0.4, 20);
      drawSignal(canvas.height * 0.75, "rgba(227,30,36,0.12)", 0.5, 15);

      // Particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(227,30,36,${p.alpha})`;
        ctx.fill();
      });

      t += 0.012;
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const cleanUser = loginUsername.trim();
    if (!cleanUser || !loginPassword.trim()) {
      setLoginError("Please enter both credentials.");
      return;
    }
    
    // Check if trying to login as admin
    const isAttemptingAdmin = cleanUser.toLowerCase() === "admin" || cleanUser.includes("@");
    if (isAttemptingAdmin) {
      try {
        const email = cleanUser.toLowerCase() === "admin" ? "admin@simulink101.com" : cleanUser;
        const { error } = await supabase.auth.signInWithPassword({ email, password: loginPassword });
        if (error) { setLoginError("Incorrect admin credentials."); return; }
        setLoginSuccess(true);
        setTimeout(() => { setIsLoginModalOpen(false); setLoginSuccess(false); setLoginUsername(""); setLoginPassword(""); }, 1200);
      } catch { setLoginError("Login failed."); }
      return;
    }

    // Try Team Login
    try {
      const team = await teamService.loginTeam(cleanUser, loginPassword);
      if (team) {
        setLoginSuccess(true);
        setCurrentUser({ role: "team", name: team.name, teamId: team.id });
        localStorage.setItem("simverse_user", JSON.stringify({ role: "team", name: team.name, teamId: team.id }));
        setTimeout(() => { setIsLoginModalOpen(false); setLoginSuccess(false); setLoginUsername(""); setLoginPassword(""); }, 1200);
        return;
      }
      setLoginError("Incorrect team name or password.");
    } catch {
      setLoginError("Login failed.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser({ role: "viewer" });
    localStorage.removeItem("simverse_user");
    setSelectedTeam(null);
  };

  const handleRegisterTeam = async (newTeamData: { name: string; dept: string; year: string; members: string[] }) => {
    try {
      const generatedPassword = Math.random().toString(36).slice(-6).toUpperCase();
      await teamService.createTeam({
        name: newTeamData.name.toUpperCase(),
        institution: `${newTeamData.dept} - ${newTeamData.year}`,
        totalPoints: 0,
        status: "Registered",
        metrics: { password: generatedPassword },
        runHistory: [],
        tags: newTeamData.members,
      });
      alert(`Team created successfully!\n\nTeam Name: ${newTeamData.name.toUpperCase()}\nPassword: ${generatedPassword}\n\nPlease save this password and share it with the team.`);
    } catch (err) {
      console.error(err);
      alert("Failed to create team.");
    }
  };

  const handleUpdateMetrics = async (teamId: string, updatedMetrics: Team["metrics"]) => {
    try {
      await teamService.updateTeamScores(teamId, updatedMetrics);
      const totalPoints = calcTotalPoints(updatedMetrics);
      setSelectedTeam(prev => prev && prev.id === teamId ? { ...prev, metrics: updatedMetrics, totalPoints } : prev);
    } catch (err) {
      console.error(err);
      alert("Failed to update metrics.");
    }
  };

  const handleResetChallenge = async () => {
    if (window.confirm("Seed default teams? This adds sample data to Supabase.")) {
      for (const t of INITIAL_TEAMS) await teamService.createTeam(t);
    }
  };

  const scrollToSection = () => {
    document.getElementById("challenge-section")?.scrollIntoView({ behavior: "smooth" });
  };

  // Parse event config
  const configTeam = teams.find(t => t.name === "__EVENT_CONFIG__");
  const task1Released = !!(configTeam?.metrics?.task1Released);
  const task2Released = !!(configTeam?.metrics?.task2Released);
  const task3Released = !!(configTeam?.metrics?.task3Released);
  const task1Link = (configTeam?.metrics?.task1Link as string) || "";
  const task2Link = (configTeam?.metrics?.task2Link as string) || "";
  const task3Link = (configTeam?.metrics?.task3Link as string) || "";

  const handleUpdateConfig = async (patch: Record<string, unknown>) => {
    const newMetrics = { ...(configTeam?.metrics || {}), ...patch };
    try {
      if (configTeam) {
        await teamService.updateTeamConfig(configTeam.id, newMetrics);
      } else {
        await teamService.createTeam({ name: "__EVENT_CONFIG__", institution: "SYSTEM", totalPoints: 0, status: "CONFIG", metrics: newMetrics });
      }
    } catch (err) { console.error(err); }
  };

  const filteredTeams = teams.filter(t => t.name !== "__EVENT_CONFIG__");

  const tasks = [
    { key: 1, released: task1Released, linkKey: "task1Link", title: "Task 1", subtitle: "Circuit Design Phase", desc: "Design and simulate the primary power converter topology. Submit your Simulink model and report.", Icon: Cpu },
    { key: 2, released: task2Released, linkKey: "task2Link", title: "Task 2", subtitle: "Simulation Accuracy Phase", desc: "Optimize your control loop. Achieve target dynamic response with minimal overshoot and settling time.", Icon: Gauge },
    { key: 3, released: task3Released, linkKey: "task3Link", title: "Task 3", subtitle: "Results & Report Phase", desc: "Submit your final evaluation report with all simulation results, waveforms, and analysis.", Icon: FileCheck },
  ];

  return (
    <div className="bg-[#070709] text-white min-h-screen selection:bg-primary-red selection:text-white flex flex-col overflow-x-hidden">

      {/* ─── NAV ─── */}
      <nav className="fixed top-0 w-full z-50 bg-[#070709]/80 backdrop-blur-2xl border-b border-white/[0.06] transition-all duration-300">
        <div className="flex justify-between items-center px-3 sm:px-6 md:px-12 py-3 max-w-[1440px] mx-auto">
          <div onClick={() => { setCurrentTab("home"); setSelectedTeam(null); setActiveTaskNumber(null); }} className="flex items-center gap-2 sm:gap-3.5 cursor-pointer group shrink-0">
            <img alt="IEEE PELS" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-white/10 group-hover:border-primary-red/40 transition-all" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhT7QIUE14McBjVbaSVgLbQU9Rskq807b4yTeIq433ZYqnXk0jH5wCkIHv7aFintnvmMEPMB8U6dzNDoCltxJIlTa1QfcbTFv-BMzBuvE-m-GH5LG8dcz-njxhfytuRde4mq-BPrltR_gDGpVQ7dZuCNEtLZy3K7ttEPoq6_sas0yedeCB344eHCiEQx9EOWuuiE-CXTRnBmGJqnhwcoFV2fUFiWM_YObS8Q1g-wvE74BsUdQU2Ic2Xg-kKlB3ZqJj3uA" />
            <div>
              <div className="font-display font-black text-sm sm:text-base text-white leading-none tracking-widest group-hover:text-primary-red transition-colors">SIMVERSE</div>
              <div className="font-mono text-[7px] sm:text-[8px] text-white/35 tracking-wider sm:tracking-widest">IEEE POWER ELECTRONICS</div>
            </div>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: "home", label: "Home" },
              { id: "tasks", label: "Tasks" },
              { id: "leaderboard", label: "Leaderboard" },
              { id: "rulebook", label: "Rulebook" },
              { id: "resources", label: "Resources" },
            ].map(tab => (
              <button key={tab.id} onClick={() => { setCurrentTab(tab.id as any); setSelectedTeam(null); setActiveTaskNumber(null); }}
                className={`font-mono text-[9px] sm:text-[10px] font-bold tracking-wider sm:tracking-widest px-2 sm:px-3 py-1.5 rounded transition-all cursor-pointer uppercase shrink-0 ${currentTab === tab.id && !selectedTeam && !activeTaskNumber ? "text-primary-red border-b border-primary-red" : "text-white/50 hover:text-white"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {currentUser.role === "admin" && (
              <>
                <div className="hidden sm:flex items-center gap-1.5 bg-primary-red/10 border border-primary-red/25 px-2.5 py-1 rounded font-mono text-[9px] text-primary-red">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-red animate-ping" />
                  <span className="font-bold">ADMIN</span>
                </div>
                <button onClick={handleResetChallenge} className="hidden md:block font-mono text-[9px] text-white/25 hover:text-primary-red border border-white/5 px-2 py-1 rounded transition-all cursor-pointer">SEED DB</button>
                <button onClick={handleLogout} className="font-mono text-[9px] font-bold text-white/60 hover:text-primary-red border border-white/10 bg-white/[0.03] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded flex items-center gap-1.5 transition-all cursor-pointer">
                  <LogOut className="h-3 w-3" /> <span className="hidden xs:inline">SIGN OUT</span>
                </button>
              </>
            )}
            {currentUser.role === "team" && (
              <>
                <div className="hidden sm:flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/25 px-2.5 py-1 rounded font-mono text-[9px] text-blue-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                  <span className="font-bold uppercase truncate max-w-[80px]">{teams.find(t => t.id === currentUser.teamId)?.name || "TEAM"}</span>
                </div>
                <button onClick={handleLogout} className="font-mono text-[9px] font-bold text-white/60 hover:text-primary-red border border-white/10 bg-white/[0.03] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded flex items-center gap-1.5 transition-all cursor-pointer">
                  <LogOut className="h-3 w-3" /> <span className="hidden xs:inline">SIGN OUT</span>
                </button>
              </>
            )}
            {currentUser.role === "viewer" && (
              <button onClick={() => { setLoginError(""); setLoginUsername(""); setLoginPassword(""); setIsLoginModalOpen(true); }}
                className="font-mono text-[9px] sm:text-[10px] font-bold text-white bg-primary-red hover:bg-red-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded flex items-center gap-1.5 transition-all shadow-lg shadow-primary-red/20 cursor-pointer">
                <LogIn className="h-3 sm:h-3.5 w-3 sm:w-3.5" /> LOGIN
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ─── MAIN ─── */}
      <main className="flex-grow pt-14">
        <AnimatePresence mode="wait">

          {selectedTeam ? (
            (() => {
              // Always use the live team from teams array so submitted links & scores stay fresh
              const liveTeam = teams.find(t => t.id === selectedTeam.id) ?? selectedTeam;
              return (
                <motion.div key="detail" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.28 }}>
                  <TeamTelemetryDetails team={liveTeam} onBack={() => setSelectedTeam(null)} onUpdateMetrics={handleUpdateMetrics} isAdmin={currentUser.role === "admin"} />
                </motion.div>
              );
            })()
          ) : activeTaskNumber ? (
            <motion.div key={`task-${activeTaskNumber}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.28 }}>
              <TaskDetailPage
                taskNumber={activeTaskNumber}
                onBack={() => setActiveTaskNumber(null)}
                currentUser={currentUser}
                teams={teams}
                submittedLinks={submittedLinks}
                onSaveSubmission={async (linkKey, linkVal) => {
                  if (!currentUser.teamId) return;
                  const t = teams.find(t => t.id === currentUser.teamId);
                  if (t) {
                    await teamService.updateTeamSubmission(t.id, linkKey, linkVal);
                    setSubmittedLinks(prev => ({ ...prev, [linkKey]: linkVal }));
                  }
                }}
                onNavigateRulebook={() => { setActiveTaskNumber(null); setCurrentTab("rulebook"); }}
                onNavigateResources={() => { setActiveTaskNumber(null); setCurrentTab("resources"); }}
              />
            </motion.div>
          ) : currentTab === "tasks" ? (
            <motion.div key="tasks-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-8 mt-14 font-sans text-white">
              <div className="mb-10 text-center">
                <span className="font-mono text-[10px] text-primary-red uppercase tracking-widest block mb-2">Engineering Challenges</span>
                <h1 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight">Phase 2 Tasks</h1>
                <p className="font-mono text-xs sm:text-sm text-white/40 mt-2 max-w-xl mx-auto">Select a task below to view detailed specifications, topology candidates, evaluation criteria, and submit your solution.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(num => {
                  const cfg = TASK_CONFIGS[num];
                  const rel = configTeam?.metrics?.[`task${num}Released` as keyof typeof configTeam.metrics] !== false;
                  return (
                    <motion.div
                      key={num}
                      whileHover={{ y: -6, scale: 1.02 }}
                      onClick={() => setActiveTaskNumber(num)}
                      className={`relative rounded-2xl p-7 border cursor-pointer flex flex-col justify-between transition-all shadow-xl ${rel ? 'border-primary-red/30 bg-gradient-to-br from-primary-red/[0.06] via-black/40 to-transparent hover:border-primary-red/60' : 'border-white/10 bg-white/[0.02]'}`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <span className="font-mono text-xs font-bold text-primary-red bg-primary-red/10 border border-primary-red/25 px-2.5 py-1 rounded-full uppercase tracking-widest">
                            TASK {num}
                          </span>
                          {rel ? (
                            <span className="font-mono text-[9px] text-green-400 bg-green-500/10 border border-green-500/25 px-2 py-0.5 rounded-full">ACTIVE</span>
                          ) : (
                            <span className="font-mono text-[9px] text-yellow-400 bg-yellow-500/10 border border-yellow-500/25 px-2 py-0.5 rounded-full">LOCKED</span>
                          )}
                        </div>

                        <h3 className="font-display font-black text-2xl text-white mb-2">{cfg.product}</h3>
                        <p className="font-mono text-xs text-primary-red/90 font-semibold mb-4">{cfg.givenSpecs.power} · {cfg.givenSpecs.output}</p>
                        <p className="font-sans text-xs text-white/60 leading-relaxed line-clamp-3 mb-6">{cfg.taskStatement}</p>
                      </div>

                      <button className="w-full btn-primary-gradient font-mono text-xs font-bold text-white py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary-red/20">
                        VIEW DEDICATED TASK PAGE →
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : currentTab === "home" ? (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>

              {/* ─── HERO ─── */}
              <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden">

                {/* Canvas background */}
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

                {/* Vignette overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#070709_80%)] pointer-events-none z-[1]" />

                {/* Center content */}
                <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl">

                  {/* IEEE badge text — top */}
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.5 }}
                    className="flex items-center gap-2 bg-white/[0.04] border border-white/10 px-4 py-1.5 rounded-full mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-red animate-pulse" />
                    <span className="font-mono text-[10px] text-white/60 tracking-widest uppercase">IEEE Power Electronics Society</span>
                  </motion.div>

                  {/* IEEE PELS Logo — directly above event name */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-5"
                  >
                    <div className="relative inline-block">
                      <div className="absolute inset-0 rounded-full bg-primary-red/20 blur-2xl scale-150 animate-pulse" />
                      <img
                        alt="IEEE PELS Logo"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWFhypqX49CLE1dA5h3Oo_p3Npdqs-zfB5A4aibOI5YUyN8LXhfqByUJrbE1xMNSFe3OI32os9ob8caLvQw8Z6DUhISk5_OZONeWi6w0dBmrsPu-5ljDhj3-YmMjT6QejkL6RMH4BV7ihr0d2_cUae1BKjVz1LX3i6ncb-mBoZBzBGFkocvzdJobfcDsdL2DFCQ2o54PskiTpKDIwdjMfm2JbpKiVDyESbWX6H92vW3nu4vuBoVdG3gi0MhS2zksFiIJA"
                        className="relative h-20 w-20 sm:h-28 sm:w-28 rounded-full border border-white/15 shadow-2xl shadow-primary-red/20 object-contain p-1"
                      />
                    </div>
                  </motion.div>

                  {/* SIMVERSE — professional staggered reveal */}
                  <div className="flex justify-center items-end gap-0 mb-4 sm:mb-6 overflow-visible max-w-full" aria-label="SIMVERSE">
                    {"SIMVERSE".split("").map((ch, i) => (
                      <motion.span
                        key={i}
                        className="font-display font-black leading-none select-none"
                        style={{
                          fontSize: "clamp(32px, 11vw, 128px)",
                          letterSpacing: "-0.02em",
                          background: "linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.55) 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          filter: "drop-shadow(0 0 28px rgba(227,30,36,0.35))",
                        }}
                        initial={{ opacity: 0, y: 40, skewX: -6 }}
                        animate={{ opacity: 1, y: 0, skewX: 0 }}
                        transition={{ delay: 0.15 + i * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {ch}
                      </motion.span>
                    ))}
                  </div>

                  {/* Glowing underline */}
                  <motion.div
                    className="h-px w-0 bg-gradient-to-r from-transparent via-primary-red to-transparent mb-6 sm:mb-8"
                    animate={{ width: "60%" }}
                    transition={{ delay: 0.75, duration: 0.8, ease: "easeOut" }}
                  />

                  {/* Subtext */}
                  <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }}
                    className="text-white/55 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed mb-8 sm:mb-10 px-2">
                    A multi-phase power electronics simulation challenge — design, optimize, and prove your engineering excellence with MATLAB Simulink.
                  </motion.p>

                  {/* CTAs */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.5 }}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
                    <button onClick={() => setCurrentTab("leaderboard")}
                      className="btn-primary-gradient text-white font-mono text-xs font-bold tracking-widest px-6 sm:px-8 py-3.5 rounded flex items-center justify-center gap-2 group cursor-pointer hover:scale-[1.02] transition-transform shadow-lg shadow-primary-red/25 w-full sm:w-auto">
                      <Trophy className="h-4 w-4 group-hover:scale-110 transition-transform" /> VIEW LEADERBOARD
                    </button>
                    <button onClick={scrollToSection}
                      className="text-white font-mono text-xs font-bold tracking-widest px-6 sm:px-8 py-3.5 rounded flex items-center justify-center gap-2 cursor-pointer border border-white/15 hover:border-white/30 hover:bg-white/[0.04] transition-all w-full sm:w-auto">
                      <Info className="h-4 w-4 text-primary-red" /> EXPLORE CHALLENGES
                    </button>
                  </motion.div>
                </div>

                {/* Scroll cue */}
                <motion.div onClick={scrollToSection} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.4 }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 cursor-pointer hover:opacity-100 transition-opacity">
                  <span className="font-mono text-[9px] text-white/40 tracking-widest uppercase">Scroll</span>
                  <ArrowDown className="h-4 w-4 text-primary-red animate-bounce" />
                </motion.div>
              </section>

              {/* ─── PHASE TO CHALLENGE ─── */}
              <section id="challenge-section" className="py-12 sm:py-24 px-4 sm:px-6 md:px-12 border-t border-white/[0.06] scroll-mt-14">
                <div className="max-w-6xl mx-auto">

                  <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 sm:mb-12 gap-3 sm:gap-0">
                    <div>
                      <span className="font-mono text-[10px] text-primary-red tracking-widest uppercase mb-1.5 sm:mb-2 block">Event Flow</span>
                      <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">Phase 2 Challenge</h2>
                      <p className="font-mono text-[11px] sm:text-xs text-white/40 mt-1 sm:mt-2">Click any task below to open its dedicated specifications and submission portal.</p>
                    </div>
                    <button onClick={() => setCurrentTab("leaderboard")} className="font-mono text-xs text-white/40 hover:text-primary-red flex items-center gap-2 mt-2 md:mt-0 cursor-pointer group transition-colors">
                      LEADERBOARD <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Task Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                    {[1, 2, 3].map(num => {
                      const cfg = TASK_CONFIGS[num];
                      const released = configTeam?.metrics?.[`task${num}Released` as keyof typeof configTeam.metrics] !== false;
                      const linkKey = `task${num}Link`;

                      return (
                        <motion.div
                          key={num}
                          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: num * 0.1 }}
                          whileHover={{ y: -5, scale: 1.015 }}
                          onClick={() => setActiveTaskNumber(num)}
                          className={`relative rounded-xl p-5 sm:p-7 flex flex-col gap-4 sm:gap-5 border overflow-hidden transition-all duration-300 cursor-pointer ${released ? 'border-primary-red/30 bg-gradient-to-br from-primary-red/[0.05] to-transparent hover:border-primary-red/50' : 'border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent hover:border-white/20'}`}
                        >
                          {/* Background number watermark */}
                          <span className={`absolute -right-3 -bottom-4 font-display font-black text-[80px] sm:text-[120px] ${released ? 'text-primary-red/[0.05]' : 'text-white/[0.03]'} leading-none select-none pointer-events-none`}>{num}</span>

                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-lg ${released ? 'bg-primary-red/[0.1] border-primary-red/20' : 'bg-white/[0.06] border-white/10'} border flex items-center justify-center shrink-0`}>
                              <Cpu className={`h-4 sm:h-5 w-4 sm:w-5 ${released ? 'text-primary-red' : 'text-white/30'}`} />
                            </div>
                            <span className={`font-mono text-[10px] font-bold ${released ? 'text-primary-red/80' : 'text-white/30'} tracking-widest`}>TASK {num}</span>
                          </div>

                          <div>
                            <h3 className={`font-display font-bold text-xl sm:text-2xl ${released ? 'text-white' : 'text-white/50'}`}>{cfg.product}</h3>

                            {released ? (
                              <div className="mt-3 sm:mt-4 flex flex-col gap-2">
                                <h4 className="font-mono text-xs text-primary-red/80 uppercase tracking-wide">{cfg.givenSpecs.power} · {cfg.givenSpecs.output}</h4>
                                <p className="text-xs sm:text-sm text-white/60 leading-relaxed line-clamp-3">{cfg.taskStatement}</p>
                              </div>
                            ) : (
                              <div className="mt-4 relative flex items-center justify-center h-16 rounded-lg overflow-hidden bg-black/30 border border-white/[0.07]">
                                <Lock className="h-5 w-5 text-white/40" />
                                <span className="font-mono text-[9px] text-white/25 tracking-widest uppercase ml-2">Locked</span>
                              </div>
                            )}
                          </div>

                          <div className="pt-4 border-t border-white/[0.06] mt-auto">
                            <button className="w-full btn-primary-gradient font-mono text-[10px] font-bold text-white py-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-widest shadow-md">
                              OPEN DEDICATED TASK PAGE →
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Scoring info */}
                  <div className="mt-6 sm:mt-8 bg-white/[0.015] border border-white/[0.06] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <Trophy className="h-5 w-5 text-yellow-400 shrink-0" />
                    <div>
                      <p className="font-mono text-xs text-white font-semibold">CUMULATIVE SCORING</p>
                      <p className="font-mono text-[10px] text-white/40 mt-0.5">Each task is evaluated out of 100 points based on the 6 evaluation criteria. Total max score: 300 points across all three tasks.</p>
                    </div>
                  </div>
                </div>
              </section>

            </motion.div>

          ) : currentTab === "leaderboard" ? (
            <motion.div key="lb" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.28 }}>
              <LeaderboardTable teams={filteredTeams} onSelectTeam={setSelectedTeam} onRegisterTeam={handleRegisterTeam} onDeleteTeam={async (id) => { try { await teamService.deleteTeam(id); } catch (err) { console.error(err); alert("Failed to delete team."); } }} isAdmin={currentUser.role === "admin"} />
            </motion.div>
          ) : currentTab === "rulebook" ? (
            <motion.div key="rulebook" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.28 }}>
              <RulebookPage />
            </motion.div>
          ) : currentTab === "resources" ? (
            <motion.div key="resources" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.28 }}>
              <ResourcesPage />
            </motion.div>
          ) : null}

        </AnimatePresence>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="w-full py-8 bg-black/60 border-t border-white/[0.06] font-mono text-[10px] text-white/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-white font-bold tracking-widest">SIMVERSE <span className="text-primary-red font-normal">v2.0</span></span>
          <span>© 2026 IEEE Power Electronics Society. All rights reserved.</span>
          <div className="flex gap-4 items-center">
            <a href="https://drive.google.com/file/d/12Xsby0psAvJR6gGXaD_EpL0zbZKzl0Zd/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="hover:text-primary-red transition-colors">Rulebook (PDF)</a>
            <span>·</span>
            <span className="flex items-center gap-1"><Heart className="h-2.5 w-2.5 text-primary-red fill-primary-red" /> SSN</span>
          </div>
        </div>
      </footer>

      {/* ─── ADMIN LOGIN MODAL ─── */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !loginSuccess && setIsLoginModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: "spring", duration: 0.45 }}
              className="relative w-full max-w-sm bg-[#0D0D10] border border-white/10 rounded-2xl p-8 z-10 shadow-2xl">
              <button onClick={() => setIsLoginModalOpen(false)} disabled={loginSuccess}
                className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors cursor-pointer">
                <X className="h-4 w-4" />
              </button>

              {loginSuccess ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-4">
                    <UserCheck className="h-6 w-6 text-green-400" />
                  </div>
                  <h4 className="font-display font-bold text-white">Access Granted</h4>
                  <p className="font-mono text-[10px] text-white/40 mt-1">Entering portal…</p>
                </motion.div>
              ) : (
                <>
                  <div className="mb-7 text-center">
                    <div className="h-11 w-11 bg-primary-red/10 border border-primary-red/25 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <LogIn className="h-5 w-5 text-primary-red" />
                    </div>
                    <span className="font-mono text-[9px] text-primary-red uppercase tracking-widest">Simverse 2026</span>
                    <h3 className="font-display font-black text-xl text-white mt-0.5">Login</h3>
                    <p className="font-mono text-[10px] text-white/35 mt-1">Admin or Team Access</p>
                  </div>

                  {loginError && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 bg-primary-red/10 border border-primary-red/20 text-primary-red font-mono text-[10px] rounded-lg text-center">
                      {loginError}
                    </motion.div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-white/40 uppercase tracking-widest">Username</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                        <input type="text" required value={loginUsername} onChange={e => setLoginUsername(e.target.value)} placeholder="admin or team name"
                          className="w-full bg-white/[0.04] border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-xs text-white font-mono placeholder:text-white/15 focus:outline-none focus:border-primary-red/50 transition-colors" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-white/40 uppercase tracking-widest">Password</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                        <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••"
                          className="w-full bg-white/[0.04] border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-xs text-white font-mono placeholder:text-white/15 focus:outline-none focus:border-primary-red/50 transition-colors" />
                      </div>
                    </div>
                    <button type="submit" className="w-full btn-primary-gradient text-white font-mono text-xs font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform cursor-pointer mt-2">
                      <LogIn className="h-4 w-4" /> SIGN IN
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── TASK SUBMISSION MODAL ─── */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTask(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="relative w-full max-w-md bg-[#0D0D10] border border-white/10 rounded-2xl p-8 z-10 shadow-2xl text-center">
              <button onClick={() => setSelectedTask(null)} className="absolute top-4 right-4 text-white/30 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>

              <div className="h-12 w-12 bg-primary-red/10 border border-primary-red/25 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-primary-red" />
              </div>
              <span className="font-mono text-[9px] text-primary-red uppercase tracking-widest">Submission Portal</span>
              <h3 className="font-display font-black text-xl text-white mt-1">{selectedTask.title}</h3>
              <p className="font-mono text-xs text-white/50 mt-3 leading-relaxed max-w-xs mx-auto">{selectedTask.description}</p>

              <div className="my-6 p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                <p className="text-sm text-white font-medium">
                  Head over to the Drive, upload your files, and you're good to go!
                </p>
                <div className="flex justify-center gap-3 mt-3">
                  {["🚀", "📂", "✅"].map((em, i) => (
                    <motion.span key={i} className="text-xl" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.25 }}>{em}</motion.span>
                  ))}
                </div>
              </div>

              <a href={selectedTask.link || "#"} target="_blank" rel="noopener noreferrer"
                className={`w-full inline-flex items-center justify-center gap-2 btn-primary-gradient text-white font-mono text-xs font-bold py-3.5 rounded-lg hover:scale-[1.01] transition-all ${!selectedTask.link ? "opacity-40 pointer-events-none" : ""}`}>
                {selectedTask.link ? "OPEN SUBMISSION DRIVE 📤" : "LINK NOT CONFIGURED YET"}
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
