"use client";

import { useState, useEffect, useRef } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { TextArea } from "../ui/TextArea";
import { useTranslation } from "../../hooks/useTranslation";

interface RejectionReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  title: string;
  itemName?: string;
  isSubmitting?: boolean;
}

export default function RejectionReasonModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  itemName,
  isSubmitting = false,
}: RejectionReasonModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isSubmitting, onClose]);

  const handleSubmit = () => {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setError(t("admin.rejectionModal.required"));
      return;
    }

    if (trimmedReason.length < 10) {
      setError(t("admin.rejectionModal.tooShort"));
      return;
    }

    onSubmit(trimmedReason);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current === e.target && !isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-[var(--card)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
              <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-900 dark:text-red-300">{title}</h2>
              {itemName && (
                <p className="text-sm text-red-700 dark:text-red-400">{itemName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            {t("admin.rejectionModal.description")}
          </p>

          <div>
            <TextArea
              ref={textareaRef}
              label={t("admin.rejectionModal.reasonLabel")}
              rows={4}
              placeholder={t("admin.rejectionModal.placeholder")}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              disabled={isSubmitting}
            />
            {error && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
            <p className="text-xs text-[var(--muted-foreground)] mt-2">
              {reason.trim().length} / {t("admin.rejectionModal.minChars")}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[var(--muted)]/30 px-6 py-4 flex items-center justify-end gap-3 border-t border-[var(--border)]">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t("admin.rejectionModal.cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? t("admin.rejectionModal.rejecting") : t("admin.rejectionModal.reject")}
          </Button>
        </div>
      </div>
    </div>
  );
}
