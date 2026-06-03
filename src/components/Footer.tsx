/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { FileText, Cpu, Linkedin, Mail, ShieldCheck } from "lucide-react";

interface FooterProps {
  onTabChange: (tab: string) => void;
}

export default function Footer({ onTabChange }: FooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-12 mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Pitch Statement */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2 text-white">
            <div className="w-6 h-6 rounded bg-blue-700 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-black tracking-tight">Resumify</span>
          </div>
          <p className="leading-relaxed text-slate-400">
            Completely free, modern, and AI-assisted resume-building workspace helping freshers, students, and senior professionals create job-ready CV dossiers within minutes.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Encrypted locally & privacy compliant.</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase text-white tracking-widest">Platform Services</h4>
          <ul className="space-y-2">
            {[
              { id: "home", label: "Home Page" },
              { id: "builder", label: "Interactive Resume Builder" },
              { id: "ai-builder", label: "Complete AI CV Generator" },
              { id: "parser", label: "PDF Parser & Extraction Tool" },
              { id: "about", label: "Team & Project Philosophy" },
            ].map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => onTabChange(link.id)}
                  className="hover:text-white transition text-xs font-medium text-slate-400"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Team Developers Information */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase text-white tracking-widest">Developers</h4>
          <p className="leading-relaxed">
            Resumify is designed, engineered, and fine-tuned by:
          </p>
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between text-white font-semibold">
              <span>ANUNAND P.R</span>
              <span className="text-[10px] text-slate-500">Developer & Designer</span>
            </div>
            <div className="flex items-center justify-between text-white font-semibold">
              <span>AKASH SUNIL</span>
              <span className="text-[10px] text-slate-500">Full-Stack Architect</span>
            </div>
          </div>
          <div className="flex gap-3 pt-3 border-t border-slate-800 text-slate-500">
            <span className="text-[10px]">V1.0 MVP Launch</span>
            <span>•</span>
            <span className="text-[10px]">Copyright © 2026 Resumify</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
