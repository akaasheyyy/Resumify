/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON body limits for parsing larger inputs or photos
app.use(express.json({ limit: "10mb" }));

// Lazy initializer for Google Gen AI
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please add it via Settings > Secrets.");
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Check if Gemini API is available and initialized
app.get("/api/ai/status", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: hasKey ? "configured" : "missing_key",
    message: hasKey 
      ? "AI systems are active and ready." 
      : "Gemini API key is not configured yet. Configure it in Settings > Secrets to unlock AI features."
  });
});

// Endpoint 1: Generate / Enhance content
app.post("/api/ai/enhance", async (req, res) => {
  try {
    const { type, payload } = req.body;
    const ai = getGeminiClient();

    let systemInstruction = "You are an expert executive resume writer and career coach.";
    let prompt = "";

    if (type === "summary") {
      systemInstruction = "You are an expert executive resume writer. Your job is to draft a punchy, professional, and ATS-optimized professional summary.";
      prompt = `Draft a professional, compelling, and modern professional summary based on the following information:
Career Objective/Goal: ${payload.careerGoal || "N/A"}
Skills: ${payload.skills || "N/A"}
Experience: ${payload.experience || "N/A"}
Education: ${payload.education || "N/A"}

Format requirements: Max 3-4 lines or 80 words. Focus on achievements, action verbs, and direct impact. Include the skills naturally. Do not include markdown formatting or quotes outside of standard text.`;
    } else if (type === "experience") {
      systemInstruction = "You are an ATS optimization specialist who writes highly professional resume accomplishments.";
      prompt = `For a job with the title "${payload.jobTitle}" at "${payload.companyName}", enhance the following raw list of responsibilities or description into a powerful, action-oriented, achievements-based list of accomplishments:
Raw input: ${payload.rawResponsibilities}

Format requirements: Output 3 to 4 bullet points. Each bullet should start with a strong action verb (e.g., Led, Developed, Optimized, Reduced, Orchestrated). Quantify results where possible (if no metrics exist, suggest plausible placeholders like 'by 15%' or 'saving 5 hours weekly'). Use clean markdown bullet points (using - ). Do not output introductory text, output only the dynamic bullet list.`;
    } else if (type === "project") {
      systemInstruction = "You are a seasoned technical writer specializing in technical portfolio pieces.";
      prompt = `For a project named "${payload.projectName}" using the technology stack "${payload.technologiesUsed}", enhance the description to make it look highly professional and technically outstanding:
Raw description: ${payload.description}

Format requirements: Output 2 to 3 bullet points starting with action verbs that focus on technical challenges solved, architecture, and impact. Use clean black markdown bullet points (using - ). Output only the enhanced bullets.`;
    } else if (type === "generate_full") {
      systemInstruction = "You are a professional CV architect.";
      prompt = `Generate a fully optimized resume structure based on the user's basic input. Create a professional summary, experience bullets, and structured projects.
Inputs:
Career Goal: ${payload.careerGoal || ""}
Education: ${payload.education || ""}
Skills: ${payload.skills || ""}
Experience: ${payload.experience || ""}

Return structured text to guide the user in drafting an outstanding job application.`;
    } else {
      return res.status(400).json({ error: "Invalid enhancement type requested." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ output: response.text });
  } catch (error: any) {
    console.error("AI Enhance error:", error);
    res.status(500).json({ error: error.message || "An error occurred with the AI agent." });
  }
});

// Endpoint 2: Parse raw pasted CV text into ResumeData structure
app.post("/api/ai/parse", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "No resume text was provided for parsing." });
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Identify and extract resume segments from this unstructured resume text:
---
${text}
---`,
      config: {
        systemInstruction: "You are a premium resume parsing and ingestion system. Extract files or copy-pasted text into a structured JSON representation matching the strict specified schema.",
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personal: {
              type: Type.OBJECT,
              properties: {
                fullName: { type: Type.STRING },
                jobTitle: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                address: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                website: { type: Type.STRING },
                summary: { type: Type.STRING }
              },
              required: ["fullName"]
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  institution: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  grade: { type: Type.STRING }
                },
                required: ["institution", "degree"]
              }
            },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  companyName: { type: Type.STRING },
                  jobTitle: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  responsibilities: { type: Type.STRING }
                },
                required: ["companyName", "jobTitle"]
              }
            },
            skills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  level: { type: Type.STRING }
                },
                required: ["name"]
              }
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  projectName: { type: Type.STRING },
                  description: { type: Type.STRING },
                  technologiesUsed: { type: Type.STRING }
                },
                required: ["projectName"]
              }
            },
            certifications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  organization: { type: Type.STRING },
                  year: { type: Type.STRING }
                },
                required: ["name"]
              }
            },
            languages: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  proficiency: { type: Type.STRING }
                },
                required: ["name"]
              }
            }
          },
          required: ["personal"]
        }
      }
    });

    const textOutput = response.text || "{}";
    const parsedData = JSON.parse(textOutput);
    res.json(parsedData);
  } catch (error: any) {
    console.error("AI Parse error:", error);
    res.status(500).json({ error: error.message || "An error occurred parsing the resume text." });
  }
});

// Configure Vite or Serve static assets
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Resumify full-stack container running on http://localhost:${PORT}`);
  });
}

start();
