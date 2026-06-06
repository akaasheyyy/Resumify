/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ResumeData, Education, Experience, Skill, Project, Certification, Language } from "../types";
import { Sparkles, Plus, Trash2, ChevronRight, ChevronLeft, Check, Wand2, Info, Loader2, AlertCircle, X, Award, BookOpen, Globe, RefreshCw, Cpu, Layers, ShieldCheck, Camera, Upload, Link } from "lucide-react";

const OUTSHELL_BLUEPRINTS = [
  {
    name: "Modern Full-Stack Architect",
    role: "Full-Stack Developer",
    iconType: "developer",
    description: "Ideal for modern web/mobile developers building React, Next.js, Node.js, and cloud database engines.",
    skills: [
      { name: "TypeScript & JavaScript (ES6+)", level: "Expert" },
      { name: "React (Vite, Next.js, Redux)", level: "Expert" },
      { name: "Node.js (Express, Microservices)", level: "Intermediate" },
      { name: "PostgreSQL & MongoDB (Prisma, Mongoose)", level: "Intermediate" },
      { name: "Git, GitHub Actions CI/CD, Docker", level: "Intermediate" },
      { name: "RESTful APIs & GraphQL Architectures", level: "Expert" },
      { name: "Tailwind CSS & Responsive Layouts", level: "Expert" }
    ],
    certifications: [
      { name: "AWS Certified Developer – Associate", organization: "Amazon Web Services", year: "2025" },
      { name: "Meta Professional Full-Stack Specialization", organization: "Coursera", year: "2024" }
    ],
    languages: [
      { name: "English", proficiency: "Fluent" },
      { name: "Spanish", proficiency: "Conversational" }
    ]
  },
  {
    name: "Cloud, Infrastructure & DevOps Specialist",
    role: "Cloud DevOps Engineer",
    iconType: "cloud",
    description: "Perfect for engineers focused on high-availability cloud cluster deployments, CI/CD, and IaC lines.",
    skills: [
      { name: "Kubernetes & Docker Orchestration", level: "Expert" },
      { name: "Terraform Infrastructure-as-code (IaC)", level: "Expert" },
      { name: "AWS Cloud Stack (EC2, S3, RDS, Lambda)", level: "Expert" },
      { name: "CI/CD (GitHub Actions, GitLab Pipelines)", level: "Expert" },
      { name: "Linux Bash Scripting & Python Automation", level: "Intermediate" },
      { name: "Monitoring & Alerting (Prometheus, Grafana)", level: "Intermediate" },
      { name: "Network Security, OAuth & IAM Policies", level: "Intermediate" }
    ],
    certifications: [
      { name: "AWS Certified DevOps Engineer – Professional", organization: "Amazon Web Services", year: "2025" },
      { name: "Certified Kubernetes Administrator (CKA)", organization: "The Linux Foundation", year: "2024" }
    ],
    languages: [
      { name: "English", proficiency: "Fluent" }
    ]
  },
  {
    name: "AI & Data Science Architect",
    role: "AI & Data Engineer",
    iconType: "ai",
    description: "Deep blueprint for developers exploring machine learning, neural pipelines, and predictive analysis.",
    skills: [
      { name: "Python (NumPy, Pandas, Scikit-learn)", level: "Expert" },
      { name: "Machine Learning & Neural Network Foundations", level: "Intermediate" },
      { name: "Generative AI Engineering (Google Gemini API SDK)", level: "Expert" },
      { name: "SQL (Complex Query & Window Joins)", level: "Expert" },
      { name: "Data Engineering Pipelines & Apache Airflow", level: "Intermediate" },
      { name: "TensorFlow & PyTorch Core Models", level: "Intermediate" },
      { name: "Data Visualisation (Tableau, D3.js Charts)", level: "Intermediate" }
    ],
    certifications: [
      { name: "Google Cloud Professional Data Engineer", organization: "Google Cloud Platform", year: "2025" },
      { name: "DeepLearning.AI TensorFlow Specialist", organization: "DeepLearning.AI", year: "2024" }
    ],
    languages: [
      { name: "English", proficiency: "Fluent" },
      { name: "Mandarin", proficiency: "Beginner" }
    ]
  },
  {
    name: "Product, Agile & Project Strategy Leader",
    role: "Product Manager",
    iconType: "strategy",
    description: "Designed for leaders orchestrating metrics, agile sprint ceremonies, and visual strategic milestones.",
    skills: [
      { name: "Agile, Scrum & Kanban Sprints", level: "Expert" },
      { name: "Product Strategy & Competitive Benchmarking", level: "Expert" },
      { name: "Behavioral Analytics & GA4 Telemetry", level: "Intermediate" },
      { name: "Stakeholder Alignment & Cross-functional Leadership", level: "Expert" },
      { name: "Jira, Confluence & Notion Roadmapping", level: "Expert" },
      { name: "A/B Testing & Conversion Rate Optimization", level: "Intermediate" }
    ],
    certifications: [
      { name: "Certified Scrum Product Owner (CSPO)", organization: "Scrum Alliance", year: "2024" },
      { name: "Product Management Certificate (PMC-I)", organization: "Product School", year: "2025" }
    ],
    languages: [
      { name: "English", proficiency: "Native" }
    ]
  },
  {
    name: "Growth Marketer & Digital Strategist",
    role: "Marketer",
    iconType: "marketing",
    description: "Interactive blueprint for copywriters, acquisition specialist loops, and analytics funnels.",
    skills: [
      { name: "SEO Optimization & SEM Campaigns (Google Ads)", level: "Expert" },
      { name: "Direct Copywriting & Audience Persona Modeling", level: "Expert" },
      { name: "Google Analytics 4 & Attribution Reporting", level: "Expert" },
      { name: "CRM Email Campaigns & ActiveCampaign Automation", level: "Intermediate" },
      { name: "A/B Testing Hubspot Landing Pages", level: "Intermediate" },
      { name: "Paid Social Growth (Meta, LinkedIn Ecosystems)", level: "Expert" }
    ],
    certifications: [
      { name: "Google Analytics Individual Qualification", organization: "Google Academy", year: "2024" },
      { name: "HubSpot Inbound Marketing Certification", organization: "HubSpot Academy", year: "2025" }
    ],
    languages: [
      { name: "English", proficiency: "Native" },
      { name: "German", proficiency: "Fluent" }
    ]
  }
];

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
  const [selectedBlueprintIndex, setSelectedBlueprintIndex] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [compressingPhoto, setCompressingPhoto] = useState(false);

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

  const handlePhotoFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorToast("Please upload an image file (PNG, JPG, WebP, SVG, etc.)");
      setTimeout(() => setErrorToast(null), 5000);
      return;
    }

    // Direct check for size to prevent Firestore payload sync failures (> 900KB)
    if (file.size > 921600) {
      setErrorToast(`File is too large (${Math.round(file.size / 1024)}KB). To guarantee flawless database sync, please import a photo under 900KB or reference a web link.`);
      setTimeout(() => setErrorToast(null), 6000);
      return;
    }

    setCompressingPhoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const originalDataUrl = event.target?.result as string;
      
      // Store the literal, raw base64 data URL exactly as it is, fully preserving original format, transparency, resolution, and quality.
      updatePersonal("photoUrl", originalDataUrl);
      setSuccessToast("Photo processed and preserved at 100% original quality!");
      setTimeout(() => setSuccessToast(null), 4000);
      setCompressingPhoto(false);
    };

    reader.onerror = () => {
      setErrorToast("Failed to read image file.");
      setTimeout(() => setErrorToast(null), 5000);
      setCompressingPhoto(false);
    };
    reader.readAsDataURL(file);
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

  const addPopularSkill = (name: string, level: "Beginner" | "Intermediate" | "Expert" = "Intermediate") => {
    if (data.skills.some(s => s.name.trim().toLowerCase() === name.trim().toLowerCase())) {
      setSuccessToast(`"${name}" is already in your skills!`);
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }
    const newSkill: Skill = { id: `sk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, name, level };
    onChange({ ...data, skills: [...data.skills, newSkill] });
    setSuccessToast(`Added skill: ${name}`);
    setTimeout(() => setSuccessToast(null), 3000);
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

  const applyBlueprint = (blueprintIndex: number, overwrite: boolean) => {
    const bp = OUTSHELL_BLUEPRINTS[blueprintIndex];
    if (!bp) return;

    const newSkills = bp.skills.map((s, idx) => ({
      id: `sk-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      name: s.name,
      level: s.level as "Beginner" | "Intermediate" | "Expert" | ""
    }));

    const newCerts = bp.certifications.map((c, idx) => ({
      id: `cert-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      name: c.name,
      organization: c.organization,
      year: c.year
    }));

    const newLangs = bp.languages.map((l, idx) => ({
      id: `lang-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      name: l.name,
      proficiency: l.proficiency
    }));

    if (overwrite) {
      onChange({
        ...data,
        skills: newSkills,
        certifications: newCerts,
        languages: newLangs
      });
      setSuccessToast(`Reset & applied ${bp.name} blueprint successfully!`);
    } else {
      onChange({
        ...data,
        skills: [...data.skills, ...newSkills],
        certifications: [...data.certifications, ...newCerts],
        languages: [...data.languages, ...newLangs]
      });
      setSuccessToast(`Merged ${bp.name} blueprints into your active list!`);
    }
    setTimeout(() => setSuccessToast(null), 5000);
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
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Date of Birth</label>
                <input
                  type="text"
                  value={data.personal.dob || ""}
                  onChange={(e) => updatePersonal("dob", e.target.value)}
                  placeholder="e.g. October 15, 1995"
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

            {/* PROFILE PICTURE MANAGEMENT SECTION */}
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-250 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-extrabold text-slate-850 uppercase tracking-wider">
                    Profile Portfolio Photo
                  </h4>
                </div>
                {/* Switch to enable/disable */}
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!data.showAvatar}
                    onChange={(e) => onChange({ ...data, showAvatar: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Show Portrait on Resume</span>
                </label>
              </div>

              {data.showAvatar && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* LEFT: Live Preview Frame */}
                  <div className="md:col-span-3 flex flex-col items-center justify-center space-y-3 bg-white p-3 rounded-xl border border-slate-200 shadow-3xs">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Live Frame Preview</span>
                    
                    <div className="relative group shrink-0 flex items-center justify-center min-h-[140px] w-full">
                      <img
                        src={data.personal.photoUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(data.personal.email || data.personal.fullName || "Akash")}`}
                        alt={data.personal.fullName || "Portrait Preview"}
                        referrerPolicy="no-referrer"
                        className={`object-cover bg-slate-100 border border-slate-300 shadow-2xs ${
                          (data.selectedAvatarSize === "sm") ? "w-14 h-14" :
                          (data.selectedAvatarSize === "md") ? "w-20 h-20" :
                          (data.selectedAvatarSize === "xl") ? "w-28 h-28" :
                          (data.selectedAvatarSize === "xxl") ? "w-32 h-32" : "w-24 h-24" // default to "lg" (w-24 h-24)
                        } ${
                          data.selectedAvatarShape === "rounded" ? "rounded-xl" :
                          data.selectedAvatarShape === "sharp" ? "rounded-none" : "rounded-full"
                        }`}
                        style={{ borderColor: data.selectedColor }}
                      />
                      {data.personal.photoUrl && (
                        <button
                          type="button"
                          onClick={() => updatePersonal("photoUrl", "")}
                          className="absolute top-1 right-2 bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded-full p-1 shadow-3xs transition active:scale-95 animate-fadeIn"
                          title="Remove custom photo and fallback to avatar"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Frame shapes selector */}
                    <div className="w-full space-y-1.5 border-t border-slate-100 pt-2.5">
                      <span className="text-[8px] text-slate-400 uppercase font-mono font-extrabold block text-center">Shape Format</span>
                      <div className="flex gap-1 justify-center">
                        {[
                          { label: "Circle", val: "circle" },
                          { label: "Rounded", val: "rounded" },
                          { label: "Sharp", val: "sharp" }
                        ].map((item) => (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => onChange({ ...data, selectedAvatarShape: item.val as any })}
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition-all ${
                              (data.selectedAvatarShape || "circle") === item.val
                                ? "bg-slate-900 border-slate-900 text-white shadow-3xs"
                                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Frame Sizing selector */}
                    <div className="w-full space-y-1.5 border-t border-slate-100 pt-2.5">
                      <span className="text-[8px] text-slate-400 uppercase font-mono font-extrabold block text-center">Display Sizing</span>
                      <div className="flex gap-1 justify-center">
                        {[
                          { label: "SM", val: "sm", title: "Compact (56px)" },
                          { label: "MD", val: "md", title: "Standard (80px)" },
                          { label: "LG", val: "lg", title: "Large (96px)" },
                          { label: "XL", val: "xl", title: "Bio Focus (112px)" },
                          { label: "XXL", val: "xxl", title: "Executive Accent (128px)" }
                        ].map((item) => (
                          <button
                            key={item.val}
                            type="button"
                            title={item.title}
                            onClick={() => onChange({ ...data, selectedAvatarSize: item.val as any })}
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border transition-all ${
                              (data.selectedAvatarSize || "lg") === item.val
                                ? "bg-blue-600 border-blue-600 text-white shadow-3xs"
                                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Upload and URL controls */}
                  <div className="md:col-span-9 space-y-4">
                    {/* Drag and Drop Zone */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                        if (e.dataTransfer.files?.[0]) {
                          handlePhotoFile(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => document.getElementById("photo-upload-input")?.click()}
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-1.5 ${
                        dragActive
                          ? "border-blue-500 bg-blue-50/55"
                          : "border-slate-250 bg-white hover:border-slate-400 hover:bg-slate-50/50"
                      }`}
                    >
                      <input
                        type="file"
                        id="photo-upload-input"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handlePhotoFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                      
                      {compressingPhoto ? (
                        <>
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                          <p className="text-[11px] font-extrabold text-blue-600 animate-pulse">Reading Raw Ultra-HD Photo...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-slate-400" />
                          <p className="text-[11.5px] font-bold text-slate-700">
                            Upload portrait photo from your computer
                          </p>
                          <p className="text-[9.5px] text-slate-500 font-medium leading-none">
                            Supports any photo format (PNG, JPEG, WebP, SVG, GIF, etc.). Drag & Drop or click to browse.
                          </p>
                        </>
                      )}
                    </div>

                    {/* Manual web URL input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider font-mono flex items-center gap-1">
                        <Link className="w-3 h-3 text-slate-450" />
                        <span>Or specify web image path address (URL)</span>
                      </label>
                      <input
                        type="url"
                        value={data.personal.photoUrl?.startsWith("data:") ? "" : data.personal.photoUrl || ""}
                        onChange={(e) => updatePersonal("photoUrl", e.target.value)}
                        placeholder="https://example.com/portrait.jpg"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      />
                      <p className="text-[9px] text-slate-500 font-medium leading-normal">
                        Direct web address of your hosted photo profile. If empty, a beautiful dynamic seed profile will be active in place.
                      </p>
                    </div>
                  </div>
                </div>
              )}
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

        {/* STEP 4: Skills, Certifications & Languages */}
        {currentStep === 4 && (
          <div className="space-y-6" id="skills-step-container">
            {/* Header intro */}
            <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/20 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h3 className="text-sm font-bold text-slate-800">Visual Blueprint Injection & Construction</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium mt-0.5">
                  Accelerate your CV formulation by instating one of our highly focused **Career Direction Outshell Blueprints** below, or manually populate and perfect your credentials inside the 3-column organizer.
                </p>
              </div>
            </div>

            {/* Outshell Blueprint Presets Panel */}
            <div className="space-y-3" id="blueprint-presets-section">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Select & Inject Career Blueprint</span>
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                {OUTSHELL_BLUEPRINTS.map((bp, bpIdx) => {
                  const isSelected = selectedBlueprintIndex === bpIdx;
                  return (
                    <button
                      key={bpIdx}
                      type="button"
                      id={`bp-button-${bpIdx}`}
                      onClick={() => setSelectedBlueprintIndex(isSelected ? null : bpIdx)}
                      className={`text-left p-3.5 rounded-xl border transition-all duration-300 relative ${
                        isSelected
                          ? "bg-blue-50/70 border-blue-600 shadow-md ring-1 ring-blue-500/20"
                          : "bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50 shadow-3xs"
                      }`}
                    >
                      {/* Floating Indicator */}
                      {isSelected && (
                        <span className="absolute top-2 right-2 flex h-4 w-4 bg-blue-600 rounded-full items-center justify-center text-[10px] text-white font-bold animate-scaleIn">
                          ✓
                        </span>
                      )}
                      
                      {/* Icon Indicator */}
                      <div className="mb-2">
                        {bp.iconType === "developer" && <Cpu className={`w-5 h-5 ${isSelected ? "text-blue-700" : "text-indigo-550"}`} />}
                        {bp.iconType === "cloud" && <Layers className={`w-5 h-5 ${isSelected ? "text-blue-700" : "text-sky-550"}`} />}
                        {bp.iconType === "ai" && <ShieldCheck className={`w-5 h-5 ${isSelected ? "text-blue-700" : "text-purple-550"}`} />}
                        {bp.iconType === "strategy" && <Award className={`w-5 h-5 ${isSelected ? "text-blue-700" : "text-amber-550"}`} />}
                        {bp.iconType === "marketing" && <Globe className={`w-5 h-5 ${isSelected ? "text-blue-700" : "text-emerald-555"}`} />}
                      </div>

                      <h4 className="text-[11.5px] font-bold text-slate-800 leading-tight block truncate" title={bp.name}>
                        {bp.name}
                      </h4>
                      <p className="text-[9.5px] text-slate-450 font-bold tracking-wide uppercase mt-0.5 font-mono">
                        {bp.role}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Blueprint Preview Drawer */}
              {selectedBlueprintIndex !== null && (
                <div 
                  className="p-4 bg-white border border-blue-200 rounded-xl space-y-4 shadow-sm animate-fadeIn"
                  id="blueprint-preview-drawer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold bg-blue-105 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-widest font-mono">
                          Selected Blueprint Outshell
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">
                        {OUTSHELL_BLUEPRINTS[selectedBlueprintIndex].name} Preset Preview
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-normal font-medium">
                        {OUTSHELL_BLUEPRINTS[selectedBlueprintIndex].description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        id="btn-merge-blueprint"
                        onClick={() => {
                          applyBlueprint(selectedBlueprintIndex, false);
                          setSelectedBlueprintIndex(null);
                        }}
                        className="px-3 py-1.5 text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-105 rounded-lg border border-blue-200 flex items-center gap-1.5 transition active:scale-[0.97]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Merge Blueprint
                      </button>
                      <button
                        type="button"
                        id="btn-overwrite-blueprint"
                        onClick={() => {
                          if (window.confirm("This action will clear all of your current skills, certificates, and languages on Step 4 and replace them with this catalog blueprint. Proceed?")) {
                            applyBlueprint(selectedBlueprintIndex, true);
                            setSelectedBlueprintIndex(null);
                          }
                        }}
                        className="px-3 py-1.5 text-[11px] font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition active:scale-[0.97]"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Clear & Overwrite List
                      </button>
                    </div>
                  </div>

                  {/* Visual Items Preview Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11.5px]">
                    {/* Skills preview */}
                    <div className="space-y-1.5 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                      <p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider font-mono">Curated Core Skills ({OUTSHELL_BLUEPRINTS[selectedBlueprintIndex].skills.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {OUTSHELL_BLUEPRINTS[selectedBlueprintIndex].skills.map((s, sIdx) => (
                          <span key={sIdx} className="inline-flex items-center gap-1 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-md border border-slate-200">
                            {s.name}
                            <span className="text-[8.5px] font-bold text-indigo-650 opacity-80 uppercase">({s.level})</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Certifications preview */}
                    <div className="space-y-1.5 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                      <p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider font-mono font-sans">Curated Certifications ({OUTSHELL_BLUEPRINTS[selectedBlueprintIndex].certifications.length})</p>
                      <ul className="space-y-1 text-[10.5px] text-slate-600 font-medium">
                        {OUTSHELL_BLUEPRINTS[selectedBlueprintIndex].certifications.map((c, cIdx) => (
                          <li key={cIdx} className="flex items-start gap-1">
                            <span className="text-amber-500 font-bold shrink-0">★</span>
                            <span className="leading-tight"><strong className="text-slate-800 font-bold">{c.name}</strong> – {c.organization} ({c.year})</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Languages preview */}
                    <div className="space-y-1.5 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                      <p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider font-mono">Curated Dialects ({OUTSHELL_BLUEPRINTS[selectedBlueprintIndex].languages.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {OUTSHELL_BLUEPRINTS[selectedBlueprintIndex].languages.map((l, lIdx) => (
                          <span key={lIdx} className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-150 font-semibold px-2 py-0.5 rounded-md capitalize">
                            {l.name} ({l.proficiency})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* List Construction Area Header */}
            <div className="flex justify-between items-center border-b pb-2 pt-2">
              <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                <span>Pristine Details Customizer</span>
              </h4>
              <div className="flex gap-2">
                <button
                  type="button"
                  id="add-skill-button"
                  onClick={addSkill}
                  className="px-2.5 py-1 text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Skill
                </button>
                <button
                  type="button"
                  id="add-cert-button"
                  onClick={addCertification}
                  className="px-2.5 py-1 text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Certificate
                </button>
                <button
                  type="button"
                  id="add-lang-button"
                  onClick={addLanguage}
                  className="px-2.5 py-1 text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Language
                </button>
              </div>
            </div>

            {/* Subgrid of organizer panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* SKILLS COLUMN */}
              <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col justify-between" id="skills-form-column">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>Technical & Soft Core Skills</span>
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 font-mono bg-white px-1.5 py-0.2 border border-slate-150 rounded-md">
                      {data.skills.length} Items
                    </span>
                  </div>

                  {data.skills.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-1 bg-white border border-dashed border-slate-200 rounded-xl p-4">
                      <Cpu className="w-6 h-6 text-slate-300" />
                      <p className="text-[11px] font-medium leading-normal">No custom skills created.</p>
                      <button type="button" onClick={addSkill} className="text-[10px] text-blue-600 hover:underline font-bold mt-1">
                        + Add Skill
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5" id="skills-list-scroll-wrapper">
                      {data.skills.map(s => {
                        return (
                          <div key={s.id} className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-3xs space-y-2 select-container">
                            <div className="flex gap-2 items-center justify-between">
                              <input
                                type="text"
                                value={s.name}
                                onChange={(e) => updateSkill(s.id, "name", e.target.value)}
                                placeholder="e.g. React.js"
                                className="flex-1 px-2 py-1 text-xs border border-slate-200 bg-white rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-semibold"
                              />
                              <button
                                type="button"
                                onClick={() => removeSkill(s.id)}
                                className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition shrink-0"
                                title="Remove skill item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            
                            {/* Horizontal Button Level Selector Pill */}
                            <div className="flex items-center gap-1 justify-between bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider ml-1 font-mono">LVL:</span>
                              <div className="flex gap-0.5 justify-end">
                                {[
                                  { label: "Beg", val: "Beginner", col: "active:bg-sky-500 text-sky-700 bg-sky-50 border-sky-100 focus:ring-sky-300" },
                                  { label: "Mid", val: "Intermediate", col: "active:bg-indigo-500 text-indigo-700 bg-indigo-50 border-indigo-100 focus:ring-indigo-300" },
                                  { label: "Exp", val: "Expert", col: "active:bg-emerald-500 text-emerald-700 bg-emerald-50 border-emerald-100 focus:ring-emerald-300" }
                                ].map((choice) => {
                                  const active = s.level === choice.val;
                                  return (
                                    <button
                                      key={choice.val}
                                      type="button"
                                      onClick={() => updateSkill(s.id, "level", s.level === choice.val ? "" : (choice.val as any))}
                                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                                        active
                                          ? `shadow-3xs ${choice.col.split(' ')[1]} ${choice.col.split(' ')[2]} border-current ring-1 ring-offset-0`
                                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
                                      }`}
                                    >
                                      {choice.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Quick Preset Tray */}
                  <div className="border-t border-slate-200/60 pt-3 mt-2 space-y-2">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider font-mono block">Quick Add Professional Skills</span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { name: "ReactJS", icon: "⚛️" },
                        { name: "TypeScript", icon: "📘" },
                        { name: "Python", icon: "🐍" },
                        { name: "SQL", icon: "🗄️" },
                        { name: "AWS Cloud", icon: "☁️" },
                        { name: "CSS/Tailwind", icon: "🎨" },
                        { name: "Figma UI", icon: "🎨" },
                        { name: "AI Systems", icon: "🤖" },
                        { name: "Project Mgmt", icon: "📅" },
                        { name: "Agile Scrum", icon: "⚡" },
                        { name: "Communications", icon: "🎙️" },
                        { name: "Leadership", icon: "🤝" }
                      ].map((item) => {
                        const exists = data.skills.some(s => s.name.trim().toLowerCase() === item.name.toLowerCase());
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => {
                              if (exists) {
                                const target = data.skills.find(s => s.name.trim().toLowerCase() === item.name.toLowerCase());
                                if (target) removeSkill(target.id);
                              } else {
                                addPopularSkill(item.name);
                              }
                            }}
                            className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md border transition-all flex items-center gap-1 active:scale-95 select-none ${
                              exists 
                                ? "bg-indigo-600 border-indigo-700 text-white shadow-3xs"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            <span>{item.icon}</span>
                            <span>{item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* CERTIFICATIONS COLUMN */}
              <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col justify-between" id="certs-form-column">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Certifications & Honors</span>
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 font-mono bg-white px-1.5 py-0.2 border border-slate-150 rounded-md">
                      {data.certifications.length} Items
                    </span>
                  </div>

                  {data.certifications.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-1 bg-white border border-dashed border-slate-200 rounded-xl p-4">
                      <Award className="w-6 h-6 text-slate-300" />
                      <p className="text-[11px] font-medium leading-normal">No certificates logged.</p>
                      <button type="button" onClick={addCertification} className="text-[10px] text-blue-600 hover:underline font-bold mt-1">
                        + Add Credentials
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5" id="certs-list-scroll-wrapper">
                      {data.certifications.map(c => (
                        <div key={c.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-3xs space-y-2 relative group animate-slideIn">
                          <button
                            type="button"
                            onClick={() => removeCertification(c.id)}
                            className="absolute right-1.5 top-1.5 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                            title="Remove certification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          
                          <div className="space-y-1">
                            <span className="text-[8.5px] font-black uppercase text-slate-400 tracking-wide font-mono block">Credential Name</span>
                            <input
                              type="text"
                              value={c.name}
                              onChange={(e) => updateCertification(c.id, "name", e.target.value)}
                              placeholder="AWS Certified Solutions Architect"
                              className="w-full px-2 py-1 text-xs border border-slate-200 bg-white rounded-lg outline-none focus:border-blue-600 font-semibold"
                            />
                          </div>

                          <div className="grid grid-cols-5 gap-1.5">
                            <div className="col-span-3 space-y-0.5">
                              <span className="text-[8.5px] font-black uppercase text-slate-400 tracking-wide font-mono block">Issuer</span>
                              <input
                                type="text"
                                value={c.organization}
                                onChange={(e) => updateCertification(c.id, "organization", e.target.value)}
                                placeholder="Amazon Web Services"
                                className="w-full px-1.5 py-0.5 text-[10px] border border-slate-200 bg-white rounded-md outline-none"
                              />
                            </div>
                            <div className="col-span-2 space-y-0.5">
                              <span className="text-[8.5px] font-black uppercase text-slate-400 tracking-wide font-mono block">Year Issued</span>
                              <input
                                type="text"
                                value={c.year}
                                onChange={(e) => updateCertification(c.id, "year", e.target.value)}
                                placeholder="2025"
                                className="w-full px-1.5 py-0.5 text-[10px] border border-slate-200 bg-white rounded-md outline-none font-semibold text-center"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* LANGUAGES COLUMN */}
              <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col justify-between" id="langs-form-column">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-emerald-555 shrink-0" />
                      <span>Languages & Cultural Dialects</span>
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 font-mono bg-white px-1.5 py-0.2 border border-slate-150 rounded-md">
                      {data.languages.length} Items
                    </span>
                  </div>

                  {data.languages.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-1 bg-white border border-dashed border-slate-200 rounded-xl p-4">
                      <Globe className="w-6 h-6 text-slate-300" />
                      <p className="text-[11px] font-medium leading-normal">No dialects listed.</p>
                      <button type="button" onClick={addLanguage} className="text-[10px] text-blue-600 hover:underline font-bold mt-1">
                        + Add Dialect
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5" id="langs-list-scroll-wrapper">
                      {data.languages.map(l => (
                        <div key={l.id} className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-3xs space-y-2 flex flex-col animate-slideIn">
                          <div className="flex gap-2 items-center justify-between">
                            <input
                              type="text"
                              value={l.name}
                              onChange={(e) => updateLanguage(l.id, "name", e.target.value)}
                              placeholder="e.g. English"
                              className="flex-1 px-2 py-1 text-xs border border-slate-200 bg-white rounded-lg outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 font-semibold"
                            />
                            <button
                              type="button"
                              onClick={() => removeLanguage(l.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition shrink-0"
                              title="Delete dialect"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Horizontal Button Proficiency Selector Tag */}
                          <div className="flex items-center gap-1 justify-between bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider ml-1 font-mono">FLK:</span>
                            <div className="flex flex-wrap gap-0.5 justify-end">
                              {[
                                { label: "Native", col: "text-emerald-700 bg-emerald-50 border-emerald-100" },
                                { label: "Fluent", col: "text-blue-700 bg-blue-50 border-blue-100" },
                                { label: "Conversational", col: "text-indigo-700 bg-indigo-50 border-indigo-100" },
                                { label: "Beginner", col: "text-slate-755 bg-slate-100 border-slate-200" }
                              ].map((prof) => {
                                const active = l.proficiency === prof.label;
                                return (
                                  <button
                                    key={prof.label}
                                    type="button"
                                    onClick={() => updateLanguage(l.id, "proficiency", prof.label)}
                                    className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded transition-all ${
                                      active
                                        ? `shadow-3xs ${prof.col.split(' ')[0]} ${prof.col.split(' ')[1]} border-current font-extrabold ring-1 ring-offset-0`
                                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
                                    }`}
                                  >
                                    {prof.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
