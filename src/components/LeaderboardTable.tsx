import React, { useState } from "react";
import { Search, Trophy, HelpCircle, Plus, X, ShieldCheck } from "lucide-react";
import { Team } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface LeaderboardTableProps {
  teams: Team[];
  onSelectTeam: (team: Team) => void;
  onRegisterTeam: (data: { name: string; members: string[] }) => void;
  isAdmin?: boolean;
}

export default function LeaderboardTable({ teams, onSelectTeam, onRegisterTeam, isAdmin = false }: LeaderboardTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [members, setMembers] = useState<string[]>([""]);

  const sorted = [...teams]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((t, i) => ({ ...t, rank: i + 1 }))
    .filter(t =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tags.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    onRegisterTeam({ name: formName.trim(), members: members.filter(m => m.trim()) });
    setFormName(""); setMembers([""]); setIsRegisterOpen(false);
  };

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

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
    <div className="w-full max-w-6xl mx-auto py-12 px-4 md:px-8 mt-14">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10 border-b border-white/[0.06] pb-6">
        <div>
          <span className="font-mono text-[10px] text-primary-red uppercase tracking-widest block mb-1">Rankings</span>
          <h1 className="font-display font-black text-4xl md:text-5xl text-white tracking-tight">Live Leaderboard</h1>
          <p className="font-mono text-xs text-white/35 mt-1">Max 300 pts · 3 tasks × 100 pts each</p>
        </div>
        {isAdmin && (
          <button onClick={() => setIsRegisterOpen(true)}
            className="btn-primary-gradient text-white font-mono text-xs font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-primary-red/15 cursor-pointer">
            <Plus className="h-4 w-4" /> REGISTER TEAM
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
          <input type="text" placeholder="Search teams…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-primary-red/50 text-xs text-white pl-9 pr-4 py-2 outline-none rounded-lg transition-all" />
        </div>
      </div>

      {/* Podium — top 3 grand display */}
      {top3.length > 0 && (
        <div className="flex flex-col items-center mb-14">
          <p className="font-mono text-[9px] text-white/25 tracking-widest uppercase mb-8">Top Performers</p>
          <div className="flex items-end justify-center gap-4 w-full max-w-2xl">
            {podiumOrder.map((team) => {
              const cfg = podiumConfig[team.rank];
              if (!cfg) return null;
              return (
                <motion.div key={team.id}
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: team.rank === 1 ? 0 : team.rank === 2 ? 0.1 : 0.2 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  onClick={() => onSelectTeam(team)}
                  className={`relative flex-1 glass-panel rounded-xl p-5 flex flex-col justify-between text-center cursor-pointer border ${cfg.height} ${cfg.border} shadow-xl ${cfg.glow} bg-gradient-to-b from-white/[0.025] to-transparent transition-all duration-300`}>

                  {/* Rank badge */}
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 ${cfg.badge} text-[9px] font-black px-3 py-0.5 rounded-full flex items-center gap-1 shadow-lg whitespace-nowrap`}>
                    <Trophy className="h-2.5 w-2.5" /> {cfg.label} PLACE
                  </div>

                  <div className="pt-3 flex flex-col gap-1">
                    <h3 className="font-display font-black text-base text-white leading-tight">{team.name}</h3>
                    <p className="font-mono text-[9px] text-white/35">{team.tags.length > 0 ? `${team.tags.length} members` : "—"}</p>
                  </div>

                  <div>
                    <span className={`font-display font-black text-3xl ${cfg.textColor}`}>{team.totalPoints}</span>
                    <span className="font-mono text-[9px] text-white/30 block">/ 300 pts</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table — remaining teams */}
      {rest.length > 0 && (
        <div className="glass-panel rounded-xl overflow-hidden border border-white/[0.06] shadow-xl mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] font-mono text-[9px] text-white/30 tracking-widest uppercase">
                  <th className="py-3.5 px-5 text-center w-16">POS</th>
                  <th className="py-3.5 px-5">TEAM</th>
                  <th className="py-3.5 px-5 text-right w-36">TOTAL PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {rest.map(team => (
                  <tr key={team.id} onClick={() => onSelectTeam(team)} className="group hover:bg-white/[0.02] cursor-pointer transition-colors">
                    <td className="py-4 px-5 text-center">
                      <div className="mx-auto w-7 h-7 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center font-mono text-[11px] text-white/50">{team.rank}</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-display font-bold text-sm text-white group-hover:text-primary-red transition-colors">{team.name}</div>
                      {team.tags.length > 0 && (
                        <div className="font-mono text-[9px] text-white/30 mt-0.5">{team.tags.join(" · ")}</div>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex flex-col items-end">
                        <span className="font-display font-black text-sm text-primary-red">{team.totalPoints}</span>
                        <span className="font-mono text-[8px] text-white/20">/ 300</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sorted.length === 0 && (
        <div className="flex flex-col items-center py-20 gap-3">
          <HelpCircle className="h-10 w-10 text-white/10" />
          <span className="font-mono text-xs text-white/25">No teams registered yet</span>
        </div>
      )}

      {/* Scoring breakdown note */}
      <div className="bg-white/[0.015] border border-white/[0.06] p-4 rounded-xl font-mono text-[10px] text-white/35 leading-relaxed">
        Scores are cumulative across all 3 tasks. Each task carries: Circuit Design (30) · Report Submission (30) · Result (40) = 100 pts per task.
      </div>

      {/* Register Team Modal */}
      <AnimatePresence>
        {isRegisterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsRegisterOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.96, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0, y: 16 }}
              className="relative w-full max-w-md bg-[#0D0D10] border border-white/10 rounded-2xl p-7 z-10 shadow-2xl">
              <button onClick={() => setIsRegisterOpen(false)} className="absolute top-4 right-4 text-white/30 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>

              <div className="mb-6">
                <span className="font-mono text-[9px] text-primary-red tracking-widest uppercase">Admin · Registry</span>
                <h2 className="font-display font-black text-2xl text-white mt-1">Register New Team</h2>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Team Name</label>
                  <input type="text" required placeholder="e.g. APEX DYNAMICS" value={formName} onChange={e => setFormName(e.target.value)}
                    className="bg-white/[0.04] border border-white/10 focus:border-primary-red/60 rounded-lg px-3.5 py-2.5 text-sm text-white outline-none font-mono uppercase" />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Team Members</label>
                    <button type="button" onClick={() => setMembers([...members, ""])}
                      className="font-mono text-[9px] bg-primary-red/15 hover:bg-primary-red/25 text-primary-red border border-primary-red/20 px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-colors">
                      <Plus className="h-3 w-3" /> ADD
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
                    {members.map((m, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input type="text" required placeholder={`Member ${i + 1}`} value={m}
                          onChange={e => { const n = [...members]; n[i] = e.target.value; setMembers(n); }}
                          className="flex-1 bg-white/[0.04] border border-white/10 focus:border-primary-red/50 rounded-lg px-3 py-2 text-xs text-white outline-none" />
                        {members.length > 1 && (
                          <button type="button" onClick={() => setMembers(members.filter((_, j) => j !== i))} className="text-white/25 hover:text-primary-red cursor-pointer p-1">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsRegisterOpen(false)}
                    className="flex-1 font-mono text-xs text-white/40 bg-white/[0.04] border border-white/10 px-4 py-2.5 rounded-lg hover:bg-white/[0.07] cursor-pointer transition-colors">CANCEL</button>
                  <button type="submit"
                    className="flex-1 btn-primary-gradient font-mono text-xs font-bold text-white px-4 py-2.5 rounded-lg hover:scale-[1.01] transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
                    <ShieldCheck className="h-3.5 w-3.5" /> REGISTER
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
