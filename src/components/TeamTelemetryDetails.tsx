import React, { useState, useEffect } from "react";
import { ArrowLeft, ShieldCheck, Trophy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Team } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface TeamTelemetryDetailsProps {
  team: Team;
  onBack: () => void;
  onUpdateMetrics: (teamId: string, updatedMetrics: Team["metrics"]) => void;
  isAdmin?: boolean;
}

interface TaskFields {
  circuit: keyof Team["metrics"];
  report: keyof Team["metrics"];
  result: keyof Team["metrics"];
}

const TASK_MAP: { label: string; key: string; fields: TaskFields }[] = [
  { label: "Task 1 — Circuit Design Phase",   key: "t1", fields: { circuit: "t1_circuit", report: "t1_report", result: "t1_result" } },
  { label: "Task 2 — Simulation Accuracy Phase", key: "t2", fields: { circuit: "t2_circuit", report: "t2_report", result: "t2_result" } },
  { label: "Task 3 — Results & Report Phase", key: "t3", fields: { circuit: "t3_circuit", report: "t3_report", result: "t3_result" } },
];

export default function TeamTelemetryDetails({ team, onBack, onUpdateMetrics, isAdmin = false }: TeamTelemetryDetailsProps) {
  const [draftMetrics, setDraftMetrics] = useState<Team["metrics"]>({ ...team.metrics });
  const [isSaved, setIsSaved] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["t1", "t2", "t3"]));
  const [expandedSummaryTask, setExpandedSummaryTask] = useState<string>("");
  const [submissions, setSubmissions] = useState<Record<string, string>>({});

  useEffect(() => { 
    setDraftMetrics({ ...team.metrics });
    
    // Fetch submissions from the new table
    import("../services/teamService").then(({ teamService }) => {
      teamService.getTeamSubmissions(team.id).then(setSubmissions);
    });
  }, [team]);

  const calcTotal = (m: Team["metrics"]) =>
    (Number(m.t1_circuit) || 0) + (Number(m.t1_report) || 0) + (Number(m.t1_result) || 0) +
    (Number(m.t2_circuit) || 0) + (Number(m.t2_report) || 0) + (Number(m.t2_result) || 0) +
    (Number(m.t3_circuit) || 0) + (Number(m.t3_report) || 0) + (Number(m.t3_result) || 0);

  const calcTaskTotal = (m: Team["metrics"], key: string) =>
    (Number(m[`${key}_circuit` as keyof Team["metrics"]]) || 0) +
    (Number(m[`${key}_report` as keyof Team["metrics"]]) || 0) +
    (Number(m[`${key}_result` as keyof Team["metrics"]]) || 0);

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

  const liveTotal = calcTotal(draftMetrics);
  const savedTotal = calcTotal(team.metrics);

  return (
    <div className="w-full max-w-5xl mx-auto py-8 sm:py-12 px-3 sm:px-6 md:px-8 mt-14 font-sans">

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

          {/* Members */}
          {team.tags && team.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2.5 sm:mt-3">
              {team.tags.map((m, i) => (
                <span key={i} className="font-mono text-[9px] sm:text-[10px] bg-white/[0.04] border border-white/[0.08] text-white/60 px-2.5 py-1 rounded-full">
                  👤 {m}
                </span>
              ))}
            </div>
          )}
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

        {/* Left: Read-only breakdown */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="glass-panel rounded-xl p-4 sm:p-6 border border-white/[0.06]">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <Trophy className="h-5 sm:h-6 w-5 sm:w-6 text-yellow-400" />
              <h2 className="font-mono text-base sm:text-lg font-bold text-white tracking-widest uppercase">Score Summary</h2>
            </div>

            <div className="space-y-5 sm:space-y-6">
              {TASK_MAP.map(({ label, key }) => {
                const taskPts = calcTaskTotal(team.metrics, key);
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
                      {isExpanded ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-3"
                        >
                          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3 sm:p-4 grid grid-cols-3 gap-1.5 sm:gap-2">
                            <div className="text-center">
                              <p className="font-mono text-[9px] sm:text-xs text-white/50 uppercase mb-1 tracking-wider sm:tracking-widest">Circuit</p>
                              <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white">{Number(team.metrics[`${key}_circuit` as keyof Team["metrics"]]) || 0}<span className="text-xs sm:text-sm font-normal text-white/30 ml-0.5 sm:ml-1">/ 30</span></p>
                            </div>
                            <div className="text-center">
                              <p className="font-mono text-[9px] sm:text-xs text-white/50 uppercase mb-1 tracking-wider sm:tracking-widest">Report</p>
                              <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white">{Number(team.metrics[`${key}_report` as keyof Team["metrics"]]) || 0}<span className="text-xs sm:text-sm font-normal text-white/30 ml-0.5 sm:ml-1">/ 30</span></p>
                            </div>
                            <div className="text-center">
                              <p className="font-mono text-[9px] sm:text-xs text-white/50 uppercase mb-1 tracking-wider sm:tracking-widest">Result</p>
                              <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white">{Number(team.metrics[`${key}_result` as keyof Team["metrics"]]) || 0}<span className="text-xs sm:text-sm font-normal text-white/30 ml-0.5 sm:ml-1">/ 40</span></p>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div className="flex justify-between font-mono text-[9px] sm:text-[10px] text-white/25 mt-1.5" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <span>Circuit {Number(team.metrics[`${key}_circuit` as keyof Team["metrics"]]) || 0}/30</span>
                          <span>Report {Number(team.metrics[`${key}_report` as keyof Team["metrics"]]) || 0}/30</span>
                          <span>Result {Number(team.metrics[`${key}_result` as keyof Team["metrics"]]) || 0}/40</span>
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

        {/* Right: Admin marks entry */}
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

              {/* Submitted Links Panel - instantly visible to Admin */}
              <div className="bg-blue-500/[0.04] border border-blue-500/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-5">
                <h3 className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-2.5 sm:mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Team Submissions
                </h3>
                <div className="space-y-2.5 sm:space-y-3">
                  {[1, 2, 3].map(num => {
                    const link = submissions[`task${num}Link`];
                    return (
                      <div key={num} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 bg-white/[0.02] p-2.5 rounded border border-white/[0.05]">
                        <span className="font-mono text-[9px] text-white/40 shrink-0 w-12">Task {num}</span>
                        {link ? (
                          <a href={link} target="_blank" rel="noopener noreferrer" 
                            className="text-white text-xs hover:text-blue-300 transition-colors break-all underline decoration-white/20 underline-offset-4 truncate">
                            {link}
                          </a>
                        ) : (
                          <span className="text-white/20 text-xs italic">Not submitted</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 flex justify-between items-center mb-4 sm:mb-5">
                <span className="font-mono text-[10px] text-white/40">Preview Total</span>
                <span className="font-display font-black text-xl sm:text-2xl text-white">{liveTotal}<span className="text-white/20 text-xs font-mono"> / 300</span></span>
              </div>

              <div className="space-y-3">
                {TASK_MAP.map(({ label, key }) => {
                  const isOpen = expanded.has(key);
                  const taskPts = calcTaskTotal(draftMetrics, key);
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
                              <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-3">
                                {[
                                  { label: "Circuit", field: `${key}_circuit` as keyof Team["metrics"], max: 30 },
                                  { label: "Report", field: `${key}_report` as keyof Team["metrics"], max: 30 },
                                  { label: "Result", field: `${key}_result` as keyof Team["metrics"], max: 40 },
                                ].map(({ label: fl, field, max }) => (
                                  <div key={field as string} className="flex flex-col gap-1 sm:gap-1.5">
                                    <label className="font-mono text-[9px] sm:text-xs font-bold text-white/60 uppercase tracking-wider sm:tracking-widest">{fl}<span className="text-primary-red/70 ml-0.5 sm:ml-1">/{max}</span></label>
                                    <input type="number" min={0} max={max}
                                      value={Number(draftMetrics[field]) || 0}
                                      onChange={e => handleField(field, max, e.target.value)}
                                      className="bg-[#070709] border border-white/20 focus:border-primary-red/80 rounded-lg px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-lg font-bold text-white font-mono outline-none w-full shadow-inner" />
                                  </div>
                                ))}
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
                className="w-full btn-primary-gradient font-mono text-xs font-bold text-white py-3 sm:py-3.5 rounded-xl hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 cursor-pointer mt-4 sm:mt-5">
                {isSaved ? (<><Check className="h-4 w-4 text-green-300" /> MARKS SAVED</>)
                  : (<><ShieldCheck className="h-4 w-4" /> SAVE ALL MARKS</>)}
              </button>
            </form>
          ) : (
            <div className="glass-panel rounded-xl p-6 sm:p-10 border border-white/[0.06] flex flex-col items-center justify-center text-center h-full">
              <Trophy className="h-10 sm:h-12 w-10 sm:w-12 text-white/10 mb-3 sm:mb-4" />
              <h3 className="font-display font-bold text-white text-base sm:text-lg">Evaluation In Progress</h3>
              <p className="font-mono text-[11px] sm:text-xs text-white/35 mt-2 max-w-xs leading-relaxed">
                Score updates are restricted to event coordinators. Results will reflect here as tasks are graded.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
