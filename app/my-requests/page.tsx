"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import Layout from "../components/Layout";
import { apiClient } from "../../lib/apiClient";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  GraduationCap,
  Building,
  FileText,
  Trash2,
} from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

interface RoleRequest {
  id?: string;
  _id?: string;
  requestedRole: string;
  status: "pending" | "approved" | "rejected";
  university?: string;
  represents?: string;
  organizationName?: string;
  description: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export default function MyRequestsPage() {
  const router = useRouter();
  const { currentUser, isLoading } = useApp();
  const { t } = useTranslation();
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        router.push("/login");
      } else if (currentUser.role === "admin") {
        router.push("/dashboard");
      }
    }
  }, [currentUser, isLoading, router]);

  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        const data = await apiClient.get<RoleRequest[]>("/api/users/me/role-requests");
        setRequests(data);
      } catch (err: any) {
        setError(err.message || t("common.error"));
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchMyRequests();
    }
  }, [currentUser]);

  const handleDeleteRequest = async (requestId: string) => {
    setDeletingId(requestId);
    try {
      await apiClient.delete(`/api/role-requests/${requestId}`);
      setRequests(requests.filter((r) => r._id !== requestId));
      setShowDeleteConfirm(null);
    } catch (err: any) {
      setError(err.message || t("common.error"));
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading || loading) {
    return (
      <Layout pageTitle={t("myRequests.title")}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
            <Clock size={14} />
            {t("myRequests.pendingReview")}
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-600 text-white dark:bg-green-500">
            <CheckCircle size={14} />
            {t("organizationEvents.approved")}
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
            <XCircle size={14} />
            {t("organizationEvents.rejected")}
          </span>
        );
      default:
        return null;
    }
  };

  const getRoleDisplayName = (role: string) => {
    const key = `roles.${role}` as any;
    return t(key).includes("roles.") ? role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : t(key);
  };

  return (
    <Layout pageTitle={t("myRequests.title")}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{t("myRequests.title")}</h1>
          <p className="text-[var(--muted-foreground)]">
            {t("myRequests.subtitle")}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700 dark:hover:text-red-300">
              <XCircle size={18} />
            </button>
          </div>
        )}

        {requests.length === 0 ? (
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-12 text-center">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)] opacity-50" />
            <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
              {t("myRequests.noRequests")}
            </h3>
            <p className="text-[var(--muted-foreground)]">
              {t("myRequests.noRequestsDesc")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request, index) => (
              <div
                key={request._id || request.id || index}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">
                        {getRoleDisplayName(request.requestedRole)}
                      </h3>
                      {getStatusBadge(request.status)}
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

                    <div className="text-sm text-[var(--foreground)]/80 flex items-start gap-1 mb-3">
                      <FileText size={14} className="mt-0.5 flex-shrink-0 opacity-70" />
                      <span>{request.description}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                      <span>{t("myRequests.submitted")} {new Date(request.createdAt).toLocaleDateString()}</span>
                      {request.updatedAt !== request.createdAt && (
                        <span>{t("myRequests.updated")} {new Date(request.updatedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Delete button for pending requests */}
                  {request.status === "pending" && (
                    <button
                      onClick={() => setShowDeleteConfirm(request._id || request.id || "")}
                      className="p-2 text-[var(--muted-foreground)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title={t("myRequests.delete")}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm === (request._id || request.id) && (
                  <div className="mb-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-400 mb-3">
                      {t("myRequests.deleteConfirm")}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteRequest(request._id || request.id || "")}
                        disabled={deletingId === (request._id || request.id)}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {deletingId === (request._id || request.id) ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            {t("myRequests.deleting")}
                          </>
                        ) : (
                          t("myRequests.delete")
                        )}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        disabled={deletingId === (request._id || request.id)}
                        className="px-3 py-1.5 bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-lg text-sm font-medium hover:bg-[var(--accent)] transition-colors"
                      >
                        {t("myRequests.cancel")}
                      </button>
                    </div>
                  </div>
                )}

                {request.status === "rejected" && request.rejectionReason && (
                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle
                          size={16}
                          className="text-red-500 shrink-0 mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                            {t("myRequests.rejectionReason")}
                          </p>
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {request.rejectionReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}