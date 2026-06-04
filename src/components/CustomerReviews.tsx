/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Trash2, ShieldCheck, AlertCircle, Sparkles, Send, Check } from "lucide-react";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { UserSession, Review } from "../types";

interface CustomerReviewsProps {
  session: UserSession;
}

export default function CustomerReviews({ session }: CustomerReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [fullName, setFullName] = useState(session.fullName || "");
  const [email, setEmail] = useState(session.email || "");
  const [submitting, setSubmitting] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Synchronise session attributes on mount/edit
  useEffect(() => {
    if (session.fullName) setFullName(session.fullName);
    if (session.email) setEmail(session.email);
  }, [session]);

  // Read comments/reviews from collection in real-time
  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedReviews: Review[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          loadedReviews.push({
            id: doc.id,
            userId: data.userId || "",
            fullName: data.fullName || "Anonymous User",
            email: data.email || "",
            rating: data.rating || 5,
            reviewText: data.reviewText || "",
            createdAt: data.createdAt,
          });
        });
        setReviews(loadedReviews);
        setLoading(false);
      },
      (error) => {
        console.error("Realtime Reviews Fetching failed:", error);
        try {
          handleFirestoreError(error, OperationType.LIST, "reviews");
        } catch (e) {
          setErrorToast("Warning: reviews table lacks Firestore rules or setup is incomplete.");
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setErrorToast("You must log in to rate the workspace/app.");
      setTimeout(() => setErrorToast(null), 5000);
      return;
    }

    if (!fullName.trim() || !email.trim()) {
      setErrorToast("Identity confirmation: Your full name and email must be filled.");
      setTimeout(() => setErrorToast(null), 5000);
      return;
    }

    if (reviewText.trim().length < 2) {
      setErrorToast("Please write a constructive testimonial of at least 2 characters.");
      setTimeout(() => setErrorToast(null), 5500);
      return;
    }

    if (reviewText.trim().length > 2000) {
      setErrorToast("Testimonials exceed maximum safety payload constraint (2000 characters).");
      setTimeout(() => setErrorToast(null), 5000);
      return;
    }

    setSubmitting(true);
    const reviewId = `rev-${uid}`; // Enforce single active review document per authenticated workspace account
    const reviewDocRef = doc(db, "reviews", reviewId);

    const payload = {
      userId: uid,
      fullName: fullName.trim(),
      email: email.trim(), // Rules safely prevent email spoofing targeting external addresses
      rating,
      reviewText: reviewText.trim(),
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(reviewDocRef, payload);
      setSuccessToast("Success! Your verified customer testimonial is compiled and active!");
      setReviewText("");
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err: any) {
      console.error("Submission failed:", err);
      try {
        handleFirestoreError(err, OperationType.WRITE, `reviews/${reviewId}`);
      } catch (e) {
        setErrorToast(err.message || "Permissions insufficient. Contact administrators ANUNAND & AKASH.");
        setTimeout(() => setErrorToast(null), 6000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, authorId: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid || uid !== authorId) {
      setErrorToast("Security warning: You can only purge your own verified review!");
      setTimeout(() => setErrorToast(null), 4000);
      return;
    }

    if (!window.confirm("Are you sure you would like to delete this testimonial?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "reviews", id));
      setSuccessToast("Verified testimonial purged successfully.");
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      console.error("Deletion failed:", err);
      try {
        handleFirestoreError(err, OperationType.DELETE, `reviews/${id}`);
      } catch (e) {
        setErrorToast("Internal error removing document.");
        setTimeout(() => setErrorToast(null), 4000);
      }
    }
  };

  // Render clickable stars
  const renderStars = (count: number, interactive = false) => {
    return (
      <div className="flex items-center gap-1 shrink-0">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = interactive 
            ? (hoverRating !== null ? star <= hoverRating : star <= rating)
            : star <= count;
          return (
            <button
              key={star}
              type="button"
              onClick={() => {
                if (interactive) setRating(star);
              }}
              onMouseEnter={() => {
                if (interactive) setHoverRating(star);
              }}
              onMouseLeave={() => {
                if (interactive) setHoverRating(null);
              }}
              disabled={!interactive}
              className={`${interactive ? "cursor-pointer active:scale-90 transition-transform duration-100 p-0.5" : "cursor-default"}`}
            >
              <Star 
                className={`w-5 h-5 ${
                  isFilled 
                    ? "fill-amber-400 text-amber-500" 
                    : "text-slate-200"
                }`} 
              />
            </button>
          );
        })}
      </div>
    );
  };

  // Compute stats metrics
  const totalCount = reviews.length;
  const averageRating = totalCount > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1) 
    : "0.0";

  return (
    <div className="space-y-12 animate-fadeIn py-4">
      
      {/* Toast Notifications */}
      {errorToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-red-650 border border-red-700 text-white rounded-xl shadow-lg flex items-center gap-3 animate-slideIn">
          <AlertCircle className="w-5 h-5 text-white animate-pulse" />
          <p className="text-xs font-bold leading-relaxed">{errorToast}</p>
        </div>
      )}

      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-605 border border-emerald-700 text-white rounded-xl shadow-lg flex items-center gap-2.5 animate-slideIn">
          <Check className="w-5 h-5 text-white" />
          <p className="text-xs font-bold leading-relaxed">{successToast}</p>
        </div>
      )}

      {/* Title & Introduction */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-3xs" id="reviews-header-block">
        <div>
          <span className="px-3.5 py-1 text-[10px] font-extrabold tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-150 rounded-full uppercase">
            👑 Community Testimonials
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-3">Customer App Experience & Reviews</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1.5 leading-relaxed">
            Read certified experiences from international developers or pen your review. Your authenticated feedback assists the team in tuning Resumify.
          </p>
        </div>

        {/* Global Statistics Scorecard */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-150 p-4 rounded-xl shrink-0">
          <div className="text-center">
            <p className="text-3xl font-black text-slate-900 leading-none">{averageRating}</p>
            <p className="text-[9px] text-slate-400 font-black uppercase font-mono mt-1">Average Star Score</p>
          </div>
          <div className="border-l border-slate-200 h-10" />
          <div>
            <div className="flex gap-0.5 mb-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(Number(averageRating)) ? "fill-amber-400" : "text-slate-200"}`} />
              ))}
            </div>
            <p className="text-xs font-bold text-slate-700">{totalCount} Customer Review{totalCount !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Post Review Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-3xs space-y-5" id="post-review-form-container">
          <div className="space-y-1.5">
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" /> Write Your Review
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Rate your experience building, exporting and parsing. One verified testimonial is allocated per account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identity Constraints Guidance Message */}
            <div className="p-3 bg-indigo-50/55 border border-indigo-100 rounded-xl space-y-1 text-[11px] text-indigo-850">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-indigo-650 shrink-0" />
                <span>Verified Account Binding Enforced</span>
              </div>
              <p className="text-[10.5px] leading-relaxed text-slate-600 font-medium">
                To guarantee credible testimonials, Firestore rules mandate matching your authenticated session address (<strong className="text-slate-800">{session.email}</strong>).
              </p>
            </div>

            {/* Author Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-black uppercase font-mono tracking-wider">Your Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rachel Green"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 rounded-lg text-xs font-semibold text-slate-800 transition focus:outline-none"
              />
            </div>

            {/* Author Email Address - Locked to current Authenticated Address to succeed Security Rules verification */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-black uppercase font-mono tracking-wider flex justify-between">
                <span>Verified Email Address</span>
                <span className="text-[9px] text-emerald-600 font-sans tracking-normal font-bold lowercase flex items-center gap-0.5">
                  <ShieldCheck className="w-3 w-3" /> account locked
                </span>
              </label>
              <input
                type="email"
                required
                readOnly
                value={email}
                title="Account email address is locked for secure Firestore ABAC verification."
                className="w-full px-3 py-2 bg-slate-100/80 border border-slate-200 text-slate-500 cursor-not-allowed rounded-lg text-xs font-mono font-bold focus:outline-none"
              />
            </div>

            {/* Interactive Rating Picker */}
            <div className="space-y-1.5 p-3.5 bg-slate-55 rounded-xl border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
              <div>
                <span className="text-[10px] text-slate-500 font-black uppercase font-mono tracking-wider block">Your App Rating score</span>
                <span className="text-[11px] text-slate-400 font-semibold mt-0.5">Tap a star to adjust scale rank</span>
              </div>
              <div className="flex items-center gap-2">
                {renderStars(rating, true)}
                <span className="text-xs font-black text-slate-800 font-mono w-4 text-center">({rating})</span>
              </div>
            </div>

            {/* Testimonial Text */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <label className="text-[10px] text-slate-500 font-black uppercase font-mono tracking-wider">Testimonial Review Text</label>
                <span className={`text-[10px] font-mono font-bold ${reviewText.length > 2000 ? "text-red-500" : "text-slate-400"}`}>
                  {reviewText.length}/2000
                </span>
              </div>
              <textarea
                required
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                maxLength={2000}
                placeholder="What do you love most about Resumify? Have suggestions for AKASH & ANUNAND?"
                className="w-full px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 rounded-lg text-xs font-medium text-slate-700 leading-relaxed transition focus:outline-none"
              />
            </div>

            {/* Submit Testimonial */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-slate-900 border border-slate-950 text-white rounded-xl text-xs font-bold hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Publishing Testimonial...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-indigo-400 scale-90" />
                  <span>Publish Verified Review</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Live Customer Testimonial List Feed */}
        <div className="lg:col-span-7 space-y-4" id="testimonials-list-container">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase font-mono tracking-wider text-slate-500 block">
              Testimonials Feed ({totalCount})
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
              Real-Time Feed live
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white rounded-all border border-slate-100 shadow-3xs flex flex-col items-center justify-center space-y-3">
              <div className="w-6 h-6 border-2 border-indigo-650/35 border-t-indigo-650 rounded-full animate-spin" />
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Connecting with review registry...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-100 rounded-2xl shadow-3xs space-y-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div className="max-w-xs mx-auto space-y-1.5">
                <h4 className="text-sm font-black text-slate-900">Be the First to Testify!</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  No verified customer reviews have been written yet. Type your experience on the left to activate our testimonial stream!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
              {reviews.map((rev) => {
                const docDate = rev.createdAt?.toDate ? rev.createdAt.toDate() : (rev.createdAt ? new Date(rev.createdAt) : new Date(2026, 5, 4));
                const formattedDate = docDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                });

                const letterSeed = encodeURIComponent(rev.fullName);
                const isMyReview = rev.userId === auth.currentUser?.uid;

                return (
                  <div 
                    key={rev.id} 
                    className={`p-4 bg-white border rounded-2xl shadow-3xs transition duration-200 relative group flex flex-col sm:flex-row gap-4 items-start ${
                      isMyReview ? "border-indigo-305 bg-indigo-50/10" : "border-slate-150"
                    }`}
                  >
                    {/* User profile identifier */}
                    <img 
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${letterSeed}&backgroundColor=6366f1,312e81,1e3a8a`}
                      alt={rev.fullName}
                      className="w-10 h-10 rounded-full bg-slate-50 border border-slate-205/60 shrink-0"
                    />

                    {/* Review content wrapper */}
                    <div className="flex-1 space-y-2.5 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b pb-2 border-slate-100">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-black text-slate-900 tracking-tight">{rev.fullName}</span>
                            {isMyReview && (
                              <span className="bg-indigo-600 text-white text-[8.5px] font-black uppercase px-2 py-0.2 rounded font-sans tracking-wide">
                                your review
                              </span>
                            )}
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded text-[9.5px] font-semibold flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" /> Verified User
                            </span>
                          </div>
                          {/* Hide strict full email content for standard public reviewers except domain profile for privacy compliance */}
                          <p className="text-[9.5px] text-slate-400 font-mono font-medium">
                            {rev.email.replace(/(.{3})(.*)(?=@)/, "$1***")}
                          </p>
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          {renderStars(rev.rating)}
                          <p className="text-[9px] text-slate-400 font-bold font-mono tracking-wide uppercase mt-1">{formattedDate}</p>
                        </div>
                      </div>

                      {/* Actual Review Text */}
                      <p className="text-xs text-slate-750 leading-relaxed font-semibold whitespace-pre-wrap">
                        {rev.reviewText}
                      </p>
                    </div>

                    {/* Delete Trigger for review authors */}
                    {isMyReview && (
                      <button
                        type="button"
                        onClick={() => handleDelete(rev.id, rev.userId)}
                        title="Delete your testimonial"
                        className="absolute bottom-4 right-4 sm:top-4 sm:bottom-auto text-slate-400 hover:text-red-500 sm:opacity-0 group-hover:opacity-100 transition p-1.5 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
