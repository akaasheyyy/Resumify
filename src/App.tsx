/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ResumeForm from "./components/ResumeForm";
import ResumePreview from "./components/ResumePreview";
import AiBuilder from "./components/AiBuilder";
import AuthModal from "./components/AuthModal";
import { DEFAULT_RESUME_DATA } from "./data";
import { ResumeData, UserSession } from "./types";
import { 
  Sparkles, FileText, Download, RotateCcw, AlertCircle, CheckCircle, 
  ArrowRight, Shield, Layers, HelpCircle, User, Mail, Send, Check 
} from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [resumeData, setResumeData] = useState<ResumeData>(DEFAULT_RESUME_DATA);
  const [authIsOpen, setAuthIsOpen] = useState(false);
  const [session, setSession] = useState<UserSession>({
    email: "",
    fullName: "",
    isLoggedIn: false,
  });

  // AI Connection checks
  const [aiStatus, setAiStatus] = useState({ status: "checking", message: "Contacting AI models..." });

  // Contact Form state representation
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Print ref
  const printRef = useRef<HTMLDivElement>(null);

  // Fetch status on startup
  useEffect(() => {
    fetch("/api/ai/status")
      .then(res => res.json())
      .then(data => {
        setAiStatus(data);
      })
      .catch((err) => {
        console.error(err);
        setAiStatus({ status: "missing_key", message: "AI engines are offline. Configure process.env.GEMINI_API_KEY in secrets." });
      });

    // Check pre-saved session helper
    const storedSessionHelper = localStorage.getItem("resumify_session");
    if (storedSessionHelper) {
      try {
        setSession(JSON.parse(storedSessionHelper));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  // Login handler
  const handleLoginSuccess = (user: UserSession) => {
    setSession(user);
    localStorage.setItem("resumify_session", JSON.stringify(user));
  };

  const handleLogout = () => {
    const freshSession = { email: "", fullName: "", isLoggedIn: false };
    setSession(freshSession);
    localStorage.removeItem("resumify_session");
  };

  // Parser Integration
  const handleDataParsed = (parsedDetails: Partial<ResumeData>) => {
    setResumeData((prev) => ({
      ...prev,
      personal: { ...prev.personal, ...(parsedDetails.personal || {}) },
      education: parsedDetails.education || prev.education,
      experience: parsedDetails.experience || prev.experience,
      skills: parsedDetails.skills || prev.skills,
      projects: parsedDetails.projects || prev.projects,
      certifications: parsedDetails.certifications || prev.certifications,
      languages: parsedDetails.languages || prev.languages,
    }));
  };

  // PDF Printing trigger
  const handlePrintPdf = () => {
    window.print();
  };

  // Reset core resume to original state
  const handleResetRestore = () => {
    if (window.confirm("Are you sure you want to restore the default sample resume data? This will overwrite your current progress.")) {
      setResumeData(DEFAULT_RESUME_DATA);
    }
  };

  // Clear resume completely for a blank start
  const handleClearForm = () => {
    if (window.confirm("Are you sure you want to clear your entire resume? This will wipe the fields.")) {
      setResumeData({
        personal: { fullName: "", jobTitle: "", email: "", phone: "", address: "", linkedin: "", website: "", summary: "" },
        education: [],
        experience: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: [],
        selectedTemplate: "modern",
        selectedColor: "#1e3a8a",
      });
    }
  };

  // Submitting Contact Us
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      alert("Please fill in all blanks.");
      return;
    }
    setContactSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: "", email: "", message: "" });
      setContactSubmitted(false);
      alert("Thank you! Your suggestion has been directed to ANUNAND P.R & AKASH SUNIL.");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar 
        currentTab={currentTab} 
        onTabChange={setCurrentTab} 
        session={session} 
        onOpenAuth={() => setAuthIsOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: Home Dashboard */}
        {currentTab === "home" && (
          <div className="space-y-16 py-4 animate-fadeIn">
            {/* Hero Panel */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 text-slate-900">
              <div className="max-w-xl space-y-6">
                <div>
                  <span className="px-3.5 py-1 text-[11px] font-bold tracking-widest text-blue-700 bg-blue-50 border border-blue-150 rounded-full uppercase">
                    ✨ Elevate Your Engineering Profile
                  </span>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight mt-4 leading-tight">
                    Create ATS-Ready Resumes in <span className="text-blue-700">Minutes.</span>
                  </h1>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-semibold">
                  Resumify is the ultimate free CV workspace. Leverage server-side Gemini models to instantly optimize accomplishments, structure portfolios, and parse raw text into gorgeous vector PDF documents.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => setCurrentTab("builder")}
                    className="px-5 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition active:scale-[0.98] flex items-center gap-1.5 shadow-md shadow-blue-700/10"
                  >
                    Create Resume Free <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentTab("ai-builder")}
                    className="px-5 py-3 border border-slate-200 hover:border-slate-350 bg-white text-slate-800 font-bold rounded-xl text-xs transition active:scale-[0.98] flex items-center gap-2 shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" /> Full AI Generation
                  </button>
                </div>
              </div>

              {/* Decorative Mockup */}
              <div className="w-full lg:max-w-md shrink-0 block relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-700 to-sky-400 opacity-20 blur-lg transition duration-1000 group-hover:opacity-30" />
                <div className="relative p-5 bg-white rounded-2xl shadow-xl border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[10px] bg-sky-50 text-sky-800 border-sky-200 px-2.5 py-0.5 rounded-full font-bold">Standard A4 Preview</span>
                  </div>
                  {/* Miniature Resume Content for style */}
                  <div className="space-y-3.5">
                    <div className="h-5 bg-slate-100 rounded w-1/3" />
                    <div className="h-3 bg-slate-50 rounded w-1/2" />
                    <hr className="border-slate-150" />
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-100 rounded w-full" />
                      <div className="h-3 bg-slate-100 rounded w-5/6" />
                      <div className="h-3 bg-slate-100 rounded w-2/3" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <span className="w-12 h-4 rounded bg-slate-50 border text-[8px] font-bold text-center">React</span>
                      <span className="w-16 h-4 rounded bg-slate-50 border text-[8px] font-bold text-center">Vite</span>
                      <span className="w-14 h-4 rounded bg-slate-50 border text-[8px] font-bold text-center">Docker</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Core USPs Grid */}
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Everything You Need to Succeed</h2>
                <p className="text-xs text-slate-500 mt-1">Unlock next-generation career utility without spending a dime.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { title: "Completely Free", desc: "No hidden microtransactions or subscriptions. Unlimited pdf exports forever.", icon: Shield },
                  { title: "AI Companion", desc: "Rewrite experiences, bullet points and summaries instantly with server-side AI.", icon: Sparkles },
                  { title: "Instant Parser", desc: "Paste unstructured PDF CV text and let Gemini map it directly into fields.", icon: Layers },
                  { title: "ATS Friendly", desc: "Built using strict templates and structured micro-spacing guidelines.", icon: HelpCircle },
                ].map((usp, idx) => {
                  const Icon = usp.icon;
                  return (
                    <div key={idx} className="p-5 bg-white rounded-xl border border-slate-100 shadow-3xs space-y-3 hover:shadow-xs transition duration-200">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{usp.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{usp.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl space-y-8">
              <div className="text-center max-w-sm mx-auto space-y-2">
                <h3 className="text-lg font-bold">How Resumify Empowers You</h3>
                <p className="text-xs text-slate-400">Complete draft in under 5 minutes through sequential setups.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { step: "01", label: "Provide coordinates", desc: "Insert your academic background, past companies, and titles into the builder wizard." },
                  { step: "02", label: "AI Optimization", desc: "Optimize your details using the built-in AI enhancer to draft bullet points with strong action verbs." },
                  { step: "03", label: "Select Shell Template", desc: "Choose from multiple templates optimized for ATS or corporate look and select brand colors." },
                  { step: "04", label: "Export Vector PDF", desc: "Click build PDF to print directly as premium vector PDF from the host canvas." },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <span className="text-2xl font-black text-blue-500 font-mono tracking-tight">{item.step}</span>
                    <h4 className="text-sm font-bold text-white">{item.label}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Interactive Resume Builder */}
        {currentTab === "builder" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            {/* Input Form Wizard */}
            <div className="lg:col-span-5 space-y-4 no-print">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  <FileText className="w-5 h-5 text-blue-700" /> Interactive CV Workshop
                </h2>
                
                {/* Reset or Clear progress buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleResetRestore}
                    title="Load Demoware details"
                    className="p-1 px-2.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-50 transition active:scale-95 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restore Sample
                  </button>
                  <button
                    onClick={handleClearForm}
                    title="Start Blank layout"
                    className="p-1 px-2.5 rounded-lg border border-red-200 text-[10px] font-bold text-red-600 bg-white hover:bg-red-50 transition active:scale-95"
                  >
                    Wipe Fields
                  </button>
                </div>
              </div>

              <ResumeForm 
                data={resumeData} 
                onChange={setResumeData} 
                aiStatus={aiStatus}
              />
            </div>

            {/* Live Interactive Preview panel */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex justify-between items-center no-print bg-white p-4 rounded-xl border border-slate-100 shadow-3xs">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Real-Time PDF Visualizer</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase font-mono mt-0.5">Preset Theme: {resumeData.selectedTemplate} / Accent: {resumeData.selectedColor}</p>
                </div>

                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition active:scale-[0.97] hover:scale-[1.01] flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4 text-sky-400" /> Download Premium PDF CV
                </button>
              </div>

              {/* Inline help helper banner specifically for Iframe sandbox instances */}
              {typeof window !== "undefined" && window.self !== window.top && (
                <div className="no-print p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl flex items-start gap-2 text-[11px] text-amber-800 leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Iframe Viewer Detected:</span> If clicking the download button does not open your browser's PDF Print dialogue box, please click the <strong>Open in New Tab</strong> button located at the top-right corner of the browser workspace to trigger instant direct PDF rendering!
                  </div>
                </div>
              )}

              {/* Rendering ResumePreview with Print Ref callback */}
              <ResumePreview data={resumeData} printRef={printRef} />
            </div>
          </div>
        )}

        {/* TAB 3: Advanced Full AI CV Generator */}
        {currentTab === "ai-builder" && (
          <div className="animate-fadeIn py-4">
            <AiBuilder 
              onGenerated={handleDataParsed} 
              onNavigateToBuilder={() => setCurrentTab("builder")}
              aiStatus={aiStatus}
            />
          </div>
        )}

        {/* TAB 5: About Core Philosophy & Contact Support */}
        {currentTab === "about" && (
          <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn py-4">
            
            {/* About resumnify info */}
            <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 space-y-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">About Resumify</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Resumify is a fully fledged, completely open, and offline-first CV environment created to streamline applicant onboarding. Our goal is to bring deep intelligence to standard layout formatting. Our tool structures your raw parameters, corrects syntactic anomalies, and prepares industry-grade vectors without compromising privacy. All data states remain within temporary variables of your local workspace context.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-50 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800">ANUNAND P.R</h4>
                  <p className="text-slate-500 mt-1">Lead Ideation & Interface Designer specialist, targeting clean visual structures.</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">AKASH SUNIL</h4>
                  <p className="text-slate-500 mt-1">Full-Stack Cloud Engineer, targeting robust API integration pipelines and logic architectures.</p>
                </div>
              </div>
            </div>

            {/* Validation Contact Us */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white p-8 rounded-2xl shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <span className="px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/25 rounded-md text-[10px] text-blue-400 font-bold tracking-widest uppercase">
                    Support Channel
                  </span>
                  <h3 className="text-lg font-bold">Contact Team Resumify</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    Have feedback or encountered build rendering hurdles? Tell ANUNAND & AKASH directly. Fill out our contact box, and we will update modules accordingly.
                  </p>
                  <div className="space-y-2 text-xs pt-4 border-t border-slate-800 text-slate-400 font-medium">
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-500" /> support@resumify-builder.com
                    </p>
                    <p className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" /> Headquartered at Google Cloud Cloud Run
                    </p>
                  </div>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Your Full Name</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-2 bg-slate-850 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Email Address</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full px-3 py-2 bg-slate-850 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Detailed Suggestion / Query</label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Write your feedback here..."
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-850 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Message
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}

      </main>

      <Footer onTabChange={setCurrentTab} />

      {/* Auth modal Popup triggered from top navbar */}
      <AuthModal 
        isOpen={authIsOpen} 
        onClose={() => setAuthIsOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
        userEmail="meakashsunilkk@gmail.com" 
      />
    </div>
  );
}
