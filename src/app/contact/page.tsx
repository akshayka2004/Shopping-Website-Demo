"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject,
          orderNumber,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "error", text: data.error || "Submission failed." });
      } else {
        setStatus({ type: "success", text: data.message });
        setName("");
        setEmail("");
        setSubject("");
        setOrderNumber("");
        setMessage("");
      }
    } catch {
      setStatus({
        type: "error",
        text: "Network error while sending message.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="border-b border-stone-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
          Client Services
        </p>
        <h1
          data-testid="contact-heading"
          className="text-3xl sm:text-4xl font-serif text-stone-900 mt-1"
        >
          Contact & Customer Care
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-5">
            <h2 className="text-lg font-serif text-stone-900">
              Studio & Support Directory
            </h2>
            <div className="space-y-4 text-sm text-stone-600">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-stone-900 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-900">Flagship Studio</p>
                  <p>{siteConfig.contact.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-stone-900 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-900">Client Care Email</p>
                  <p>{siteConfig.contact.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-stone-900 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-900">Telephone</p>
                  <p>{siteConfig.contact.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-stone-900 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-900">Operating Hours</p>
                  <p>{siteConfig.contact.hours}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 space-y-5">
            <h2 className="text-lg font-serif text-stone-900">
              Send Us an Inquiry
            </h2>

            {status && (
              <div
                data-testid="contact-form-status"
                className={`p-4 rounded-xl text-xs flex items-center gap-2.5 border ${
                  status.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-red-50 border-red-200 text-red-900"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                )}
                <span>{status.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    data-testid="contact-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    data-testid="contact-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    data-testid="contact-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Sizing advice / Order assistance"
                    required
                    className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Order Reference (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="ORD-2026-1001"
                    className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Message *
                </label>
                <textarea
                  data-testid="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  required
                  className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                data-testid="contact-submit-btn"
                disabled={submitting}
                className="px-6 py-3 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800"
              >
                {submitting ? "Sending..." : "Submit Inquiry"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

