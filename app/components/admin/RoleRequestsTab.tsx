"use client";

import { useState, useEffect } from "react";
import { apiClient, APIError } from "../../../lib/apiClient";
import { Button } from "../ui/Button";
import RejectionReasonModal from "./RejectionReasonModal";
import {
  Check,
  X,
  Loader2,
  User,
  Building,
  GraduationCap,
  FileText,
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

interface RoleRequest {
  id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  requestedRole: string;
  status: string;
  university?: string;
  represents?: string;
  organizationName?: string;
  description: string;
  createdAt: string;
}

interface RoleRequestsTabProps {
  onAction?: () => void;
}

export default function RoleRequestsTab({ onAction }: RoleRequestsTabProps) {
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RoleRequest | null>(null);
  const { t } = useTranslation();

  const fetchRequests = async () => {
    try {
      const data = await apiClient.get<RoleRequest[]>("/api/role-requests");
      setRequests(data.filter(r => r.status === 'pending'));
    } catch (err: any) {
      setError(err.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await apiClient.post(`/api/role-requests/${id}/approve`, {});
      await fetchRequests();
      onAction?.();
    } catch (err: any) {
      const message = err instanceof APIError
        ? err.getUserFriendlyMessage()
        : t("common.error");
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClick = (request: RoleRequest) => {
    setSelectedRequest(request);
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async (rejectionReason: string) => {
    if (!selectedRequest) return;

    setActionLoading(selectedRequest.id);
    try {
      await apiClient.post(`/api/role-requests/${selectedRequest.id}/reject`, {
        rejectionReason,
      });
      await fetchRequests();
      onAction?.();
      setRejectModalOpen(false);
      setSelectedRequest(null);
    } catch (err: any) {
      const message = err instanceof APIError
        ? err.getUserFriendlyMessage()
        : t("common.error");
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
        {error}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted-foreground)]">
        <GraduationCap className="w-12 h-12 mx-auto mb-4 text-[var(--muted)]" />
        <p>{t("admin.roleRequests.noRequests")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request, index) => (
        <div
          key={request.id || index}
          className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <User size={18} className="text-[var(--muted-foreground)]" />
                <span className="font-medium text-[var(--foreground)]">
                  {request.user?.name || t("admin.pending.unknown")}
                </span>
                <span className="text-sm text-[var(--muted-foreground)]">
                  ({request.user?.email})
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <GraduationCap size={16} className="text-blue-500" />
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 capitalize">
                  {t("admin.roleRequests.requesting")}: {request.requestedRole.replace("_", " ")}
                </span>
              </div>

              {request.requestedRole === "student_rep" && (
                <div className="text-sm text-[var(--muted-foreground)] mb-2">
                  <Building size={14} className="inline mr-1" />
                  {request.university} - {request.represents}
                </div>
              )}

              {request.requestedRole === "organizer" && (
                <div className="text-sm text-[var(--muted-foreground)] mb-2">
                  <Building size={14} className="inline mr-1" />
                  {request.organizationName}
                </div>
              )}

              <div className="text-sm text-[var(--foreground)]/80 flex items-start gap-1">
                <FileText size={14} className="mt-0.5 flex-shrink-0" />
                <span>{request.description}</span>
              </div>

              <div className="text-xs text-[var(--muted-foreground)] mt-2">
                {t("myRequests.submitted")} {new Date(request.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleApprove(request.id)}
                disabled={actionLoading === request.id}
                leftIcon={
                  actionLoading === request.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )
                }
              >
                {t("admin.roleRequests.approve")}
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleRejectClick(request)}
                disabled={actionLoading === request.id}
                leftIcon={<X size={14} />}
              >
                {t("admin.roleRequests.reject")}
              </Button>
            </div>
          </div>
        </div>
      ))}

      <RejectionReasonModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedRequest(null);
        }}
        onSubmit={handleRejectConfirm}
        title={t("admin.roleRequests.rejectTitle")}
        itemName={selectedRequest ? `${selectedRequest.user?.name} - ${selectedRequest.requestedRole.replace("_", " ")}` : undefined}
        isSubmitting={actionLoading === selectedRequest?.id}
      />
    </div>
  );
}
