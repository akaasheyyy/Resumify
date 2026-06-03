/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PersonalDetails {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  website: string;
  summary: string;
  photoUrl?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  duration: string; // e.g., "2020 - 2024"
  grade: string;
}

export interface Experience {
  id: string;
  companyName: string;
  jobTitle: string;
  duration: string; // e.g., "2024 - Present"
  responsibilities: string; // Markdown or plain text block
}

export interface Skill {
  id: string;
  name: string;
  level?: "Beginner" | "Intermediate" | "Expert" | ""; // Optional skill rating
}

export interface Project {
  id: string;
  projectName: string;
  description: string;
  technologiesUsed: string; // Comma separated or plain string
}

export interface Certification {
  id: string;
  name: string;
  organization: string;
  year: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: string; // e.g., "Native", "Fluent", "Conversational"
}

export interface ResumeData {
  personal: PersonalDetails;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  selectedTemplate: "modern" | "professional" | "creative" | "student";
  selectedColor: string; // Accent color hex
}

export interface UserSession {
  email: string;
  fullName: string;
  isLoggedIn: boolean;
  avatarUrl?: string;
}
