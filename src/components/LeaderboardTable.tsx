import React, { useState } from "react";
import { Search, Trophy, ArrowRight, RotateCcw, Filter, UserCheck, Timer, HelpCircle, Plus, X, ShieldCheck } from "lucide-react";
import { Team } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface LeaderboardTableProps {
  teams: Team[];
  onSelectTeam: (team: Team) => void;
  onRegisterTeam: (newTeamData: {
    name: string;
    institution: string;
    circuitDesign: number;
    reportSubmission: number;
    result: number;
    tags: string[];
  }) => void;
  isAdmin?: boolean;
}

export default function LeaderboardTable({ teams, onSelectTeam, onRegisterTeam, isAdmin = false }: LeaderboardTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [members, setMembers] = useState<string[]>([""]);

  // Filter teams (excluding special config team)
  const filteredTeams = teams
    .filter((team) => {
      if (team.name === "__EVENT_CONFIG__") return false;
      const matchesSearch =
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    })
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((team, idx) => ({ ...team, rank: idx + 1 }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    onRegisterTeam({
      name: formName.trim().toUpperCase(),
      institution: "SIMVERSE",
      circuitDesign: 0,
      reportSubmission: 0,
      result: 0,
      tags: members.filter((m) => m.trim() !== ""),
    });

    // Reset Form
    setFormName("");
    setMembers([""]);
    setIsRegisterModalOpen(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4 md:px-8 mt-16 font-sans">
      
      {/* Table Header Section */}
      <div className="border-b border-white/10 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="font-mono text-xs text-primary-red uppercase tracking-widest block mb-1">CHALLENGE STANDINGS</span>
          <h1 className="font-display font-extrabold text-3xl md:text-5xl text-white tracking-tight">
            LIVE LEADERBOARD
          </h1>
        </div>
        
        {/* Registration Modal trigger (Admin Only) */}
        {isAdmin && (
          <div className="flex gap-4">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="btn-primary-gradient text-white font-mono text-xs font-bold px-5 py-3 rounded-sm flex items-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-primary-red/10 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              REGISTER NEW TEAM
            </button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Search teams or members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/10 focus:border-primary-red text-sm text-white pl-10 pr-4 py-2.5 outline-none rounded-sm transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-mono text-white/40 hover:text-white cursor-pointer"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Podium Section for top 3 teams */}
      {filteredTeams.length >= 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end max-w-4xl mx-auto">
          
          {/* 2nd Place */}
          {filteredTeams[1] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => onSelectTeam(filteredTeams[1])}
              className="glass-panel p-6 rounded-lg text-center relative border-slate-400/20 hover:border-slate-400/50 cursor-pointer order-2 md:order-1 h-44 flex flex-col justify-between"
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-400 border border-slate-300 text-black text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Trophy className="h-3 w-3" /> 2ND PLACE
              </div>
              <div className="mt-2">
                <h3 className="font-display font-extrabold text-xl text-white tracking-tight">
                  {filteredTeams[1].name}
                </h3>
                <p className="font-mono text-[10px] text-white/50 uppercase mt-1">
                  {filteredTeams[1].tags?.length || 0} Members
                </p>
              </div>
              <div className="font-display font-black text-3xl text-slate-300">
                {filteredTeams[1].totalPoints} <span className="text-xs font-mono text-white/40">PTS</span>
              </div>
            </motion.div>
          )}

          {/* 1st Place */}
          {filteredTeams[0] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-8 rounded-lg text-center relative border-yellow-500/40 hover:border-yellow-500/70 cursor-pointer order-1 md:order-2 h-52 flex flex-col justify-between bg-gradient-to-b from-yellow-500/[0.05] to-transparent shadow-xl shadow-yellow-500/5"
              onClick={() => onSelectTeam(filteredTeams[0])}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-500 border border-yellow-400 text-black text-sm font-black px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg animate-bounce">
                <Trophy className="h-3.5 w-3.5 fill-black" /> 1ST PLACE
              </div>
              <div className="mt-2">
                <h3 className="font-display font-black text-2xl text-white tracking-tight">
                  {filteredTeams[0].name}
                </h3>
                <p className="font-mono text-[10px] text-yellow-400/80 uppercase mt-1 tracking-wider font-bold">
                  🏆 TOP STANDING
                </p>
              </div>
              <div className="font-display font-black text-4xl text-yellow-400">
                {filteredTeams[0].totalPoints} <span className="text-xs font-mono text-white/40">PTS</span>
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {filteredTeams[2] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => onSelectTeam(filteredTeams[2])}
              className="glass-panel p-6 rounded-lg text-center relative border-amber-600/20 hover:border-amber-600/50 cursor-pointer order-3 h-40 flex flex-col justify-between"
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-600 border border-amber-500 text-black text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Trophy className="h-3 w-3" /> 3RD PLACE
              </div>
              <div className="mt-2">
                <h3 className="font-display font-extrabold text-xl text-white tracking-tight">
                  {filteredTeams[2].name}
                </h3>
                <p className="font-mono text-[10px] text-white/50 uppercase mt-1">
                  {filteredTeams[2].tags?.length || 0} Members
                </p>
              </div>
              <div className="font-display font-black text-2xl text-amber-500">
                {filteredTeams[2].totalPoints} <span className="text-xs font-mono text-white/40">PTS</span>
              </div>
            </motion.div>
          )}

        </div>
      )}

      {/* Main Leaderboard Table */}
      <div className="glass-panel rounded-lg overflow-hidden border border-white/10 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.01] font-mono text-[11px] text-white/55 tracking-wider uppercase">
                <th className="py-4 px-6 text-center w-20">POS</th>
                <th className="py-4 px-6">TEAM NAME</th>
                <th className="py-4 px-6 text-right w-44">TOTAL POINTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTeams.length > 0 ? (
                filteredTeams.map((team) => {
                  const isTopThree = team.rank <= 3;
                  const rankColors =
                    team.rank === 1
                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      : team.rank === 2
                      ? "bg-slate-300/10 text-slate-300 border-slate-300/20"
                      : team.rank === 3
                      ? "bg-amber-600/10 text-amber-500 border-amber-500/20"
                      : "bg-white/5 text-white/50 border-white/10";

                  return (
                    <tr
                      key={team.id}
                      onClick={() => onSelectTeam(team)}
                      className="group hover:bg-white/[0.015] active:bg-white/[0.03] cursor-pointer transition-colors duration-300"
                    >
                      {/* Rank POS column */}
                      <td className="py-5 px-6 text-center">
                        <div className={`mx-auto w-8 h-8 rounded-full border flex items-center justify-center font-display font-black text-sm ${rankColors}`}>
                          {team.rank}
                        </div>
                      </td>

                      {/* Team Credentials column */}
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-display font-extrabold text-sm text-white group-hover:text-primary-red transition-colors flex items-center gap-2">
                            {team.name}
                            {isTopThree && (
                              <Trophy className={`h-3.5 w-3.5 ${
                                team.rank === 1 ? 'text-yellow-400' : team.rank === 2 ? 'text-slate-300' : 'text-amber-500'
                              }`} />
                            )}
                          </span>
                          <span className="font-mono text-[10px] text-white/45 tracking-wide flex items-center gap-1.5 uppercase">
                            {team.tags?.join(" • ") || "No members registered"}
                          </span>
                        </div>
                      </td>

                      {/* Total Score column */}
                      <td className="py-5 px-6 text-right">
                        <div className="inline-flex flex-col items-end">
                          <div className="bg-primary-red/10 border border-primary-red/25 px-3 py-1.5 rounded-sm font-display font-black text-sm text-primary-red group-hover:bg-primary-red group-hover:text-white transition-all duration-300">
                            {team.totalPoints}
                          </div>
                          <span className="font-mono text-[8px] text-white/30 mt-1 uppercase">MAX 100</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="py-16 px-6 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <HelpCircle className="h-10 w-10 text-white/20 animate-bounce" />
                      <span className="font-mono text-xs text-white/40 uppercase">NO TEAMS REGISTERED YET</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology Section */}
      <div className="mt-16 bg-white/[0.01] border border-white/5 p-6 rounded-lg font-sans">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="h-5 w-5 text-primary-red" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">SIMVERSE EVENT RULES</h3>
        </div>
        <p className="text-white/60 text-xs leading-relaxed max-w-5xl">
          Evaluation is conducted by event administrators. Grading split-ups are based on: Circuit Design (30%), Report Submission (30%), and Result parameters validation (40%). All tasks are released dynamically in real-time.
        </p>
      </div>

      {/* Dynamic Team Registration Modal */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRegisterModalOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-brand-black border border-white/15 rounded-md shadow-2xl p-6 overflow-y-auto max-h-[90vh] z-10 scrollbar-thin"
            >
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6 pb-4 border-b border-white/10">
                <span className="font-mono text-[10px] text-primary-red uppercase tracking-widest block mb-1">IEEE PELS REGISTRY</span>
                <h2 className="font-display font-extrabold text-2xl text-white">REGISTER NEW TEAM</h2>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                {/* Team Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-white/70">TEAM NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. APEX DYNAMICS"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="bg-white/5 border border-white/10 focus:border-primary-red rounded-sm px-3.5 py-2 text-sm text-white outline-none font-mono uppercase"
                  />
                </div>

                {/* Team Members List */}
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs text-white/70 uppercase flex justify-between items-center">
                    <span>TEAM MEMBERS</span>
                    <button
                      type="button"
                      onClick={() => setMembers([...members, ""])}
                      className="text-[10px] bg-primary-red/15 hover:bg-primary-red/30 text-primary-red border border-primary-red/20 px-2.5 py-1 rounded flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> ADD MEMBER
                    </button>
                  </label>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                    {members.map((member, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          required
                          placeholder={`Member ${index + 1} Name`}
                          value={member}
                          onChange={(e) => {
                            const newMembers = [...members];
                            newMembers[index] = e.target.value;
                            setMembers(newMembers);
                          }}
                          className="flex-grow bg-white/5 border border-white/10 focus:border-primary-red rounded-sm px-3 py-1.5 text-xs text-white outline-none"
                        />
                        {members.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setMembers(members.filter((_, i) => i !== index))}
                            className="text-white/40 hover:text-primary-red cursor-pointer p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsRegisterModalOpen(false)}
                    className="font-mono text-xs text-white/70 bg-white/5 border border-white/10 px-5 py-2.5 rounded-sm hover:bg-white/10 cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="btn-primary-gradient font-mono text-xs font-bold text-white px-6 py-2.5 rounded-sm hover:scale-[1.02] transition-transform flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    SUBMIT TEAM
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
