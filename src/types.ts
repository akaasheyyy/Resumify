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
  selectedTemplate: string; // Dynamic template style
  selectedColor: string; // Accent color hex
  selectedFont?: string; // Creative font pairing
  selectedDensity?: "compact" | "comfortable" | "spacious" | "atmospheric"; // Margins & Spacing
  selectedLayoutVariation?: "classic" | "split-sidebar" | "grid-tech" | "centered-bold" | "academic-harvard" | "minimal"; // Page layouts
  selectedBulletStyle?: "disc" | "square" | "dash" | "accent-dot"; // Bullets graphics
  selectedBorderAccent?: "none" | "top-bar" | "left-bar" | "frame" | "accent-bottom"; // Shell aesthetics
  showAvatar?: boolean; // Avatar Toggle
  selectedAvatarShape?: "circle" | "rounded" | "sharp"; // Avatar Frame
  selectedAvatarSize?: "sm" | "md" | "lg" | "xl" | "xxl"; // Avatar Sizing
}

export interface UserSession {
  email: string;
  fullName: string;
  isLoggedIn: boolean;
  avatarUrl?: string;
}

export interface Review {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  rating: number;
  reviewText: string;
  createdAt?: any;
}

