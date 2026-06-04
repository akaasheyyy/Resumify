/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ResumeData } from "../types";
import { Mail, Phone, MapPin, Linkedin, Globe, Award, BookOpen, Layers, Briefcase, Languages } from "lucide-react";

interface ResumePreviewProps {
  data: ResumeData;
  printRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ResumePreview({ data, printRef }: ResumePreviewProps) {
  const { 
    personal, education, experience, skills, projects, certifications, languages, 
    selectedTemplate, selectedColor, selectedFont, selectedDensity, selectedBulletStyle, 
    selectedBorderAccent, showAvatar, selectedAvatarShape, selectedAvatarSize
  } = data;

  // Spacing and Density wrapper padding solver
  const getPaddingClass = () => {
    switch (selectedDensity) {
      case "compact": return "p-4 sm:p-5 text-[11px]";
      case "spacious": return "p-11 sm:p-12 text-[13px]";
      case "atmospheric": return "p-14 sm:p-16 text-sm";
      case "comfortable":
      default: return "p-8 sm:p-10 text-xs";
    }
  };

  // Border Accent helper
  const getBorderStyles = (): React.CSSProperties => {
    const s: React.CSSProperties = {
      fontFamily: selectedFont || "Inter, sans-serif",
    };
    if (selectedBorderAccent === "left-bar") {
      s.borderLeft = `8px solid ${selectedColor}`;
    } else if (selectedBorderAccent === "frame") {
      s.border = `4px double ${selectedColor}`;
    } else if (selectedBorderAccent === "accent-bottom") {
      s.borderBottom = `8px solid ${selectedColor}`;
    }
    return s;
  };

  // Dynamic bullet lists formatting
  const renderBullets = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n").filter(l => l.trim() !== "");
    if (lines.length <= 1 && !text.startsWith("-") && !text.startsWith("•")) {
      return <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{text}</p>;
    }

    let listClass = "list-disc pl-4";
    let bulletChar = "";
    if (selectedBulletStyle === "square") {
      listClass = "list-[square] pl-4";
    } else if (selectedBulletStyle === "dash") {
      listClass = "list-none pl-1 space-y-1";
      bulletChar = "― ";
    } else if (selectedBulletStyle === "accent-dot") {
      listClass = "list-none pl-1 space-y-1";
      bulletChar = "✦ ";
    }

    return (
      <ul className={`${listClass} space-y-1 mt-1 text-xs text-slate-600 leading-relaxed`}>
        {lines.map((line, idx) => {
          const cleanLine = line.replace(/^[•\-\*\s\▪\✦\★]+/, "");
          return (
            <li key={idx} className="flex items-start gap-1">
              {bulletChar && <span className="shrink-0 scale-90" style={{ color: selectedColor }}>{bulletChar}</span>}
              <span className="flex-1">{cleanLine}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  // Avatar Image block rendering
  const renderAvatar = () => {
    if (!showAvatar) return null;
    const shapeClass = 
      selectedAvatarShape === "rounded" ? "rounded-xl" :
      selectedAvatarShape === "sharp" ? "rounded-none border-2" : "rounded-full";
    const avatarUrl = personal.photoUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(personal.email || personal.fullName || "Akash")}`;
    
    // Choose photo/avatar render dimensions: default to lg (w-24 h-24 / 96px) for an outstanding presentation!
    const sizeMap = {
      sm: "w-14 h-14",
      md: "w-20 h-20",
      lg: "w-24 h-24",
      xl: "w-28 h-28",
      xxl: "w-32 h-32"
    };
    const sizeClass = sizeMap[selectedAvatarSize || "lg"] || "w-24 h-24";

    return (
      <img
        src={avatarUrl}
        alt={personal.fullName || "Portrait"}
        referrerPolicy="no-referrer"
        className={`${sizeClass} object-cover bg-slate-50 border border-slate-200 shadow-3xs shrink-0 ${shapeClass}`}
        style={{ borderColor: selectedColor }}
      />
    );
  };

  // Modern Template
  const renderModern = () => (
    <div className={`${getPaddingClass()} bg-white max-w-[21cm] min-h-[29.7cm] shadow-xs relative`} style={{ fontFamily: selectedFont || "Inter, sans-serif" }}>
      {/* Header */}
      <div className="border-b-2 pb-6" style={{ borderColor: selectedColor }}>
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{personal.fullName || "Your Full Name"}</h1>
            <p className="text-lg font-medium mt-1 uppercase tracking-wider" style={{ color: selectedColor }}>
              {personal.jobTitle || "Professional Title"}
            </p>
          </div>
          {renderAvatar()}
        </div>

        {/* Contact info Bar */}
        <div className="flex flex-wrap gap-y-2 gap-x-4 mt-4 text-[11px] text-slate-500">
          {personal.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" style={{ color: selectedColor }} />
              {personal.email}
            </span>
          )}
          {personal.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" style={{ color: selectedColor }} />
              {personal.phone}
            </span>
          )}
          {personal.address && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" style={{ color: selectedColor }} />
              {personal.address}
            </span>
          )}
          {personal.linkedin && (
            <span className="flex items-center gap-1">
              <Linkedin className="w-3.5 h-3.5" style={{ color: selectedColor }} />
              {personal.linkedin}
            </span>
          )}
          {personal.website && (
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" style={{ color: selectedColor }} />
              {personal.website}
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      {personal.summary && (
        <div className="mt-6">
          <p className="text-xs text-slate-600 leading-relaxed text-justify">{personal.summary}</p>
        </div>
      )}

      {/* Grid Content */}
      <div className="grid grid-cols-3 gap-6 mt-6">
        {/* Main Column */}
        <div className="col-span-2 space-y-6">
          {/* Experience */}
          {experience.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b pb-1 flex items-center gap-1.5" style={{ color: selectedColor, borderColor: `${selectedColor}30` }}>
                <Briefcase className="w-4 h-4" /> Professional Experience
              </h2>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id} className="group">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-xs font-bold text-slate-800">{exp.jobTitle}</h3>
                      <span className="text-[10px] text-slate-400 font-semibold">{exp.duration}</span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{exp.companyName}</p>
                    <div className="mt-1.5">{renderBullets(exp.responsibilities)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b pb-1 flex items-center gap-1.5" style={{ color: selectedColor, borderColor: `${selectedColor}30` }}>
                <Layers className="w-4 h-4" /> Projects
              </h2>
              <div className="space-y-4">
                {projects.map((proj) => (
                  <div key={proj.id}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-xs font-bold text-slate-800">{proj.projectName}</h3>
                      {proj.technologiesUsed && (
                        <span className="text-[9px] px-2 py-0.5 bg-slate-100 rounded-full text-slate-600 font-medium font-mono">
                          {proj.technologiesUsed}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6 border-l pl-6 border-slate-100">
          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b pb-1 flex items-center gap-1.5" style={{ color: selectedColor, borderColor: `${selectedColor}30` }}>
                <Layers className="w-4 h-4" /> Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => {
                  let levelBadgeColor = "bg-slate-100 text-slate-600";
                  if (skill.level === "Expert") {
                    levelBadgeColor = "bg-emerald-50 text-emerald-800 border-emerald-100/60";
                  } else if (skill.level === "Intermediate") {
                    levelBadgeColor = "bg-indigo-50 text-indigo-850 border-indigo-100/60";
                  } else if (skill.level === "Beginner") {
                    levelBadgeColor = "bg-sky-50 text-sky-850 border-sky-100/60";
                  }
                  return (
                    <div 
                      key={skill.id} 
                      className="text-[10px] px-2.5 py-1.5 bg-white rounded-lg border border-slate-150 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col gap-0.5 hover:shadow-xs transition-all border-l-2"
                      style={{ borderLeftColor: selectedColor }}
                    >
                      <span className="font-bold text-slate-800 tracking-tight">{skill.name}</span>
                      {skill.level && (
                        <span className={`text-[7px] px-1 py-0.2 rounded font-black uppercase tracking-wider self-start border ${levelBadgeColor}`}>
                          {skill.level}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b pb-1 flex items-center gap-1.5" style={{ color: selectedColor, borderColor: `${selectedColor}30` }}>
                <BookOpen className="w-4 h-4" /> Education
              </h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <h3 className="text-xs font-bold text-slate-800">{edu.degree}</h3>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5">{edu.institution}</p>
                    <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                      <span>{edu.duration}</span>
                      {edu.grade && <span className="font-semibold">{edu.grade}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b pb-1 flex items-center gap-1.5" style={{ color: selectedColor, borderColor: `${selectedColor}30` }}>
                <Award className="w-4 h-4" /> Certifications
              </h2>
              <div className="space-y-2">
                {certifications.map((cert) => (
                  <div key={cert.id}>
                    <h3 className="text-xs font-bold text-slate-800">{cert.name}</h3>
                    <p className="text-[10px] text-slate-500">{cert.organization} ({cert.year})</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b pb-1 flex items-center gap-1.5" style={{ color: selectedColor, borderColor: `${selectedColor}30` }}>
                <Languages className="w-4 h-4" /> Languages
              </h2>
              <div className="space-y-1.5">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{lang.name}</span>
                    <span className="text-[10px] text-slate-400">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Professional (Corporate layout with sidebar on Left)
  const renderProfessional = () => (
    <div className="flex max-w-[21cm] min-h-[29.7cm] bg-white shadow-xs" style={{ fontFamily: selectedFont || "Georgia, serif" }}>
      {/* Left Sidebar Accent column */}
      <div className="w-[7cm] bg-slate-900 text-slate-100 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Header Name with Avatar */}
          <div className="space-y-4">
            {renderAvatar()}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">{personal.fullName || "Your Full Name"}</h1>
              <p className="text-xs font-semibold tracking-wider mt-1.5 uppercase opacity-90" style={{ color: selectedColor }}>
                {personal.jobTitle || "Title"}
              </p>
            </div>
          </div>

          {/* Contact details */}
          <div className="space-y-3 pt-4 border-t border-slate-700 text-xs">
            {personal.email && (
              <div className="flex gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: selectedColor }} />
                <span className="break-all text-[11px] text-slate-300">{personal.email}</span>
              </div>
            )}
            {personal.phone && (
              <div className="flex gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: selectedColor }} />
                <span className="text-[11px] text-slate-300">{personal.phone}</span>
              </div>
            )}
            {personal.address && (
              <div className="flex gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: selectedColor }} />
                <span className="text-[11px] text-slate-300">{personal.address}</span>
              </div>
            )}
            {personal.linkedin && (
              <div className="flex gap-2">
                <Linkedin className="w-3.5 h-3.5 shrink-0" style={{ color: selectedColor }} />
                <span className="break-all text-[11px] text-slate-300">{personal.linkedin}</span>
              </div>
            )}
            {personal.website && (
              <div className="flex gap-2">
                <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: selectedColor }} />
                <span className="break-all text-[11px] text-slate-300">{personal.website}</span>
              </div>
            )}
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-slate-700">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center justify-between">
                <span>Core Skills</span>
                <span className="text-[10px] text-slate-400 normal-case font-mono">{skills.length} skills</span>
              </h2>
              <div className="space-y-2.5">
                {skills.map(s => {
                  const width = s.level === "Expert" ? "100%" : s.level === "Intermediate" ? "70%" : "40%";
                  const dotColor = s.level === "Expert" ? "text-emerald-400" : s.level === "Intermediate" ? "text-indigo-400" : "text-sky-450";
                  return (
                    <div key={s.id} className="text-xs">
                      <div className="flex justify-between font-bold text-slate-100 items-baseline">
                        <span className="tracking-tight">{s.name}</span>
                        <span className="text-[9px] text-slate-450 font-semibold font-mono flex items-center gap-1">
                          <span className={dotColor}>●</span> {s.level || "Expert"}
                        </span>
                      </div>
                      {/* Visual skill bars */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            backgroundColor: selectedColor, 
                            width: width 
                          }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-slate-700">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300">Languages</h2>
              <div className="space-y-1.5 text-xs">
                {languages.map(l => (
                  <div key={l.id} className="flex justify-between text-slate-200 text-[11px]">
                    <span className="font-semibold">{l.name}</span>
                    <span className="text-slate-400">{l.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info inside sidebar */}
        <div className="text-[9px] text-slate-500 text-center font-mono pt-4 border-t border-slate-800">
          References available on request
        </div>
      </div>

      {/* Right Content column */}
      <div className="flex-1 p-8 space-y-6 bg-slate-50/50">
        {/* Professional Summary */}
        {personal.summary && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest border-b pb-1.5 mb-2.5" style={{ color: selectedColor, borderColor: `${selectedColor}30` }}>
              Executive Profile
            </h2>
            <p className="text-xs text-justify text-slate-700 leading-relaxed font-sans">{personal.summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest border-b pb-1.5 mb-3" style={{ color: selectedColor, borderColor: `${selectedColor}30` }}>
              Employment History
            </h2>
            <div className="space-y-4">
              {experience.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between">
                    <h3 className="text-xs font-bold text-slate-900 font-sans">{exp.jobTitle}</h3>
                    <span className="text-[10px] text-slate-500 font-semibold">{exp.duration}</span>
                  </div>
                  <p className="text-[11px] italic text-slate-600 mt-0.5">{exp.companyName}</p>
                  <div className="mt-2 text-slate-700 font-sans">{renderBullets(exp.responsibilities)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest border-b pb-1.5 mb-3" style={{ color: selectedColor, borderColor: `${selectedColor}30` }}>
              Academic Qualifications
            </h2>
            <div className="space-y-3">
              {education.map(edu => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-xs font-bold text-slate-900 font-sans">{edu.degree}</h3>
                    <span className="text-[10px] text-slate-500 font-semibold">{edu.duration}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 font-sans">{edu.institution} {edu.grade && `— ${edu.grade}`}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects / Certifications */}
        {(projects.length > 0 || certifications.length > 0) && (
          <div className="grid grid-cols-2 gap-4">
            {projects.length > 0 && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest border-b pb-1.5 mb-2" style={{ color: selectedColor, borderColor: `${selectedColor}30` }}>
                  Key Portfolios
                </h2>
                <div className="space-y-2">
                  {projects.slice(0, 2).map(p => (
                    <div key={p.id} className="text-xs">
                      <h4 className="font-bold text-slate-800 font-sans">{p.projectName}</h4>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-3 leading-relaxed font-sans">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {certifications.length > 0 && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest border-b pb-1.5 mb-2" style={{ color: selectedColor, borderColor: `${selectedColor}30` }}>
                  Certifications
                </h2>
                <div className="space-y-2">
                  {certifications.map(c => (
                    <div key={c.id} className="text-[11px] text-slate-700">
                      <span className="font-semibold text-slate-800 font-sans">{c.name}</span>
                      <p className="text-[10px] text-slate-500">{c.organization} ({c.year})</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Creative (Stylish & modern block elements)
  const renderCreative = () => (
    <div className={`${getPaddingClass()} bg-white max-w-[21cm] min-h-[29.7cm] shadow-xs relative`} style={{ fontFamily: selectedFont || "Space Grotesk, sans-serif" }}>
      {/* Creative Background Accents */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 pointer-events-none" style={{ backgroundColor: selectedColor }} />
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-tr-full opacity-5 pointer-events-none" style={{ backgroundColor: selectedColor }} />

      {/* Creative Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex-1">
          <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full text-white font-bold mb-3 inline-block" style={{ backgroundColor: selectedColor }}>
            {personal.jobTitle || "Innovator & Builder"}
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">{personal.fullName || "Your Full Name"}</h1>
          <p className="text-xs text-slate-500 mt-2 max-w-sm">{personal.summary}</p>
        </div>
        {renderAvatar()}

        {/* Dynamic contacts block */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-2 w-full md:w-auto text-[11px] text-slate-600 font-medium">
          {personal.email && (
            <span className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" style={{ color: selectedColor }} /> {personal.email}
            </span>
          )}
          {personal.phone && (
            <span className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" style={{ color: selectedColor }} /> {personal.phone}
            </span>
          )}
          {personal.address && (
            <span className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" style={{ color: selectedColor }} /> {personal.address}
            </span>
          )}
          {personal.linkedin && (
            <span className="flex items-center gap-2">
              <Linkedin className="w-3.5 h-3.5" style={{ color: selectedColor }} /> {personal.linkedin}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Left Column (Main Skills, Educations & Projects) */}
        <div className="md:col-span-2 space-y-6">
          {/* Work Timeline */}
          {experience.length > 0 && (
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedColor }} /> Active Journey
              </h2>
              <div className="relative border-l pl-4 ml-1.5 border-slate-200 space-y-5">
                {experience.map(exp => (
                  <div key={exp.id} className="relative">
                    {/* Circle timeline accent */}
                    <span 
                      className="absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-white" 
                      style={{ backgroundColor: selectedColor }} 
                    />
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-xs font-bold text-slate-800">{exp.jobTitle}</h4>
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 rounded-full text-slate-500">{exp.duration}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{exp.companyName}</p>
                    <div className="mt-2 text-xs text-slate-600">{renderBullets(exp.responsibilities)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Featured Works */}
          {projects.length > 0 && (
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedColor }} /> Engineered Portfolios
              </h2>
              <div className="grid grid-cols-2 gap-3.5">
                {projects.map(proj => (
                  <div key={proj.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition">
                    <h4 className="text-xs font-bold text-slate-800">{proj.projectName}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{proj.description}</p>
                    {proj.technologiesUsed && (
                      <span className="text-[8px] font-mono font-semibold text-slate-400 uppercase mt-2.5 block tracking-wider">
                        {proj.technologiesUsed}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Skills Chips, Certificates, Languages) */}
        <div className="space-y-6">
          {/* Skills Grid */}
          {skills.length > 0 && (
            <div className="p-4 bg-slate-50/40 rounded-xl border border-slate-100 shadow-3xs">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selectedColor }} />
                <span>Superpowers & Skills</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map(s => {
                  let badgeText = "text-slate-705 border-slate-200 bg-white";
                  let levelTag = "";
                  if (s.level === "Expert") {
                    badgeText = "text-emerald-800 border-emerald-100 bg-emerald-50/40";
                    levelTag = "💪";
                  } else if (s.level === "Intermediate") {
                    badgeText = "text-indigo-800 border-indigo-100 bg-indigo-50/40";
                    levelTag = "⭐";
                  } else if (s.level === "Beginner") {
                    badgeText = "text-sky-800 border-sky-100 bg-sky-50/40";
                    levelTag = "🌱";
                  }
                  return (
                    <span 
                      key={s.id} 
                      className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1 shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${badgeText}`}
                    >
                      <span>{s.name}</span>
                      {levelTag && <span className="text-[9px] opacity-90">{levelTag}</span>}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Education</h3>
              <div className="space-y-3">
                {education.map(edu => (
                  <div key={edu.id} className="relative pl-3 border-l-2" style={{ borderColor: selectedColor }}>
                    <h4 className="text-xs font-bold text-slate-800">{edu.degree}</h4>
                    <span className="text-[10px] text-slate-500 block">{edu.institution}</span>
                    <span className="text-[9px] text-slate-400 block font-semibold">{edu.duration} {edu.grade && `| ${edu.grade}`}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications cards */}
          {certifications.length > 0 && (
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">Certificates</h3>
              <div className="space-y-2">
                {certifications.map(c => (
                  <div key={c.id} className="p-2.5 bg-slate-50/75 border border-slate-100 rounded-lg flex items-start gap-2">
                    <Award className="w-4 h-4 shrink-0 text-slate-400" style={{ color: selectedColor }} />
                    <div className="text-[10px]">
                      <h4 className="font-bold text-slate-800">{c.name}</h4>
                      <p className="text-[9px] text-slate-500 mt-0.5">{c.organization}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Student (Fresher design optimized focusing on Education/Projects first)
  const renderStudent = () => (
    <div className={`${getPaddingClass()} bg-white max-w-[21cm] min-h-[29.7cm] shadow-xs relative`} style={{ fontFamily: selectedFont || "Inter, sans-serif" }}>
      {/* Modern Centered Header */}
      <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 gap-3">
        {renderAvatar()}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{personal.fullName || "Your Full Name"}</h1>
          <p className="text-sm font-semibold tracking-wider text-slate-400 uppercase mt-1">{personal.jobTitle || "Fresh Graduate"}</p>
        </div>
        
        {/* Rounded Pill links */}
        <div className="flex flex-wrap justify-center gap-1.5 mt-3 text-[10px] text-slate-500">
          {personal.email && (
            <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-full">{personal.email}</span>
          )}
          {personal.phone && (
            <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-full">{personal.phone}</span>
          )}
          {personal.address && (
            <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-full">{personal.address}</span>
          )}
          {personal.linkedin && (
            <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-full">{personal.linkedin}</span>
          )}
        </div>
      </div>

      {/* Profile */}
      {personal.summary && (
        <div className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Career Objective</h2>
          <p className="text-xs text-slate-600 leading-relaxed text-justify">{personal.summary}</p>
        </div>
      )}

      {/* Education First */}
      {education.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-2.5 pb-0.5 border-b" style={{ color: selectedColor, borderColor: `${selectedColor}20` }}>
            Education
          </h2>
          <div className="space-y-3">
            {education.map(edu => (
              <div key={edu.id} className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">{edu.institution}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{edu.degree}</p>
                </div>
                <div className="text-right text-[10px]">
                  <span className="font-bold text-slate-700 block">{edu.duration}</span>
                  {edu.grade && <span className="px-1.5 py-0.5 bg-sky-50 text-sky-800 border border-sky-100 rounded text-[9px] mt-1 inline-block">{edu.grade}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Core Projects */}
      {projects.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-2.5 pb-0.5 border-b" style={{ color: selectedColor, borderColor: `${selectedColor}20` }}>
            Acadmic & Sandbox Projects
          </h2>
          <div className="space-y-4">
            {projects.map(p => (
              <div key={p.id}>
                <div className="flex justify-between">
                  <h3 className="text-xs font-semibold text-slate-800">{p.projectName}</h3>
                  {p.technologiesUsed && (
                    <span className="text-[9px] font-mono text-slate-400 font-bold">{p.technologiesUsed}</span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid of secondary items */}
      <div className="grid grid-cols-2 gap-6 mt-6 pt-4 border-t border-slate-100">
        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2.5 flex items-center justify-between">
              <span>Technical & Soft Skills</span>
              <span className="text-[8px] text-slate-405 font-mono normal-case font-normal">{skills.length} skills listed</span>
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map(s => {
                let borderStyle = s.level === "Expert" ? `2px solid ${selectedColor}` : '2px solid #cbd5e1';
                return (
                  <span 
                    key={s.id} 
                    style={{ borderLeft: borderStyle }}
                    className="text-[10px] px-2 py-0.5 bg-slate-50 border border-slate-150 rounded text-slate-700 font-semibold shadow-3xs flex items-center gap-1"
                  >
                    <span>{s.name}</span>
                    {s.level && <span className="text-[8px] text-slate-400 font-normal">({s.level})</span>}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Experience or leadership */}
        {experience.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Work & Internships</h2>
            <div className="space-y-3">
              {experience.slice(0, 2).map(exp => (
                <div key={exp.id}>
                  <h4 className="text-[11px] font-bold text-slate-700">{exp.jobTitle}</h4>
                  <p className="text-[10px] text-slate-500">{exp.companyName} ({exp.duration})</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* languages & certificates footer */}
      {(certifications.length > 0 || languages.length > 0) && (
        <div className="grid grid-cols-2 gap-6 mt-6 pt-4 border-t border-slate-100">
          {certifications.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Activities & Certifications</h2>
              <ul className="space-y-1.5 text-[10px] list-none">
                {certifications.map(c => (
                  <li key={c.id} className="text-slate-600">
                    🏆 <span className="font-semibold">{c.name}</span> — {c.organization}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {languages.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Languages</h2>
              <div className="flex gap-2">
                {languages.map(l => (
                  <span key={l.id} className="text-[10px] bg-slate-50 px-2 py-0.5 rounded text-slate-600 border border-slate-100">
                    {l.name} ({l.proficiency})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div 
      ref={printRef}
      id="printable-cv"
      className="w-full bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden printable-shadow relative"
      style={getBorderStyles()}
    >
      {selectedBorderAccent === "top-bar" && (
        <div className="w-full h-3 shrink-0" style={{ backgroundColor: selectedColor }} />
      )}
      {selectedTemplate === "modern" && renderModern()}
      {selectedTemplate === "professional" && renderProfessional()}
      {selectedTemplate === "creative" && renderCreative()}
      {selectedTemplate === "student" && renderStudent()}
    </div>
  );
}
