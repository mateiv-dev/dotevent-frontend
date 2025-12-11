"use client";

import { useState, useEffect } from "react";
import { apiClient } from "../../../lib/apiClient";
import { Button } from "../ui/Button";
import {
  Check,
  X,
  Loader2,
  Calendar,
  MapPin,
  Users,
  FileText,
} from "lucide-react";
import { getCategoryStyles } from "../../utils/categoryStyles";

interface PendingEvent {
  _id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  capacity: number;
  organizer: string;
  description: string;
  status: string;
  createdAt: string;
}

interface PendingEventsTabProps {
  onAction?: () => void;
}

export default function PendingEventsTab({ onAction }: PendingEventsTabProps) {
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchEvents = async () => {
    try {
      const data = await apiClient.get<PendingEvent[]>("/api/events/pending");
      setEvents(data);
    } catch (err: any) {
      setError(err.message || "Failed to load pending events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await apiClient.post(`/api/events/${id}/approve`, {});
      await fetchEvents();
      onAction?.();
    } catch (err: any) {
      setError(err.message || "Failed to approve event");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }
    setActionLoading(id);
    try {
      await apiClient.post(`/api/events/${id}/reject`, { rejectionReason });
      setRejectingId(null);
      setRejectionReason("");
      await fetchEvents();
      onAction?.();
    } catch (err: any) {
      setError(err.message || "Failed to reject event");
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

  if (error && events.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
        {error}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p>No pending events to review</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {events.map((event) => {
        const categoryStyles = getCategoryStyles(event.category as any);

        return (
          <div
            key={event._id}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
          >
            <div
              className={`h-2 bg-gradient-to-r ${categoryStyles.gradient}`}
            />
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-900 mb-2">
                    {event.title}
                  </h3>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {event.date} at {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      Capacity: {event.capacity}
                    </span>
                  </div>

                  <div className="text-sm text-slate-500 mb-2">
                    <span className="font-medium">Organizer:</span>{" "}
                    {event.organizer}
                  </div>

                  <div className="text-sm text-slate-500 flex items-start gap-1">
                    <FileText size={14} className="mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{event.description}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${categoryStyles.bg} ${categoryStyles.text}`}
                    >
                      {event.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      Submitted:{" "}
                      {new Date(event.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {rejectingId !== event._id && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleApprove(event._id)}
                      disabled={actionLoading === event._id}
                      leftIcon={
                        actionLoading === event._id ? (
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
                      onClick={() => setRejectingId(event._id)}
                      disabled={actionLoading === event._id}
                      leftIcon={<X size={14} />}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>

              {rejectingId === event._id && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Rejection Reason
                  </label>
                  <textarea
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Explain why this event is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setRejectingId(null);
                        setRejectionReason("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleReject(event._id)}
                      disabled={actionLoading === event._id}
                      leftIcon={
                        actionLoading === event._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <X size={14} />
                        )
                      }
                    >
                      Confirm Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
