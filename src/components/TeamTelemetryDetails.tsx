import React, { useState, useEffect } from "react";
import { ArrowLeft, ShieldCheck, Trophy, Check } from "lucide-react";
import { Team } from "../types";
import { motion } from "motion/react";

interface TeamTelemetryDetailsProps {
  team: Team;
  onBack: () => void;
  onUpdateMetrics: (teamId: string, updatedMetrics: Team["metrics"]) => void;
  isAdmin?: boolean;
}

export default function TeamTelemetryDetails({ team, onBack, onUpdateMetrics, isAdmin = false }: TeamTelemetryDetailsProps) {
  const [circuitDesign, setCircuitDesign] = useState(team.metrics.circuitDesign || 0);
  const [reportSubmission, setReportSubmission] = useState(team.metrics.reportSubmission || 0);
  const [result, setResult] = useState(team.metrics.result || 0);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setCircuitDesign(team.metrics.circuitDesign || 0);
    setReportSubmission(team.metrics.reportSubmission || 0);
    setResult(team.metrics.result || 0);
  }, [team]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedMetrics = {
      circuitDesign: Math.min(30, Math.max(0, Number(circuitDesign))),
      reportSubmission: Math.min(30, Math.max(0, Number(reportSubmission))),
      result: Math.min(40, Math.max(0, Number(result))),
    };
    await onUpdateMetrics(team.id, updatedMetrics);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const calculatedTotal = Number(circuitDesign) + Number(reportSubmission) + Number(result);

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 md:px-8 mt-16 font-sans">
      
      {/* Return Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 font-mono text-xs text-white/60 hover:text-primary-red transition-colors bg-white/5 hover:bg-primary-red/10 border border-white/10 hover:border-primary-red/20 px-4 py-2 rounded-sm mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        BACK TO LEADERBOARD
      </button>

      {/* Hero Header */}
      <div className="relative mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="font-mono text-xs text-primary-red uppercase tracking-widest block mb-1">TEAM METRICS & PROFILE</span>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl text-white tracking-tight drop-shadow-md">
            {team.name}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            {team.tags?.map((member, i) => (
              <span key={i} className="font-mono text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded text-white/70">
                👤 {member}
              </span>
            ))}
          </div>
        </div>

        {/* Current Rank & Total Points */}
        <div className="flex gap-6 items-center bg-white/[0.01] p-4 rounded-lg border border-white/10 backdrop-blur-md">
          <div className="text-right">
            <span className="font-mono text-[10px] text-white/40 block leading-tight">CURRENT RANK</span>
            <span className="font-display font-black text-4xl text-white/70">
              #{team.rank.toString().padStart(2, "0")}
            </span>
          </div>
          <div className="h-10 w-[1px] bg-white/10"></div>
          <div className="text-right bg-primary-red px-5 py-2.5 rounded shadow-lg shadow-primary-red/15">
            <span className="font-mono text-[10px] text-white/95 block leading-tight font-bold">TOTAL POINTS</span>
            <span className="font-display font-black text-4xl text-white">
              {calculatedTotal}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side: Score Split up Display */}
        <div className="glass-panel p-6 rounded-lg relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
              <Trophy className="h-4 w-4 text-primary-red" />
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-white">MARKS SPLIT-UP</h2>
            </div>

            <div className="space-y-6">
              {/* Circuit Design */}
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex flex-col">
                  <span className="font-sans font-semibold text-white text-sm">Circuit Design</span>
                  <span className="font-mono text-[10px] text-white/40">Evaluation of converter topology design</span>
                </div>
                <span className="font-mono text-lg font-bold text-white">
                  <span className="text-primary-red">{circuitDesign}</span> <span className="text-white/35">/ 30</span>
                </span>
              </div>

              {/* Report Submission */}
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex flex-col">
                  <span className="font-sans font-semibold text-white text-sm">Report Submission</span>
                  <span className="font-mono text-[10px] text-white/40">Technical report clarity and analysis</span>
                </div>
                <span className="font-mono text-lg font-bold text-white">
                  <span className="text-primary-red">{reportSubmission}</span> <span className="text-white/35">/ 30</span>
                </span>
              </div>

              {/* Result */}
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex flex-col">
                  <span className="font-sans font-semibold text-white text-sm">Result</span>
                  <span className="font-mono text-[10px] text-white/40">Simulation outputs validation & graphs accuracy</span>
                </div>
                <span className="font-mono text-lg font-bold text-white">
                  <span className="text-primary-red">{result}</span> <span className="text-white/35">/ 40</span>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/5 flex justify-between text-[10px] font-mono text-white/40">
            <span>MAXIMUM MARKS: 100</span>
            <span className="text-primary-red">SIMVERSE_V1.0</span>
          </div>
        </div>

        {/* Right Side: Admin Marks Entry Portal */}
        {isAdmin ? (
          <div className="glass-panel p-6 rounded-lg relative overflow-hidden border-primary-red/20 bg-gradient-to-b from-primary-red/[0.02] to-transparent shadow-xl">
            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
              <ShieldCheck className="h-4 w-4 text-primary-red" />
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-white">ADMIN MARKS ENTRY</h2>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              
              {/* Circuit Design Input */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-white/70 uppercase">CIRCUIT DESIGN (MAX 30)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={circuitDesign}
                  onChange={(e) => setCircuitDesign(Math.min(30, Math.max(0, Number(e.target.value))))}
                  className="bg-white/5 border border-white/10 focus:border-primary-red rounded px-3 py-2 text-sm text-white font-mono outline-none"
                />
              </div>

              {/* Report Submission Input */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-white/70 uppercase">REPORT SUBMISSION (MAX 30)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={reportSubmission}
                  onChange={(e) => setReportSubmission(Math.min(30, Math.max(0, Number(e.target.value))))}
                  className="bg-white/5 border border-white/10 focus:border-primary-red rounded px-3 py-2 text-sm text-white font-mono outline-none"
                />
              </div>

              {/* Result Input */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-white/70 uppercase">RESULT (MAX 40)</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={result}
                  onChange={(e) => setResult(Math.min(40, Math.max(0, Number(e.target.value))))}
                  className="bg-white/5 border border-white/10 focus:border-primary-red rounded px-3 py-2 text-sm text-white font-mono outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary-gradient font-mono text-xs font-bold text-white py-3.5 rounded hover:scale-[1.01] transition-transform flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                {isSaved ? (
                  <>
                    <Check className="h-4 w-4 text-green-400" />
                    MARKS UPDATED
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    SAVE CHANGES
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="glass-panel p-6 rounded-lg flex flex-col justify-center items-center text-center opacity-65">
            <Trophy className="h-10 w-10 text-white/20 mb-3 animate-pulse" />
            <h3 className="font-sans font-bold text-white text-base">EVALUATION IN PROGRESS</h3>
            <p className="font-mono text-xs text-white/50 mt-1 max-w-xs">
              Marks updates are strictly restricted to event coordinators. Contact admin if metrics synchronization is required.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
