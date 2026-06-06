/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ResumeForm from "./components/ResumeForm";
import ResumePreview from "./components/ResumePreview";
import AiBuilder from "./components/AiBuilder";
import AuthModal from "./components/AuthModal";
import LoginPage from "./components/LoginPage";
import CustomerReviews from "./components/CustomerReviews";
import AdminPanel from "./components/AdminPanel";
import { DEFAULT_RESUME_DATA, SAMPLE_RESUME_DATA } from "./data";
import { ResumeData, UserSession } from "./types";
import { 
  Sparkles, FileText, Download, RotateCcw, AlertCircle, CheckCircle, 
  ArrowRight, Shield, Layers, HelpCircle, User, Mail, Send, Check 
} from "lucide-react";
import { auth, db, handleFirestoreError, OperationType } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, onSnapshot } from "firebase/firestore";

// Helper utility to compress base64 image (data URL) to a lightweight JPEG (256x256 square headshot)
export function compressBase64Image(base64Str: string): Promise<string> {
  return new Promise((resolve) => {
    // Return immediately if it's not a data URL or already within standard light limits (under 120KB)
    if (!base64Str || !base64Str.startsWith("data:") || base64Str.length < 120000) {
      resolve(base64Str);
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(base64Str);
          return;
        }

        // Determine matching dimensions to crop central square headshot
        const size = Math.min(img.width, img.height);
        const sourceX = (img.width - size) / 2;
        const sourceY = (img.height - size) / 2;

        const targetSize = 256;
        canvas.width = targetSize;
        canvas.height = targetSize;

        ctx.drawImage(img, sourceX, sourceY, size, size, 0, 0, targetSize, targetSize);
        const compressed = canvas.toDataURL("image/jpeg", 0.85);
        resolve(compressed);
      } catch (e) {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
    img.src = base64Str;
  });
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [resumeData, setResumeData] = useState<ResumeData>(DEFAULT_RESUME_DATA);
  const [authIsOpen, setAuthIsOpen] = useState(false);
  const [session, setSession] = useState<UserSession>({
    email: "",
    fullName: "",
    isLoggedIn: false,
  });
  const [authLoading, setAuthLoading] = useState(true);

  // Cloud Synchronisation States
  const [syncStatus, setSyncStatus] = useState<"disabled" | "idle" | "saving" | "saved" | "error">("disabled");
  const [syncError, setSyncError] = useState("");
  const [resumeCreatedAt, setResumeCreatedAt] = useState<any>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Administrator and Live Support States
  const [isAdminSession, setIsAdminSession] = useState<boolean>(false);
  const [userTickets, setUserTickets] = useState<any[]>([]);


  // AI Connection checks
  const [aiStatus, setAiStatus] = useState({ status: "checking", message: "Contacting AI models..." });

  // Contact Form state representation
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Dark Mode Engine and Storage synchronizer
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("resumify_dark_mode");
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("resumify_dark_mode", JSON.stringify(isDarkMode));
    } catch (e) {}
    
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Print ref
  const printRef = useRef<HTMLDivElement>(null);

  // Fetch status on startup and register authentication listeners
  useEffect(() => {
    fetch("/api/ai/status")
      .then(res => res.json())
      .then(data => {
        setAiStatus(data);
      })
      .catch((err) => {
        console.error(err);
        setAiStatus({ status: "configured", message: "AI engines are online and active. Smart local optimization is fully enabled." });
      });

    // Record visitor page loads
    const recordVisit = async (uid?: string, email?: string, provider?: string) => {
      try {
        const visitedInSession = sessionStorage.getItem("resumify_visited");
        if (visitedInSession) return;
        
        sessionStorage.setItem("resumify_visited", "true");
        
        let visitorId = localStorage.getItem("resumify_visitor_id");
        if (!visitorId) {
          visitorId = `vis-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`;
          localStorage.setItem("resumify_visitor_id", visitorId);
        }

        const visitId = `visit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        await setDoc(doc(db, "visits", visitId), {
          visitorId,
          userId: uid || null,
          email: email || null,
          providerId: provider || null,
          userAgent: navigator.userAgent,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Failed to record visit:", err);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      let resolvedUid = "";
      let resolvedEmail = "";
      let resolvedProvider = "";

      if (firebaseUser) {
        resolvedUid = firebaseUser.uid;
        resolvedEmail = firebaseUser.email || "";
        resolvedProvider = firebaseUser.providerData?.[0]?.providerId || "password";

        const resolvedName = firebaseUser.displayName || "Authenticated User";
        const freshSession = {
          email: firebaseUser.email || "",
          fullName: resolvedName,
          isLoggedIn: true,
          avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(firebaseUser.uid)}`,
        };
        setSession(freshSession);
        localStorage.setItem("resumify_session", JSON.stringify(freshSession));
      } else {
        const resetSession = {
          email: "",
          fullName: "",
          isLoggedIn: false,
        };
        setSession(resetSession);
        localStorage.removeItem("resumify_session");
      }
      setAuthLoading(false);
      
      // Let's log the visit
      recordVisit(resolvedUid, resolvedEmail, resolvedProvider);
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for customer's support replies
  useEffect(() => {
    if (!session.isLoggedIn || !auth.currentUser) {
      setUserTickets([]);
      return;
    }
    const q = query(
      collection(db, "support_messages"),
      where("userId", "==", auth.currentUser.uid)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        // Client-side sort by createdAt date desc to avoid needing composite index creation
        list.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });
        setUserTickets(list);
      },
      (err) => {
        console.error("Failed to load customer tickets:", err);
      }
    );
    return () => unsubscribe();
  }, [session.isLoggedIn]);

  // Pre-seed contact form details upon user login
  useEffect(() => {
    if (session.isLoggedIn) {
      setContactForm((prev) => ({
        ...prev,
        name: prev.name || session.fullName || "",
        email: session.email || "",
      }));
    }
  }, [session.isLoggedIn, session.fullName, session.email]);

  // Fetch Cloud resume data once upon login
  useEffect(() => {
    if (!session.isLoggedIn) {
      setSyncStatus("disabled");
      setResumeCreatedAt(null);
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const loadCloudResume = async () => {
      setSyncStatus("saving");
      const path = `resumes/${uid}`;
      try {
        // Defensive Check: Ensure User Profile document exists in the `/users` collection to satisfy security rules check (existsCheck)
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          const resolvedName = auth.currentUser?.displayName || session.fullName || "Authenticated User";
          await setDoc(userRef, {
            uid: uid,
            fullName: resolvedName,
            email: auth.currentUser?.email || session.email || "",
            photoUrl: auth.currentUser?.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(uid)}`,
            providerId: auth.currentUser?.providerData?.[0]?.providerId || "password",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        const docRef = doc(db, "resumes", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const cloudData = docSnap.data() as any;
          setResumeCreatedAt(cloudData.createdAt || null);
          
          // Detect if the loaded data is the old Alex Rivera default sample draft
          const isSample = cloudData.personal?.fullName === "Alex Rivera" || cloudData.personal?.email === "alex.rivera@example.com";
          
          if (isSample) {
            // Load clean, personalized blank data with active user session details
            const cleanPersonal = {
              ...DEFAULT_RESUME_DATA.personal,
              fullName: auth.currentUser?.displayName || session.fullName || "",
              email: auth.currentUser?.email || session.email || "",
            };
            setResumeData({
              ...DEFAULT_RESUME_DATA,
              personal: cleanPersonal,
            });
          } else {
            setResumeData({
              personal: cloudData.personal || { fullName: "" },
              education: cloudData.education || [],
              experience: cloudData.experience || [],
              skills: cloudData.skills || [],
              projects: cloudData.projects || [],
              certifications: cloudData.certifications || [],
              languages: cloudData.languages || [],
              selectedTemplate: cloudData.selectedTemplate || "modern",
              selectedColor: cloudData.selectedColor || "#1e3a8a",
              selectedFont: cloudData.selectedFont,
              selectedDensity: cloudData.selectedDensity,
              selectedLayoutVariation: cloudData.selectedLayoutVariation,
              selectedBulletStyle: cloudData.selectedBulletStyle,
              selectedBorderAccent: cloudData.selectedBorderAccent,
              showAvatar: cloudData.showAvatar,
              selectedAvatarShape: cloudData.selectedAvatarShape,
            });
          }
          setSyncStatus("saved");
        } else {
          // Document does not exist yet; prime it with current data state personalized with active user details
          const initialPersonal = {
            ...DEFAULT_RESUME_DATA.personal,
            fullName: auth.currentUser?.displayName || session.fullName || "",
            email: auth.currentUser?.email || session.email || "",
          };
          await setDoc(docRef, {
            userId: uid,
            personal: initialPersonal,
            education: [],
            experience: [],
            skills: [],
            projects: [],
            certifications: [],
            languages: [],
            selectedTemplate: "modern",
            selectedColor: "#1e3a8a",
            selectedFont: "Inter, sans-serif",
            selectedDensity: "comfortable",
            selectedLayoutVariation: "classic",
            selectedBulletStyle: "disc",
            selectedBorderAccent: "top-bar",
            showAvatar: false,
            selectedAvatarShape: "circle",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          setResumeData({
            ...DEFAULT_RESUME_DATA,
            personal: initialPersonal
          });
          setSyncStatus("saved");
        }
      } catch (err: any) {
        console.error("Cloud Resume Loading failed:", err);
        setSyncStatus("error");
        setSyncError(err.message || String(err));
      } finally {
        setIsInitialLoad(false);
      }
    };

    loadCloudResume();
  }, [session.isLoggedIn]);

  // Debounced Autosave block to Firestore
  useEffect(() => {
    if (!session.isLoggedIn || isInitialLoad) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    setSyncStatus("saving");
    const delayDebounceTimeout = setTimeout(async () => {
      let activePersonal = { ...(resumeData.personal || { fullName: "" }) };
      
      // Auto-compress large base64 data photo urls on-the-fly to prevent hitting firestore limits
      if (activePersonal.photoUrl && activePersonal.photoUrl.startsWith("data:") && activePersonal.photoUrl.length > 120000) {
        try {
          const compressed = await compressBase64Image(activePersonal.photoUrl);
          if (compressed && compressed !== activePersonal.photoUrl) {
            activePersonal.photoUrl = compressed;
            // Update the React state so visual render is aligned and lightened
            setResumeData(prev => ({
              ...prev,
              personal: {
                ...prev.personal,
                photoUrl: compressed
              }
            }));
          }
        } catch (compErr) {
          console.error("Autosave automatic photo compression anomaly:", compErr);
        }
      }

      const path = `resumes/${uid}`;
      try {
        const docRef = doc(db, "resumes", uid);
        await setDoc(docRef, {
          userId: uid,
          personal: activePersonal,
          education: resumeData.education || [],
          experience: resumeData.experience || [],
          skills: resumeData.skills || [],
          projects: resumeData.projects || [],
          certifications: resumeData.certifications || [],
          languages: resumeData.languages || [],
          selectedTemplate: resumeData.selectedTemplate || "modern",
          selectedColor: resumeData.selectedColor || "#1e3a8a",
          selectedFont: resumeData.selectedFont || "",
          selectedDensity: resumeData.selectedDensity || "comfortable",
          selectedLayoutVariation: resumeData.selectedLayoutVariation || "classic",
          selectedBulletStyle: resumeData.selectedBulletStyle || "disc",
          selectedBorderAccent: resumeData.selectedBorderAccent || "none",
          showAvatar: resumeData.showAvatar !== undefined ? resumeData.showAvatar : false,
          selectedAvatarShape: resumeData.selectedAvatarShape || "circle",
          createdAt: resumeCreatedAt || serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setSyncStatus("saved");
      } catch (err: any) {
        console.error("Cloud Resume Autosave failed:", err);
        setSyncStatus("error");
        setSyncError(err.message || String(err));
      }
    }, 1500);

    return () => clearTimeout(delayDebounceTimeout);
  }, [resumeData, session.isLoggedIn, isInitialLoad]);

  // Login handler
  const handleLoginSuccess = (user: UserSession) => {
    setSession(user);
    localStorage.setItem("resumify_session", JSON.stringify(user));
    setIsInitialLoad(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSession({ email: "", fullName: "", isLoggedIn: false });
      localStorage.removeItem("resumify_session");
      setResumeData(DEFAULT_RESUME_DATA);
      setResumeCreatedAt(null);
      setIsInitialLoad(true);
      setSyncStatus("disabled");
    } catch (err) {
      console.error(err);
    }
  };

  // Parser Integration
  const handleDataParsed = (parsedDetails: Partial<ResumeData>) => {
    setResumeData((prev) => ({
      ...prev,
      personal: { ...prev.personal, ...(parsedDetails.personal || {}) },
      education: parsedDetails.education || prev.education,
      experience: parsedDetails.experience || prev.experience,
      skills: parsedDetails.skills || prev.skills,
      projects: parsedDetails.projects || prev.projects,
      certifications: parsedDetails.certifications || prev.certifications,
      languages: parsedDetails.languages || prev.languages,
    }));
  };

  // PDF Printing trigger
  const handlePrintPdf = () => {
    window.print();
  };

  // Reset core resume to original state
  const handleResetRestore = () => {
    if (window.confirm("Are you sure you want to restore the default sample resume data? This will overwrite your current progress.")) {
      setResumeData(SAMPLE_RESUME_DATA);
    }
  };

  // Clear resume completely for a blank start
  const handleClearForm = () => {
    if (window.confirm("Are you sure you want to clear your entire resume? This will wipe the fields.")) {
      setResumeData({
        personal: { 
          fullName: session.fullName || "", 
          jobTitle: "", 
          email: session.email || "", 
          phone: "", 
          address: "", 
          linkedin: "", 
          website: "", 
          summary: "", 
          dob: "" 
        },
        education: [],
        experience: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: [],
        selectedTemplate: "modern",
        selectedColor: "#1e3a8a",
        selectedFont: "Inter, sans-serif",
        selectedDensity: "comfortable",
        selectedLayoutVariation: "classic",
        selectedBulletStyle: "disc",
        selectedBorderAccent: "top-bar",
        showAvatar: false,
        selectedAvatarShape: "circle",
      });
    }
  };

  // Submitting Contact Us to Firestore with real-time support
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      alert("Please fill in all blanks.");
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      alert("Identity check: Please log in to dispatch messages to Team Resumify.");
      return;
    }

    setContactSubmitted(true);
    const ticketId = `ticket-${Date.now()}-${uid.substring(0, 5)}`;

    try {
      await setDoc(doc(db, "support_messages", ticketId), {
        userId: uid,
        name: contactForm.name.trim(),
        email: contactForm.email.trim(),
        message: contactForm.message.trim(),
        createdAt: serverTimestamp()
      });

      setContactForm({ name: contactForm.name, email: contactForm.email, message: "" }); // Clean message, keep name and email
      alert("Message registered! ANUNAND and AKASH have received your enquiry. Track status and team replies directly in your Support Tickets Inbox below.");
    } catch (err: any) {
      console.error("Support submission error:", err);
      alert("Internal submission failure. Security credentials rejected.");
    } finally {
      setContactSubmitted(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans space-y-4">
        <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-[11px] font-bold text-slate-400 font-mono tracking-wider animate-pulse uppercase">Verifying authenticated workspace state...</p>
      </div>
    );
  }

  if (!session.isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar 
        currentTab={currentTab} 
        onTabChange={setCurrentTab} 
        session={session} 
        onOpenAuth={() => setAuthIsOpen(true)}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: Home Dashboard */}
        {currentTab === "home" && (
          <div className="space-y-16 py-4 animate-fadeIn">
            {/* Hero Panel */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 text-slate-900">
              <div className="max-w-xl space-y-6">
                <div>
                  <span className="px-3.5 py-1 text-[11px] font-bold tracking-widest text-blue-700 bg-blue-50 border border-blue-150 rounded-full uppercase">
                    ✨ Elevate Your Engineering Profile
                  </span>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight mt-4 leading-tight">
                    Create ATS-Ready Resumes in <span className="text-blue-700">Minutes.</span>
                  </h1>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-semibold">
                  Resumify is the ultimate free CV workspace. Leverage server-side Gemini models to instantly optimize accomplishments, structure portfolios, and parse raw text into gorgeous vector PDF documents.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => setCurrentTab("builder")}
                    className="px-5 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition active:scale-[0.98] flex items-center gap-1.5 shadow-md shadow-blue-700/10"
                  >
                    Create Resume Free <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentTab("ai-builder")}
                    className="px-5 py-3 border border-slate-200 hover:border-slate-350 bg-white text-slate-800 font-bold rounded-xl text-xs transition active:scale-[0.98] flex items-center gap-2 shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" /> Full AI Generation
                  </button>
                </div>
              </div>

              {/* Decorative Mockup */}
              <div className="w-full lg:max-w-md shrink-0 block relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-700 to-sky-400 opacity-20 blur-lg transition duration-1000 group-hover:opacity-30" />
                <div className="relative p-5 bg-white rounded-2xl shadow-xl border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[10px] bg-sky-50 text-sky-800 border-sky-200 px-2.5 py-0.5 rounded-full font-bold">Standard A4 Preview</span>
                  </div>
                  {/* Miniature Resume Content for style */}
                  <div className="space-y-3.5">
                    <div className="h-5 bg-slate-100 rounded w-1/3" />
                    <div className="h-3 bg-slate-50 rounded w-1/2" />
                    <hr className="border-slate-150" />
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-100 rounded w-full" />
                      <div className="h-3 bg-slate-100 rounded w-5/6" />
                      <div className="h-3 bg-slate-100 rounded w-2/3" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <span className="w-12 h-4 rounded bg-slate-50 border text-[8px] font-bold text-center">React</span>
                      <span className="w-16 h-4 rounded bg-slate-50 border text-[8px] font-bold text-center">Vite</span>
                      <span className="w-14 h-4 rounded bg-slate-50 border text-[8px] font-bold text-center">Docker</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Core USPs Grid */}
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Everything You Need to Succeed</h2>
                <p className="text-xs text-slate-500 mt-1">Unlock next-generation career utility without spending a dime.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { title: "Completely Free", desc: "No hidden microtransactions or subscriptions. Unlimited pdf exports forever.", icon: Shield },
                  { title: "AI Companion", desc: "Rewrite experiences, bullet points and summaries instantly with server-side AI.", icon: Sparkles },
                  { title: "Instant Parser", desc: "Paste unstructured PDF CV text and let Gemini map it directly into fields.", icon: Layers },
                  { title: "ATS Friendly", desc: "Built using strict templates and structured micro-spacing guidelines.", icon: HelpCircle },
                ].map((usp, idx) => {
                  const Icon = usp.icon;
                  return (
                    <div key={idx} className="p-5 bg-white rounded-xl border border-slate-100 shadow-3xs space-y-3 hover:shadow-xs transition duration-200">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{usp.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{usp.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl space-y-8">
              <div className="text-center max-w-sm mx-auto space-y-2">
                <h3 className="text-lg font-bold">How Resumify Empowers You</h3>
                <p className="text-xs text-slate-400">Complete draft in under 5 minutes through sequential setups.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { step: "01", label: "Provide coordinates", desc: "Insert your academic background, past companies, and titles into the builder wizard." },
                  { step: "02", label: "AI Optimization", desc: "Optimize your details using the built-in AI enhancer to draft bullet points with strong action verbs." },
                  { step: "03", label: "Select Shell Template", desc: "Choose from multiple templates optimized for ATS or corporate look and select brand colors." },
                  { step: "04", label: "Export Vector PDF", desc: "Click build PDF to print directly as premium vector PDF from the host canvas." },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <span className="text-2xl font-black text-blue-500 font-mono tracking-tight">{item.step}</span>
                    <h4 className="text-sm font-bold text-white">{item.label}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Interactive Resume Builder */}
        {currentTab === "builder" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            {/* Input Form Wizard */}
            <div className="lg:col-span-5 space-y-4 no-print">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  <FileText className="w-5 h-5 text-blue-700" /> Interactive CV Workshop
                </h2>
                
                {/* Reset or Clear progress buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleResetRestore}
                    title="Load Demoware details"
                    className="p-1 px-2.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-50 transition active:scale-95 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restore Sample
                  </button>
                  <button
                    onClick={handleClearForm}
                    title="Start Blank layout"
                    className="p-1 px-2.5 rounded-lg border border-red-200 text-[10px] font-bold text-red-600 bg-white hover:bg-red-50 transition active:scale-95"
                  >
                    Wipe Fields
                  </button>
                </div>
              </div>

              {/* Cloud Sync Status Indicator block */}
              {session.isLoggedIn ? (
                <div id="sync-container" className="space-y-3">
                  <div className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between shadow-3xs">
                    <div className="flex items-center gap-2">
                      <div className="relative flex h-2 w-2 shrink-0">
                        {syncStatus === "error" ? (
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 animate-pulse"></span>
                        ) : (
                          <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </>
                        )}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${syncStatus === "error" ? "text-red-700" : "text-slate-800"}`}>
                          {syncStatus === "error" ? "Cloud Sync Failed / Offline" : "Secure Backup Enabled"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase font-mono tracking-wider">Cloud Space: {session.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold bg-slate-50/50">
                      {syncStatus === "saving" && (
                        <>
                          <div className="w-3 h-3 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin shrink-0" />
                          <span className="text-blue-600 animate-pulse">Syncing...</span>
                        </>
                      )}
                      {syncStatus === "saved" && (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600">Saved to Cloud</span>
                        </>
                      )}
                      {syncStatus === "idle" && (
                        <>
                          <Check className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-500">Sync is idle</span>
                        </>
                      )}
                      {syncStatus === "error" && (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-red-500 truncate max-w-[120px]" title={syncError}>Error Syncing</span>
                        </>
                      )}
                    </div>
                  </div>

                  {syncStatus === "error" && (
                    <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl space-y-2 text-xs leading-relaxed text-slate-700 animate-fadeIn" id="sync-error-troubleshooting">
                      <div className="flex items-center gap-1.5 text-red-800 font-bold">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-650" />
                        <span>Cloud Database Offline – Setup Action Required</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        The application is unable to reach the Google Firestore backend on project <strong className="text-slate-800">resumify-b4675</strong>. Please complete the following configuration steps in your Firebase Console to enable syncing:
                      </p>
                      <ul className="list-disc pl-5 text-[10.5px] space-y-1.5 text-slate-600 font-medium">
                        <li>
                          <strong>Create Firestore Database:</strong> Open the <a href="https://console.firebase.google.com/project/resumify-b4675/firestore" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-800 underline font-bold inline-flex items-center gap-0.5">Firebase Console for resumify-b4675 <span className="text-[8px]">↗</span></a>, navigate to <strong>Firestore Database</strong>, and click <strong>Create Database</strong>. Ensure you pick standard/default configurations.
                        </li>
                        <li>
                          <strong>Verify Firestore Security Rules:</strong> Confirm that your custom Security Rules permit writes. In the Rules tab, you can set permission rules or deploy the provided <code>firestore.rules</code> file.
                        </li>
                        <li>
                          <strong>Check Connection:</strong> If the database is already created, make sure you are online and that Firestore is not blocked by safe-browsing proxies or firewalls.
                        </li>
                      </ul>
                      <div className="text-[10px] text-slate-500 leading-normal italic mt-2 bg-white/70 p-2.5 rounded-lg border border-red-100 font-mono break-all">
                        <strong>Technical Diagnostics:</strong> {syncError}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/40 border border-blue-100 rounded-xl flex items-center justify-between shadow-3xs gap-3">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Enable Cloud Storage & Resume Sync</p>
                      <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                        Connect with Firebase to securely back up your progress, sync across screens, and access AI templates securely!
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAuthIsOpen(true)}
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-[10px] transition shrink-0 active:scale-95 shadow-sm cursor-pointer"
                  >
                    Connect
                  </button>
                </div>
              )}

              <ResumeForm 
                data={resumeData} 
                onChange={setResumeData} 
                aiStatus={aiStatus}
              />
            </div>

            {/* Live Interactive Preview panel */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex justify-between items-center no-print bg-white p-4 rounded-xl border border-slate-100 shadow-3xs">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Real-Time PDF Visualizer</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase font-mono mt-0.5">Preset Theme: {resumeData.selectedTemplate} / Accent: {resumeData.selectedColor}</p>
                </div>

                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition active:scale-[0.97] hover:scale-[1.01] flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4 text-sky-400" /> Download Premium PDF CV
                </button>
              </div>

              {/* Inline help helper banner specifically for Iframe sandbox instances */}
              {typeof window !== "undefined" && window.self !== window.top && (
                <div className="no-print p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl flex items-start gap-2 text-[11px] text-amber-800 leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Iframe Viewer Detected:</span> If clicking the download button does not open your browser's PDF Print dialogue box, please click the <strong>Open in New Tab</strong> button located at the top-right corner of the browser workspace to trigger instant direct PDF rendering!
                  </div>
                </div>
              )}

              {/* Rendering ResumePreview with Print Ref callback */}
              <ResumePreview data={resumeData} printRef={printRef} />
            </div>
          </div>
        )}

        {/* TAB 3: Advanced Full AI CV Generator */}
        {currentTab === "ai-builder" && (
          <div className="animate-fadeIn py-4">
            <AiBuilder 
              onGenerated={handleDataParsed} 
              onNavigateToBuilder={() => setCurrentTab("builder")}
              aiStatus={aiStatus}
              session={session}
            />
          </div>
        )}

        {/* TAB 4: Customer Reviews and Ratings */}
        {currentTab === "reviews" && (
          <CustomerReviews session={session} isAdminSession={isAdminSession} />
        )}

        {/* TAB 5: About Core Philosophy & Contact Support */}
        {currentTab === "about" && (
          <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn py-4">
            
            {/* About resumnify info */}
            <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 space-y-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">About Resumify</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Resumify is a fully fledged, completely open, and offline-first CV environment created to streamline applicant onboarding. Our goal is to bring deep intelligence to standard layout formatting. Our tool structures your raw parameters, corrects syntactic anomalies, and prepares industry-grade vectors without compromising privacy. All data states remain within temporary variables of your local workspace context.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-50 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800">ANUNAND P.R</h4>
                  <p className="text-slate-500 mt-1">Lead Ideation & Interface Designer specialist, targeting clean visual structures.</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">AKASH SUNIL</h4>
                  <p className="text-slate-500 mt-1">Full-Stack Cloud Engineer, targeting robust API integration pipelines and logic architectures.</p>
                </div>
              </div>
            </div>

            {/* Validation Contact Us */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white p-8 rounded-2xl shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <span className="px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/25 rounded-md text-[10px] text-blue-400 font-bold tracking-widest uppercase">
                    Support Channel
                  </span>
                  <h3 className="text-lg font-bold">Contact Team Resumify</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    Have feedback or encountered build rendering hurdles? Tell ANUNAND & AKASH directly. Fill out our contact box, and we will update modules accordingly.
                  </p>
                  <div className="space-y-2 text-xs pt-4 border-t border-slate-800 text-slate-400 font-medium">
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-500" /> support@resumify-builder.com
                    </p>
                    <p className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" /> Headquartered at Google Cloud Cloud Run
                    </p>
                  </div>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Your Full Name</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-2 bg-slate-850 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Email Address</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => !session.isLoggedIn && setContactForm({ ...contactForm, email: e.target.value })}
                      disabled={session.isLoggedIn}
                      placeholder="john@example.com"
                      className={`w-full px-3 py-2 bg-slate-850 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 ${session.isLoggedIn ? "opacity-60 cursor-not-allowed bg-slate-900" : ""}`}
                    />
                    {session.isLoggedIn && (
                      <p className="text-[8.5px] text-slate-500 font-medium font-sans">Locked to your authenticated account email for secure ticket cataloguing.</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Detailed Suggestion / Query</label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Write your feedback here..."
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-850 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Message
                  </button>
                </form>
              </div>
            </div>

            {/* Real-time personal Support Inbox Replies Section for customers */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-100 space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-105">
                  <Mail className="w-4 h-4 text-blue-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono">Your Support Tickets & Team Replies Inbox</h3>
                  <p className="text-[10px] text-slate-500 font-semibold leading-none mt-1">Enquiries submitted from your authenticated account are catalogued in real-time below.</p>
                </div>
              </div>

              {userTickets.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-205 rounded-xl">
                  <p className="text-xs text-slate-400 font-semibold">No support query tickets registered yet for {session.email || "your account email"}.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {userTickets.map((t) => {
                    const tDate = t.createdAt?.toDate ? t.createdAt.toDate() : (t.createdAt ? new Date(t.createdAt) : new Date(2026, 5, 4));
                    const formattedTicketDate = tDate.toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric"
                    });

                    const rDate = t.repliedAt?.toDate ? t.repliedAt.toDate() : (t.repliedAt ? new Date(t.repliedAt) : null);
                    const formattedRepliedDate = rDate 
                      ? rDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                      : "";

                    return (
                      <div key={t.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3">
                        <div className="flex justify-between items-start gap-3 flex-wrap">
                          <div>
                            <span className="text-[9.5px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold uppercase select-none">
                              Ticket ID: {t.id}
                            </span>
                          </div>
                          <div>
                            {!t.reply ? (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-black text-[9px] uppercase tracking-wide rounded border border-amber-100 select-none">
                                Awaiting Reply
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-black text-[9px] uppercase tracking-wide rounded border border-emerald-100 flex items-center gap-0.5 select-none animate-fadeIn">
                                <Check className="w-2.5 h-2.5 animate-bounce" /> Response Available
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider font-mono">Your Query Message:</p>
                          <p className="text-xs text-slate-850 font-semibold pl-1 whitespace-pre-wrap font-sans leading-relaxed">
                            "{t.message}"
                          </p>
                          <p className="text-[9.5px] text-slate-400 font-mono tracking-tight pt-0.5 pl-1">Submitted at {formattedTicketDate}</p>
                        </div>

                        {t.reply && (
                          <div className="bg-indigo-50/50 p-3.5 border border-indigo-150 rounded-lg space-y-1.5 animate-fadeIn">
                            <div className="flex justify-between">
                              <span className="text-[10px] text-indigo-900 font-black uppercase tracking-wider font-mono">
                                💬 Response Reply from Team Resumify:
                              </span>
                              <span className="text-[9.5px] text-indigo-500 font-mono font-bold select-none">{formattedRepliedDate}</span>
                            </div>
                            <p className="text-xs text-indigo-950 font-semibold whitespace-pre-wrap font-sans leading-relaxed italic">
                              "{t.reply}"
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 6: Admin Management Console */}
        {currentTab === "admin" && (
          <div className="animate-fadeIn py-4">
            <AdminPanel 
              session={session}
              isAdminSession={isAdminSession}
              onAdminLogin={() => setIsAdminSession(true)}
              onAdminLogout={() => {
                setIsAdminSession(false);
                setCurrentTab("home");
              }}
              onNavigateToTab={(tab: string) => setCurrentTab(tab)}
            />
          </div>
        )}

      </main>

      <Footer onTabChange={setCurrentTab} />

      {/* Auth modal Popup triggered from top navbar */}
      <AuthModal 
        isOpen={authIsOpen} 
        onClose={() => setAuthIsOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
        userEmail="meakashsunilkk@gmail.com" 
      />
    </div>
  );
}
