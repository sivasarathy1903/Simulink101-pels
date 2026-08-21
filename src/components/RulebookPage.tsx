import React from "react";
import { FileText, ExternalLink, Calendar, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, BookOpen, Clock, Users, Cpu, Trophy, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { EVALUATION_CRITERIA } from "./TaskDetailPage";

const RULEBOOK_LINK = "https://drive.google.com/file/d/12Xsby0psAvJR6gGXaD_EpL0zbZKzl0Zd/view?usp=sharing";

export default function RulebookPage() {
  return (
    <div className="w-full max-w-5xl mx-auto py-8 sm:py-12 px-3 sm:px-6 md:px-8 mt-14 font-sans text-white">
      
      {/* Hero Header */}
      <div className="relative rounded-2xl p-6 sm:p-10 border border-primary-red/30 bg-gradient-to-br from-primary-red/[0.08] via-black/40 to-transparent overflow-hidden mb-10 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[10px] text-primary-red font-bold tracking-widest uppercase bg-primary-red/10 border border-primary-red/25 px-2.5 py-1 rounded-full">
                OFFICIAL GUIDELINES
              </span>
              <span className="font-mono text-[10px] text-white/50 bg-white/[0.05] border border-white/10 px-2.5 py-1 rounded-full">
                IEEE PELS SIMVERSE 2.0
              </span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">Phase 2 Rulebook</h1>
            <p className="font-mono text-sm sm:text-base text-white/60 mt-1">Complete rules, task hierarchy timeline, software specs, and evaluation guidelines.</p>
          </div>

          <a
            href={RULEBOOK_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary-gradient font-mono text-xs sm:text-sm font-bold text-white px-6 py-3.5 rounded-xl hover:scale-[1.03] transition-all shadow-xl shadow-primary-red/25 flex items-center gap-2 cursor-pointer shrink-0"
          >
            CLICK ME TO VIEW RULEBOOK (PDF) <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="space-y-8">
        
        {/* Section 1 & 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="font-mono text-xs font-bold text-primary-red bg-primary-red/10 px-2 py-0.5 rounded border border-primary-red/20">01</span>
                <h3 className="font-display font-bold text-lg text-white">Phase II Overview</h3>
              </div>
              <p className="font-mono text-xs text-white/60 leading-relaxed mb-4">
                Phase 2 is an online simulation challenge consisting of three sequential engineering tasks designed to test converter modeling, calculation accuracy, and simulation expertise.
              </p>
              <ul className="space-y-2 font-mono text-xs text-white/70">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary-red" /> Teams of 2 participants</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary-red" /> Tasks released sequentially via official portal</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary-red" /> MATLAB/Simulink R2026a is mandatory</li>
              </ul>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="font-mono text-xs font-bold text-primary-red bg-primary-red/10 px-2 py-0.5 rounded border border-primary-red/20">02</span>
                <h3 className="font-display font-bold text-lg text-white">Orientation</h3>
              </div>
              <p className="font-mono text-xs text-white/60 leading-relaxed mb-4">
                Official Orientation session covering rules, challenge structure, submission portal usage, task release flow, and guidelines.
              </p>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-[11px] font-mono text-white/50">
                📌 Attendance or reviewing orientation recording is strongly advised before starting Task 1.
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Event Hierarchy Timeline */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-primary-red bg-primary-red/10 px-2 py-0.5 rounded border border-primary-red/20">03</span>
              <h3 className="font-display font-bold text-xl text-white">Phase 2 Event Hierarchy Timeline</h3>
            </div>
            <span className="font-mono text-xs text-white/40">Sequential Progression</span>
          </div>

          <div className="space-y-4">
            {/* Phase 2 Orientation */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 flex items-center justify-center font-mono text-xs font-bold shrink-0">00</span>
                <div>
                  <h4 className="font-display font-bold text-sm text-white">Phase 2 Orientation & Briefing</h4>
                  <p className="font-mono text-xs text-white/50">Rules, submission portal walkthrough, and challenge launch</p>
                </div>
              </div>
              <span className="font-mono text-[10px] text-yellow-400 bg-yellow-500/10 border border-yellow-500/25 px-2.5 py-1 rounded-full shrink-0">Opening Stage</span>
            </div>

            {/* Task 1 */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-lg bg-primary-red/10 border border-primary-red/30 text-primary-red flex items-center justify-center font-mono text-xs font-bold shrink-0">01</span>
                <div>
                  <h4 className="font-display font-bold text-sm text-white">Task 1: Disposable Wearable ECG Patch</h4>
                  <p className="font-mono text-xs text-white/50">Boost converter topology selection, design, and simulation</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-[10px] text-primary-red bg-primary-red/10 border border-primary-red/25 px-2.5 py-1 rounded-full block mb-1">Standard Window + Extension</span>
                <span className="font-mono text-[9px] text-white/30">100 Marks</span>
              </div>
            </div>

            {/* Task 2 */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-lg bg-primary-red/10 border border-primary-red/30 text-primary-red flex items-center justify-center font-mono text-xs font-bold shrink-0">02</span>
                <div>
                  <h4 className="font-display font-bold text-sm text-white">Task 2: High-Power Supply for Portable SDR</h4>
                  <p className="font-mono text-xs text-white/50">Step-up/step-down converter topology design & simulation</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-[10px] text-primary-red bg-primary-red/10 border border-primary-red/25 px-2.5 py-1 rounded-full block mb-1">Standard Window + Extension</span>
                <span className="font-mono text-[9px] text-white/30">100 Marks</span>
              </div>
            </div>

            {/* Task 3 */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-lg bg-primary-red/10 border border-primary-red/30 text-primary-red flex items-center justify-center font-mono text-xs font-bold shrink-0">03</span>
                <div>
                  <h4 className="font-display font-bold text-sm text-white">Task 3: Electric Two-Wheeler Auxiliary Power Module</h4>
                  <p className="font-mono text-xs text-white/50">Buck converter topology modeling, loss analysis, and simulation</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-[10px] text-primary-red bg-primary-red/10 border border-primary-red/25 px-2.5 py-1 rounded-full block mb-1">Standard Window + Extension</span>
                <span className="font-mono text-[9px] text-white/30">100 Marks</span>
              </div>
            </div>

            {/* Evaluation & Phase 3 Selection */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 flex items-center justify-center font-mono text-xs font-bold shrink-0">04</span>
                <div>
                  <h4 className="font-display font-bold text-sm text-white">Leaderboard Finalization & Phase 3 Qualification</h4>
                  <p className="font-mono text-xs text-white/50">Cumulative Phase 2 marks evaluation and top team selection</p>
                </div>
              </div>
              <span className="font-mono text-[10px] text-green-400 bg-green-500/10 border border-green-500/25 px-2.5 py-1 rounded-full shrink-0">Final Phase 2 Stage</span>
            </div>
          </div>
        </div>

        {/* Section 4, 5, 6 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs font-bold text-primary-red bg-primary-red/10 px-2 py-0.5 rounded">04</span>
              <h4 className="font-display font-bold text-base text-white">Task Release Flow</h4>
            </div>
            <p className="font-mono text-xs text-white/60 leading-relaxed">
              Each task problem statement and submission portal unlocks according to the official event release schedule. Check the official portal regularly.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs font-bold text-primary-red bg-primary-red/10 px-2 py-0.5 rounded">05</span>
              <h4 className="font-display font-bold text-base text-white">Software Requirement</h4>
            </div>
            <p className="font-mono text-xs text-white/60 leading-relaxed">
              <strong>MATLAB/Simulink R2026a</strong> is mandatory for all simulation files. Submissions in other versions will not open during grading.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs font-bold text-primary-red bg-primary-red/10 px-2 py-0.5 rounded">06</span>
              <h4 className="font-display font-bold text-base text-white">Mentor Support</h4>
            </div>
            <p className="font-mono text-xs text-white/60 leading-relaxed">
              Assigned mentors provide technical guidance and problem clarification. Mentors do not write solutions or code for participants.
            </p>
          </div>
        </div>

        {/* Section 7: Submission Requirements */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08]">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="font-mono text-xs font-bold text-primary-red bg-primary-red/10 px-2 py-0.5 rounded border border-primary-red/20">07</span>
            <h3 className="font-display font-bold text-xl text-white">Submission Requirements</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-5 space-y-2">
              <h4 className="font-mono text-xs font-bold text-primary-red uppercase tracking-wider">Required Files per Task</h4>
              <ul className="font-mono text-xs text-white/70 space-y-1.5">
                <li>• Complete <code>.slx</code> Simulink model file</li>
                <li>• Technical Report (PDF/Docx) covering:</li>
                <li className="pl-4 text-white/50">– Problem understanding & topology choice</li>
                <li className="pl-4 text-white/50">– Mathematical calculations & parameter derivations</li>
                <li className="pl-4 text-white/50">– Simulation model setup & waveforms</li>
                <li className="pl-4 text-white/50">– Efficiency & loss analysis</li>
                <li className="pl-4 text-white/50">– Individual member contributions</li>
              </ul>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-5 space-y-2">
              <h4 className="font-mono text-xs font-bold text-blue-400 uppercase tracking-wider">Submission Process</h4>
              <ol className="font-mono text-xs text-white/70 space-y-2 list-decimal pl-4">
                <li>Upload <code>.slx</code> file and Report to a Google Drive folder.</li>
                <li>Ensure access is set to <strong>"Anyone with the link"</strong>.</li>
                <li>Paste the Google Drive link into the task portal on this website before deadline.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Section 8: Evaluation Criteria Table */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-primary-red bg-primary-red/10 px-2 py-0.5 rounded border border-primary-red/20">08</span>
              <h3 className="font-display font-bold text-xl text-white">Evaluation Criteria (100 Marks Split)</h3>
            </div>
            <span className="font-mono text-xs text-primary-red font-bold">Total: 100 Marks / Task</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-white/10 font-mono text-[10px] text-white/40 uppercase tracking-widest">
                  <th className="py-3 px-4">Criterion</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] font-mono text-xs">
                {EVALUATION_CRITERIA.map(crit => (
                  <tr key={crit.key} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 font-bold text-white">{crit.label}</td>
                    <td className="py-3.5 px-4 text-white/50 font-sans text-[11px]">{crit.desc}</td>
                    <td className="py-3.5 px-4 text-right font-display font-black text-primary-red text-sm">{crit.max}</td>
                  </tr>
                ))}
                <tr className="bg-white/[0.03] font-bold text-white">
                  <td className="py-3 px-4 uppercase tracking-widest text-primary-red">Total Marks</td>
                  <td className="py-3 px-4 text-white/40 text-[10px] font-sans">Evaluated independently for each of the 3 tasks</td>
                  <td className="py-3 px-4 text-right font-display text-base text-primary-red">100</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 9, 10, 11 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs font-bold text-primary-red bg-primary-red/10 px-2 py-0.5 rounded">09</span>
              <h4 className="font-display font-bold text-base text-white">AI Usage Policy</h4>
            </div>
            <p className="font-mono text-xs text-white/60 leading-relaxed">
              AI tools are permitted for learning, calculations, debugging, and drafting. Participants must understand and be capable of explaining all submitted work.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs font-bold text-primary-red bg-primary-red/10 px-2 py-0.5 rounded">10</span>
              <h4 className="font-display font-bold text-base text-white">Phase 3 Qualification</h4>
            </div>
            <p className="font-mono text-xs text-white/60 leading-relaxed">
              Cumulative Phase 2 leaderboard performance determines selection for Phase 3 (Simulation Hackathon). Top 3 teams receive special advantages.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs font-bold text-primary-red bg-primary-red/10 px-2 py-0.5 rounded">11</span>
              <h4 className="font-display font-bold text-base text-white">General Guidelines</h4>
            </div>
            <p className="font-mono text-xs text-white/60 leading-relaxed">
              Submitting another team's work is strictly prohibited and results in immediate elimination of both teams.
            </p>
          </div>
        </div>

        {/* Big Bottom Action Link */}
        <div className="text-center pt-6">
          <a
            href={RULEBOOK_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 btn-primary-gradient font-mono text-sm font-bold text-white px-8 py-4 rounded-xl hover:scale-[1.03] transition-all shadow-xl shadow-primary-red/25 cursor-pointer"
          >
            CLICK ME TO VIEW OFFICIAL RULEBOOK (PDF) <ExternalLink className="h-4 w-4" />
          </a>
        </div>

      </div>
    </div>
  );
}
