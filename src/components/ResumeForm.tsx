/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ResumeData, Education, Experience, Skill, Project, Certification, Language } from "../types";
import { Sparkles, Plus, Trash2, ChevronRight, ChevronLeft, Check, Wand2, Info, Loader2 } from "lucide-react";

interface ResumeFormProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
  aiStatus: { status: string; message: string };
}

export default function ResumeForm({ data, onChange, aiStatus }: ResumeFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [enhancingField, setEnhancingField] = useState<string | null>(null);

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
    try {
      const response = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "summary",
          payload: {
            careerGoal: data.personal.jobTitle,
            skills: data.skills.map(s => s.name).join(", "),
            experience: data.experience.map(e => `${e.jobTitle} at ${e.companyName}`).join("; "),
            education: data.education.map(ed => ed.degree).join("; "),
          },
        }),
      });
      const resData = await response.json();
      if (resData.output) {
        updatePersonal("summary", resData.output.trim());
      } else if (resData.error) {
        alert(resData.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to communicate with AI server. Ensure your Gemini API Key is set.");
    } finally {
      setEnhancingField(null);
    }
  };

  const handleAIEnhanceExperience = async (id: string, jobTitle: string, companyName: string, raw: string) => {
    if (enhancingField || !raw.trim()) return;
    setEnhancingField(`exp-${id}`);
    try {
      const response = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "experience",
          payload: { jobTitle, companyName, rawResponsibilities: raw },
        }),
      });
      const resData = await response.json();
      if (resData.output) {
        updateExperience(id, "responsibilities", resData.output.trim());
      } else if (resData.error) {
        alert(resData.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error enhancing experience bullet points.");
    } finally {
      setEnhancingField(null);
    }
  };

  const handleAIEnhanceProject = async (id: string, projectName: string, tech: string, desc: string) => {
    if (enhancingField || !desc.trim()) return;
    setEnhancingField(`proj-${id}`);
    try {
      const response = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "project",
          payload: { projectName, technologiesUsed: tech, description: desc },
        }),
      });
      const resData = await response.json();
      if (resData.output) {
        updateProject(id, "description", resData.output.trim());
      } else if (resData.error) {
        alert(resData.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error generating technical project description.");
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
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">Step 6: Customize Resume Shell & Template theme</h3>

            {/* Template Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">Select Layout Template</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: "modern", title: "Modern Minimalist", desc: "Clean & high ATS-score layout" },
                  { id: "professional", title: "Corporate Georgia", desc: "Elegant split sidebar corporate design" },
                  { id: "creative", title: "Creative Grotesk", desc: "Stylish visual journey visual block layout" },
                  { id: "student", title: "Fresh Academic", desc: "Showcases education & sandbox projects first" },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => onChange({ ...data, selectedTemplate: tpl.id as any })}
                    className={`p-4 rounded-xl text-left border-2 transition active:scale-[0.98] ${
                      data.selectedTemplate === tpl.id 
                        ? "border-blue-700 bg-blue-50/20" 
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <span className="text-xs font-bold block text-slate-800">{tpl.title}</span>
                    <span className="text-[10px] text-slate-400 mt-1 block leading-relaxed">{tpl.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">Accent Brand Color</label>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { value: "#1e3a8a", name: "Deep Navy" },
                  { value: "#0d9488", name: "Teal Green" },
                  { value: "#0284c7", name: "Sky Blue" },
                  { value: "#db2777", name: "Orchid Pink" },
                  { value: "#7c3aed", name: "Neon Violet" },
                  { value: "#dc2626", name: "Ruby Red" },
                  { value: "#1f2937", name: "Slate Dark" },
                ].map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => onChange({ ...data, selectedColor: color.value })}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-semibold transition active:scale-[0.95] flex items-center gap-1.5 border ${
                      data.selectedColor === color.value 
                        ? "border-slate-900 shadow-sm text-slate-900 bg-slate-50" 
                        : "border-slate-150 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.value }} />
                    {color.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Notice */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100/50 text-[11px] text-slate-500 leading-relaxed max-w-xl">
              <span className="font-bold text-slate-700 block mb-1">💡 Professional Printing Tips:</span>
              Once you finish editing, verify all details are complete. Resumify prints precisely formatted PDF resumes directly using vector pipelines. Ensure Margins are standard and Background Graphics are enabled in your chrome/safari printing dialogue for a spotless output representation!
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
