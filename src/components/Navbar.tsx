/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, FileText, Cpu, Compass, HelpCircle, LogIn, LogOut, User } from "lucide-react";
import { UserSession } from "../types";

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  session: UserSession;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function Navbar({ currentTab, onTabChange, session, onOpenAuth, onLogout }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-100 shadow-3xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <button 
          onClick={() => onTabChange("home")}
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-700/20 group-hover:bg-blue-800 transition active:scale-95 duration-200">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-700 transition">Resumify</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-100 font-bold uppercase rounded-md">V1.0</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Free AI-Powered Builder</p>
          </div>
        </button>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5">
          {[
            { id: "home", label: "Home", icon: Compass },
            { id: "builder", label: "Resume Builder", icon: FileText },
            { id: "ai-builder", label: "Full AI Architect", icon: Cpu },
            { id: "parser", label: "PDF Parse & Edit", icon: Sparkles },
            { id: "about", label: "About", icon: HelpCircle },
          ].map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                  isActive 
                    ? "bg-slate-100 text-slate-900" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? "text-blue-700" : "text-slate-400"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Auth status or login button */}
        <div className="flex items-center gap-3">
          {session.isLoggedIn ? (
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800">{session.fullName}</p>
                <p className="text-[9px] text-slate-400 font-mono">{session.email}</p>
              </div>
              <img 
                src={session.avatarUrl} 
                alt={session.fullName} 
                className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50 shadow-3xs shrink-0" 
              />
              <button
                onClick={onLogout}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition active:scale-[0.97] flex items-center gap-1.5 shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
