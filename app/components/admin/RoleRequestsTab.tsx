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

interface RoleRequest {
  _id: string;
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

  const fetchRequests = async () => {
    try {
      const data = await apiClient.get<RoleRequest[]>("/api/requests");
      setRequests(data);
    } catch (err: any) {
      setError(err.message || "Failed to load requests");
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
      await apiClient.post(`/api/requests/${id}/approve`, {});
      await fetchRequests();
      onAction?.();
    } catch (err: any) {
      const message = err instanceof APIError
        ? err.getUserFriendlyMessage()
        : "Failed to approve request";
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

    setActionLoading(selectedRequest._id);
    try {
      await apiClient.post(`/api/requests/${selectedRequest._id}/reject`, {
        rejectionReason,
      });
      await fetchRequests();
      onAction?.();
      setRejectModalOpen(false);
      setSelectedRequest(null);
    } catch (err: any) {
      const message = err instanceof APIError
        ? err.getUserFriendlyMessage()
        : "Failed to reject request";
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
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
        {error}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <GraduationCap className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p>No pending role requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request._id}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <User size={18} className="text-slate-400" />
                <span className="font-medium text-slate-900">
                  {request.user?.name || "Unknown User"}
                </span>
                <span className="text-sm text-slate-500">
                  ({request.user?.email})
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <GraduationCap size={16} className="text-blue-500" />
                <span className="text-sm font-medium text-blue-600 capitalize">
                  Requesting: {request.requestedRole.replace("_", " ")}
                </span>
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

              <div className="text-sm text-slate-500 flex items-start gap-1">
                <FileText size={14} className="mt-0.5 flex-shrink-0" />
                <span>{request.description}</span>
              </div>

              <div className="text-xs text-slate-400 mt-2">
                Submitted: {new Date(request.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleApprove(request._id)}
                disabled={actionLoading === request._id}
                leftIcon={
                  actionLoading === request._id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )
                }
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleRejectClick(request)}
                disabled={actionLoading === request._id}
                leftIcon={<X size={14} />}
              >
                Reject
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
        title="Reject Role Request"
        itemName={selectedRequest ? `${selectedRequest.user?.name} - ${selectedRequest.requestedRole.replace("_", " ")}` : undefined}
        isSubmitting={actionLoading === selectedRequest?._id}
      />
    </div>
  );
}
