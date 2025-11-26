"use client";

import { useState } from "react";

interface AgeGateProps {
  onConfirm: () => void;
}

export default function AgeGate({ onConfirm }: AgeGateProps) {
  const [checked, setChecked] = useState(false);

  const handleEnter = () => {
    if (!checked) {
      alert("Please confirm that you are 18+ and consent to continue.");
      return;
    }
    onConfirm();
  };

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Before we begin…</h2>
      <p className="text-sm text-slate-300">
        This experience contains adult themes and is designed for{" "}
        <span className="font-semibold text-slate-100">
          consenting adults only
        </span>
        . Please read and confirm:
      </p>

      <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
        <li>I am 18+ years old.</li>
        <li>I understand I can pause or stop at any time.</li>
        <li>I will respect my own boundaries and the boundaries of others.</li>
        <li>Stories shared here stay private unless everyone agrees.</li>
      </ul>

      <label className="flex items-start gap-3 mt-3 text-sm cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-brand-500 focus:ring-brand-500"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <span>I confirm all of the above.</span>
      </label>

      <button
        onClick={handleEnter}
        className="mt-4 inline-flex items-center justify-center rounded-2xl bg-brand-500 hover:bg-brand-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        Enter the game
      </button>

      <p className="text-xs text-slate-500 pt-3 border-t border-slate-800">
        You have been saved from small talk.
      </p>
    </section>
  );
}
