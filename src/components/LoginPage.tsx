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
  signInWithPopup,
  GoogleAuthProvider,
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
  if (code === "auth/unauthorized-domain") {
    const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
    return `Google Sign-In failed because the current domain ('${hostname}') is not authorized in your Firebase console. Please log into your Firebase Console, select your project 'resumify-b4675', navigate to 'Authentication' > 'Settings' > 'Authorized domains', and add '${hostname}' to the list of authorized domains.`;
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

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      
      const credential = await signInWithPopup(auth, provider);
      const firebaseUser = credential.user;
      const resolvedName = firebaseUser.displayName || "Google User";

      // Sync User Profile Record to Firestore
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          fullName: resolvedName,
          email: firebaseUser.email || "",
          photoUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(firebaseUser.uid)}`,
          providerId: "google.com",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setLoading(false);
      setSuccess(true);

      setTimeout(() => {
        onLoginSuccess({
          email: firebaseUser.email || "",
          isLoggedIn: true,
          fullName: resolvedName,
          avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(firebaseUser.uid)}`,
        });
        setSuccess(false);
      }, 1000);

    } catch (err: any) {
      console.error("Google authentication failed:", err);
      setError(formatAuthError(err));
      setLoading(false);
    }
  };

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
          providerId: "password",
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

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-150"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-slate-400 font-bold tracking-wider text-[9px] uppercase font-mono">or continue with</span>
                </div>
              </div>

              {/* Google Authenticator Action Button */}
              <button
                type="button"
                id="btn-google-auth"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition duration-250 border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

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
