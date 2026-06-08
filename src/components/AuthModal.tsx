/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, LogIn, Mail, Lock, User, Chrome, CheckCircle } from "lucide-react";
import { UserSession } from "../types";
import { auth, db } from "../lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile 
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
  userEmail?: string;
}


function formatAuthError(err: any): string {
  if (!err) return "Authentication error occurred.";
  const code = err.code || "";
  const msg = err.message || "";
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
    return "Invalid email address or password combination.";
  }
  if (code === "auth/email-already-in-use") {
    return "This email address is already registered.";
  }
  if (code === "auth/weak-password") {
    return "Password is too weak. Must be at least 6 characters.";
  }
  if (code === "auth/invalid-email") {
    return "Please structure a valid email address representation.";
  }
  if (code === "auth/popup-closed-by-user") {
    return "Google login popup was closed before completion. If popups are disabled, please allow them in your browser.";
  }
  if (code === "auth/operation-not-allowed") {
    return "Email & Password Sign-In is not enabled on your Firebase Console. Please go to your Firebase Console under 'Authentication' > 'Sign-in method' and enable the 'Email/Password' provider.";
  }
  return msg.replace("Firebase: ", "") || "An unexpected error occurred.";
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess, userEmail = "meakashsunilkk@gmail.com" }: AuthModalProps) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password || (!isLoginTab && !fullName)) {
      setError("Please fill out all required fields.");
      setLoading(false);
      return;
    }

    try {
      let user;
      let resolvedName = fullName.trim() || "Guest User";

      if (isLoginTab) {
        // Real Sign In
        const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
        user = credential.user;
        resolvedName = user.displayName || resolvedName;
      } else {
        // Real Sign Up
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        user = credential.user;
        await updateProfile(user, { displayName: resolvedName });
      }

      // Sync User Profile Record to Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const isNewUser = !userSnap.exists() || !isLoginTab;

      if (isNewUser) {
        await setDoc(userRef, {
          uid: user.uid,
          fullName: resolvedName,
          email: user.email || email.toLowerCase().trim(),
          photoUrl: user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.uid)}`,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      try {
        fetch("/api/email/send-welcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email || email.toLowerCase().trim(),
            fullName: resolvedName
          })
        }).then(res => res.json())
          .then(data => console.log("Welcome email status:", data))
          .catch(err => console.error("Failed to route welcome email:", err));
      } catch (mailErr) {
        console.error("Welcome email error:", mailErr);
      }

      setLoading(false);
      setSuccess(true);

      setTimeout(() => {
        onLoginSuccess({
          email: user.email || email.toLowerCase().trim(),
          isLoggedIn: true,
          fullName: resolvedName,
          avatarUrl: user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.uid)}`,
        });
        setSuccess(false);
        onClose();
      }, 1000);

    } catch (err: any) {
      console.error("Auth error: ", err);
      setError(formatAuthError(err));
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      // Configure popup
      const credential = await signInWithPopup(auth, provider);
      const user = credential.user;
      const resolvedName = user.displayName || "Google User";

      // Sync User Profile to Firestore to satisfy foreign relationship constraints
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const isNewUser = !userSnap.exists();

      if (isNewUser) {
        await setDoc(userRef, {
          uid: user.uid,
          fullName: resolvedName,
          email: user.email || "",
          photoUrl: user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.uid)}`,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      try {
        fetch("/api/email/send-welcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email || "",
            fullName: resolvedName
          })
        }).then(res => res.json())
          .then(data => console.log("Welcome email status:", data))
          .catch(err => console.error("Failed to route welcome email:", err));
      } catch (mailErr) {
        console.error("Welcome email error:", mailErr);
      }

      setLoading(false);
      setSuccess(true);

      setTimeout(() => {
        onLoginSuccess({
          email: user.email || "",
          isLoggedIn: true,
          fullName: resolvedName,
          avatarUrl: user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.uid)}`,
        });
        setSuccess(false);
        onClose();
      }, 1000);

    } catch (err: any) {
      console.error("Google Auth error: ", err);
      setError(formatAuthError(err));
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        id="auth-modal"
        className="relative w-full max-w-md overflow-hidden bg-white rounded-2xl shadow-2xl border border-slate-100 transition-all duration-300"
      >
        {/* Decorative Header Accent */}
        <div className="h-2 bg-gradient-to-r from-blue-700 via-sky-500 to-emerald-400" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {isLoginTab ? "Welcome Back to Resumify" : "Create Free Account"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isLoginTab ? "Access and update your stored resumes" : "Get started with professional CV generation"}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 transition rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="w-16 h-16 text-emerald-500 animate-bounce" />
              <h4 className="text-lg font-bold text-slate-900 mt-4">Successfully Authenticated!</h4>
              <p className="text-sm text-slate-500 mt-1">Loading secure user session...</p>
            </div>
          ) : (
            <>
              {/* Tabs Switch */}
              <div className="flex p-0.5 mb-6 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => { setIsLoginTab(true); setError(""); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                    isLoginTab 
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/50" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLoginTab(false); setError(""); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                    !isLoginTab 
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/50" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-600 rounded-lg bg-red-50 border border-red-100">
                    {error}
                  </div>
                )}

                {!isLoginTab && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-700">Password</label>
                    {isLoginTab && (
                      <a href="#" onClick={(e) => e.preventDefault()} className="text-xs text-blue-600 hover:underline">
                        Forgot?
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg text-sm transition shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      {isLoginTab ? "Secure Sign In" : "Register Now"}
                    </>
                  )}
                </button>
              </form>

              {/* Separator */}
              <div className="relative my-6 text-center">
                <hr className="border-slate-200" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-white">
                  or continue with
                </span>
              </div>

              {/* Google Login button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2 px-4 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-sm transition active:scale-[0.98] flex items-center justify-center gap-2.5 shadow-xs"
              >
                <Chrome className="w-4 h-4 text-red-500" />
                Sign in with Google
              </button>

              <p className="text-[11px] text-center text-slate-400 mt-6 leading-relaxed">
                By entering Resumify, you agree to our Terms of Service & Privacy Guidelines. All session states are kept private.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
