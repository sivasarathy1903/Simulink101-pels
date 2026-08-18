import React, { useState } from "react";
import { Search, Trophy, HelpCircle, Plus, X, ShieldCheck, Trash2 } from "lucide-react";
import { Team } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface LeaderboardTableProps {
  teams: Team[];
  onSelectTeam: (team: Team) => void;
  onRegisterTeam: (data: { name: string; dept: string; year: string; members: string[] }) => void;
  onDeleteTeam?: (id: string) => void;
  isAdmin?: boolean;
}

export default function LeaderboardTable({ teams, onSelectTeam, onRegisterTeam, onDeleteTeam, isAdmin = false }: LeaderboardTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDept, setFormDept] = useState("");
  const [formYear, setFormYear] = useState("");
  
  // Structured member state
  const [participantList, setParticipantList] = useState<{ name: string; dept: string; year: string }[]>([
    { name: "", dept: "", year: "" }
  ]);

  const sorted = [...teams]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((t, i) => ({ ...t, rank: i + 1 }))
    .filter(t =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tags.some(m => m.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.members?.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.dept.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    // Default team-level dept & year from first participant if not specified
    const primaryDept = formDept.trim() || participantList[0]?.dept || "EEE";
    const primaryYear = formYear.trim() || participantList[0]?.year || "3rd";

    // Formatted member string list for tags/storage
    const formattedMembers = participantList
      .filter(p => p.name.trim())
      .map(p => {
        const d = p.dept.trim() || primaryDept;
        const y = p.year.trim() || primaryYear;
        return `${p.name.trim()} (${d} - ${y})`;
      });

    onRegisterTeam({
      name: formName.trim(),
      dept: primaryDept,
      year: primaryYear,
      members: formattedMembers,
    });

    setFormName(""); setFormDept(""); setFormYear("");
    setParticipantList([{ name: "", dept: "", year: "" }]);
    setIsRegisterOpen(false);
  };

  const top3 = sorted.slice(0, 3);

  const podiumOrder = top3.length === 3
    ? [top3[1], top3[0], top3[2]]   // silver | gold | bronze
    : top3.length === 2
    ? [top3[1], top3[0]]
    : top3;

  const podiumConfig: Record<number, { height: string; label: string; textColor: string; border: string; glow: string; badge: string }> = {
    1: { height: "h-52", label: "1ST", textColor: "text-yellow-400", border: "border-yellow-500/40 hover:border-yellow-400/70", glow: "shadow-yellow-500/10", badge: "bg-yellow-500 text-black" },
    2: { height: "h-44", label: "2ND", textColor: "text-slate-300", border: "border-slate-400/30 hover:border-slate-300/60", glow: "shadow-slate-400/5", badge: "bg-slate-400 text-black" },
    3: { height: "h-40", label: "3RD", textColor: "text-amber-500", border: "border-amber-600/30 hover:border-amber-500/60", glow: "shadow-amber-600/5", badge: "bg-amber-600 text-black" },
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 sm:py-12 px-3 sm:px-6 md:px-8 mt-14 font-sans">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-4 mb-8 sm:mb-10 border-b border-white/[0.06] pb-4 sm:pb-6">
        <div>
          <span className="font-mono text-[10px] text-primary-red uppercase tracking-widest block mb-1">Rankings</span>
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">Live Leaderboard</h1>
          <p className="font-mono text-[11px] sm:text-xs text-white/35 mt-1">Max 300 pts · 3 tasks × 100 pts each</p>
        </div>
        {isAdmin && (
          <button onClick={() => setIsRegisterOpen(true)}
            className="w-full sm:w-auto justify-center btn-primary-gradient text-white font-mono text-xs font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-primary-red/15 cursor-pointer">
            <Plus className="h-4 w-4" /> REGISTER TEAM
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6 sm:mb-8">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
          <input type="text" placeholder="Search team or participant name/dept…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-primary-red/50 text-xs text-white pl-9 pr-4 py-2 outline-none rounded-lg transition-all" />
        </div>
      </div>

      {/* Podium — top 3 grand display */}
      {top3.length > 0 && (
        <div className="flex flex-col items-center mb-10 sm:mb-14">
          <p className="font-mono text-[9px] text-white/25 tracking-widest uppercase mb-6 sm:mb-8">Top Performers</p>
          <div className="flex items-end justify-center gap-2 sm:gap-4 w-full max-w-2xl">
            {podiumOrder.map((team) => {
              const cfg = podiumConfig[team.rank];
              if (!cfg) return null;
              
              const mobileHeight = team.rank === 1 ? "h-44 sm:h-52" : team.rank === 2 ? "h-36 sm:h-44" : "h-32 sm:h-40";

              return (
                <motion.div key={team.id}
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: team.rank === 1 ? 0 : team.rank === 2 ? 0.1 : 0.2 }}
                  whileHover={{ y: -6, scale: 1.025 }}
                  onClick={() => onSelectTeam(team)}
                  className={`relative flex-1 glass-panel rounded-xl p-3 sm:p-6 flex flex-col justify-between text-center cursor-pointer border ${mobileHeight} ${cfg.border} shadow-xl ${cfg.glow} bg-gradient-to-b from-white/[0.025] to-transparent transition-all duration-300`}>

                  {/* Rank badge */}
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${cfg.badge} text-[7px] sm:text-[9px] font-black px-2 sm:px-3 py-0.5 rounded-full flex items-center gap-1 shadow-lg whitespace-nowrap`}>
                    <Trophy className="h-2 sm:h-2.5 w-2 sm:w-2.5" /> {cfg.label} PLACE
                  </div>

                  <div className="pt-2 sm:pt-3 flex flex-col gap-0.5 sm:gap-1">
                    <h3 className="font-display font-black text-xs sm:text-base md:text-lg text-white leading-tight line-clamp-2">{team.name}</h3>
                    <p className="font-mono text-[8px] sm:text-[9px] text-white/35">
                      {team.members && team.members.length > 0
                        ? `${team.members.length} Participants`
                        : team.tags.length > 0 ? `${team.tags.length} Members` : "—"}
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className={`font-display font-black text-2xl sm:text-4xl md:text-5xl leading-none ${cfg.textColor}`}>{team.totalPoints}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {sorted.length === 0 && (
        <div className="flex flex-col items-center py-20 gap-3">
          <HelpCircle className="h-10 w-10 text-white/10" />
          <span className="font-mono text-xs text-white/25">No teams registered yet</span>
        </div>
      )}

      {/* All teams summary below podium */}
      {sorted.length > 0 && (
        <div className="glass-panel rounded-xl overflow-hidden border border-white/[0.06] shadow-xl mb-6 sm:mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-white/[0.06] font-mono text-[9px] text-white/30 tracking-widest uppercase">
                  <th className="py-3.5 px-4 text-center w-14">POS</th>
                  <th className="py-3.5 px-4">TEAM & PARTICIPANTS</th>
                  <th className="py-3.5 px-4 text-right w-36">TOTAL PTS</th>
                  {isAdmin && <th className="py-3.5 px-4 w-12" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {sorted.map(team => (
                  <tr key={team.id} onClick={() => onSelectTeam(team)} className="group hover:bg-white/[0.02] cursor-pointer transition-colors">
                    <td className="py-4 px-4 text-center">
                      <div className="mx-auto w-7 h-7 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center font-mono text-[11px] text-white/50 font-bold">{team.rank}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-display font-bold text-sm sm:text-base text-white group-hover:text-primary-red transition-colors flex items-center gap-2">
                        {team.name}
                        {team.institution && <span className="font-mono text-[10px] text-white/30 font-normal">({team.institution})</span>}
                      </div>

                      {/* Display participant list with Dept and Year */}
                      {team.members && team.members.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {team.members.map((m, idx) => (
                            <span key={idx} className="font-mono text-[9px] bg-white/[0.04] border border-white/[0.08] text-white/70 px-2 py-0.5 rounded-md">
                              👤 {m.name} {m.dept ? <span className="text-primary-red/80 font-semibold">({m.dept} {m.year ? `· ${m.year}` : ''})</span> : ''}
                            </span>
                          ))}
                        </div>
                      ) : team.tags.length > 0 ? (
                        <div className="font-mono text-[9px] text-white/40 mt-1">{team.tags.join(" · ")}</div>
                      ) : null}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex flex-col items-end gap-0.5">
                        <span className="font-display font-black text-3xl sm:text-4xl text-primary-red leading-none">{team.totalPoints}</span>
                        <span className="font-mono text-[8px] text-white/20">/ 300 PTS</span>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="py-4 px-3" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete team "${team.name}"? This cannot be undone.`)) {
                              onDeleteTeam?.(team.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                          title="Delete team"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scoring breakdown note */}
      <div className="bg-white/[0.015] border border-white/[0.06] p-4 rounded-xl font-mono text-[10px] text-white/35 leading-relaxed">
        Scores accumulate across all 3 tasks (Max 300 pts). Evaluation criteria: Topology Selection (15) · Calculations (15) · Simulation Model (20) · Output Performance (20) · Waveform Analysis (20) · Report Quality (10) = 100 pts per task.
      </div>

      {/* Register Team Modal */}
      <AnimatePresence>
        {isRegisterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsRegisterOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.96, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0, y: 16 }}
              className="relative w-full max-w-lg bg-[#0D0D10] border border-white/10 rounded-2xl p-5 sm:p-7 z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsRegisterOpen(false)} className="absolute top-4 right-4 text-white/30 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>

              <div className="mb-5 sm:mb-6">
                <span className="font-mono text-[9px] text-primary-red tracking-widest uppercase">Admin · Registry</span>
                <h2 className="font-display font-black text-xl sm:text-2xl text-white mt-0.5">Register New Team</h2>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest">Team Name</label>
                  <input type="text" required placeholder="e.g. APEX DYNAMICS" value={formName} onChange={e => setFormName(e.target.value)}
                    className="bg-white/[0.04] border border-white/10 focus:border-primary-red/60 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none font-mono uppercase" />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="font-mono text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest">Primary Department</label>
                    <input type="text" placeholder="e.g. EEE / ECE / BME" value={formDept} onChange={e => setFormDept(e.target.value)}
                      className="bg-white/[0.04] border border-white/10 focus:border-primary-red/60 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none font-mono uppercase" />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:w-1/3">
                    <label className="font-mono text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest">Year</label>
                    <input type="text" placeholder="e.g. 3rd" value={formYear} onChange={e => setFormYear(e.target.value)}
                      className="bg-white/[0.04] border border-white/10 focus:border-primary-red/60 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none font-mono uppercase" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Participants Details (Name, Dept, Year)</label>
                    <button type="button" onClick={() => setParticipantList([...participantList, { name: "", dept: "", year: "" }])}
                      className="font-mono text-[9px] bg-primary-red/15 hover:bg-primary-red/25 text-primary-red border border-primary-red/20 px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-colors">
                      <Plus className="h-3 w-3" /> ADD PARTICIPANT
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 max-h-60 overflow-y-auto p-1">
                    {participantList.map((p, idx) => (
                      <div key={idx} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[9px] text-primary-red uppercase font-bold">Participant {idx + 1}</span>
                          {participantList.length > 1 && (
                            <button type="button" onClick={() => setParticipantList(participantList.filter((_, j) => j !== idx))} className="text-white/30 hover:text-primary-red cursor-pointer">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input type="text" required placeholder="Name" value={p.name}
                            onChange={e => { const n = [...participantList]; n[idx].name = e.target.value; setParticipantList(n); }}
                            className="bg-white/[0.04] border border-white/10 focus:border-primary-red/50 rounded-lg px-3 py-2 text-xs text-white outline-none" />
                          <input type="text" placeholder="Dept (e.g. EEE)" value={p.dept}
                            onChange={e => { const n = [...participantList]; n[idx].dept = e.target.value; setParticipantList(n); }}
                            className="bg-white/[0.04] border border-white/10 focus:border-primary-red/50 rounded-lg px-3 py-2 text-xs text-white outline-none" />
                          <input type="text" placeholder="Year (e.g. 3rd)" value={p.year}
                            onChange={e => { const n = [...participantList]; n[idx].year = e.target.value; setParticipantList(n); }}
                            className="bg-white/[0.04] border border-white/10 focus:border-primary-red/50 rounded-lg px-3 py-2 text-xs text-white outline-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsRegisterOpen(false)}
                    className="flex-1 font-mono text-xs text-white/40 bg-white/[0.04] border border-white/10 px-4 py-2.5 rounded-lg hover:bg-white/[0.07] cursor-pointer transition-colors">CANCEL</button>
                  <button type="submit"
                    className="flex-1 btn-primary-gradient font-mono text-xs font-bold text-white px-4 py-2.5 rounded-lg hover:scale-[1.01] transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
                    <ShieldCheck className="h-3.5 w-3.5" /> REGISTER TEAM
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

