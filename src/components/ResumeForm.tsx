/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ResumeData, Education, Experience, Skill, Project, Certification, Language } from "../types";
import { Sparkles, Plus, Trash2, ChevronRight, ChevronLeft, Check, Wand2, Info, Loader2, AlertCircle, X } from "lucide-react";

interface ResumeFormProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
  aiStatus: { status: string; message: string };
}

export default function ResumeForm({ data, onChange, aiStatus }: ResumeFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [enhancingField, setEnhancingField] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form updater
  const updatePersonal = (field: string, value: string) => {
    onChange({
      ...data,
      personal: {
        ...data.personal,
        [field]: value,
      },
    });
  };

  // List updaters
  const addEducation = () => {
    const newEdu: Education = { id: `edu-${Date.now()}`, institution: "", degree: "", duration: "", grade: "" };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const removeEducation = (id: string) => {
    onChange({ ...data, education: data.education.filter(e => e.id !== id) });
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    onChange({
      ...data,
      education: data.education.map(e => e.id === id ? { ...e, [field]: value } : e),
    });
  };

  const addExperience = () => {
    const newExp: Experience = { id: `exp-${Date.now()}`, companyName: "", jobTitle: "", duration: "", responsibilities: "" };
    onChange({ ...data, experience: [...data.experience, newExp] });
  };

  const removeExperience = (id: string) => {
    onChange({ ...data, experience: data.experience.filter(e => e.id !== id) });
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    onChange({
      ...data,
      experience: data.experience.map(e => e.id === id ? { ...e, [field]: value } : e),
    });
  };

  const addSkill = () => {
    const newSkill: Skill = { id: `sk-${Date.now()}`, name: "", level: "Intermediate" };
    onChange({ ...data, skills: [...data.skills, newSkill] });
  };

  const removeSkill = (id: string) => {
    onChange({ ...data, skills: data.skills.filter(s => s.id !== id) });
  };

  const updateSkill = (id: string, field: keyof Skill, value: string) => {
    onChange({
      ...data,
      skills: data.skills.map(s => s.id === id ? { ...s, [field]: value } : s),
    });
  };

  const addProject = () => {
    const newProj: Project = { id: `proj-${Date.now()}`, projectName: "", description: "", technologiesUsed: "" };
    onChange({ ...data, projects: [...data.projects, newProj] });
  };

  const removeProject = (id: string) => {
    onChange({ ...data, projects: data.projects.filter(p => p.id !== id) });
  };

  const updateProject = (id: string, field: keyof Project, value: string) => {
    onChange({
      ...data,
      projects: data.projects.map(p => p.id === id ? { ...p, [field]: value } : p),
    });
  };

  const addCertification = () => {
    const newCert: Certification = { id: `cert-${Date.now()}`, name: "", organization: "", year: "" };
    onChange({ ...data, certifications: [...data.certifications, newCert] });
  };

  const removeCertification = (id: string) => {
    onChange({ ...data, certifications: data.certifications.filter(c => c.id !== id) });
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    onChange({
      ...data,
      certifications: data.certifications.map(c => c.id === id ? { ...c, [field]: value } : c),
    });
  };

  const addLanguage = () => {
    const newLang: Language = { id: `lang-${Date.now()}`, name: "", proficiency: "Fluent" };
    onChange({ ...data, languages: [...data.languages, newLang] });
  };

  const removeLanguage = (id: string) => {
    onChange({ ...data, languages: data.languages.filter(l => l.id !== id) });
  };

  const updateLanguage = (id: string, field: keyof Language, value: string) => {
    onChange({
      ...data,
      languages: data.languages.map(l => l.id === id ? { ...l, [field]: value } : l),
    });
  };

  // AI Integration: In-line ATS Enhancement via Server SDK proxy
  const handleAIEnhanceSummary = async () => {
    if (enhancingField) return;
    setEnhancingField("summary");
    setErrorToast(null);
    setSuccessToast(null);
    try {
      const response = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "summary",
          payload: {
            careerGoal: data?.personal?.jobTitle || "",
            skills: data?.skills?.map(s => s.name).filter(Boolean).join(", ") || "",
            experience: data?.experience?.map(e => `${e.jobTitle || ""} at ${e.companyName || ""}`).filter(Boolean).join("; ") || "",
            education: data?.education?.map(ed => ed.degree || "").filter(Boolean).join("; ") || "",
          },
        }),
      });
      const resData = await response.json();
      if (resData.output) {
        updatePersonal("summary", resData.output.trim());
        setSuccessToast("Professional bio generated & optimized successfully!");
        setTimeout(() => setSuccessToast(null), 5000);
      } else if (resData.error) {
        setErrorToast(resData.error);
      }
    } catch (err) {
      console.error(err);
      setErrorToast("Failed to communicate with AI server. Ensure your Gemini API Key is set.");
    } finally {
      setEnhancingField(null);
    }
  };

  const handleAIEnhanceExperience = async (id: string, jobTitle: string, companyName: string, raw: string) => {
    if (enhancingField || !raw?.trim()) return;
    setEnhancingField(`exp-${id}`);
    setErrorToast(null);
    setSuccessToast(null);
    try {
      const response = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "experience",
          payload: { jobTitle: jobTitle || "", companyName: companyName || "", rawResponsibilities: raw || "" },
        }),
      });
      const resData = await response.json();
      if (resData.output) {
        updateExperience(id, "responsibilities", resData.output.trim());
        setSuccessToast("Experience bullet points optimized successfully!");
        setTimeout(() => setSuccessToast(null), 5000);
      } else if (resData.error) {
        setErrorToast(resData.error);
      }
    } catch (err) {
      console.error(err);
      setErrorToast("Error enhancing experience bullet points.");
    } finally {
      setEnhancingField(null);
    }
  };

  const handleAIEnhanceProject = async (id: string, projectName: string, tech: string, desc: string) => {
    if (enhancingField || !desc?.trim()) return;
    setEnhancingField(`proj-${id}`);
    setErrorToast(null);
    setSuccessToast(null);
    try {
      const response = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "project",
          payload: { projectName: projectName || "", technologiesUsed: tech || "", description: desc || "" },
        }),
      });
      const resData = await response.json();
      if (resData.output) {
        updateProject(id, "description", resData.output.trim());
        setSuccessToast("Project details enhanced successfully!");
        setTimeout(() => setSuccessToast(null), 5000);
      } else if (resData.error) {
        setErrorToast(resData.error);
      }
    } catch (err) {
      console.error(err);
      setErrorToast("Error generating technical project description.");
    } finally {
      setEnhancingField(null);
    }
  };

  const steps = [
    { num: 1, label: "Personal Details" },
    { num: 2, label: "Education" },
    { num: 3, label: "Experience" },
    { num: 4, label: "Skills" },
    { num: 5, label: "Projects" },
    { num: 6, label: "Customize" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
      {/* Steps indicators */}
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between overflow-x-auto gap-4 scrollbar-hidden">
        {steps.map((s) => (
          <button
            key={s.num}
            onClick={() => setCurrentStep(s.num)}
            className="flex items-center gap-2 whitespace-nowrap focus:outline-none"
          >
            <span 
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition ${
                currentStep === s.num 
                  ? "bg-blue-700 text-white" 
                  : currentStep > s.num 
                    ? "bg-emerald-100 text-emerald-800" 
                    : "bg-slate-200 text-slate-500"
              }`}
            >
              {currentStep > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
            </span>
            <span 
              className={`text-xs font-semibold ${
                currentStep === s.num ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {s.label}
            </span>
            {s.num < 6 && <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div className="p-6 min-h-[460px]">
        {errorToast && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-250 text-red-800 rounded-xl flex items-start justify-between text-xs animate-fadeIn shadow-3xs" id="form-error-toast">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-650 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Optimization Failure</p>
                <p className="leading-relaxed text-slate-705 font-medium">{errorToast}</p>
              </div>
            </div>
            <button type="button" onClick={() => setErrorToast(null)} className="p-1 hover:bg-red-100 rounded-lg transition text-red-800 shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {successToast && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-850 rounded-xl flex items-center justify-between text-xs animate-fadeIn shadow-3xs" id="form-success-toast">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successToast}</span>
            </div>
            <button type="button" onClick={() => setSuccessToast(null)} className="p-1 hover:bg-emerald-100 rounded-lg transition text-emerald-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* API Warning if server has no key configured */}
        {aiStatus.status === "missing_key" && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-800 leading-relaxed shadow-3xs">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">AI Support Limited</p>
              <p>{aiStatus.message}</p>
            </div>
          </div>
        )}

        {/* STEP 1: Personal Details */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">Step 1: Personal Details & Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  value={data.personal.fullName}
                  onChange={(e) => updatePersonal("fullName", e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Job Title / Career Goal *</label>
                <input
                  type="text"
                  value={data.personal.jobTitle}
                  onChange={(e) => updatePersonal("jobTitle", e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  value={data.personal.email}
                  onChange={(e) => updatePersonal("email", e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Phone Number</label>
                <input
                  type="text"
                  value={data.personal.phone}
                  onChange={(e) => updatePersonal("phone", e.target.value)}
                  placeholder="+1 (555) 012-3456"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Address / Location</label>
                <input
                  type="text"
                  value={data.personal.address}
                  onChange={(e) => updatePersonal("address", e.target.value)}
                  placeholder="San Francisco, CA"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">LinkedIn URL</label>
                <input
                  type="text"
                  value={data.personal.linkedin}
                  onChange={(e) => updatePersonal("linkedin", e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">Personal Website / Portfolio</label>
                <input
                  type="text"
                  value={data.personal.website}
                  onChange={(e) => updatePersonal("website", e.target.value)}
                  placeholder="myportfolio.dev"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Resume Summary with AI generator widget */}
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Professional Summary *</label>
                <button
                  type="button"
                  onClick={handleAIEnhanceSummary}
                  disabled={enhancingField === "summary"}
                  className="px-2.5 py-1 text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-1.5 transition active:scale-[0.97]"
                >
                  {enhancingField === "summary" ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Optimizing Summary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      Generate Professional Bio with AI
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={data.personal.summary}
                onChange={(e) => updatePersonal("summary", e.target.value)}
                placeholder="Write a tiny pitch highlighting your skills, experiences, and accomplishments or let Resumify AI generate a tailored one for you above."
                rows={4}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Education */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-base font-bold text-slate-900">Step 2: Educational Details</h3>
              <button
                type="button"
                onClick={addEducation}
                className="px-3 py-1 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-lg flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add School/College
              </button>
            </div>

            {data.education.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No educational qualifications added yet. Click above to add schools or universities.
              </div>
            ) : (
              <div className="space-y-4">
                {data.education.map((edu, index) => (
                  <div key={edu.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 space-y-3 relative group">
                    <button
                      type="button"
                      onClick={() => removeEducation(edu.id)}
                      className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Qualification #{index + 1}</span>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Institution / University Name *</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                          placeholder="e.g. University of California, Berkeley"
                          className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Degree / Specification *</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                          placeholder="e.g. B.S. in Computer Science"
                          className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Graduation Timeline *</label>
                        <input
                          type="text"
                          value={edu.duration}
                          onChange={(e) => updateEducation(edu.id, "duration", e.target.value)}
                          placeholder="e.g. 2018 - 2022"
                          className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Grade / CGPA</label>
                        <input
                          type="text"
                          value={edu.grade}
                          onChange={(e) => updateEducation(edu.id, "grade", e.target.value)}
                          placeholder="e.g. 3.85 GPA or 92%"
                          className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Experience */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-base font-bold text-slate-900">Step 3: Work Experience</h3>
              <button
                type="button"
                onClick={addExperience}
                className="px-3 py-1 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-lg flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Experience block
              </button>
            </div>

            {data.experience.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No work experiences added yet. Click above to add professional histories or internships.
              </div>
            ) : (
              <div className="space-y-5">
                {data.experience.map((exp, index) => (
                  <div key={exp.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 space-y-3 relative group">
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Job Experience #{index + 1}</span>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Company Name *</label>
                        <input
                          type="text"
                          value={exp.companyName}
                          onChange={(e) => updateExperience(exp.id, "companyName", e.target.value)}
                          placeholder="e.g. InnovateTech Solutions"
                          className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Job Title *</label>
                        <input
                          type="text"
                          value={exp.jobTitle}
                          onChange={(e) => updateExperience(exp.id, "jobTitle", e.target.value)}
                          placeholder="e.g. Senior Software Engineer"
                          className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Tenure Duration *</label>
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => updateExperience(exp.id, "duration", e.target.value)}
                          placeholder="e.g. Jan 2023 - Present"
                          className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* AI bullet generation for this role */}
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700">Core Accomplishments & Duties *</label>
                        <button
                          type="button"
                          onClick={() => handleAIEnhanceExperience(exp.id, exp.jobTitle, exp.companyName, exp.responsibilities)}
                          disabled={enhancingField === `exp-${exp.id}`}
                          className="px-2 py-0.5 text-[9px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded flex items-center gap-1 transition active:scale-[0.97]"
                        >
                          {enhancingField === `exp-${exp.id}` ? (
                            <>
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              ATS Writing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-2.5 h-2.5" />
                              Write Professional Bullets with AI
                            </>
                          )}
                        </button>
                      </div>
                      <textarea
                        value={exp.responsibilities}
                        onChange={(e) => updateExperience(exp.id, "responsibilities", e.target.value)}
                        placeholder="List your job tasks or achievements. Use lists or newlines. We strongly recommend writing raw descriptions here and then clicking 'Write Professional Bullets with AI' to transform them into world-class CV formulations!"
                        rows={4}
                        className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Skills */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-base font-bold text-slate-900">Step 4: Skills, Certifications & Languages</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-900 text-white rounded-lg flex items-center gap-1 transition text-[11px]"
                >
                  <Plus className="w-3 h-3" /> Skill
                </button>
                <button
                  type="button"
                  onClick={addCertification}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-900 text-white rounded-lg flex items-center gap-1 transition text-[11px]"
                >
                  <Plus className="w-3 h-3" /> Certificate
                </button>
                <button
                  type="button"
                  onClick={addLanguage}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-900 text-white rounded-lg flex items-center gap-1 transition text-[11px]"
                >
                  <Plus className="w-3 h-3" /> Language
                </button>
              </div>
            </div>

            {/* Subgrid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Skills Area */}
              <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest border-b pb-1">Core Tech & Soft Skills</h4>
                {data.skills.length === 0 ? (
                  <p className="text-[11px] text-slate-400 py-4 text-center">No skills added.</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {data.skills.map(s => (
                      <div key={s.id} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-slate-200 shadow-3xs">
                        <input
                          type="text"
                          value={s.name}
                          onChange={(e) => updateSkill(s.id, "name", e.target.value)}
                          placeholder="e.g. TypeScript"
                          className="flex-1 px-1.5 py-1 text-xs border rounded-sm outline-none focus:border-blue-600"
                        />
                        <select
                          value={s.level}
                          onChange={(e) => updateSkill(s.id, "level", e.target.value)}
                          className="text-[10px] bg-slate-50 border rounded-sm p-1"
                        >
                          <option value="Expert">Expert</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Beginner">Beginner</option>
                          <option value="">Hide level</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeSkill(s.id)}
                          className="text-slate-400 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Certifications Area */}
              <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest border-b pb-1">Certifications</h4>
                {data.certifications.length === 0 ? (
                  <p className="text-[11px] text-slate-400 py-4 text-center">No certifications.</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {data.certifications.map(c => (
                      <div key={c.id} className="bg-white p-2.5 rounded-lg border border-slate-200. shadow-3xs space-y-1.5 relative">
                        <button
                          type="button"
                          onClick={() => removeCertification(c.id)}
                          className="absolute right-1.5 top-1.5 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="text"
                          value={c.name}
                          onChange={(e) => updateCertification(c.id, "name", e.target.value)}
                          placeholder="Certificate Name"
                          className="w-full px-1.5 py-1 text-xs border rounded-sm outline-none focus:border-blue-600"
                        />
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            value={c.organization}
                            onChange={(e) => updateCertification(c.id, "organization", e.target.value)}
                            placeholder="Organization"
                            className="px-1.5 py-0.5 text-[10px] border rounded-sm outline-none"
                          />
                          <input
                            type="text"
                            value={c.year}
                            onChange={(e) => updateCertification(c.id, "year", e.target.value)}
                            placeholder="Year"
                            className="px-1.5 py-0.5 text-[10px] border rounded-sm outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Languages Area */}
              <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest border-b pb-1 font-sans">Languages</h4>
                {data.languages.length === 0 ? (
                  <p className="text-[11px] text-slate-400 py-4 text-center">No languages added.</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {data.languages.map(l => (
                      <div key={l.id} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-slate-200 shadow-3xs">
                        <input
                          type="text"
                          value={l.name}
                          onChange={(e) => updateLanguage(l.id, "name", e.target.value)}
                          placeholder="Language"
                          className="flex-1 px-1.5 py-1 text-xs border rounded-sm outline-none"
                        />
                        <select
                          value={l.proficiency}
                          onChange={(e) => updateLanguage(l.id, "proficiency", e.target.value)}
                          className="text-[10px] bg-slate-50 border rounded-sm p-1"
                        >
                          <option value="Native">Native</option>
                          <option value="Fluent">Fluent</option>
                          <option value="Conversational">Conversational</option>
                          <option value="Beginner">Beginner</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeLanguage(l.id)}
                          className="text-slate-400 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Projects */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-base font-bold text-slate-900">Step 5: Professional Projects</h3>
              <button
                type="button"
                onClick={addProject}
                className="px-3 py-1 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-lg flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project Info
              </button>
            </div>

            {data.projects.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No projects added yet. Click above to showcase your academic coding, tools, or freelance ventures.
              </div>
            ) : (
              <div className="space-y-5">
                {data.projects.map((proj, index) => (
                  <div key={proj.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 space-y-3 relative group">
                    <button
                      type="button"
                      onClick={() => removeProject(proj.id)}
                      className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Project Showcase #{index + 1}</span>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Project Name *</label>
                        <input
                          type="text"
                          value={proj.projectName}
                          onChange={(e) => updateProject(proj.id, "projectName", e.target.value)}
                          placeholder="e.g. Apex Telemetry Dashboard"
                          className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Tech Stack Used *</label>
                        <input
                          type="text"
                          value={proj.technologiesUsed}
                          onChange={(e) => updateProject(proj.id, "technologiesUsed", e.target.value)}
                          placeholder="e.g. React, D3.js, WebSockets, Tailwind"
                          className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700">Detailed Description *</label>
                        <button
                          type="button"
                          onClick={() => handleAIEnhanceProject(proj.id, proj.projectName, proj.technologiesUsed, proj.description)}
                          disabled={enhancingField === `proj-${proj.id}`}
                          className="px-2 py-0.5 text-[9px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded flex items-center gap-1 transition active:scale-[0.97]"
                        >
                          {enhancingField === `proj-${proj.id}` ? (
                            <>
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              Technical Writer...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-2.5 h-2.5" />
                              Polish Description with AI
                            </>
                          )}
                        </button>
                      </div>
                      <textarea
                        value={proj.description}
                        onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                        placeholder="Write a brief description of what challenges this project solves, architectural notes or metrics, or let Resumify AI structure it professionally for you."
                        rows={3}
                        className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 6: Customize & Theme select */}
        {currentStep === 6 && (
          <div className="space-y-7 animate-fadeIn">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                🎨 Real-Time Layout & Style Architect
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Customize shell structures, spacing, and typography to generate your unique professional signature. Combine parameters to access over <strong>1,600+ dynamic layout custom configurations</strong>.
              </p>
            </div>

            {/* Custom Layout template */}
            <div className="space-y-2 pb-5 border-b border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">1. Outer Shell Blueprint</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {[
                  { id: "modern", title: "Modern Minimalist", desc: "Clean & high ATS score corporate design" },
                  { id: "professional", title: "Corporate Georgia", desc: "Elegant split sidebar traditional layout" },
                  { id: "creative", title: "Creative Grotesk", desc: "Stylish tech-forward block arrangements" },
                  { id: "student", title: "Fresh Academic", desc: "Showcases education & sandbox projects first" },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => onChange({ ...data, selectedTemplate: tpl.id })}
                    className={`p-3 rounded-lg text-left border-2 transition active:scale-[0.98] ${
                      data.selectedTemplate === tpl.id 
                        ? "border-blue-700 bg-blue-50/20" 
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <span className="text-xs font-bold block text-slate-800">{tpl.title}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block leading-normal">{tpl.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color Selection & Custom hex input */}
            <div className="space-y-3 pb-5 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">2. Brand Accent Color Pairing</label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Dynamic Color Picker:</span>
                  <input
                    type="color"
                    value={data.selectedColor || "#1e3a8a"}
                    onChange={(e) => onChange({ ...data, selectedColor: e.target.value })}
                    className="w-7 h-7 rounded border border-slate-200 cursor-pointer shadow-3xs"
                    title="Infinite Color Picker Selector"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "#1e3a8a", name: "Deep Navy" },
                  { value: "#0d9488", name: "Teal Green" },
                  { value: "#0284c7", name: "Sky Blue" },
                  { value: "#db2777", name: "Orchid Pink" },
                  { value: "#7c3aed", name: "Neon Violet" },
                  { value: "#dc2626", name: "Ruby Red" },
                  { value: "#1f2937", name: "Slate Dark" },
                  { value: "#065f46", name: "Forest Emerald" },
                  { value: "#b45309", name: "Amber Gold" },
                  { value: "#4338ca", name: "Royal Indigo" },
                ].map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => onChange({ ...data, selectedColor: color.value })}
                    className={`px-2.5 py-1.5 rounded-full text-[10px] font-semibold transition active:scale-[0.95] flex items-center gap-1.5 border ${
                      data.selectedColor === color.value 
                        ? "border-slate-900 shadow-3xs text-slate-900 bg-slate-50" 
                        : "border-slate-150 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color.value }} />
                    {color.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography selection tab */}
            <div className="space-y-2 pb-5 border-b border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">3. Premium Typography Pairing</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {[
                  { value: "Inter, sans-serif", name: "Inter (Corporate Pro)" },
                  { value: "Space Grotesk, sans-serif", name: "Space Grotesk (Tech/Design)" },
                  { value: "Outfit, sans-serif", name: "Outfit (Clean Geometric)" },
                  { value: "Georgia, serif", name: "Georgia (Classic Academic)" },
                  { value: "Lora, serif", name: "Lora (Polished Literary)" },
                  { value: "Playfair Display, serif", name: "Playfair (High-End Elegant)" },
                  { value: "JetBrains Mono, monospace", name: "JetBrains (Technical Dev)" },
                ].map((font) => (
                  <button
                    key={font.value}
                    type="button"
                    onClick={() => onChange({ ...data, selectedFont: font.value })}
                    className={`p-2.5 rounded-lg text-left border transition active:scale-[0.98] ${
                      data.selectedFont === font.value 
                        ? "border-blue-700 bg-blue-50/10 text-blue-800 font-bold" 
                        : "border-slate-100 text-slate-600 hover:border-slate-250"
                    }`}
                    style={{ fontFamily: font.value }}
                  >
                    <span className="text-xs truncate block">{font.name}</span>
                    <span className="text-[9px] text-slate-400 font-normal block mt-0.5">Aa Bb Cc 123</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Density Spacer & Bullet style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-5 border-b border-slate-100">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">4. A4 Grid Spacing Density</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "compact", name: "Compact (Single Page)" },
                    { id: "comfortable", name: "Comfortable (Standard)" },
                    { id: "spacious", name: "Spacious (Elegant)" },
                    { id: "atmospheric", name: "Atmospheric" },
                  ].map((density) => (
                    <button
                      key={density.id}
                      type="button"
                      onClick={() => onChange({ ...data, selectedDensity: density.id as any })}
                      className={`p-2 rounded-md text-center text-[10px] font-bold border transition ${
                        data.selectedDensity === density.id 
                          ? "border-slate-900 bg-slate-900 text-white" 
                          : "border-slate-100 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {density.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">5. Bullet Points Graphic Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "disc", name: "• Standard Discs" },
                    { id: "square", name: "▪ Solid Squares" },
                    { id: "dash", name: "― Clean Dashes" },
                    { id: "accent-dot", name: "✨ Custom Dots" },
                  ].map((bullet) => (
                    <button
                      key={bullet.id}
                      type="button"
                      onClick={() => onChange({ ...data, selectedBulletStyle: bullet.id as any })}
                      className={`p-2 rounded-md text-center text-[10px] font-bold border transition ${
                        data.selectedBulletStyle === bullet.id 
                          ? "border-slate-900 bg-slate-900 text-white" 
                          : "border-slate-100 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {bullet.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Border styling & Profile photo config */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-5 border-b border-slate-100">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">6. Shell Accent Borders</label>
                <select
                  value={data.selectedBorderAccent || "top-bar"}
                  onChange={(e) => onChange({ ...data, selectedBorderAccent: e.target.value as any })}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="none">Frameless (Clean Minimal)</option>
                  <option value="top-bar">A4 Top Color Ribbon Accent</option>
                  <option value="left-bar">Left Sidebar Accent Line</option>
                  <option value="frame">Surrounding Geometric Margins Accent Frame</option>
                  <option value="accent-bottom">Bottom Signature Underline Bar</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block font-sans">7. Portrait Display Frame</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!data.showAvatar}
                      onChange={(e) => onChange({ ...data, showAvatar: e.target.checked })}
                      className="w-3.5 h-3.5 text-blue-600 border-slate-2 border-2 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    Display Picture (Avatar)
                  </label>
                  {data.showAvatar && (
                    <select
                      value={data.selectedAvatarShape || "circle"}
                      onChange={(e) => onChange({ ...data, selectedAvatarShape: e.target.value as any })}
                      className="text-[10px] font-semibold px-2 py-1 bg-white border border-slate-200 rounded-md focus:outline-none"
                    >
                      <option value="circle">Circular Framing</option>
                      <option value="rounded">Soft Square</option>
                      <option value="sharp">Sharp Polygon</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Print advice notices */}
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-[11px] text-slate-600 leading-relaxed max-w-xl">
              <span className="font-bold text-blue-800 block mb-1">💡 Pro Printing Tips:</span>
              Your resume is designed for exact A4 proportions (21cm × 29.7cm). Clicking the PDF download print button opens your browser's vector pipeline. Ensure <strong>Background graphics</strong> is enabled in your print manager configuration to include accent colors and ribbon dividers correctly.
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation bar */}
      <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
        <button
          type="button"
          disabled={currentStep === 1}
          onClick={() => setCurrentStep(prev => prev - 1)}
          className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg flex items-center gap-1 transition active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-4 h-4" /> Previous Section
        </button>

        <button
          type="button"
          disabled={currentStep === 6}
          onClick={() => setCurrentStep(prev => prev + 1)}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg flex items-center gap-1 transition active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none"
        >
          Next Section <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
