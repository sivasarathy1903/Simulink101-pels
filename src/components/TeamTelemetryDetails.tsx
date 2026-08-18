import React, { useState, useEffect } from "react";
import { ArrowLeft, ShieldCheck, Trophy, Check, ChevronDown, ChevronUp, FileText, CheckCircle2 } from "lucide-react";
import { Team } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { EVALUATION_CRITERIA } from "./TaskDetailPage";
import { calcTaskTotal, calcTotalPoints } from "../services/teamService";

const TASK_MAP = [
  { label: "Task 1 — Soft Robotic Rehabilitation Glove", key: "t1" },
  { label: "Task 2 — Drone Camera Gimbal Power Stage", key: "t2" },
  { label: "Task 3 — Electric Two-Wheeler Module", key: "t3" },
];

interface TeamTelemetryDetailsProps {
  team: Team;
  onBack: () => void;
  onUpdateMetrics: (teamId: string, updatedMetrics: Team["metrics"]) => void;
  isAdmin?: boolean;
}

export default function TeamTelemetryDetails({ team, onBack, onUpdateMetrics, isAdmin = false }: TeamTelemetryDetailsProps) {
  const [draftMetrics, setDraftMetrics] = useState<Team["metrics"]>({ ...team.metrics });
  const [isSaved, setIsSaved] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["t1", "t2", "t3"]));
  const [expandedSummaryTask, setExpandedSummaryTask] = useState<string>("t1");
  const [submissions, setSubmissions] = useState<Record<string, { link: string; submittedAt?: string }>>({});

  useEffect(() => { 
    setDraftMetrics({ ...team.metrics });
    import("../services/teamService").then(({ teamService }) => {
      teamService.getTeamSubmissions(team.id).then(setSubmissions);
    });
  }, [team]);

  const formatSubmissionTime = (isoStr?: string) => {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    } catch {
      return isoStr;
    }
  };

  const handleField = (field: keyof Team["metrics"], max: number, val: string) => {
    const num = Math.min(max, Math.max(0, Number(val)));
    setDraftMetrics(prev => ({ ...prev, [field]: num }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateMetrics(team.id, draftMetrics);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const liveTotal = calcTotalPoints(draftMetrics);
  const savedTotal = calcTotalPoints(team.metrics);

  return (
    <div className="w-full max-w-5xl mx-auto py-8 sm:py-12 px-3 sm:px-6 md:px-8 mt-14 font-sans text-white">

      {/* Back */}
      <button onClick={onBack}
        className="flex items-center gap-2 font-mono text-xs text-white/40 hover:text-primary-red transition-colors border border-white/[0.08] hover:border-primary-red/25 bg-white/[0.025] px-3.5 sm:px-4 py-2 rounded-lg mb-6 sm:mb-8 cursor-pointer">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Leaderboard
      </button>

      {/* Hero */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6 mb-8 sm:mb-10">
        <div>
          <span className="font-mono text-[10px] text-primary-red uppercase tracking-widest block mb-1">Team Profile</span>
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">{team.name}</h1>

          {/* Members list with Dept and Year */}
          {team.members && team.members.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2.5 sm:mt-3">
              {team.members.map((m, i) => (
                <span key={i} className="font-mono text-[9px] sm:text-[10px] bg-white/[0.04] border border-white/[0.08] text-white/80 px-3 py-1 rounded-full">
                  👤 {m.name} {m.dept ? <span className="text-primary-red font-semibold">({m.dept} {m.year ? `· ${m.year}` : ''})</span> : ''}
                </span>
              ))}
            </div>
          ) : team.tags && team.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2.5 sm:mt-3">
              {team.tags.map((m, i) => (
                <span key={i} className="font-mono text-[9px] sm:text-[10px] bg-white/[0.04] border border-white/[0.08] text-white/60 px-2.5 py-1 rounded-full">
                  👤 {m}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Score pill */}
        <div className="flex gap-3 sm:gap-5 items-center justify-between sm:justify-start bg-white/[0.025] border border-white/10 rounded-xl px-4 sm:px-6 py-3 sm:py-4 w-full lg:w-auto shrink-0">
          <div className="text-center">
            <p className="font-mono text-[8px] sm:text-[9px] text-white/30 tracking-widest mb-0.5">RANK</p>
            <p className="font-display font-black text-2xl sm:text-4xl text-white/60">#{team.rank.toString().padStart(2, "0")}</p>
          </div>
          <div className="w-px h-8 sm:h-10 bg-white/10" />
          <div className="text-center bg-primary-red rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 shadow-lg shadow-primary-red/20">
            <p className="font-mono text-[8px] sm:text-[9px] text-white/80 tracking-widest mb-0.5">TOTAL SCORE</p>
            <p className="font-display font-black text-2xl sm:text-4xl text-white">{savedTotal}</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-[8px] sm:text-[9px] text-white/30 tracking-widest mb-0.5">MAX</p>
            <p className="font-display font-black text-xl sm:text-2xl text-white/25">300</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">

        {/* Left: Score Summary Cards */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="glass-panel rounded-xl p-4 sm:p-6 border border-white/[0.06]">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <Trophy className="h-5 sm:h-6 w-5 sm:w-6 text-yellow-400" />
              <h2 className="font-mono text-base sm:text-lg font-bold text-white tracking-widest uppercase">Score Summary</h2>
            </div>

            <div className="space-y-5 sm:space-y-6">
              {TASK_MAP.map(({ label, key }) => {
                const taskPts = calcTaskTotal(team.metrics, key as any);
                const pct = (taskPts / 100) * 100;
                const isExpanded = expandedSummaryTask === key;
                return (
                  <div key={key} className="cursor-pointer group" onClick={() => setExpandedSummaryTask(isExpanded ? "" : key)}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-mono text-xs sm:text-sm text-white/70 group-hover:text-white transition-colors">{label.split(" — ")[0]}</span>
                      <span className="font-mono text-lg sm:text-xl font-bold text-white"><span className="text-primary-red">{taskPts}</span><span className="text-white/20"> / 100</span></span>
                    </div>
                    <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gradient-to-r from-primary-red to-red-600 rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-3"
                        >
                          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3 space-y-1.5 font-mono text-xs">
                            {EVALUATION_CRITERIA.map(crit => {
                              const pts = Number(team.metrics[`${key}_${crit.key}` as keyof Team["metrics"]]) || 0;
                              return (
                                <div key={crit.key} className="flex justify-between items-center text-[11px]">
                                  <span className="text-white/50">{crit.label}</span>
                                  <span className="font-bold text-white"><span className="text-primary-red">{pts}</span>/{crit.max}</span>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/[0.06] flex justify-between items-center">
              <span className="font-mono text-xs sm:text-sm text-white/35">Cumulative Total</span>
              <span className="font-display font-black text-2xl sm:text-3xl text-white">{savedTotal}<span className="text-white/20 text-base sm:text-lg font-mono"> / 300</span></span>
            </div>
          </div>
        </div>

        {/* Right: Detailed Evaluation Breakdown for Viewers OR Mark Entry for Admin */}
        <div className="lg:col-span-3">
          {isAdmin ? (
            <form onSubmit={handleSave} className="glass-panel rounded-xl p-4 sm:p-5 border border-primary-red/15 bg-gradient-to-b from-primary-red/[0.02] to-transparent">
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <ShieldCheck className="h-4 w-4 text-primary-red" />
                <h2 className="font-mono text-xs font-bold text-white tracking-widest uppercase">Admin — Enter Marks</h2>
                {liveTotal !== savedTotal && (
                  <span className="ml-auto font-mono text-[9px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">Unsaved</span>
                )}
              </div>

              {/* Submitted Links Panel with Timestamps */}
              <div className="bg-blue-500/[0.04] border border-blue-500/20 rounded-xl p-3.5 sm:p-4 mb-4 sm:mb-5">
                <h3 className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> Team Submissions & Timestamps
                  </span>
                  <span className="text-white/30 text-[9px]">For Admin Grading</span>
                </h3>
                <div className="space-y-3">
                  {[1, 2, 3].map(num => {
                    const subInfo = submissions[`task${num}Link`];
                    const link = subInfo?.link || (team.metrics[`task${num}Link`] as string);
                    const timestampStr = subInfo?.submittedAt || (team.metrics[`task${num}Link_submittedAt`] as string) || (team.metrics[`task${num}_submittedAt`] as string);
                    const formattedTime = formatSubmissionTime(timestampStr);

                    return (
                      <div key={num} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] font-bold text-primary-red uppercase">Task {num}</span>
                          {link ? (
                            <span className="font-mono text-[9px] text-green-400 bg-green-500/10 border border-green-500/25 px-2 py-0.5 rounded-md flex items-center gap-1">
                              ✓ Submitted {formattedTime ? `· ${formattedTime}` : ''}
                            </span>
                          ) : (
                            <span className="font-mono text-[9px] text-white/30 bg-white/[0.03] px-2 py-0.5 rounded-md italic">
                              Not submitted yet
                            </span>
                          )}
                        </div>

                        {link ? (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1">
                            <a href={link} target="_blank" rel="noopener noreferrer" 
                              className="text-white text-xs hover:text-blue-300 transition-colors break-all underline decoration-white/20 underline-offset-4 truncate font-mono">
                              🔗 {link}
                            </a>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 flex justify-between items-center mb-4 sm:mb-5">
                <span className="font-mono text-[10px] text-white/40">Preview Total</span>
                <span className="font-display font-black text-xl sm:text-2xl text-white">{liveTotal}<span className="text-white/20 text-xs font-mono"> / 300</span></span>
              </div>

              <div className="space-y-4">
                {TASK_MAP.map(({ label, key }) => {
                  const isOpen = expanded.has(key);
                  const taskPts = calcTaskTotal(draftMetrics, key as any);
                  return (
                    <div key={key} className="border border-white/[0.06] rounded-xl overflow-hidden">
                      <button type="button" onClick={() => setExpanded(prev => {
                          const next = new Set(prev);
                          next.has(key) ? next.delete(key) : next.add(key);
                          return next;
                        })}
                        className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left hover:bg-white/[0.02] transition-colors cursor-pointer">
                        <div>
                          <p className="font-mono text-[10px] text-white/50">{label}</p>
                          <p className="font-display font-semibold text-white text-xs sm:text-sm mt-0.5">
                            Score: <span className="text-primary-red">{taskPts}</span><span className="text-white/25"> / 100</span>
                          </p>
                        </div>
                        {isOpen ? <ChevronUp className="h-4 w-4 text-white/30" /> : <ChevronDown className="h-4 w-4 text-white/30" />}
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="p-3.5 sm:p-4 pt-0 border-t border-white/[0.06]">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                {EVALUATION_CRITERIA.map(crit => {
                                  const field = `${key}_${crit.key}` as keyof Team["metrics"];
                                  return (
                                    <div key={crit.key} className="flex flex-col gap-1 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.05]">
                                      <label className="font-mono text-[10px] font-bold text-white/70 uppercase flex justify-between">
                                        <span>{crit.label}</span>
                                        <span className="text-primary-red">/{crit.max}</span>
                                      </label>
                                      <input type="number" min={0} max={crit.max}
                                        value={Number(draftMetrics[field]) || 0}
                                        onChange={e => handleField(field, crit.max, e.target.value)}
                                        className="bg-[#070709] border border-white/20 focus:border-primary-red/80 rounded-lg px-3 py-1.5 text-sm font-bold text-white font-mono outline-none w-full" />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              <button type="submit"
                className="w-full btn-primary-gradient font-mono text-xs font-bold text-white py-3 sm:py-3.5 rounded-xl hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 cursor-pointer mt-5">
                {isSaved ? (<><Check className="h-4 w-4 text-green-300" /> MARKS SAVED</>)
                  : (<><ShieldCheck className="h-4 w-4" /> SAVE ALL MARKS</>)}
              </button>
            </form>
          ) : (
            /* Live Evaluation Breakdown View for Participants / Viewers */
            <div className="glass-panel rounded-xl p-5 sm:p-7 border border-white/[0.08] space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-5 w-5 text-primary-red" />
                  <h2 className="font-mono text-base font-bold text-white uppercase tracking-widest">Detailed Evaluation Breakdown</h2>
                </div>
                <span className="font-mono text-xs text-white/40 font-semibold">100 Marks per Task</span>
              </div>

              <div className="space-y-6">
                {TASK_MAP.map(({ label, key }) => {
                  const taskTotal = calcTaskTotal(team.metrics, key as any);
                  return (
                    <div key={key} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5 space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-display font-bold text-sm sm:text-base text-white">{label}</h3>
                        <span className="font-mono text-base sm:text-lg font-bold text-primary-red">{taskTotal} <span className="text-white/30 text-xs font-mono">/ 100</span></span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                        {EVALUATION_CRITERIA.map(crit => {
                          const pts = Number(team.metrics[`${key}_${crit.key}` as keyof Team["metrics"]]) || 0;
                          return (
                            <div key={crit.key} className="bg-black/30 border border-white/[0.04] p-2.5 rounded-lg flex justify-between items-center">
                              <span className="text-white/60 text-[11px]">{crit.label}</span>
                              <span className="font-bold text-white"><span className="text-primary-red">{pts}</span> / {crit.max}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-primary-red/[0.04] border border-primary-red/20 rounded-xl p-4 flex items-center justify-between font-mono text-xs">
                <span className="text-white/60">Phase 2 Cumulative Score</span>
                <span className="font-display font-black text-2xl text-primary-red">{savedTotal} <span className="text-white/30 text-xs font-mono">/ 300 PTS</span></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

