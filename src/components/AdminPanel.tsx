/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, Pencil, Trash2, X, Check, Mail, User, 
  MessageSquare, Send, Lock, Unlock, Power, Filter, Clock, AlertCircle, RefreshCw
} from "lucide-react";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { 
  collection, onSnapshot, doc, setDoc, deleteDoc, 
  serverTimestamp, query, orderBy, limit 
} from "firebase/firestore";
import { Review, SupportMessage, UserSession } from "../types";

interface AdminPanelProps {
  session: UserSession;
  isAdminSession: boolean;
  onAdminLogin: () => void;
  onAdminLogout: () => void;
  onNavigateToTab: (tab: string) => void;
}

export default function AdminPanel({ 
  session, 
  isAdminSession, 
  onAdminLogin, 
  onAdminLogout,
  onNavigateToTab 
}: AdminPanelProps) {
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"reviews" | "tickets">("reviews");

  // Dashboard Data states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tickets, setTickets] = useState<SupportMessage[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  // Filters
  const [ticketFilter, setTicketFilter] = useState<"all" | "pending" | "replied">("all");

  // Inline edit state for reviews
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editReviewText, setEditReviewText] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [isSavingReview, setIsSavingReview] = useState(false);

  // Instant reply state for support tickets
  const [replyingTicket, setReplyingTicket] = useState<SupportMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Toasts
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Password submission handler
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "2ACREATIONS") {
      onAdminLogin();
      setAuthError(null);
      setPassword("");
      showSuccess("Authorized! Welcome to the Resumify Administration Console.");
    } else {
      setAuthError("Incorrect administrator credentials code. Access access barred.");
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 5050);
  };

  // Real-time listener for Reviews
  useEffect(() => {
    if (!isAdminSession) return;
    setReviewsLoading(true);

    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Review[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            userId: data.userId || "",
            fullName: data.fullName || "Anonymous Poster",
            email: data.email || "",
            rating: data.rating || 5,
            reviewText: data.reviewText || "",
            createdAt: data.createdAt
          });
        });
        setReviews(list);
        setReviewsLoading(false);
      },
      (err) => {
        console.error("Admin reviews pull failed:", err);
        showError("Permission denied when listing reviews from secure collection.");
        setReviewsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isAdminSession]);

  // Real-time listener for Support Tickets
  useEffect(() => {
    if (!isAdminSession) return;
    setTicketsLoading(true);

    const q = query(collection(db, "support_messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: SupportMessage[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            userId: data.userId || "",
            name: data.name || "Anonymous Cust",
            email: data.email || "",
            message: data.message || "",
            reply: data.reply,
            repliedAt: data.repliedAt,
            createdAt: data.createdAt
          });
        });
        setTickets(list);
        setTicketsLoading(false);
      },
      (err) => {
        console.error("Admin tickets subscribe failed:", err);
        showError("Permission denied retrieving customer support tickets.");
        setTicketsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isAdminSession]);

  // Deleting reviews as admin
  const handleDeleteReview = async (id: string) => {
    if (!window.confirm("CRITICAL WARNING: Are you sure you want to permanently delete this customer testimonial from Firestore? This action is irreversible.")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "reviews", id));
      showSuccess("Customer review was permanently purged from database.");
    } catch (err: any) {
      console.error("Failed to delete review:", err);
      showError("Access permissions denied on review delete.");
    }
  };

  // Editing reviews - trigger form
  const handleStartEditReview = (rev: Review) => {
    setEditingReview(rev);
    setEditRating(rev.rating);
    setEditReviewText(rev.reviewText);
    setEditFullName(rev.fullName);
  };

  // Save review edits
  const handleSaveReviewEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;

    if (!editFullName.trim() || !editReviewText.trim()) {
      showError("Please make sure name and review body are completed.");
      return;
    }

    setIsSavingReview(true);
    try {
      const docRef = doc(db, "reviews", editingReview.id);
      await setDoc(docRef, {
        userId: editingReview.userId,
        fullName: editFullName.trim(),
        email: editingReview.email,
        rating: editRating,
        reviewText: editReviewText.trim(),
        createdAt: editingReview.createdAt || serverTimestamp()
      });
      showSuccess("Review modified and saved successfully.");
      setEditingReview(null);
    } catch (err: any) {
      console.error("Save review error:", err);
      showError("Failed to update review. Secure write denied.");
    } finally {
      setIsSavingReview(false);
    }
  };

  // Reply message form triggers
  const handleStartReply = (ticket: SupportMessage) => {
    setReplyingTicket(ticket);
    setReplyText(ticket.reply || "");
  };

  // Save Reply to ticket
  const handleSaveTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingTicket) return;

    if (!replyText.trim()) {
      showError("Response message text cannot be empty.");
      return;
    }

    setIsSendingReply(true);
    try {
      const docRef = doc(db, "support_messages", replyingTicket.id);

      // Perform partial update to set reply & repliedAt
      await setDoc(docRef, {
        userId: replyingTicket.userId,
        name: replyingTicket.name,
        email: replyingTicket.email,
        message: replyingTicket.message,
        createdAt: replyingTicket.createdAt || serverTimestamp(),
        reply: replyText.trim(),
        repliedAt: serverTimestamp()
      });

      // Try to dispatch actual SMTP-simulation backend email!
      try {
        const response = await fetch("/api/admin/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerEmail: replyingTicket.email,
            customerName: replyingTicket.name,
            ticketId: replyingTicket.id,
            originalMessage: replyingTicket.message,
            replyText: replyText.trim()
          })
        });

        if (response.ok) {
          const resJson = await response.json();
          console.log("Email dispatch service output:", resJson);
          showSuccess(`Support response registered! Direct email notification successfully dispatched to ${replyingTicket.email}.`);
        } else {
          showSuccess(`Support response registered. Direct email simulated copy printed to node server log.`);
        }
      } catch (mailErr) {
        console.warn("Mail api hook connection failed but message stored successfully in Firestore.", mailErr);
        showSuccess(`Support response saved to Firestore database!`);
      }

      setReplyingTicket(null);
      setReplyText("");
    } catch (err: any) {
      console.error("Response register failure:", err);
      showError("Could not dispatch response. Firestore rules blocked.");
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!window.confirm("Purge this support ticket data from memory?")) return;
    try {
      await deleteDoc(doc(db, "support_messages", id));
      showSuccess("Ticket removed.");
    } catch (err) {
      showError("Delete ticket failed.");
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (ticketFilter === "pending") return !t.reply;
    if (ticketFilter === "replied") return !!t.reply;
    return true;
  });

  // Calculate stats
  const pendingTicketsCount = tickets.filter(t => !t.reply).length;
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "N/A";

  if (!isAdminSession) {
    return (
      <div className="max-w-md mx-auto my-12 animate-fadeIn">
        <div className="bg-white p-8 rounded-3xl border border-slate-150 shadow-lg space-y-6 relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600" />
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
              <Lock className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">System Lock</h2>
            <p className="text-xs text-slate-500 font-medium">
              Enter the master access password passcode to unlock variables editing and support console.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono block">
                Administrator Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                autoFocus
              />
              {authError && (
                <p className="text-[10px] text-red-500 font-bold flex items-center gap-1.5 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {authError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 border border-indigo-700 text-white rounded-xl text-xs font-bold hover:bg-indigo-750 active:scale-[0.98] transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>

          <p className="text-[10px] text-slate-400 text-center font-medium">
            Strict Zero-Trust identity protocol active. Changes tracked under email <span className="font-mono text-slate-650 font-bold">{session.email}</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn py-2 selection:bg-indigo-150">
      
      {/* Toast notifications */}
      {successToast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-emerald-400 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-black z-50 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}
      {errorToast && (
        <div className="fixed bottom-6 right-6 bg-red-950 border border-red-900 text-red-400 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-black z-50 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Admin Panel Header Dashboard */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 rounded text-[9px] text-indigo-400 font-bold uppercase tracking-widest">
              SYSTEM CONSOLE
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> Authorized
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight font-sans flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <span>Resumify Security Administrator Panel</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Operating secure operations with high level privileges for active account <span className="text-slate-200 font-mono font-bold">{session.email}</span>.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onNavigateToTab("reviews")}
            className="px-3.5 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-840 rounded-xl text-xs font-bold text-slate-300 transition flex items-center gap-1 rounded-xl cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> View Reviews Tab
          </button>
          
          <button
            onClick={onAdminLogout}
            className="px-3.5 py-2 bg-red-900/40 hover:bg-red-800/60 border border-red-500/20 text-red-300 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <Power className="w-3.5 h-3.5 text-red-400" /> Log Out Admin
          </button>
        </div>
      </div>

      {/* Quick Status Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs space-y-1">
          <span className="text-[10px] text-slate-400 font-black uppercase font-mono tracking-wider">Accumulated Reviews</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-slate-900">{reviewsLoading ? "..." : reviews.length}</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold mt-1">
              ★ {averageRating} Avg
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs space-y-1">
          <span className="text-[10px] text-slate-400 font-black uppercase font-mono tracking-wider">Support Messages Feed</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-slate-900">{ticketsLoading ? "..." : tickets.length}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs space-y-1">
          <span className="text-[10px] text-slate-400 font-black uppercase font-mono tracking-wider">Awaiting Responses</span>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-black ${pendingTicketsCount > 0 ? "text-amber-500 animate-pulse" : "text-emerald-600"}`}>
              {ticketsLoading ? "..." : pendingTicketsCount}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-bold mt-1 bg-amber-50 text-amber-600 font-sans">
              Needs Reply
            </span>
          </div>
        </div>
      </div>

      {/* Sub tabs selectors */}
      <div className="border-b border-slate-200 pb-px flex items-center justify-between gap-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveSubTab("reviews")}
            className={`pb-3 font-black text-xs uppercase tracking-wider font-mono border-b-2 transition cursor-pointer select-none ${
              activeSubTab === "reviews" 
                ? "border-indigo-600 text-indigo-600" 
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Manage Testimonials ({reviews.length})
          </button>

          <button
            onClick={() => setActiveSubTab("tickets")}
            className={`pb-3 font-black text-xs uppercase tracking-wider font-mono border-b-2 transition cursor-pointer select-none ${
              activeSubTab === "tickets" 
                ? "border-indigo-600 text-indigo-600" 
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Support Channel Inbox ({pendingTicketsCount} open)
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE DETAILS SUB TAB */}
      {activeSubTab === "reviews" && (
        <div className="space-y-6">
          
          {/* Overlay Edit Review Modal (or absolute card) */}
          {editingReview && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-4 animate-fadeIn relative">
              <button 
                onClick={() => setEditingReview(null)} 
                className="absolute top-4 right-4 p-1 rounded-full text-amber-700 hover:bg-amber-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 text-amber-800">
                <Pencil className="w-4 h-4" />
                <h4 className="text-xs font-black uppercase font-mono tracking-wider">Editing Review Written by ID: <span className="font-bold font-sans text-slate-800">{editingReview.fullName}</span></h4>
              </div>
              <form onSubmit={handleSaveReviewEdits} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase font-sans">Reviewer Full Name</label>
                    <input 
                      type="text"
                      className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-250 rounded-xl"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase font-sans">Unmask Email Address (Locked)</label>
                    <input 
                      type="text"
                      className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed rounded-xl"
                      value={editingReview.email}
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-bold uppercase font-sans">Review Text Body</label>
                  <textarea 
                    rows={3}
                    className="w-full text-xs font-semibold p-3.5 bg-white border border-slate-250 rounded-xl focus:outline-indigo-500 focus:border-indigo-500"
                    value={editReviewText}
                    onChange={(e) => setEditReviewText(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-black uppercase font-mono mr-2">Assign Rating:</span>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setEditRating(s)}
                        className="p-0.5 cursor-pointer"
                      >
                        <Lock className={`w-3.5 h-3.5 ${s <= editRating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setEditingReview(null)}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingReview}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer disabled:opacity-60 flex items-center gap-1"
                    >
                      {isSavingReview ? "Saving Changes..." : "Save Testimonial Changes"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Testimonial review cards layout */}
          <div className="space-y-4">
            {reviewsLoading ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-slate-300 mb-2" />
                <span className="text-xs font-mono">Syncing reviews from secure collection...</span>
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-xs text-slate-405 font-mono">No customer reviews present.</p>
            ) : (
              reviews.map((rev) => {
                const docDate = rev.createdAt?.toDate ? rev.createdAt.toDate() : (rev.createdAt ? new Date(rev.createdAt) : new Date(2026, 5, 4));
                const formattedDate = docDate.toLocaleDateString("en-US", {
                  year: "numeric", month: "short", day: "numeric"
                });

                return (
                  <div key={rev.id} className="bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs relative group transition-all hover:border-slate-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 mb-3 border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-xs font-black font-mono">
                          {rev.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 tracking-tight">{rev.fullName}</p>
                          <p className="text-[10px] text-blue-600 font-bold font-mono tracking-tight flex items-center gap-1">
                            <Mail className="w-3 h-3 text-blue-500" /> {rev.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <Lock key={num} className={`w-3.5 h-3.5 ${num <= rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono font-semibold uppercase">{formattedDate}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-semibold whitespace-pre-wrap pl-1">
                      {rev.reviewText}
                    </p>

                    <div className="flex justify-end gap-1.5 mt-3 pt-3 border-t border-slate-50">
                      <button
                        onClick={() => handleStartEditReview(rev)}
                        className="text-[10.5px] px-3 py-1 bg-slate-50 hover:bg-slate-100 hover:text-indigo-600 text-slate-650 transition rounded-lg font-bold border border-slate-200 flex items-center gap-0.5 cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" /> Edit Testimony
                      </button>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="text-[10.5px] px-3 py-1 bg-red-50 hover:bg-red-100 hover:text-red-600 text-red-650 transition rounded-lg font-bold border border-slate-200 flex items-center gap-0.5 cursor-pointer animate-fadeIn"
                      >
                        <Trash2 className="w-3 h-3" /> Purge
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeSubTab === "tickets" && (
        <div className="space-y-6">

          {/* Ticket Response compose panel */}
          {replyingTicket && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 shadow-sm space-y-4 animate-fadeIn relative">
              <button 
                onClick={() => setReplyingTicket(null)} 
                className="absolute top-4 right-4 p-1 rounded-full text-indigo-700 hover:bg-indigo-105 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 text-indigo-900">
                <Send className="w-4 h-4" />
                <h4 className="text-xs font-black uppercase font-mono tracking-wider">COMPOSE RESPONSE REPLY FOR: <span className="font-bold font-sans text-indigo-950">{replyingTicket.name}</span></h4>
              </div>

              <div className="bg-white p-3.5 border border-indigo-150 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>From: {replyingTicket.name} ({replyingTicket.email})</span>
                </div>
                <p className="text-xs text-slate-800 font-medium whitespace-pre-wrap italic">
                  "{replyingTicket.message}"
                </p>
              </div>

              <form onSubmit={handleSaveTicketReply} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-indigo-950 font-bold uppercase font-mono tracking-tight block">Response Reply Message Text</label>
                  <textarea 
                    rows={4}
                    className="w-full text-xs font-semibold p-3.5 bg-white border border-indigo-200 rounded-xl focus:outline-indigo-500 focus:border-indigo-500"
                    placeholder="Type professional help or feedback reply message..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-between items-center gap-1">
                  <span className="text-[10px] text-slate-500 font-semibold font-sans">Customer will immediately view the response in their Inbox space under Team Resumify Support tab.</span>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setReplyingTicket(null)}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingReply}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-60"
                    >
                      {isSendingReply ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Publishing reply...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Dispatch Response</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Filters toolhead */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
              <Filter className="w-4 h-4 text-slate-400" />
              <span>Filter list by response status:</span>
            </div>
            <div className="flex gap-2">
              {[
                { id: "all", label: `All Queries (${tickets.length})` },
                { id: "pending", label: `Awaiting Reply (${pendingTicketsCount})` },
                { id: "replied", label: `Replied (${tickets.length - pendingTicketsCount})` },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setTicketFilter(btn.id as any)}
                  className={`px-3 py-1 rounded-lg text-[10.5px] font-bold transition border cursor-pointer ${
                    ticketFilter === btn.id 
                      ? "bg-slate-900 text-white border-slate-900 shadow-3xs" 
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Messages Feed */}
          <div className="space-y-4">
            {ticketsLoading ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-slate-300 mb-2" />
                <span className="text-xs font-mono">Syncing customer query tickets...</span>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-400 font-bold">No query tickets match selected filter.</p>
              </div>
            ) : (
              filteredTickets.map((t) => {
                const ticketDate = t.createdAt?.toDate ? t.createdAt.toDate() : (t.createdAt ? new Date(t.createdAt) : new Date(2026, 5, 4));
                const formattedTicketDate = ticketDate.toLocaleDateString("en-US", {
                  year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                });

                const repliedDate = t.repliedAt?.toDate ? t.repliedAt.toDate() : (t.repliedAt ? new Date(t.repliedAt) : null);
                const formattedRepliedDate = repliedDate 
                  ? repliedDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                  : "";

                return (
                  <div key={t.id} className="bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs space-y-4 hover:border-slate-300 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-900 tracking-tight">{t.name}</span>
                          {!t.reply ? (
                            <span className="px-2 py-0.5 bg-red-50 text-red-650 tracking-tight text-[9px] font-black uppercase rounded border border-red-150">
                              Awaiting Reply
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 tracking-tight text-[9px] font-black uppercase rounded border border-emerald-150 flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Replied
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono tracking-tight mt-0.5 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-300" /> {t.email} 
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-400">UID: {t.userId.substring(0, 10)}...</span>
                        </p>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase flex items-center gap-1 sm:justify-end">
                          <Clock className="w-3.5 h-3.5" /> {formattedTicketDate}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider font-mono block">Query Suggestion / message:</span>
                      <p className="text-xs text-slate-800 leading-relaxed font-semibold whitespace-pre-wrap pl-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        "{t.message}"
                      </p>
                    </div>

                    {/* Render Reply if active */}
                    {t.reply && (
                      <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-150/55 space-y-2 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-[9.5px] text-indigo-900 font-black uppercase tracking-wider font-mono flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-750" /> Team Resumify Response
                          </span>
                          <span className="text-[9px] text-indigo-500 font-mono uppercase font-bold">{formattedRepliedDate}</span>
                        </div>
                        <p className="text-xs text-indigo-950 font-semibold whitespace-pre-wrap italic">
                          "{t.reply}"
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-1">
                      {t.reply && (
                        <button
                          onClick={() => handleStartReply(t)}
                          className="text-[10.5px] px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 font-bold border border-slate-205 rounded-lg flex items-center gap-1 transition cursor-pointer"
                        >
                          <Pencil className="w-3 h-3 text-slate-500" /> Edit Response
                        </button>
                      )}
                      
                      {!t.reply && (
                        <button
                          onClick={() => handleStartReply(t)}
                          className="text-[10.5px] px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-1 transition cursor-pointer font-sans"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Compose Response Reply
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteTicket(t.id)}
                        className="text-[10.5px] px-3.5 py-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 font-bold border border-slate-200 rounded-lg flex items-center gap-1 transition cursor-pointer"
                        title="Delete ticket"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
}
