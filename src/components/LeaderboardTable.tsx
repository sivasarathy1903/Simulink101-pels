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
    modelDesign: number;
    simulationAccuracy: number;
    systemPerformance: number;
    innovation: number;
    technicalApproach: number;
    resultAnalysis: number;
    presentation: number;
    tags: string[];
  }) => void;
  isAdmin?: boolean;
}

export default function LeaderboardTable({ teams, onSelectTeam, onRegisterTeam, isAdmin = false }: LeaderboardTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"rank" | "points" | "name">("rank");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formInstitution, setFormInstitution] = useState("");
  const [formTags, setFormTags] = useState<string[]>(["PID"]);
  const [formMetrics, setFormMetrics] = useState({
    modelDesign: 85,
    simulationAccuracy: 80,
    systemPerformance: 75,
    innovation: 70,
    technicalApproach: 65,
    resultAnalysis: 60,
    presentation: 70,
  });

  const tagOptions = ["PID", "Inverter", "LCL Filter", "Buck-Boost", "SMC", "ZVS", "SVPWM", "Grid-Tie", "GaN", "SiC"];

  // Collect all unique tags dynamically
  const allTags = Array.from(new Set(teams.flatMap((t) => t.tags || [])));

  // Filter teams
  const filteredTeams = teams
    .filter((team) => {
      const matchesSearch =
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.institution.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = selectedTag ? team.tags.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === "rank") return a.rank - b.rank;
      if (sortBy === "points") return b.totalPoints - a.totalPoints;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  const toggleTagSelection = (tag: string) => {
    if (formTags.includes(tag)) {
      setFormTags(formTags.filter((t) => t !== tag));
    } else {
      setFormTags([...formTags, tag]);
    }
  };

  const handleMetricChange = (key: keyof typeof formMetrics, value: number) => {
    setFormMetrics({
      ...formMetrics,
      [key]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formInstitution.trim()) return;

    onRegisterTeam({
      name: formName.trim().toUpperCase(),
      institution: formInstitution.trim(),
      ...formMetrics,
      tags: formTags.length > 0 ? formTags : ["PID"],
    });

    // Reset Form
    setFormName("");
    setFormInstitution("");
    setFormTags(["PID"]);
    setFormMetrics({
      modelDesign: 85,
      simulationAccuracy: 80,
      systemPerformance: 75,
      innovation: 70,
      technicalApproach: 65,
      resultAnalysis: 60,
      presentation: 70,
    });
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

      {/* Search and Tag filters */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 mb-8">
        
        {/* Search Input bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Search teams or institution..."
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

        {/* Tag Pills */}
        <div className="flex flex-wrap items-center gap-2 max-w-xl">
          <span className="font-mono text-[10px] text-white/40 flex items-center gap-1 uppercase mr-1">
            <Filter className="h-3 w-3" /> Filters:
          </span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`font-mono text-[10px] px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
              selectedTag === null
                ? "bg-primary-red/10 border-primary-red text-primary-red"
                : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/25"
            }`}
          >
            ALL
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`font-mono text-[10px] px-3 py-1.5 rounded-full border transition-all uppercase cursor-pointer ${
                selectedTag === tag
                  ? "bg-primary-red/10 border-primary-red text-primary-red font-bold"
                  : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/25"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Sorting options */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-white/40 uppercase">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white/5 border border-white/10 text-white font-mono text-[11px] px-3 py-1.5 rounded outline-none cursor-pointer focus:border-primary-red"
          >
            <option value="rank" className="bg-[#0A0A0A] text-white">Rankings</option>
            <option value="points" className="bg-[#0A0A0A] text-white">Top Points</option>
            <option value="name" className="bg-[#0A0A0A] text-white">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Main stand table with F1 telemetry dashboard style */}
      <div className="glass-panel rounded-lg overflow-hidden border border-white/10 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.01] font-mono text-[11px] text-white/55 tracking-wider uppercase">
                <th className="py-4 px-6 text-center w-20">POS</th>
                <th className="py-4 px-6 min-w-[220px]">TEAM CREDENTIALS</th>
                <th className="py-4 px-4 text-center hidden md:table-cell">MODEL DESIGN</th>
                <th className="py-4 px-4 text-center hidden lg:table-cell">ACCURACY</th>
                <th className="py-4 px-4 text-center hidden lg:table-cell">PERFORMANCE</th>
                <th className="py-4 px-6 text-right hidden sm:table-cell w-36">LAST UPDATED</th>
                <th className="py-4 px-6 text-right w-32">SCORE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTeams.length > 0 ? (
                filteredTeams.map((team) => {
                  // Style top positions differently
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
                            {team.institution}
                          </span>
                          
                          {/* Tags indicator */}
                          <div className="flex gap-1.5 mt-1.5">
                            {team.tags?.map((t) => (
                              <span key={t} className="font-mono text-[8px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded-[2px] uppercase">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Model Design Score */}
                      <td className="py-5 px-4 text-center hidden md:table-cell font-mono text-xs">
                        <div className="flex flex-col items-center">
                          <span className="text-white font-medium">{team.metrics.modelDesign}</span>
                          <div className="w-12 bg-white/10 h-1 mt-1 rounded-full overflow-hidden">
                            <div className="bg-primary-red h-full" style={{ width: `${team.metrics.modelDesign}%` }}></div>
                          </div>
                        </div>
                      </td>

                      {/* Accuracy Score */}
                      <td className="py-5 px-4 text-center hidden lg:table-cell font-mono text-xs">
                        <div className="flex flex-col items-center">
                          <span className="text-white font-medium">{team.metrics.simulationAccuracy}</span>
                          <div className="w-12 bg-white/10 h-1 mt-1 rounded-full overflow-hidden">
                            <div className="bg-primary-red h-full" style={{ width: `${team.metrics.simulationAccuracy}%` }}></div>
                          </div>
                        </div>
                      </td>

                      {/* Performance Score */}
                      <td className="py-5 px-4 text-center hidden lg:table-cell font-mono text-xs">
                        <div className="flex flex-col items-center">
                          <span className="text-white font-medium">{team.metrics.systemPerformance}</span>
                          <div className="w-12 bg-white/10 h-1 mt-1 rounded-full overflow-hidden">
                            <div className="bg-primary-red h-full" style={{ width: `${team.metrics.systemPerformance}%` }}></div>
                          </div>
                        </div>
                      </td>

                      {/* Last Updated column */}
                      <td className="py-5 px-6 text-right hidden sm:table-cell font-mono text-xs text-white/50">
                        <div className="flex items-center justify-end gap-1.5">
                          <Timer className="h-3.5 w-3.5 text-white/30" />
                          <span>{team.lastUpdated}</span>
                        </div>
                      </td>

                      {/* Total Score column with bright red telemetry background */}
                      <td className="py-5 px-6 text-right">
                        <div className="inline-flex flex-col items-end">
                          <div className="bg-primary-red/10 border border-primary-red/25 px-3 py-1.5 rounded-sm font-display font-black text-sm text-primary-red group-hover:bg-primary-red group-hover:text-white transition-all duration-300">
                            {team.totalPoints}
                          </div>
                          <span className="font-mono text-[8px] text-white/30 mt-1 uppercase">MAX 700</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 px-6 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <HelpCircle className="h-10 w-10 text-white/20 animate-bounce" />
                      <span className="font-mono text-xs text-white/40 uppercase">NO CONTROLLERS MATCH YOUR FILTERS</span>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedTag(null);
                        }}
                        className="font-mono text-[10px] bg-white/5 border border-white/10 text-white hover:bg-white/10 px-3 py-1.5 rounded cursor-pointer"
                      >
                        RESET SEARCH
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology Section embedded at the footer for high professionality */}
      <div className="mt-16 bg-white/[0.01] border border-white/5 p-6 rounded-lg font-sans">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="h-5 w-5 text-primary-red" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">IEEE PELS EVALUATION METRICS</h3>
        </div>
        <p className="text-white/60 text-xs leading-relaxed max-w-5xl">
          The IEEE Power Electronics Society SIMULINK 101 competition judges submissions dynamically inside a custom automated virtual test-bed. Scoring uses real-time simulation tracking to test step response, settling overshoot thresholds, active dampening resonance, and hardware converter harmonic efficiency under steady-state load conditions. Teams can adjust and optimize block variables continuously.
        </p>
      </div>

      {/* Dynamic Team Registration Modal */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRegisterModalOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Body container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-2xl bg-brand-black border border-white/15 rounded-md shadow-2xl p-6 overflow-y-auto max-h-[90vh] z-10 scrollbar-thin"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6 pb-4 border-b border-white/10">
                <span className="font-mono text-[10px] text-primary-red uppercase tracking-widest block mb-1">IEEE PELS REGISTRY</span>
                <h2 className="font-display font-extrabold text-2xl text-white">REGISTER COMPETITOR TEAM</h2>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                {/* Team Name and Institution Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-white/70">TEAM NAME</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VECTOR_FLUX"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="bg-white/5 border border-white/10 focus:border-primary-red rounded-sm px-3.5 py-2 text-sm text-white outline-none font-mono uppercase"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-white/70">INSTITUTION / CHAPTER</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SSN College of Engineering"
                      value={formInstitution}
                      onChange={(e) => setFormInstitution(e.target.value)}
                      className="bg-white/5 border border-white/10 focus:border-primary-red rounded-sm px-3.5 py-2 text-sm text-white outline-none"
                    />
                  </div>
                </div>

                {/* Tags multi-selection */}
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs text-white/70 uppercase">FILTER CONSTRAINTS / TAGS (select active blocks)</label>
                  <div className="flex flex-wrap gap-2">
                    {tagOptions.map((tag) => {
                      const isSelected = formTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTagSelection(tag)}
                          className={`font-mono text-[10px] px-3 py-1.5 rounded-full border transition-all cursor-pointer uppercase ${
                            isSelected
                              ? "bg-primary-red/10 border-primary-red text-primary-red font-bold"
                              : "bg-white/5 border-white/10 text-white/50 hover:text-white"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Score Sliders Panel */}
                <div className="bg-white/[0.02] border border-white/10 rounded p-4 flex flex-col gap-4">
                  <div className="font-mono text-xs text-white border-b border-white/5 pb-2 uppercase tracking-wide">
                    📊 Simulation Scores Calibration (Out of 100)
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Model Design */}
                    <div>
                      <div className="flex justify-between font-mono text-[11px] text-white/70 mb-1">
                        <span>MODEL DESIGN</span>
                        <span className="text-primary-red font-bold">{formMetrics.modelDesign}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formMetrics.modelDesign}
                        onChange={(e) => handleMetricChange("modelDesign", parseInt(e.target.value))}
                        className="w-full accent-primary-red bg-white/10 h-1 rounded-full cursor-pointer"
                      />
                    </div>

                    {/* Simulation Accuracy */}
                    <div>
                      <div className="flex justify-between font-mono text-[11px] text-white/70 mb-1">
                        <span>SIMULATION ACCURACY</span>
                        <span className="text-primary-red font-bold">{formMetrics.simulationAccuracy}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formMetrics.simulationAccuracy}
                        onChange={(e) => handleMetricChange("simulationAccuracy", parseInt(e.target.value))}
                        className="w-full accent-primary-red bg-white/10 h-1 rounded-full cursor-pointer"
                      />
                    </div>

                    {/* System Performance */}
                    <div>
                      <div className="flex justify-between font-mono text-[11px] text-white/70 mb-1">
                        <span>SYSTEM PERFORMANCE</span>
                        <span className="text-primary-red font-bold">{formMetrics.systemPerformance}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formMetrics.systemPerformance}
                        onChange={(e) => handleMetricChange("systemPerformance", parseInt(e.target.value))}
                        className="w-full accent-primary-red bg-white/10 h-1 rounded-full cursor-pointer"
                      />
                    </div>

                    {/* Innovation */}
                    <div>
                      <div className="flex justify-between font-mono text-[11px] text-white/70 mb-1">
                        <span>INNOVATION</span>
                        <span className="text-primary-red font-bold">{formMetrics.innovation}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formMetrics.innovation}
                        onChange={(e) => handleMetricChange("innovation", parseInt(e.target.value))}
                        className="w-full accent-primary-red bg-white/10 h-1 rounded-full cursor-pointer"
                      />
                    </div>

                    {/* Technical Approach */}
                    <div>
                      <div className="flex justify-between font-mono text-[11px] text-white/70 mb-1">
                        <span>TECHNICAL APPROACH</span>
                        <span className="text-primary-red font-bold">{formMetrics.technicalApproach}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formMetrics.technicalApproach}
                        onChange={(e) => handleMetricChange("technicalApproach", parseInt(e.target.value))}
                        className="w-full accent-primary-red bg-white/10 h-1 rounded-full cursor-pointer"
                      />
                    </div>

                    {/* Result Analysis */}
                    <div>
                      <div className="flex justify-between font-mono text-[11px] text-white/70 mb-1">
                        <span>RESULT ANALYSIS</span>
                        <span className="text-primary-red font-bold">{formMetrics.resultAnalysis}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formMetrics.resultAnalysis}
                        onChange={(e) => handleMetricChange("resultAnalysis", parseInt(e.target.value))}
                        className="w-full accent-primary-red bg-white/10 h-1 rounded-full cursor-pointer"
                      />
                    </div>

                    {/* Presentation */}
                    <div className="sm:col-span-2">
                      <div className="flex justify-between font-mono text-[11px] text-white/70 mb-1">
                        <span>PRESENTATION</span>
                        <span className="text-primary-red font-bold">{formMetrics.presentation}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formMetrics.presentation}
                        onChange={(e) => handleMetricChange("presentation", parseInt(e.target.value))}
                        className="w-full accent-primary-red bg-white/10 h-1 rounded-full cursor-pointer"
                      />
                    </div>
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
                    SUBMIT TO LEADERBOARD
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
