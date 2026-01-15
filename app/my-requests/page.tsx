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
        setError(err.message || "Failed to load requests");
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
      setError(err.message || "Failed to delete request");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading || loading) {
    return (
      <Layout pageTitle="My Requests">
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
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <Clock size={14} />
            Pending Review
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle size={14} />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle size={14} />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getRoleDisplayName = (role: string) => {
    return role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Layout pageTitle="My Requests">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Role Requests</h1>
          <p className="text-slate-500">
            View and track your role upgrade requests
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
              <XCircle size={18} />
            </button>
          </div>
        )}

        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No requests yet
            </h3>
            <p className="text-slate-500">
              You haven't submitted any role upgrade requests.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request, index) => (
              <div
                key={request._id || request.id || index}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {getRoleDisplayName(request.requestedRole)}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>

                    {request.requestedRole === "student_rep" && (
                      <div className="text-sm text-slate-600 mb-2">
                        <Building size={14} className="inline mr-1" />
                        {request.university} - {request.represents}
                      </div>
                    )}

                    {request.requestedRole === "organizer" && (
                      <div className="text-sm text-slate-600 mb-2">
                        <Building size={14} className="inline mr-1" />
                        {request.organizationName}
                      </div>
                    )}

                    <div className="text-sm text-slate-500 flex items-start gap-1 mb-3">
                      <FileText size={14} className="mt-0.5 flex-shrink-0" />
                      <span>{request.description}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>Submitted: {new Date(request.createdAt).toLocaleDateString()}</span>
                      {request.updatedAt !== request.createdAt && (
                        <span>Updated: {new Date(request.updatedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Delete button for pending requests */}
                  {request.status === "pending" && (
                    <button
                      onClick={() => setShowDeleteConfirm(request._id || request.id || "")}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete request"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm === (request._id || request.id) && (
                  <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-amber-800 mb-3">
                      Are you sure you want to delete this request? This action cannot be undone.
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
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        disabled={deletingId === (request._id || request.id)}
                        className="px-3 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {request.status === "rejected" && request.rejectionReason && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle
                          size={16}
                          className="text-red-500 mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <p className="text-sm font-medium text-red-700 mb-1">
                            Rejection Reason:
                          </p>
                          <p className="text-sm text-red-600">
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