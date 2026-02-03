"use client";

import { useState } from "react";
import { apiClient, APIError } from "../../lib/apiClient";
import {
  X,
  Loader2,
  ScanLine,
  CheckCircle,
  AlertCircle,
  Ticket,
  UserCheck,
} from "lucide-react";
import { Button } from "./ui/Button";
import { useTranslation } from "../hooks/useTranslation";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  onCheckInSuccess?: () => void;
}

interface CheckInResult {
  success: boolean;
  message: string;
}

export default function CheckInModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  onCheckInSuccess,
}: CheckInModalProps) {
  const [ticketCode, setTicketCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const { t } = useTranslation();

  const handleCheckIn = async () => {
    if (!ticketCode.trim()) {
      setResult({
        success: false,
        message: "Please enter a ticket code",
      });
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      await apiClient.checkInParticipant(eventId, ticketCode.trim());

      setResult({
        success: true,
        message: t("checkInModal.success"),
      });
      setCheckedInCount((prev) => prev + 1);
      setTicketCode("");
      onCheckInSuccess?.();
    } catch (err: any) {
      const message =
        err instanceof APIError
          ? err.getUserFriendlyMessage()
          : "Failed to check in participant";
      setResult({
        success: false,
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleCheckIn();
    }
  };

  const handleClose = () => {
    setTicketCode("");
    setResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--card)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <ScanLine size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{t("checkInModal.title")}</h2>
                <p className="text-green-100 text-sm line-clamp-1">
                  {eventTitle}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Stats */}
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
            <UserCheck size={18} />
            <span className="font-medium">
              {t("checkInModal.checkedInStats", { count: checkedInCount })}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Manual Input */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              {t("checkInModal.enterCode")}
            </label>
            <div className="relative">
              <Ticket
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              />
              <input
                type="text"
                value={ticketCode}
                onChange={(e) => {
                  setTicketCode(e.target.value.toUpperCase());
                  setResult(null);
                }}
                onKeyPress={handleKeyPress}
                placeholder={t("checkInModal.placeholder")}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-mono text-lg tracking-wider uppercase"
                autoFocus
              />
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">
              {t("checkInModal.helpText")}
            </p>
          </div>

          {/* Result Message */}
          {result && (
            <div
              className={`p-4 rounded-xl flex items-start gap-3 ${result.success
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
                }`}
            >
              {result.success ? (
                <CheckCircle className="text-green-600 shrink-0" size={20} />
              ) : (
                <AlertCircle className="text-red-600 shrink-0" size={20} />
              )}
              <p
                className={`text-sm font-medium ${result.success ? "text-green-700" : "text-red-700"
                  }`}
              >
                {result.message}
              </p>
            </div>
          )}

          {/* Check-In Button */}
          <Button
            onClick={handleCheckIn}
            isLoading={loading}
            className="w-full"
            leftIcon={<UserCheck size={18} />}
          >
            {t("checkInModal.checkInButton")}
          </Button>

          {/* Info Box */}
          <div className="bg-[var(--muted)] rounded-xl p-4 space-y-2">
            <h4 className="font-medium text-[var(--foreground)] text-sm">
              {t("checkInModal.instructionsTitle")}
            </h4>
            <ul className="text-sm text-[var(--muted-foreground)] space-y-1 list-disc list-inside">
              <li>{t("checkInModal.instructions1")}</li>
              <li>{t("checkInModal.instructions2")}</li>
              <li>{t("checkInModal.instructions3")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
