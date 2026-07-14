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

export default function App() {
  const [currentTab, setCurrentTab] = useState<"home" | "leaderboard">("home");
  const { teams } = useTeams();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const [selectedTask, setSelectedTask] = useState<{
    title: string;
    link: string;
    description: string;
  } | null>(null);

  // Auth States
  const [currentUser, setCurrentUser] = useState<{ role: "admin" | "viewer"; name?: string }>({ role: "viewer" });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Canvas ref for particle background
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    const cleanUser = loginUsername.trim().toLowerCase();
    if (!cleanUser || !loginPassword.trim()) {
      setLoginError("Please enter both credentials.");
      return;
    }
    if (cleanUser === "admin" || cleanUser.includes("@")) {
      try {
        const email = cleanUser === "admin" ? "admin@simulink101.com" : cleanUser;
        const { error } = await supabase.auth.signInWithPassword({ email, password: loginPassword });
        if (error) { setLoginError("Incorrect admin credentials."); return; }
        setLoginSuccess(true);
        setTimeout(() => { setIsLoginModalOpen(false); setLoginSuccess(false); setLoginUsername(""); setLoginPassword(""); }, 1200);
      } catch { setLoginError("Login failed."); }
      return;
    }
    setLoginError("Only admin access is permitted here.");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser({ role: "viewer" });
    localStorage.removeItem("simverse_user");
    setSelectedTeam(null);
  };

  const handleRegisterTeam = async (newTeamData: { name: string; members: string[] }) => {
    try {
      await teamService.createTeam({
        name: newTeamData.name.toUpperCase(),
        institution: "SIMVERSE 2026",
        totalPoints: 0,
        status: "Registered",
        metrics: {},
        runHistory: [],
        tags: newTeamData.members,
      });
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
    { key: 1, released: task1Released, link: task1Link, title: "Task 1", subtitle: "Circuit Design Phase", desc: "Design and simulate the primary power converter topology. Submit your Simulink model and report.", Icon: Cpu },
    { key: 2, released: task2Released, link: task2Link, title: "Task 2", subtitle: "Simulation Accuracy Phase", desc: "Optimize your control loop. Achieve target dynamic response with minimal overshoot and settling time.", Icon: Gauge },
    { key: 3, released: task3Released, link: task3Link, title: "Task 3", subtitle: "Results & Report Phase", desc: "Submit your final evaluation report with all simulation results, waveforms, and analysis.", Icon: FileCheck },
  ];

  return (
    <div className="bg-[#070709] text-white min-h-screen selection:bg-primary-red selection:text-white flex flex-col overflow-x-hidden">

      {/* ─── NAV ─── */}
      <nav className="fixed top-0 w-full z-50 bg-[#070709]/80 backdrop-blur-2xl border-b border-white/[0.06] transition-all duration-300">
        <div className="flex justify-between items-center px-6 md:px-12 py-3.5 max-w-[1440px] mx-auto">
          <div onClick={() => { setCurrentTab("home"); setSelectedTeam(null); }} className="flex items-center gap-3.5 cursor-pointer group">
            <img alt="IEEE PELS" className="h-9 w-9 rounded-full border border-white/10 group-hover:border-primary-red/40 transition-all" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhT7QIUE14McBjVbaSVgLbQU9Rskq807b4yTeIq433ZYqnXk0jH5wCkIHv7aFintnvmMEPMB8U6dzNDoCltxJIlTa1QfcbTFv-BMzBuvE-m-GH5LG8dcz-njxhfytuRde4mq-BPrltR_gDGpVQ7dZuCNEtLZy3K7ttEPoq6_sas0yedeCB344eHCiEQx9EOWuuiE-CXTRnBmGJqnhwcoFV2fUFiWM_YObS8Q1g-wvE74BsUdQU2Ic2Xg-kKlB3ZqJj3uA" />
            <div>
              <div className="font-display font-black text-base text-white leading-none tracking-widest group-hover:text-primary-red transition-colors">SIMVERSE</div>
              <div className="font-mono text-[8px] text-white/35 tracking-widest">IEEE POWER ELECTRONICS SOCIETY</div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {["home", "leaderboard"].map(tab => (
              <button key={tab} onClick={() => { setCurrentTab(tab as any); setSelectedTeam(null); }}
                className={`font-mono text-[10px] font-bold tracking-widest px-4 py-1.5 rounded transition-all cursor-pointer uppercase ${currentTab === tab && !selectedTeam ? "text-primary-red border-b border-primary-red" : "text-white/50 hover:text-white"}`}>
                {tab === "home" ? "Home" : "Leaderboard"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            {currentUser.role === "admin" && (
              <>
                <div className="hidden sm:flex items-center gap-1.5 bg-primary-red/10 border border-primary-red/25 px-2.5 py-1 rounded font-mono text-[9px] text-primary-red">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-red animate-ping" />
                  <span className="font-bold">ADMIN</span>
                </div>
                <button onClick={handleResetChallenge} className="hidden md:block font-mono text-[9px] text-white/25 hover:text-primary-red border border-white/5 px-2 py-1 rounded transition-all cursor-pointer">SEED DB</button>
                <button onClick={handleLogout} className="font-mono text-[9px] font-bold text-white/60 hover:text-primary-red border border-white/10 bg-white/[0.03] px-3 py-1.5 rounded flex items-center gap-1.5 transition-all cursor-pointer">
                  <LogOut className="h-3 w-3" /> SIGN OUT
                </button>
              </>
            )}
            {currentUser.role === "viewer" && (
              <button onClick={() => { setLoginError(""); setLoginUsername(""); setLoginPassword(""); setIsLoginModalOpen(true); }}
                className="font-mono text-[10px] font-bold text-white bg-primary-red hover:bg-red-700 px-4 py-2 rounded flex items-center gap-1.5 transition-all shadow-lg shadow-primary-red/20 cursor-pointer">
                <ShieldCheck className="h-3.5 w-3.5" /> ADMIN ACCESS
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ─── MAIN ─── */}
      <main className="flex-grow pt-14">
        <AnimatePresence mode="wait">

          {selectedTeam ? (
            <motion.div key="detail" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.28 }}>
              <TeamTelemetryDetails team={selectedTeam} onBack={() => setSelectedTeam(null)} onUpdateMetrics={handleUpdateMetrics} isAdmin={currentUser.role === "admin"} />
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
                        className="relative h-28 w-28 rounded-full border border-white/15 shadow-2xl shadow-primary-red/20 object-contain p-1"
                      />
                    </div>
                  </motion.div>

                  {/* SIMVERSE — professional staggered reveal */}
                  <div className="flex justify-center items-end gap-0 mb-6 overflow-visible" aria-label="SIMVERSE">
                    {"SIMVERSE".split("").map((ch, i) => (
                      <motion.span
                        key={i}
                        className="font-display font-black leading-none select-none"
                        style={{
                          fontSize: "clamp(64px, 12vw, 128px)",
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
                    className="h-px w-0 bg-gradient-to-r from-transparent via-primary-red to-transparent mb-8"
                    animate={{ width: "60%" }}
                    transition={{ delay: 0.75, duration: 0.8, ease: "easeOut" }}
                  />

                  {/* Subtext */}
                  <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }}
                    className="text-white/55 text-base md:text-lg max-w-xl leading-relaxed mb-10">
                    A multi-phase power electronics simulation challenge — design, optimize, and prove your engineering excellence with MATLAB Simulink.
                  </motion.p>

                  {/* CTAs */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => setCurrentTab("leaderboard")}
                      className="btn-primary-gradient text-white font-mono text-xs font-bold tracking-widest px-8 py-3.5 rounded flex items-center gap-2 group cursor-pointer hover:scale-[1.02] transition-transform shadow-lg shadow-primary-red/25">
                      <Trophy className="h-4 w-4 group-hover:scale-110 transition-transform" /> VIEW LEADERBOARD
                    </button>
                    <button onClick={scrollToSection}
                      className="text-white font-mono text-xs font-bold tracking-widest px-8 py-3.5 rounded flex items-center gap-2 cursor-pointer border border-white/15 hover:border-white/30 hover:bg-white/[0.04] transition-all">
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
              <section id="challenge-section" className="py-24 px-6 md:px-12 border-t border-white/[0.06] scroll-mt-14">
                <div className="max-w-6xl mx-auto">

                  <div className="flex flex-col md:flex-row items-end justify-between mb-12">
                    <div>
                      <span className="font-mono text-xs text-primary-red block mb-2 tracking-widest font-semibold">CHALLENGE TRACK</span>
                      <h2 className="font-display font-black text-4xl md:text-5xl text-white tracking-tight">Phase to Challenge</h2>
                      <p className="font-mono text-xs text-white/40 mt-2">Tasks unlock sequentially — each phase builds on the last.</p>
                    </div>
                    <button onClick={() => setCurrentTab("leaderboard")} className="font-mono text-xs text-white/40 hover:text-primary-red flex items-center gap-2 mt-4 md:mt-0 cursor-pointer group transition-colors">
                      LEADERBOARD <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Admin Controls */}
                  {currentUser.role === "admin" && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-primary-red/[0.04] border border-primary-red/20 rounded-xl p-6 mb-10">
                      <div className="flex items-center gap-2 mb-5">
                        <Sliders className="h-4 w-4 text-primary-red" />
                        <span className="font-mono text-xs font-bold text-white tracking-widest uppercase">Admin Task Controls</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                          { label: "TASK 1", relKey: "task1Released", linkKey: "task1Link", released: task1Released, link: task1Link },
                          { label: "TASK 2", relKey: "task2Released", linkKey: "task2Link", released: task2Released, link: task2Link },
                          { label: "TASK 3", relKey: "task3Released", linkKey: "task3Link", released: task3Released, link: task3Link },
                        ].map(({ label, relKey, linkKey, released, link }) => (
                          <div key={label} className="bg-white/[0.03] border border-white/10 rounded-lg p-4 flex flex-col gap-3">
                            <span className="font-mono text-[10px] text-white/50 font-bold">{label}</span>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={released}
                                onChange={e => handleUpdateConfig({ [relKey]: e.target.checked })}
                                className="accent-primary-red w-3.5 h-3.5" />
                              <span className="font-mono text-[11px] text-white">{released ? "🟢 Released" : "🔴 Locked"}</span>
                            </label>
                            <input type="text" placeholder="Google Drive link…" value={link}
                              onChange={e => handleUpdateConfig({ [linkKey]: e.target.value })}
                              className="bg-[#070709] border border-white/10 text-[11px] text-white px-2.5 py-1.5 rounded outline-none focus:border-primary-red/60 font-mono w-full" />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Task Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tasks.map(({ key, title, subtitle, desc, released, link, Icon }, idx) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 + 0.2 }}
                        whileHover={{ y: -5, scale: 1.015 }}
                        className={`relative rounded-xl p-7 flex flex-col gap-5 border overflow-hidden transition-all duration-300 ${released ? 'border-primary-red/30 bg-gradient-to-br from-primary-red/[0.05] to-transparent hover:border-primary-red/50' : 'border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent hover:border-white/20'}`}
                      >
                        {/* Background number watermark */}
                        <span className={`absolute -right-3 -bottom-4 font-display font-black text-[120px] ${released ? 'text-primary-red/[0.05]' : 'text-white/[0.03]'} leading-none select-none pointer-events-none`}>{key}</span>

                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg ${released ? 'bg-primary-red/[0.1] border-primary-red/20' : 'bg-white/[0.06] border-white/10'} border flex items-center justify-center`}>
                            <Icon className={`h-5 w-5 ${released ? 'text-primary-red' : 'text-white/30'}`} />
                          </div>
                          <span className={`font-mono text-[10px] font-bold ${released ? 'text-primary-red/80' : 'text-white/30'} tracking-widest`}>{title.toUpperCase()}</span>
                        </div>

                        <div>
                          <h3 className={`font-display font-bold text-3xl ${released ? 'text-white' : 'text-white/50'}`}>{title}</h3>

                          {released ? (
                            <div className="mt-4 flex flex-col gap-3">
                              <h4 className="font-mono text-xs text-primary-red/80 uppercase tracking-wide">{subtitle}</h4>
                              <p className="text-sm text-white/60 leading-relaxed">{desc}</p>
                              {link && (
                                <a href={link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center justify-center gap-2 bg-primary-red hover:bg-red-600 text-white font-mono text-[11px] font-bold uppercase tracking-widest py-3 px-4 rounded-lg transition-colors">
                                  Access Drive Link
                                </a>
                              )}
                            </div>
                          ) : (
                            /* Jail / locked animation */
                            <div className="mt-4 relative flex items-center justify-center h-16 rounded-lg overflow-hidden bg-black/30 border border-white/[0.07]">
                              {/* Bars */}
                              {[0,1,2,3,4,5].map(i => (
                                <motion.div
                                  key={i}
                                  className="absolute top-0 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-white/25 via-white/10 to-white/25"
                                  style={{ left: `${14 + i * 14}%` }}
                                  animate={{ scaleY: [1, 0.92, 1], opacity: [0.5, 0.3, 0.5] }}
                                  transition={{ duration: 2.2, delay: i * 0.18, repeat: Infinity, ease: "easeInOut" }}
                                />
                              ))}
                              {/* Lock icon centre */}
                              <motion.div
                                className="relative z-10 flex flex-col items-center gap-1"
                                animate={{ y: [0, -2, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                              >
                                <Lock className="h-5 w-5 text-white/40" />
                                <span className="font-mono text-[9px] text-white/25 tracking-widest uppercase">Locked</span>
                              </motion.div>
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-white/[0.06] mt-auto">
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-white/[0.02] rounded-lg py-2">
                              <p className="font-display font-black text-white/30 text-sm">30</p>
                              <p className="font-mono text-[8px] text-white/20 mt-0.5">Circuit</p>
                            </div>
                            <div className="bg-white/[0.02] rounded-lg py-2">
                              <p className="font-display font-black text-white/30 text-sm">30</p>
                              <p className="font-mono text-[8px] text-white/20 mt-0.5">Report</p>
                            </div>
                            <div className="bg-white/[0.02] rounded-lg py-2">
                              <p className="font-display font-black text-white/30 text-sm">40</p>
                              <p className="font-mono text-[8px] text-white/20 mt-0.5">Result</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Scoring info */}
                  <div className="mt-8 bg-white/[0.015] border border-white/[0.06] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Trophy className="h-5 w-5 text-yellow-400 shrink-0" />
                    <div>
                      <p className="font-mono text-xs text-white font-semibold">CUMULATIVE SCORING</p>
                      <p className="font-mono text-[10px] text-white/40 mt-0.5">Each task contributes up to 100 points (Circuit 30 + Report 30 + Result 40). Scores accumulate across all three tasks.</p>
                    </div>
                  </div>
                </div>
              </section>

            </motion.div>

          ) : (
            <motion.div key="lb" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.28 }}>
              <LeaderboardTable teams={filteredTeams} onSelectTeam={setSelectedTeam} onRegisterTeam={handleRegisterTeam} onDeleteTeam={async (id) => { try { await teamService.deleteTeam(id); } catch (err) { console.error(err); alert("Failed to delete team."); } }} isAdmin={currentUser.role === "admin"} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="w-full py-8 bg-black/60 border-t border-white/[0.06] font-mono text-[10px] text-white/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-white font-bold tracking-widest">SIMVERSE <span className="text-primary-red font-normal">v1.0</span></span>
          <span>© 2026 IEEE Power Electronics Society. All rights reserved.</span>
          <div className="flex gap-4 items-center">
            <a href="#" className="hover:text-primary-red transition-colors">Credits</a>
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
                  <p className="font-mono text-[10px] text-white/40 mt-1">Entering admin panel…</p>
                </motion.div>
              ) : (
                <>
                  <div className="mb-7 text-center">
                    <div className="h-11 w-11 bg-primary-red/10 border border-primary-red/25 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <ShieldCheck className="h-5 w-5 text-primary-red" />
                    </div>
                    <span className="font-mono text-[9px] text-primary-red uppercase tracking-widest">Simverse 2026</span>
                    <h3 className="font-display font-black text-xl text-white mt-0.5">Admin Access</h3>
                    <p className="font-mono text-[10px] text-white/35 mt-1">Restricted to event coordinators only</p>
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
                        <input type="text" required value={loginUsername} onChange={e => setLoginUsername(e.target.value)} placeholder="admin"
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
                      <LogIn className="h-4 w-4" /> SIGN IN AS ADMIN
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
