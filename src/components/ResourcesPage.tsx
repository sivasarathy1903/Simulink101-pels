import React from "react";
import { Sparkles, Video, FileText, Layers, ExternalLink, Zap, Folder } from "lucide-react";

export default function ResourcesPage() {
  const resources = [
    {
      id: "videos",
      title: "Resource Videos",
      category: "Video Tutorials & Walkthroughs",
      description: "Step-by-step video guides, MATLAB Simulink setup walkthroughs, and converter simulation modeling demonstrations.",
      link: "https://drive.google.com/drive/folders/1UcHADTtgwgFD4OFOT_RiDgsGRL-d6NEj?usp=drive_link",
      icon: Video,
      badge: "Watch & Learn",
      color: "from-red-500/20 to-red-600/5 border-red-500/30 text-red-400",
      btnColor: "bg-red-600 hover:bg-red-500 text-white shadow-red-600/25",
    },
    {
      id: "reports",
      title: "Reference Report",
      category: "Technical Report Formatting",
      description: "Official report layout template, technical analysis format, waveform presentation guidelines, and evaluation breakdown.",
      link: "https://drive.google.com/drive/folders/1qHFDXb4NIM8nR3wPfCxWvd1AJV_DQmxw?usp=drive_link",
      icon: FileText,
      badge: "Official Template",
      color: "from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400",
      btnColor: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25",
    },
    {
      id: "circuits",
      title: "Reference Circuit Diagrams",
      category: "Topology Schematics & Maps",
      description: "High-resolution converter circuit diagrams, power stage schematics, switching node details, and parameter references.",
      link: "https://drive.google.com/drive/folders/1okh4ZenOcmrUaBbazsSsw07k-jn1pKS-?usp=drive_link",
      icon: Layers,
      badge: "Circuit Schematics",
      color: "from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400",
      btnColor: "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/25",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto py-10 sm:py-16 px-4 sm:px-8 mt-14 font-sans text-white">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="font-mono text-xs font-bold text-primary-red tracking-widest uppercase bg-primary-red/10 border border-primary-red/25 px-3.5 py-1.5 rounded-full inline-block mb-3">
          SIMVERSE 2.0 · PARTICIPANT TOOLKIT
        </span>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight mb-3">
          Participant Resources
        </h1>
        <p className="font-mono text-xs sm:text-sm text-white/60 leading-relaxed">
          Access official video tutorials, reference technical reports, and circuit schematics to design, simulate, and present your power converter models.
        </p>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {resources.map((res) => {
          const Icon = res.icon;
          return (
            <div
              key={res.id}
              className="relative rounded-2xl p-6 sm:p-8 border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent hover:border-white/20 transition-all duration-300 flex flex-col justify-between group shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-5">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${res.color} border flex items-center justify-center`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-[9px] font-bold text-white/50 bg-white/[0.04] border border-white/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {res.badge}
                  </span>
                </div>

                <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest block mb-1">
                  {res.category}
                </span>

                <h2 className="font-display font-black text-2xl text-white mb-3 group-hover:text-primary-red transition-colors">
                  {res.title}
                </h2>

                <p className="font-sans text-xs sm:text-sm text-white/65 leading-relaxed mb-6">
                  {res.description}
                </p>
              </div>

              <a
                href={res.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full font-mono text-xs font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${res.btnColor}`}
              >
                <Folder className="h-4 w-4" /> OPEN GOOGLE DRIVE <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          );
        })}
      </div>

      {/* Additional Guidelines Note */}
      <div className="mt-12 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-white/60">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-yellow-400 shrink-0" />
          <span>All resource materials are hosted on official IEEE PELS Google Drive folders with open participant access.</span>
        </div>
        <span className="text-white/30 text-[10px] shrink-0">Updated Phase 2</span>
      </div>

    </div>
  );
}
