/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { LogIn, Mail, Lock, User, CheckCircle, Shield, Sparkles } from "lucide-react";
import { auth, db } from "../lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { UserSession } from "../types";

interface LoginPageProps {
  onLoginSuccess: (session: UserSession) => void;
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
  if (code === "auth/operation-not-allowed") {
    return "Email & Password Sign-In is not enabled on your Firebase Console. Please go to your Firebase Console under 'Authentication' > 'Sign-in method' and enable the 'Email/Password' provider.";
  }
  return msg.replace("Firebase: ", "") || "An unexpected error occurred.";
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password || (!isLoginTab && !fullName)) {
      setError("Please fill out all required fields.");
      setLoading(false);
      return;
    }

    try {
      let firebaseUser;
      let resolvedName = fullName.trim() || "Guest User";

      if (isLoginTab) {
        // Sign In with email & password
        const credential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        firebaseUser = credential.user;
        resolvedName = firebaseUser.displayName || resolvedName;
      } else {
        // Sign Up with email & password
        if (password.length < 6) {
          setError("Password must be at least 6 characters long.");
          setLoading(false);
          return;
        }
        const credential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        firebaseUser = credential.user;
        await updateProfile(firebaseUser, { displayName: resolvedName });
      }

      // Sync User Profile Record to Firestore
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || !isLoginTab) {
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          fullName: resolvedName,
          email: firebaseUser.email || trimmedEmail.toLowerCase(),
          photoUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(firebaseUser.uid)}`,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setLoading(false);
      setSuccess(true);

      setTimeout(() => {
        onLoginSuccess({
          email: firebaseUser.email || trimmedEmail.toLowerCase(),
          isLoggedIn: true,
          fullName: resolvedName,
          avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(firebaseUser.uid)}`,
        });
        setSuccess(false);
      }, 1000);

    } catch (err: any) {
      console.error("Authentication action failed:", err);
      setError(formatAuthError(err));
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 border-t-4 border-blue-700">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        {/* Workspace Brand Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
          <Shield className="w-3.5 h-3.5" /> Secure Workspace Environment Enabled
        </div>
        
        {/* App Title */}
        <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
          <Sparkles className="w-7 h-7 text-blue-700 animate-pulse" /> Resumify
        </h2>
        <p className="text-xs text-slate-500 font-semibold max-w-xs mx-auto leading-normal">
          The ultimate CV & portfolio wizard. Log in to securely sync your details, layout presets, and parse work-history with AI templates.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div id="auth-panel" className="bg-white py-8 px-4 shadow-xl rounded-2xl border border-slate-100 sm:px-10">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-fadeIn">
              <CheckCircle className="w-16 h-16 text-emerald-500 animate-bounce" />
              <h4 className="text-lg font-bold text-slate-900 mt-4">Successfully Authenticated!</h4>
              <p className="text-sm text-slate-500 mt-1 font-medium">Entering Resumify CV Workspace...</p>
            </div>
          ) : (
            <>
              {/* Authenticator Segment Selector Tabs */}
              <div className="flex p-0.5 mb-6 bg-slate-100 rounded-xl" id="auth-tabs">
                <button
                  type="button"
                  id="tab-signin"
                  onClick={() => { setIsLoginTab(true); setError(""); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    isLoginTab 
                      ? "bg-white text-slate-950 shadow-xs border border-slate-200/50" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  id="tab-signup"
                  onClick={() => { setIsLoginTab(false); setError(""); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    !isLoginTab 
                      ? "bg-white text-slate-950 shadow-xs border border-slate-200/50" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Create Account
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
                {error && (
                  <div id="auth-error" className="p-3 text-xs text-red-650 rounded-lg bg-red-50 border border-red-200 font-semibold leading-normal">
                    {error}
                  </div>
                )}

                {!isLoginTab && (
                  <div className="space-y-1.5" id="group-fullname">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        id="input-fullname"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-2 text-xs border border-slate-250 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5" id="group-email">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      id="input-email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2 text-xs border border-slate-250 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5" id="group-password">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      id="input-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 text-xs border border-slate-250 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-auth-submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition duration-250 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      {isLoginTab ? "Secure Sign In" : "Register with Email & Password"}
                    </>
                  )}
                </button>
              </form>

              <p className="text-[10px] text-center text-slate-400 mt-6 leading-relaxed font-semibold">
                By signing up, you agree to secure data synchronisation parameters. Authentication is processed directly through Google Firebase.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
