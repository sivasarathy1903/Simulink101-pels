import React, { useState } from "react";
import { ArrowLeft, Cpu, ShieldCheck, Trophy, Sparkles, Lock, ExternalLink, CheckCircle2, FileText, Zap, Layers, AlertCircle, Clock } from "lucide-react";
import { motion } from "motion/react";
import { Team, TaskInfo } from "../types";
import { teamService } from "../services/teamService";

export const TASK_CONFIGS: Record<number, TaskInfo> = {
  1: {
    id: "task-1",
    key: 1,
    title: "Task 1",
    product: "Disposable Wearable ECG Patch",
    description: "A medical device company is developing a disposable wearable ECG patch for continuous heart monitoring. The patch must operate from a single-cell battery and provide a clean, regulated supply to the analog front-end and microcontroller. Because the product is intended for high-volume disposable use, the power stage must be extremely compact, low-cost, and simple, while still delivering reliable performance.",
    givenSpecs: {
      input: "1.2 V",
      output: "3.3 V",
      power: "0.2 W",
      priority: "Lowest component count, low cost, high reliability",
      freq: "500 kHz",
      rippleIL: "0.05 A",
      rippleVo: "0.1 V",
      minEff: "80%",
    },
    designParameters: [
      { label: "Input Voltage available", value: "1.2 V" },
      { label: "Target Output Voltage", value: "3.3 V" },
      { label: "Output Power to be delivered", value: "0.2 W" },
      { label: "Switching Frequency", value: "500 kHz" },
      { label: "Inductor Current Ripple (ΔIL)", value: "0.05 A" },
      { label: "Output Voltage Ripple (ΔVo)", value: "0.1 V" },
      { label: "Expected Minimum Efficiency", value: "80%" },
    ],
    keyPriorities: [
      "Lowest component count and smallest form factor",
      "Low cost",
      "High reliability through circuit simplicity",
      "Suitable for high-volume disposable medical wearables",
    ],
    topologyOptions: [
      { name: "Conventional Boost Converter" },
      { name: "Synchronous Boost Converter" },
      { name: "2-Phase Interleaved Boost Converter" },
    ],
    taskStatement: "Select the most suitable topology for this application. Justify your choice with clear technical reasoning, design the converter using the given parameters, and simulate it to demonstrate stable 3.3 V output at 0.2 W with acceptable performance.",
    released: true,
    linkKey: "task1Link",
  },
  2: {
    id: "task-2",
    key: 2,
    title: "Task 2",
    product: "High-Power Supply for Portable Software-Defined Radio",
    description: "A defence electronics company is developing a compact DC-DC module for a portable software-defined radio (SDR) and RF power amplifier system. The radio can be powered from different sources, so the input voltage varies significantly. The power stage must deliver a stable 24 V output when the input is as low as 12 V and as high as 36 V.",
    givenSpecs: {
      input: "12 V & 36 V",
      output: "24 V",
      power: "50 W",
      priority: "Stable non-inverting 24V output, step-up & step-down, single-inductor preference",
      freq: "100 kHz",
      rippleIL: "0.5 A",
      rippleVo: "0.1 V",
    },
    designParameters: [
      { label: "Input Voltage available", value: "12 V & 36 V" },
      { label: "Target Output Voltage", value: "24 V" },
      { label: "Output Power to be delivered", value: "50 W" },
      { label: "Switching Frequency", value: "100 kHz" },
      { label: "Inductor Current Ripple (ΔIL)", value: "0.5 A" },
      { label: "Output Voltage Ripple (ΔVo)", value: "0.1 V" },
    ],
    keyPriorities: [
      "Stable non-inverting 24 V output for both 12 V and 36 V input",
      "Ability to operate in both step-up and step-down modes",
      "Compact size",
      "Prefer single-inductor topology where possible",
    ],
    topologyOptions: [
      { name: "SEPIC Converter" },
      { name: "Conventional Buck-Boost Converter" },
      { name: "Non-Inverting Buck-Boost Converter" },
    ],
    taskStatement: "Select the most suitable topology for this application. Justify your choice with clear technical reasoning, design the converter using the given parameters, and simulate it to demonstrate that the output remains stable at 24 V for both 12 V and 36 V input.",
    released: true,
    linkKey: "task2Link",
  },
  3: {
    id: "task-3",
    key: 3,
    title: "Task 3",
    product: "Electric Two-Wheeler Auxiliary Power Module",
    description: "An electric two-wheeler manufacturer is developing a high-power auxiliary power module that converts the main battery voltage into a stable low-voltage supply for the vehicle’s lighting, control unit, and onboard electronics. The module must deliver high current with low ripple and good thermal performance in a compact form.",
    givenSpecs: {
      input: "48 V",
      output: "12 V",
      power: "100 W",
      priority: "Low voltage ripple, low current ripple, thermal distribution, high efficiency",
      freq: "50 kHz",
      rippleIL: "1.5 A (per phase)",
      rippleVo: "0.08 V",
    },
    designParameters: [
      { label: "Input Voltage", value: "48 V" },
      { label: "Target Output Voltage", value: "12 V" },
      { label: "Output Power to be delivered", value: "100 W" },
      { label: "Switching Frequency", value: "50 kHz" },
      { label: "Inductor Current Ripple (per phase) ΔIL", value: "1.5 A" },
      { label: "Output Voltage Ripple (ΔVo)", value: "0.08 V" },
    ],
    keyPriorities: [
      "Low output voltage ripple",
      "Low input current ripple",
      "Better thermal distribution",
      "High efficiency and compact filter size",
    ],
    topologyOptions: [
      { name: "Conventional Buck Converter" },
      { name: "Synchronous Buck Converter" },
      { name: "2-Phase Buck Converter" },
    ],
    taskStatement: "Select the most suitable topology for this application. Justify your choice with clear technical reasoning, design the converter using the given parameters, and simulate it to demonstrate stable 12 V output at 100 W with acceptable performance.",
    released: true,
    linkKey: "task3Link",
  },
};

export const EVALUATION_CRITERIA = [
  { key: "topology", label: "Understanding & Topology Selection", max: 15, desc: "Technical justification and selection of converter topology for product specifications." },
  { key: "calc", label: "Design Calculations", max: 15, desc: "Derivation of L, C, duty cycle, ripple, component stress, and parameter formulas." },
  { key: "model", label: "Simulation Model", max: 20, desc: "Clean MATLAB Simulink R2026a model implementation, controller tuning, and sub-circuits." },
  { key: "perf", label: "Output Performance", max: 20, desc: "Voltage regulation, transient response, overshoot, settling time, and load stability." },
  { key: "eff", label: "Efficiency, Losses & Waveform Analysis", max: 20, desc: "Conduction & switching loss breakdown, overall efficiency calculation, and scope waveforms." },
  { key: "report", label: "Report Quality", max: 10, desc: "Structure, technical clarity, individual contribution, conclusion, and formatting." },
];

interface TaskDetailPageProps {
  taskNumber: number;
  onBack: () => void;
  currentUser: { role: "admin" | "viewer" | "team"; name?: string; teamId?: string };
  teams: Team[];
  submittedLinks: Record<string, string>;
  onSaveSubmission: (taskKey: string, link: string) => Promise<void>;
  onToggleRelease?: (taskNumber: number, isReleased: boolean) => Promise<void>;
  onNavigateRulebook?: () => void;
  onNavigateResources?: () => void;
}

export default function TaskDetailPage({
  taskNumber,
  onBack,
  currentUser,
  teams,
  submittedLinks,
  onSaveSubmission,
  onToggleRelease,
  onNavigateRulebook,
  onNavigateResources,
}: TaskDetailPageProps) {
  const task = TASK_CONFIGS[taskNumber] || TASK_CONFIGS[1];
  
  // Find event config to see if task is actually released
  const configTeam = teams.find(t => t.name === "__EVENT_CONFIG__");
  const isReleased = configTeam?.metrics?.[`task${taskNumber}Released` as keyof typeof configTeam.metrics] !== false;

  const [inputLink, setInputLink] = useState(submittedLinks[task.linkKey] || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTogglingRelease, setIsTogglingRelease] = useState(false);

  const existingSubmission = submittedLinks[task.linkKey];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputLink.trim()) return;
    setIsSaving(true);
    try {
      await onSaveSubmission(task.linkKey, inputLink.trim());
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleReleaseClick = async () => {
    if (!onToggleRelease) return;
    setIsTogglingRelease(true);
    try {
      await onToggleRelease(taskNumber, !isReleased);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTogglingRelease(false);
    }
  };

  // ── FROZEN VIEW FOR NON-ADMIN PARTICIPANTS / VIEWERS ──
  if (!isReleased && currentUser.role !== "admin") {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 sm:py-16 px-4 sm:px-8 mt-14 font-sans text-white text-center">
        <button onClick={onBack}
          className="flex items-center gap-2 font-mono text-xs text-white/50 hover:text-primary-red transition-colors border border-white/[0.08] hover:border-primary-red/30 bg-white/[0.02] px-4 py-2 rounded-lg mb-8 cursor-pointer mx-auto sm:mx-0">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Challenges
        </button>

        <div className="relative rounded-3xl p-8 sm:p-12 border border-yellow-500/30 bg-gradient-to-br from-yellow-500/[0.06] via-black/60 to-transparent shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Animated Lock Badge */}
          <div className="h-20 w-20 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 mx-auto mb-6 shadow-xl shadow-yellow-500/10">
            <Lock className="h-10 w-10 animate-pulse" />
          </div>

          <span className="font-mono text-xs font-bold text-yellow-400 tracking-widest uppercase bg-yellow-500/10 border border-yellow-500/25 px-3.5 py-1.5 rounded-full mb-4 inline-block">
            TASK {taskNumber} IS CURRENTLY FROZEN / LOCKED
          </span>

          <h2 className="font-display font-black text-3xl sm:text-4xl text-white mb-3">
            {task.product}
          </h2>

          <p className="font-mono text-xs sm:text-sm text-white/50 max-w-md mx-auto leading-relaxed mb-8">
            This task has been temporarily locked by the SIMVERSE Phase 2 coordinators. Specifications and submission access will unlock when released.
          </p>

          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 max-w-md mx-auto mb-8 font-mono text-xs text-left space-y-2">
            <div className="flex justify-between text-white/60">
              <span>Task Status:</span>
              <span className="text-yellow-400 font-bold">🧊 Frozen by Admin</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Required Software:</span>
              <span className="text-white">MATLAB R2026a</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Evaluation Max:</span>
              <span className="text-primary-red font-bold">100 Marks</span>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            {onNavigateRulebook && (
              <button onClick={onNavigateRulebook} className="btn-primary-gradient font-mono text-xs font-bold text-white px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-primary-red/20">
                <FileText className="h-4 w-4" /> VIEW OFFICIAL RULEBOOK
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-8 sm:py-12 px-3 sm:px-6 md:px-8 mt-14 font-sans text-white">

      {/* Admin Freeze / Release Status Banner */}
      {currentUser.role === "admin" && (
        <div className="bg-primary-red/[0.08] border border-primary-red/25 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-primary-red uppercase tracking-widest">Admin Task Control:</span>
            {isReleased ? (
              <span className="bg-green-500/10 border border-green-500/30 text-green-400 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" /> RELEASED / ACTIVE
              </span>
            ) : (
              <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                🧊 FROZEN / LOCKED FOR PARTICIPANTS
              </span>
            )}
          </div>

          <button
            onClick={handleToggleReleaseClick}
            disabled={isTogglingRelease}
            className={`font-mono text-xs font-bold px-5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              isReleased
                ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 hover:bg-yellow-500/30"
                : "btn-primary-gradient text-white shadow-lg shadow-primary-red/20"
            }`}
          >
            {isTogglingRelease ? "Updating Status…" : isReleased ? "FREEZE TASK 🧊" : "RELEASE / UNLOCK TASK 🔓"}
          </button>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-4 border-b border-white/[0.08]">
        <button onClick={onBack}
          className="flex items-center gap-2 font-mono text-xs text-white/50 hover:text-primary-red transition-colors border border-white/[0.08] hover:border-primary-red/30 bg-white/[0.02] px-3.5 py-2 rounded-lg cursor-pointer">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Challenges
        </button>

        <div className="flex items-center gap-2">
          {onNavigateRulebook && (
            <button onClick={onNavigateRulebook} className="font-mono text-xs text-white/40 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer">
              <FileText className="h-3.5 w-3.5 text-primary-red" /> Rulebook
            </button>
          )}
          {onNavigateResources && (
            <button onClick={onNavigateResources} className="font-mono text-xs text-white/40 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer">
              <Zap className="h-3.5 w-3.5 text-yellow-400" /> Resources
            </button>
          )}
        </div>
      </div>

      {/* Task Header Hero */}
      <div className="relative rounded-2xl p-6 sm:p-10 border border-primary-red/30 bg-gradient-to-br from-primary-red/[0.08] via-black/40 to-transparent overflow-hidden mb-10 shadow-2xl">
        <span className="absolute -right-4 -bottom-6 font-display font-black text-[140px] sm:text-[180px] text-primary-red/[0.04] leading-none select-none pointer-events-none">{task.key}</span>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[10px] text-primary-red font-bold tracking-widest uppercase bg-primary-red/10 border border-primary-red/25 px-2.5 py-1 rounded-full">
                SIMVERSE 2.0 · PHASE 2
              </span>
              {isReleased ? (
                <span className="font-mono text-[10px] text-green-400 bg-green-500/10 border border-green-500/25 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" /> Active Challenge
                </span>
              ) : (
                <span className="font-mono text-[10px] text-yellow-400 bg-yellow-500/10 border border-yellow-500/25 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              )}
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">{task.title}</h1>
            <p className="font-mono text-base sm:text-lg text-primary-red/90 mt-1 font-semibold">{task.product}</p>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center shrink-0 min-w-[140px]">
            <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest mb-1">Max Score</p>
            <p className="font-display font-black text-3xl sm:text-4xl text-primary-red">100 <span className="text-sm text-white/30 font-mono">PTS</span></p>
          </div>
        </div>

        {/* Product Application Narrative Box */}
        {task.description && (
          <p className="font-sans text-xs sm:text-sm text-white/70 leading-relaxed mb-6 bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl">
            {task.description}
          </p>
        )}

        {/* Given Specifications Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-6 border-t border-white/10">
          <div className="bg-black/40 border border-white/[0.08] rounded-xl p-3.5">
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest block mb-1">Input Voltage</span>
            <span className="font-mono text-sm sm:text-base text-white font-bold">{task.givenSpecs.input}</span>
          </div>
          <div className="bg-black/40 border border-white/[0.08] rounded-xl p-3.5">
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest block mb-1">Target Output</span>
            <span className="font-mono text-sm sm:text-base text-white font-bold">{task.givenSpecs.output}</span>
          </div>
          <div className="bg-black/40 border border-white/[0.08] rounded-xl p-3.5">
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest block mb-1">Power Rating</span>
            <span className="font-mono text-sm sm:text-base text-white font-bold">{task.givenSpecs.power}</span>
          </div>
          <div className="bg-black/40 border border-white/[0.08] rounded-xl p-3.5">
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest block mb-1">Key Priority</span>
            <span className="font-mono text-xs sm:text-sm text-primary-red/90 font-bold line-clamp-2">{task.givenSpecs.priority}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Left 2 Cols: Task Parameters, Priorities, Task Statement & Topologies */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Detailed Design Parameters Grid */}
          {task.designParameters && task.designParameters.length > 0 && (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08]">
              <div className="flex items-center gap-2.5 mb-6">
                <Zap className="h-5 w-5 text-yellow-400" />
                <h2 className="font-mono text-base font-bold text-white uppercase tracking-widest">Design Parameters</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                {task.designParameters.map((param, idx) => (
                  <div key={idx} className="bg-white/[0.02] border border-white/[0.06] p-3.5 rounded-xl flex items-center justify-between">
                    <span className="text-white/60 text-[11px]">{param.label}</span>
                    <span className="font-bold text-white text-xs bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.08] text-primary-red">{param.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Priorities Checklist */}
          {task.keyPriorities && task.keyPriorities.length > 0 && (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08]">
              <div className="flex items-center gap-2.5 mb-4">
                <ShieldCheck className="h-5 w-5 text-primary-red" />
                <h2 className="font-mono text-base font-bold text-white uppercase tracking-widest">Key Priorities</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
                {task.keyPriorities.map((priority, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 bg-white/[0.02] border border-white/[0.05] p-3 rounded-xl">
                    <CheckCircle2 className="h-4 w-4 text-primary-red shrink-0" />
                    <span className="text-white/80">{priority}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Task Requirements & Prompt */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08]">
            <div className="flex items-center gap-2.5 mb-4">
              <Cpu className="h-5 w-5 text-primary-red" />
              <h2 className="font-mono text-base font-bold text-white uppercase tracking-widest">Your Task Statement</h2>
            </div>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed font-sans bg-white/[0.02] border border-white/[0.05] p-5 rounded-xl">
              {task.taskStatement}
            </p>
          </div>

          {/* Topology Options */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08]">
            <div className="flex items-center gap-2.5 mb-6">
              <Layers className="h-5 w-5 text-primary-red" />
              <h2 className="font-mono text-base font-bold text-white uppercase tracking-widest">Candidate Topology Options</h2>
            </div>
            <div className="space-y-3">
              {task.topologyOptions.map((opt, i) => (
                <div key={i} className="p-4 sm:p-5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:border-white/20 transition-all flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-white">{opt.name}</h3>
                </div>
              ))}
            </div>
          </div>

          {/* Animated 6-Item Evaluation Criteria Table */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <h2 className="font-mono text-base font-bold text-white uppercase tracking-widest">Evaluation Criteria Table</h2>
              </div>
              <span className="font-mono text-xs text-white/40">100 Marks Total</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[480px]">
                <thead>
                  <tr className="border-b border-white/10 font-mono text-[10px] text-white/40 uppercase tracking-widest">
                    <th className="py-3 px-4">Criterion</th>
                    <th className="py-3 px-4">Focus & Breakdown</th>
                    <th className="py-3 px-4 text-right">Max Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] font-mono text-xs">
                  {EVALUATION_CRITERIA.map((crit, idx) => (
                    <motion.tr 
                      key={crit.key} 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: idx * 0.08 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-red" />
                        {crit.label}
                      </td>
                      <td className="py-3.5 px-4 text-white/50 text-[11px] font-sans">{crit.desc}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-display font-black text-base text-primary-red">{crit.max}</span>
                        <span className="text-white/30 text-[10px] ml-1">pts</span>
                      </td>
                    </motion.tr>
                  ))}
                  <tr className="bg-white/[0.03] font-bold text-white">
                    <td className="py-3 px-4 uppercase tracking-widest text-primary-red">Total Marks</td>
                    <td className="py-3 px-4 text-white/40 text-[10px] font-sans">Accumulates toward Phase 2 Leaderboard</td>
                    <td className="py-3 px-4 text-right font-display text-lg text-primary-red">100 <span className="text-xs text-white/30">pts</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Submission Portal & Resources */}
        <div className="space-y-8">
          
          {/* Submission Portal Card */}
          <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-blue-500/30 bg-gradient-to-b from-blue-500/[0.05] to-transparent shadow-xl">
            <div className="flex items-center gap-2.5 mb-4">
              <Sparkles className="h-5 w-5 text-blue-400" />
              <h2 className="font-mono text-base font-bold text-white uppercase tracking-widest">Submission Portal</h2>
            </div>

            <p className="font-mono text-xs text-white/60 leading-relaxed mb-6">
              Upload your complete <code className="text-blue-300 font-bold bg-blue-500/10 px-1 py-0.5 rounded">.slx</code> Simulink model file and Technical Report (PDF/Word) to Google Drive, then submit the link below.
            </p>

            {currentUser.role === "team" ? (
              existingSubmission && !isEditing ? (
                <div className="bg-green-500/[0.08] border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs text-green-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Link Submitted
                    </span>
                    <button onClick={() => setIsEditing(true)} className="font-mono text-[10px] text-white/50 hover:text-white border border-white/10 px-2.5 py-1 rounded transition-colors cursor-pointer">
                      Edit Link
                    </button>
                  </div>
                  <a href={existingSubmission} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-white/80 break-all underline decoration-white/30 underline-offset-4 hover:text-white transition-colors block">
                    {existingSubmission}
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <label className="font-mono text-[10px] text-blue-400 uppercase tracking-widest block font-bold">Google Drive Folder Link</label>
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={inputLink}
                    onChange={(e) => setInputLink(e.target.value)}
                    className="w-full bg-[#070709] border border-white/20 focus:border-blue-400 rounded-xl px-4 py-3 text-xs text-white font-mono outline-none transition-colors"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSaving || !inputLink.trim()}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-mono text-xs font-bold uppercase tracking-widest py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-600/20"
                    >
                      {isSaving ? "Submitting..." : "Submit Drive Link"}
                    </button>
                    {existingSubmission && (
                      <button type="button" onClick={() => setIsEditing(false)} className="font-mono text-xs text-white/40 hover:text-white border border-white/10 px-3 rounded-xl cursor-pointer">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )
            ) : (
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 text-center">
                <AlertCircle className="h-8 w-8 text-white/20 mx-auto mb-2" />
                <p className="font-mono text-xs text-white/50">Please log in as a registered team to submit your Drive link for {task.title}.</p>
              </div>
            )}

            {saveSuccess && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 bg-green-500/10 border border-green-500/25 text-green-400 font-mono text-xs rounded-xl text-center">
                ✅ Drive link submitted successfully!
              </motion.div>
            )}

            <div className="mt-6 pt-5 border-t border-white/[0.08] space-y-2 font-mono text-[10px] text-white/40">
              <p className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-primary-red" /> MATLAB/Simulink R2026a is mandatory.</p>
              <p className="flex items-center gap-1.5"><ExternalLink className="h-3 w-3 text-blue-400" /> Ensure Drive link access is set to "Anyone with link".</p>
            </div>
          </div>

          {/* Quick Help & Guidance */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-4">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary-red" /> Submission Checklist
            </h3>
            <ul className="space-y-2 font-mono text-xs text-white/60">
              <li className="flex items-start gap-2"><span className="text-green-400 font-bold">✓</span> Complete <code>.slx</code> simulation model file</li>
              <li className="flex items-start gap-2"><span className="text-green-400 font-bold">✓</span> Technical Report covering calculations & waveforms</li>
              <li className="flex items-start gap-2"><span className="text-green-400 font-bold">✓</span> Individual team member contribution section</li>
              <li className="flex items-start gap-2"><span className="text-green-400 font-bold">✓</span> Verified accessible Google Drive folder link</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
