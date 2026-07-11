import React from "react";
import { ArrowLeft, Gauge, ShieldCheck, Trophy, Sparkles, TrendingUp, HelpCircle } from "lucide-react";
import { Team } from "../types";
import { motion } from "motion/react";

interface TeamTelemetryDetailsProps {
  team: Team;
  onBack: () => void;
  onUpdateMetrics: (teamId: string, updatedMetrics: Team["metrics"]) => void;
  isAdmin?: boolean;
}

export default function TeamTelemetryDetails({ team, onBack, onUpdateMetrics, isAdmin = false }: TeamTelemetryDetailsProps) {
  // Translate metrics into printable labels and descriptors
  const categoryLabels: { key: keyof typeof team.metrics; label: string; icon: string }[] = [
    { key: "modelDesign", label: "MODEL DESIGN", icon: "📐" },
    { key: "simulationAccuracy", label: "SIMULATION ACCURACY", icon: "🎯" },
    { key: "systemPerformance", label: "SYSTEM PERFORMANCE", icon: "⚡" },
    { key: "innovation", label: "INNOVATION", icon: "💡" },
    { key: "technicalApproach", label: "TECHNICAL APPROACH", icon: "📝" },
    { key: "resultAnalysis", label: "RESULT ANALYSIS", icon: "🔍" },
    { key: "presentation", label: "PRESENTATION", icon: "📢" },
  ];

  // Helper to draw F1 telemetry segmented bars (e.g. 20 segments)
  const renderSegmentedBar = (score: number, categoryKey: keyof typeof team.metrics) => {
    const totalSegments = 25;
    const filledSegments = Math.round((score / 100) * totalSegments);
    
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="flex justify-between items-center text-xs font-mono">
          <div className="flex items-center gap-1.5 text-white/70">
            <span>{categoryLabels.find(l => l.key === categoryKey)?.label}</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Interactive Adjust buttons (Admin Only) */}
            {isAdmin && (
              <div className="flex gap-1">
                <button 
                  onClick={() => handleAdjustScore(categoryKey, -5)}
                  className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary-red/20 hover:border-primary-red/30 text-white/50 hover:text-white transition-colors"
                  title="Decrease score"
                >
                  -
                </button>
                <button 
                  onClick={() => handleAdjustScore(categoryKey, 5)}
                  className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary-red/20 hover:border-primary-red/30 text-white/50 hover:text-white transition-colors"
                  title="Increase score"
                >
                  +
                </button>
              </div>
            )}
            <span className="font-semibold text-white">
              <span className="text-primary-red">{score}</span> <span className="text-white/40">/ 100</span>
            </span>
          </div>
        </div>

        {/* The block segments (high fidelity F1 styling) */}
        <div className="flex gap-[2px] h-3.5 bg-white/5 p-[2px] rounded-sm border border-white/5">
          {Array.from({ length: totalSegments }).map((_, i) => {
            const isFilled = i < filledSegments;
            return (
              <div
                key={i}
                className={`flex-1 h-full rounded-[1px] transition-all duration-300 ${
                  isFilled 
                    ? "bg-primary-red shadow-sm shadow-primary-red/20" 
                    : "bg-white/10"
                }`}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const handleAdjustScore = (key: keyof typeof team.metrics, delta: number) => {
    const currentScore = team.metrics[key];
    const newScore = Math.min(100, Math.max(0, currentScore + delta));
    
    const updatedMetrics = {
      ...team.metrics,
      [key]: newScore
    };
    onUpdateMetrics(team.id, updatedMetrics);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4 md:px-8 mt-16 font-sans">
      
      {/* Return Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 font-mono text-xs text-white/60 hover:text-primary-red transition-colors bg-white/5 hover:bg-primary-red/10 border border-white/10 hover:border-primary-red/20 px-4 py-2 rounded-sm mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        BACK TO LEADERBOARD
      </button>

      {/* Hero Telemetry Card Header */}
      <div className="relative mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="font-mono text-xs text-primary-red uppercase tracking-widest block mb-1">TEAM TELEMETRY DATA</span>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl text-white tracking-tight drop-shadow-md">
            {team.name}
          </h1>
          <p className="font-mono text-xs text-white/50 mt-1 uppercase">
            {team.institution} • STATUS: <span className="text-green-400">{team.lastUpdated}</span>
          </p>
        </div>

        {/* Current Rank & Total Points in Big display */}
        <div className="flex gap-6 items-center bg-white/[0.01] p-4 rounded-lg border border-white/10 backdrop-blur-md">
          <div className="text-right">
            <span className="font-mono text-[10px] text-white/40 block leading-tight">CURRENT RANK</span>
            <span className="font-display font-black text-4xl md:text-5xl text-white/70">
              #{team.rank.toString().padStart(2, "0")}
            </span>
          </div>
          <div className="h-10 w-[1px] bg-white/10"></div>
          <div className="text-right bg-primary-red px-5 py-2.5 rounded shadow-lg shadow-primary-red/15">
            <span className="font-mono text-[10px] text-white/90 block leading-tight font-bold">TOTAL POINTS</span>
            <span className="font-display font-black text-4xl md:text-5xl text-white">
              {team.totalPoints}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Category Progress Bars */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-lg relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 mb-8 border-b border-white/10 pb-4">
              <span className="text-primary-red font-mono text-xs">📊</span>
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-white">CATEGORY-WISE MARKS</h2>
              <span className="ml-auto font-mono text-[10px] text-white/40">CALIBRATION ENGINE</span>
            </div>

            {/* Metrics Bars List */}
            <div className="flex flex-col gap-6">
              {categoryLabels.map(({ key, label }) => (
                <motion.div 
                  key={key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderSegmentedBar(team.metrics[key], key)}
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between text-[11px] text-white/40 font-mono">
              <span>
                {isAdmin 
                  ? "* Admin calibration active. Use the + / - controllers to adjust and test scoring algorithms live."
                  : "* Read-only mode active. Log in as Admin to calibrate team parameters."
                }
              </span>
              <span className="text-primary-red">SIMULINK_V2.0_STABLE</span>
            </div>
          </div>
        </div>

        {/* Right Column: Final Evaluation & Telemetry Spread */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Final Evaluation Card (Glass Gradient Crimson glow border) */}
          <div className="glass-panel p-6 rounded-lg relative overflow-hidden border-primary-red/30 bg-gradient-to-b from-primary-red/[0.04] to-transparent shadow-xl shadow-primary-red/5">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary-red/10 rounded-full filter blur-2xl pointer-events-none"></div>
            
            <div className="flex flex-col items-center justify-center text-center py-6">
              {/* Circular Gauge visual */}
              <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="#E31E24"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - team.totalPoints / 700)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Gauge className="h-6 w-6 text-primary-red mb-1 animate-pulse" />
                  <span className="font-mono text-[9px] text-white/40 uppercase">EVALUATION</span>
                </div>
              </div>

              <span className="font-mono text-xs text-primary-red uppercase tracking-widest font-semibold mb-2">FINAL EVALUATION</span>
              
              <div className="flex items-baseline justify-center mb-4">
                <span className="font-display font-black text-5xl text-white">{team.totalPoints}</span>
                <span className="font-display text-xl text-white/40 font-medium ml-2">/ 700</span>
              </div>

              <p className="font-mono text-xs text-white/70 max-w-xs leading-relaxed border-t border-white/5 pt-4">
                {team.status}
              </p>
            </div>
          </div>

          {/* Telemetry Spread summary */}
          <div className="glass-panel p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
              <Sparkles className="h-4 w-4 text-primary-red" />
              <h3 className="font-mono text-xs font-bold uppercase text-white">TELEMETRY SPREAD</h3>
            </div>

            <div className="flex flex-col gap-3 font-mono text-[11px] text-white/60">
              <div className="flex items-center justify-between">
                <span>MODEL CONFIGURATION</span>
                <span className="text-white font-semibold">92%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary-red h-full" style={{ width: "92%" }}></div>
              </div>

              <div className="flex items-center justify-between mt-1">
                <span>SIMULATION FEEDBACK LOOP</span>
                <span className="text-white font-semibold">88%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary-red h-full" style={{ width: "88%" }}></div>
              </div>

              <div className="flex items-center justify-between mt-1">
                <span>POWER LOSS SUPPRESSION</span>
                <span className="text-white font-semibold">75%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary-red h-full" style={{ width: "75%" }}></div>
              </div>
            </div>
          </div>

          {/* Interactive Optimization Run History */}
          <div className="glass-panel p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary-red" />
                <h3 className="font-mono text-xs font-bold uppercase text-white">OPTIMIZATION TIMELINE</h3>
              </div>
              <span className="font-mono text-[10px] text-green-400">PASSED v1.3</span>
            </div>

            <div className="relative pl-6 border-l border-white/10 flex flex-col gap-6 my-2">
              {team.runHistory.map((run, index) => (
                <div key={run.run} className="relative">
                  {/* Point circle */}
                  <span className={`absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full ${
                    index === team.runHistory.length - 1 ? 'bg-primary-red ring-4 ring-primary-red/20' : 'bg-white/30'
                  }`}></span>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[11px] text-white font-semibold">TEST SEQUENCE RUN 0{run.run}</span>
                    <span className="font-mono text-xs text-primary-red font-bold">{run.score} pts</span>
                  </div>
                  <p className="font-sans text-[11px] text-white/50">
                    {index === 0 && "Initial Simulink topology loaded. Open-loop tuning completed."}
                    {index === 1 && "Integral feedback applied. Dynamic overshoot minimized to 18%."}
                    {index === 2 && "Damped LCL filter inserted. Perfect harmonic attenuation verified."}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
