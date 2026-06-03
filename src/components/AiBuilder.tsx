/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ResumeData } from "../types";
import { Sparkles, Briefcase, FileText, ArrowRight, Loader2, Info } from "lucide-react";

interface AiBuilderProps {
  onGenerated: (data: Partial<ResumeData>) => void;
  onNavigateToBuilder: () => void;
  aiStatus: { status: string; message: string };
}

export default function AiBuilder({ onGenerated, onNavigateToBuilder, aiStatus }: AiBuilderProps) {
  const [careerGoal, setCareerGoal] = useState("Staff Cloud Architect");
  const [education, setEducation] = useState("Master of Science in IT from Georgia Tech (2020)");
  const [skills, setSkills] = useState("AWS, Cloud Security, Kubernetes, Terraform, GoLang, Systems Design");
  const [experience, setExperience] = useState("5 years leading infrastructure migrations at CloudBase. Managed Kubernetes clusters and cut hosting spend by 30%.");

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setGenerating(true);
    setSuccess(false);

    try {
      // Step A: Generate summary first
      const summaryRes = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "summary",
          payload: { careerGoal, education, skills, experience },
        }),
      });
      const summaryData = await summaryRes.json();

      // Step B: Generate structured accomplishments
      const expRes = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "experience",
          payload: {
            jobTitle: careerGoal,
            companyName: "Enterprise Client Corporation",
            rawResponsibilities: experience,
          },
        }),
      });
      const expData = await expRes.json();

      // Step C: Generate a project out of skills
      const projectRes = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "project",
          payload: {
            projectName: "Enterprise Cloud Landing Zone",
            technologiesUsed: skills.split(",").slice(0, 3).join(", "),
            description: `Designed and built automated multi-tenant environment using modern systems configurations and declarative setups on micro-architectures.`,
          },
        }),
      });
      const projectData = await projectRes.json();

      if (summaryData.output && expData.output) {
        const generatedResume: Partial<ResumeData> = {
          personal: {
            fullName: "Alex Rivera", // Placeholder Name to fill
            jobTitle: careerGoal,
            email: "alex.rivera@example.com",
            phone: "+1 (555) 987-6543",
            address: "Remote, United States",
            linkedin: "linkedin.com/in/alex-rivera-cloud",
            website: "alex-rivera.net",
            summary: summaryData.output.trim(),
          },
          education: [
            {
              id: "edu-ai-1",
              institution: education.split("from")[1]?.trim() || "Georgia Institute of Technology",
              degree: education.split("from")[0]?.trim() || "M.S. in Information Technology",
              duration: "2018 - 2020",
              grade: "High Honors",
            },
          ],
          experience: [
            {
              id: "exp-ai-1",
              companyName: "CloudBase Systems",
              jobTitle: careerGoal,
              duration: "2021 - Present",
              responsibilities: expData.output.trim(),
            },
          ],
          skills: skills.split(",").map((s, i) => ({
            id: `sk-ai-${i}`,
            name: s.trim(),
            level: "Expert",
          })),
          projects: [
            {
              id: "proj-ai-1",
              projectName: "Enterprise Cloud Landing Zone",
              description: projectData.output ? projectData.output.trim() : "Engineered and refactored distributed AWS systems architectures resolving configuration constraints.",
              technologiesUsed: skills.split(",").slice(0, 3).join(", ") || "Terraform, Kubernetes, Go",
            },
          ],
          certifications: [
            {
              id: "cert-ai-1",
              name: `Professional Certified ${careerGoal.split(" ")[1] || "Engineer"}`,
              organization: "Industry Authority",
              year: "2025",
            },
          ],
        };

        onGenerated(generatedResume);
        setSuccess(true);
      } else {
        setError("Incomplete response from AI generator. Please verify parameters or retry.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to create full resume via Gemini API. Try reviewing server connection details.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" /> Complete AI Resume Architect
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
          Don't have time to draft sentences? Let Resumify's AI generator draft a comprehensive CV! Simply provide your target path, schooling highlights, raw skills, and background.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Form Inputs */}
        <form onSubmit={handleGenerate} className="bg-white p-6 rounded-xl shadow-md border border-slate-100 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b pb-2">
            <FileText className="w-4 h-4 text-slate-400" /> Career Profile Specifications
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Immediate Target Role / Career Goal *</label>
            <input
              type="text"
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              placeholder="e.g. Senior Software Architect"
              required
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Educational Milestones *</label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g. Master of Science from Georgia Tech (2022)"
              required
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Core Technical & Key Achievements *</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, Node, REST APIs, System Layout, AWS"
              required
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Tell us about your experience *</label>
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. Led engineering migrations, trained juniors, resolved site memory constraints, optimized databases."
              required
              rows={4}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={generating || aiStatus.status === "missing_key"}
            className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Synthesizing Dream Resume...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Auto-Generate Full CV with AI
              </>
            )}
          </button>
        </form>

        {/* Results / Help Panel */}
        <div className="space-y-4">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/60 text-xs text-slate-600 leading-relaxed space-y-3">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold border-b pb-1.5">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>What Resumify AI Accomplishes For You:</span>
            </div>
            <ul className="list-disc pl-4 space-y-2 text-slate-600">
              <li>Formulates an executive **Professional Summary** targeted to your exact goal.</li>
              <li>Reforms your raw experience details into **achievements-based bullet points** with active starter verbs.</li>
              <li>Generates a showcase **Technical Project description** reflecting your key stack elements.</li>
              <li>Pre-sets standard coordinates and fills structured lists for single-click builder loading.</li>
            </ul>
          </div>

          {success && (
            <div className="p-5 bg-emerald-50 border border-emerald-250 rounded-xl space-y-3 shadow-3xs animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-800">
                <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
                <h4 className="text-sm font-bold">Generation Accomplished!</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                A pristine, job-ready template outline has been synthesized. We loaded your summaries, qualifications, skills, and projects.
              </p>
              <button
                type="button"
                onClick={onNavigateToBuilder}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
              >
                Incorporate & Edit inside Builder <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs space-y-1">
              <p className="font-bold">Generation Failed</p>
              <p className="leading-relaxed">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
