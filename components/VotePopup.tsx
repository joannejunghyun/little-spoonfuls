"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";

interface VoteState {
  count: number;
  target: number;
  hasVoted: boolean;
}

interface VotePopupProps {
  initialVote: VoteState;
  onVoted: (newState: VoteState) => void;
  onClose: () => void;
}

export function VotePopup({ initialVote, onVoted, onClose }: VotePopupProps) {
  const t = useLanguage();
  const [vote, setVote] = useState(initialVote);
  const [loading, setLoading] = useState(false);

  async function handleVote() {
    setLoading(true);
    const res = await fetch("/api/vote", { method: "POST" });
    if (res.ok) {
      const data: VoteState = await res.json();
      setVote(data);
      onVoted(data);
    }
    setLoading(false);
  }

  const progress = Math.min((vote.count / vote.target) * 100, 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-lg leading-none"
        >
          ✕
        </button>

        <div className="flex flex-col gap-4">
          <div className="text-center">
            <div className="text-3xl mb-2">🍼</div>
            <h2 className="text-lg font-black text-foreground">{t.voteTitle}</h2>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{t.voteDesc}</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>{t.voteProgress(vote.count, vote.target)}</span>
              <span>{vote.target - vote.count > 0 ? t.voteNeeded(vote.target - vote.count) : t.voteGoalReached}</span>
            </div>
            <div className="h-2.5 bg-[#fff0e6] rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {vote.hasVoted ? (
            <div className="bg-[#f0fdf4] rounded-2xl p-4 text-center border border-[#bbf7d0]">
              <p className="text-sm font-bold text-emerald-700">{t.voteThanks}</p>
              <p className="text-xs text-emerald-600 mt-1">{t.voteEarlyBird}</p>
            </div>
          ) : (
            <Button
              onClick={handleVote}
              disabled={loading}
              className="w-full rounded-2xl py-5 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
            >
              {loading ? "..." : t.voteBtn}
            </Button>
          )}

          {!vote.hasVoted && (
            <button
              onClick={onClose}
              className="text-xs text-muted-foreground text-center hover:underline"
            >
              {t.voteLater}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
