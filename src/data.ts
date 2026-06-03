/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResumeData } from "./types";

export const DEFAULT_RESUME_DATA: ResumeData = {
  personal: {
    fullName: "Alex Rivera",
    jobTitle: "Senior Full Stack Engineer",
    email: "alex.rivera@example.com",
    phone: "+1 (555) 019-2834",
    address: "San Francisco, CA",
    linkedin: "linkedin.com/in/alex-rivera-dev",
    website: "alexrivera.dev",
    summary: "Dynamic and impact-driven Full Stack Engineer with over 5 years of experience architecting cloud native web applications. Proven success leading distributed teams, reducing platform latencies by 35%, and maximizing engineering velocities utilizing modern React, TypeScript, and cloud services.",
  },
  education: [
    {
      id: "edu-1",
      institution: "University of California, Berkeley",
      degree: "B.S. in Computer Science",
      duration: "2018 - 2022",
      grade: "3.85 GPA",
    },
  ],
  experience: [
    {
      id: "exp-1",
      companyName: "InnovateTech Solutions",
      jobTitle: "Senior Software Engineer",
      duration: "2023 - Present",
      responsibilities: "- Led a high-performing team of 4 engineers to migrate legacy monoliths to a distributed microservices framework, increasing system response times by 40%.\n- Authored robust, self-documenting server-side modules and designed fully typed RESTful APIs interacting with PostgreSQL databases.\n- Mentored junior engineers, established comprehensive code review standards, and introduced micro-frontend patterns using module federation.",
    },
    {
      id: "exp-2",
      companyName: "Nexa Digital",
      jobTitle: "Software Engineer II",
      duration: "2021 - 2023",
      responsibilities: "- Engineered and polished intuitive client-side dashboard panels representing multi-layered telemetry logs and visual charts using D3.js and Recharts.\n- Cut build times in half by optimizing bundle dependencies, implementing aggressive tree-shaking, and transitioning build tools to Vite.\n- Collaborated with UX product design specialists to implement fully WCAG 2.1 AA accessible workflows.",
    },
  ],
  skills: [
    { id: "sk-1", name: "TypeScript", level: "Expert" },
    { id: "sk-2", name: "React", level: "Expert" },
    { id: "sk-3", name: "Node.js (Express)", level: "Expert" },
    { id: "sk-4", name: "PostgreSQL", level: "Intermediate" },
    { id: "sk-5", name: "Tailwind CSS", level: "Expert" },
    { id: "sk-6", name: "Docker & AWS", level: "Intermediate" },
  ],
  projects: [
    {
      id: "proj-1",
      projectName: "Apex Telemetry Dashboard",
      description: "A highly performant analytics control panel displaying real-time system metrics with low latency and visual charts. Leveraged WebSockets and React-based virtualization for smooth rendering of 50k+ data points.",
      technologiesUsed: "React, D3.js, WebSockets, TypeScript, Tailwind CSS",
    },
    {
      id: "proj-2",
      projectName: "LexiParse: AI Ingestion Platform",
      description: "An intelligent unstructured files ingestion manager parsing PDFs and extractable files using generative models and structured JSON outputs.",
      technologiesUsed: "Node.js, Express, @google/genai, PostgreSQL, Docker",
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect",
      organization: "Amazon Web Services",
      year: "2023",
    },
  ],
  languages: [
    { id: "lang-1", name: "English", proficiency: "Native" },
    { id: "lang-2", name: "Spanish", proficiency: "Conversational" },
  ],
  selectedTemplate: "modern",
  selectedColor: "#1e3a8a", // Deep Blue default
};
