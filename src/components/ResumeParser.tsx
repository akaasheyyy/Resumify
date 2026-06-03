/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ResumeData } from "../types";
import { Sparkles, FileText, UploadCloud, Clipboard, Check, Loader2, ArrowRight } from "lucide-react";

interface ResumeParserProps {
  onParsed: (data: Partial<ResumeData>) => void;
  onNavigateToBuilder: () => void;
}

export default function ResumeParser({ onParsed, onNavigateToBuilder }: ResumeParserProps) {
  const [inputText, setInputText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Parse action
  const handleParse = async () => {
    if (!inputText.trim()) {
      setError("Please paste some CV text or details first!");
      return;
    }
    setError("");
    setParsing(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/ai/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      const parsedJson = await response.json();
      if (response.ok && parsedJson.personal) {
        // Enforce UUID structure or standard IDs for list items
        const sanitizedData: Partial<ResumeData> = {
          personal: {
            fullName: parsedJson.personal.fullName || "",
            jobTitle: parsedJson.personal.jobTitle || "",
            email: parsedJson.personal.email || "",
            phone: parsedJson.personal.phone || "",
            address: parsedJson.personal.address || "",
            linkedin: parsedJson.personal.linkedin || "",
            website: parsedJson.personal.website || "",
            summary: parsedJson.personal.summary || "",
          },
          education: (parsedJson.education || []).map((edu: any, idx: number) => ({
            id: `edu-parsed-${idx}`,
            institution: edu.institution || "",
            degree: edu.degree || "",
            duration: edu.duration || "",
            grade: edu.grade || "",
          })),
          experience: (parsedJson.experience || []).map((exp: any, idx: number) => ({
            id: `exp-parsed-${idx}`,
            companyName: exp.companyName || "",
            jobTitle: exp.jobTitle || "",
            duration: exp.duration || "",
            responsibilities: exp.responsibilities || "",
          })),
          skills: (parsedJson.skills || []).map((sk: any, idx: number) => ({
            id: `sk-parsed-${idx}`,
            name: sk.name || "",
            level: sk.level || "Intermediate",
          })),
          projects: (parsedJson.projects || []).map((proj: any, idx: number) => ({
            id: `proj-parsed-${idx}`,
            projectName: proj.projectName || "",
            description: proj.description || "",
            technologiesUsed: proj.technologiesUsed || "",
          })),
          certifications: (parsedJson.certifications || []).map((c: any, idx: number) => ({
            id: `cert-parsed-${idx}`,
            name: c.name || "",
            organization: c.organization || "",
            year: c.year || "",
          })),
          languages: (parsedJson.languages || []).map((l: any, idx: number) => ({
            id: `lang-parsed-${idx}`,
            name: l.name || "",
            proficiency: l.proficiency || "Fluent",
          })),
        };

        onParsed(sanitizedData);
        setSuccess(true);
        setInputText("");
      } else {
        setError(parsedJson.error || "Could not recognize structured resume info. Please try pasting a more standard CV layout.");
      }
    } catch (err: any) {
      console.error(err);
      setError("AI Parsing failed. Ensure your server environment is configured with a valid GEMINI_API_KEY.");
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Resume Parser & PDF Editor</h2>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">
          Have an existing PDF, Word, or text CV? Paste its contents below. Our AI-driven structured ingestion pipeline parses everything into custom resume state elements seamlessly!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Input panel */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <Clipboard className="w-4 h-4 text-slate-400" /> Paste CV Content
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">PDF - Docx - Text</span>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={parsing}
            placeholder={`Example old CV text paste:
            
Alex Rivera
alex.rivera@example.com | (555) 012-3456
Education: UC Berkeley, Computer Science degree (2018-2022)
Experience: Senior dev at InnovateTech Solutions (2023-Present)
- Solved complex scaling issues using Node.js and AWS.`}
            rows={12}
            className="w-full p-4 border border-slate-200 rounded-lg text-xs font-mono bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none leading-relaxed transition"
          />

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={handleParse}
              disabled={parsing || !inputText.trim()}
              className="flex-1 py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-sm"
            >
              {parsing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Extracting Resume Details...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Parse Resume Content
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Help / Status panel */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-md space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            <h3 className="text-sm font-bold tracking-tight">How PDF Editing Works</h3>
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-white/10 text-[10px] font-bold flex items-center justify-center border border-white/15 shrink-0">1</span>
                <p className="leading-relaxed">Copy the text contents of your old PDF resume layout or drafted portfolio.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-white/10 text-[10px] font-bold flex items-center justify-center border border-white/15 shrink-0">2</span>
                <p className="leading-relaxed">Insert it into the field. Click <b>Parse Resume Content</b> and watch the Gemini model ingest, organize, and structure details.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-white/10 text-[10px] font-bold flex items-center justify-center border border-white/15 shrink-0">3</span>
                <p className="leading-relaxed">Verify parsed items inside the interactive <b>Resume Builder</b>, edit templates, and download updated vector PDFs instantly!</p>
              </div>
            </div>
          </div>

          {/* Success Dialog */}
          {success && (
            <div className="p-5 bg-emerald-50 border border-emerald-250 rounded-xl space-y-3 shadow-3xs animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-800">
                <Check className="w-5 h-5 shrink-0" />
                <h4 className="text-sm font-bold">Successfully Parsed!</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your past resume coordinates, schools, skills, and histories were parsed into state assets. Proceed to the builder to polish themes!
              </p>
              <button
                type="button"
                onClick={onNavigateToBuilder}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-3xs"
              >
                Go to Builder <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs space-y-1">
              <p className="font-bold">Parsing Ingestion Failed</p>
              <p className="leading-relaxed">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
