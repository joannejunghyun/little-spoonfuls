"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";

const DISMISS_KEY = "telegram_banner_dismissed_at";
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface LinkStatus {
  linked: boolean;
}

interface CodeResponse {
  code?: string;
  expires_in?: number;
  bot_username?: string | null;
  status?: "already_linked";
}

export function TelegramConnectBanner({ visible }: { visible: boolean }) {
  const t = useLanguage();
  const [linkStatus, setLinkStatus] = useState<LinkStatus | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [alreadyLinked, setAlreadyLinked] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!visible) return;
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? "0");
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_TTL_MS) {
      setDismissed(true);
      return;
    }
    setDismissed(false);
    fetch("/api/telegram/link")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: LinkStatus | null) => setLinkStatus(data))
      .catch(() => setLinkStatus(null));
  }, [visible]);

  useEffect(() => {
    if (!modalOpen || !expiresAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [modalOpen, expiresAt]);

  if (!visible || dismissed || !linkStatus || linkStatus.linked) return null;

  async function handleConnect() {
    setLoading(true);
    setError(false);
    setAlreadyLinked(false);
    try {
      const res = await fetch("/api/telegram/link", { method: "POST" });
      if (!res.ok) {
        setError(true);
        setModalOpen(true);
        return;
      }
      const data: CodeResponse = await res.json();
      if (data.status === "already_linked") {
        setAlreadyLinked(true);
        setModalOpen(true);
        return;
      }
      if (!data.code || !data.expires_in) {
        setError(true);
        setModalOpen(true);
        return;
      }
      setCode(data.code);
      setBotUsername(data.bot_username ?? null);
      setExpiresAt(Date.now() + data.expires_in * 1000);
      setModalOpen(true);
    } catch {
      setError(true);
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  }

  function handleClose() {
    setModalOpen(false);
    setCode(null);
    setExpiresAt(null);
    setError(false);
    setAlreadyLinked(false);
    setCopied(false);
  }

  async function handleCopy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // noop
    }
  }

  const minutesLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt - now) / 60000)) : 0;
  const botLabel = botUsername ? (botUsername.startsWith("@") ? botUsername : `@${botUsername}`) : null;

  return (
    <>
      <div className="bg-[#eaf6ff] rounded-3xl p-4 border border-[#cfe7ff] flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💬</div>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-bold text-foreground">{t.telegram.bannerTitle}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{t.telegram.bannerBody}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleConnect}
            disabled={loading}
            className="flex-1 rounded-2xl py-2.5 text-sm font-bold bg-[#229ed9] hover:bg-[#1d8cc1] text-white"
          >
            {t.telegram.connectBtn}
          </Button>
          <button
            onClick={handleDismiss}
            className="text-xs text-muted-foreground hover:underline px-3"
          >
            {t.telegram.laterBtn}
          </button>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-lg leading-none"
              aria-label={t.telegram.modalClose}
            >
              ✕
            </button>

            <h2 className="text-lg font-black text-foreground text-center mb-4">
              {t.telegram.modalTitle}
            </h2>

            {error && (
              <p className="text-sm text-center text-destructive">{t.telegram.modalError}</p>
            )}

            {alreadyLinked && (
              <p className="text-sm text-center text-foreground">{t.telegram.modalAlreadyLinked}</p>
            )}

            {!error && !alreadyLinked && code && (
              <div className="flex flex-col gap-4">
                <ol className="text-sm text-foreground flex flex-col gap-2 list-decimal list-inside">
                  <li>{t.telegram.modalStep1}</li>
                  <li>{botLabel ? t.telegram.modalStep2(botLabel) : t.telegram.modalStep2Fallback}</li>
                </ol>

                <div className="flex flex-col gap-1">
                  <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">
                    {t.telegram.modalCodeLabel}
                  </p>
                  <div className="bg-[#fff9f4] border border-[#ffefe0] rounded-2xl px-4 py-3 flex items-center justify-between">
                    <span className="font-mono text-xl font-bold text-foreground tracking-widest">
                      {code}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      {copied ? t.telegram.modalCopied : t.telegram.modalCopy}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {t.telegram.modalExpires(minutesLeft)}
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={handleClose}
              className="w-full rounded-2xl py-3 mt-5 font-bold bg-muted hover:bg-muted/80 text-foreground"
            >
              {t.telegram.modalClose}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
