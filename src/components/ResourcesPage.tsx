import React from "react";
import { Sparkles, Clock, Lock, ShieldAlert, FileText, Cpu, BookOpen } from "lucide-react";

export default function ResourcesPage() {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 sm:py-16 px-4 sm:px-8 mt-14 font-sans text-white text-center">
      
      {/* Locked / Yet to release Hero */}
      <div className="relative rounded-3xl p-8 sm:p-14 border border-white/10 bg-gradient-to-br from-white/[0.04] via-black/60 to-transparent overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 flex flex-col items-center max-w-xl mx-auto">
          
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-yellow-400 mb-6 shadow-xl shadow-yellow-500/10">
            <Lock className="h-8 sm:h-10 w-8 sm:w-10" />
          </div>

          <span className="font-mono text-xs font-bold text-yellow-400 tracking-widest uppercase bg-yellow-500/10 border border-yellow-500/25 px-3.5 py-1.5 rounded-full mb-4">
            PARTICIPANT TOOLKIT
          </span>

          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight mb-3">
            Resources Are Yet To Be Released
          </h1>

          <p className="font-mono text-xs sm:text-sm text-white/50 leading-relaxed mb-8">
            Official simulation templates, MATLAB calculation cheat sheets, and problem statement guides will be unlocked during the orientation session.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full font-mono text-xs">
            <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-xl flex flex-col items-center gap-1.5 opacity-50">
              <Cpu className="h-5 w-5 text-yellow-400" />
              <span className="font-bold text-white text-[11px]">MATLAB Setup</span>
              <span className="text-[9px] text-white/40">R2026a Guide</span>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-xl flex flex-col items-center gap-1.5 opacity-50">
              <FileText className="h-5 w-5 text-yellow-400" />
              <span className="font-bold text-white text-[11px]">Report Template</span>
              <span className="text-[9px] text-white/40">Official .docx</span>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-xl flex flex-col items-center gap-1.5 opacity-50">
              <BookOpen className="h-5 w-5 text-yellow-400" />
              <span className="font-bold text-white text-[11px]">Formula Sheet</span>
              <span className="text-[9px] text-white/40">Converter Derivations</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.08] w-full flex items-center justify-center gap-2 font-mono text-[11px] text-white/35">
            <Clock className="h-3.5 w-3.5 text-yellow-400 animate-spin" /> Check back after Phase 2 Orientation on 21 August 2026
          </div>

        </div>
      </div>

    </div>
  );
}
