import React from "react";
import { Zap, Download, ExternalLink, FileText, Cpu, BookOpen, Layers, Sparkles } from "lucide-react";

export interface ResourceItem {
  id: string;
  title: string;
  category: "Template" | "Software" | "Documentation" | "Guide";
  description: string;
  fileSize?: string;
  icon: any;
  link: string;
}

const RESOURCES: ResourceItem[] = [
  {
    id: "r1",
    title: "MATLAB/Simulink R2026a Power Electronics Setup Guide",
    category: "Software",
    description: "Step-by-step setup instructions for installing MATLAB R2026a with Simscape Electrical and Power Systems Toolboxes.",
    fileSize: "PDF · 2.4 MB",
    icon: Cpu,
    link: "https://drive.google.com/file/d/12Xsby0psAvJR6gGXaD_EpL0zbZKzl0Zd/view?usp=sharing",
  },
  {
    id: "r2",
    title: "SIMVERSE 2.0 Technical Report Template (.docx)",
    category: "Template",
    description: "Official structured report format including sections for topology selection, derivations, scope waveforms, and contributions.",
    fileSize: "DOCX · 450 KB",
    icon: FileText,
    link: "https://drive.google.com/file/d/12Xsby0psAvJR6gGXaD_EpL0zbZKzl0Zd/view?usp=sharing",
  },
  {
    id: "r3",
    title: "Converter Component Calculation Cheat Sheet",
    category: "Guide",
    description: "Formulas for Boost, Buck, and Buck-Boost inductor sizing, output capacitance, current ripple factor, and MOSFET conduction losses.",
    fileSize: "PDF · 1.1 MB",
    icon: Layers,
    link: "https://drive.google.com/file/d/12Xsby0psAvJR6gGXaD_EpL0zbZKzl0Zd/view?usp=sharing",
  },
  {
    id: "r4",
    title: "Simulink Power Electronics Reference Models",
    category: "Documentation",
    description: "Sample reference circuits for basic PWM generator tuning, PI controller setup, and loss measurement scopes.",
    fileSize: "ZIP · 5.8 MB",
    icon: BookOpen,
    link: "https://drive.google.com/file/d/12Xsby0psAvJR6gGXaD_EpL0zbZKzl0Zd/view?usp=sharing",
  },
];

export default function ResourcesPage() {
  return (
    <div className="w-full max-w-5xl mx-auto py-8 sm:py-12 px-3 sm:px-6 md:px-8 mt-14 font-sans text-white">
      
      {/* Header */}
      <div className="relative rounded-2xl p-6 sm:p-10 border border-yellow-500/30 bg-gradient-to-br from-yellow-500/[0.08] via-black/40 to-transparent overflow-hidden mb-10 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[10px] text-yellow-400 font-bold tracking-widest uppercase bg-yellow-400/10 border border-yellow-400/25 px-2.5 py-1 rounded-full">
                PARTICIPANT TOOLKIT
              </span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">Resources & Downloads</h1>
            <p className="font-mono text-sm sm:text-base text-white/60 mt-1">Official templates, calculation guides, software setup, and reference materials.</p>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center shrink-0">
            <span className="font-mono text-[9px] text-white/40 uppercase block mb-0.5">Available Assets</span>
            <span className="font-display font-black text-3xl text-yellow-400">{RESOURCES.length}</span>
          </div>
        </div>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {RESOURCES.map((res) => {
          const Icon = res.icon;
          return (
            <div key={res.id} className="glass-panel rounded-2xl p-6 border border-white/[0.08] hover:border-yellow-400/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center text-yellow-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-[10px] text-white/40 bg-white/[0.05] border border-white/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {res.category}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-white group-hover:text-yellow-400 transition-colors mb-2">
                  {res.title}
                </h3>
                <p className="font-mono text-xs text-white/60 leading-relaxed mb-6">
                  {res.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <span className="font-mono text-[10px] text-white/40">{res.fileSize}</span>
                <a
                  href={res.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs font-bold text-yellow-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Download / View <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resource request box */}
      <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] text-center">
        <Sparkles className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
        <h4 className="font-display font-bold text-white text-base">Need Additional Technical Guidance?</h4>
        <p className="font-mono text-xs text-white/50 mt-1 max-w-md mx-auto">
          Contact your assigned SIMVERSE Phase 2 mentor for simulation clarification and parameter derivation help.
        </p>
      </div>

    </div>
  );
}
