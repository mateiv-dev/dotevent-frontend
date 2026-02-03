import { useState, useEffect } from "react";
import { X, Building, GraduationCap, FileText, Loader2 } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { TextArea } from "./ui/TextArea";
import { Select } from "./ui/Select";
import { apiClient } from "../../lib/apiClient";
import { useApp } from "../context/AppContext";
import { useTranslation } from "../hooks/useTranslation";

interface RoleRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: string;
  onSuccess?: () => void;
}

type RequestedRole = "student_rep" | "organizer";

export default function RoleRequestModal({
  isOpen,
  onClose,
  currentRole,
  onSuccess,
}: RoleRequestModalProps) {
  const { currentUser } = useApp();
  const [requestedRole, setRequestedRole] =
    useState<RequestedRole>("student_rep");
  const [university, setUniversity] = useState("");
  const [represents, setRepresents] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen && currentUser && currentUser.role === "student" && requestedRole === "student_rep") {
      const studentUser = currentUser as any;
      if (studentUser.university) {
        setUniversity(studentUser.university);
      }
    }
  }, [isOpen, currentUser, requestedRole]);

  if (!isOpen) return null;

  const canRequestStudentRep =
    currentRole === "simple_user" || currentRole === "student";
  const canRequestOrganizer =
    currentRole !== "organizer" && currentRole !== "admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const payload: any = {
        requestedRole,
        description,
      };

      if (requestedRole === "student_rep") {
        payload.university = university;
        payload.represents = represents;
      } else if (requestedRole === "organizer") {
        payload.organizationName = organizationName;
      }

      await apiClient.post("/api/role-requests", payload);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 2000);
    } catch (err: any) {
      setError(err.message || t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white dark:bg-[var(--card)] rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
            {t("roleRequest.successTitle")}
          </h2>
          <p className="text-[var(--muted-foreground)]">
            {t("roleRequest.successDesc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-[var(--card)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            {t("roleRequest.title")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
          >
            <X size={20} className="text-[var(--muted-foreground)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <Select
            label={t("roleRequest.requestedRole")}
            leftIcon={<GraduationCap size={16} />}
            value={requestedRole}
            onChange={(e) => setRequestedRole(e.target.value as RequestedRole)}
          >
            {canRequestStudentRep && (
              <option value="student_rep">{t("roleRequest.studentRep")}</option>
            )}
            {canRequestOrganizer && (
              <option value="organizer">{t("roleRequest.organizer")}</option>
            )}
          </Select>

          {requestedRole === "student_rep" && (
            <>
              <Input
                label={t("settings.university")}
                required
                placeholder={t("createEvent.placeholders.faculty")}
                leftIcon={<Building size={16} />}
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                disabled={isSubmitting}
              />
              <Input
                label={t("settings.represents")}
                required
                placeholder={t("createEvent.placeholders.department")}
                leftIcon={<Building size={16} />}
                value={represents}
                onChange={(e) => setRepresents(e.target.value)}
                disabled={isSubmitting}
              />
            </>
          )}

          {requestedRole === "organizer" && (
            <Input
              label={t("roleRequest.organizationName")}
              required
              placeholder="e.g., Tech Club Bucharest"
              leftIcon={<Building size={16} />}
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              disabled={isSubmitting}
            />
          )}

          <TextArea
            label={t("roleRequest.justification")}
            required
            rows={4}
            placeholder={t("roleRequest.justificationPlaceholder")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              leftIcon={
                isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <FileText size={18} />
                )
              }
            >
              {isSubmitting ? t("roleRequest.submitting") : t("roleRequest.submit")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
