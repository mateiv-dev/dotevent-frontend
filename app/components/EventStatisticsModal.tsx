"use client";

import { useState, useEffect } from "react";
import { apiClient, APIError, EventStatistics } from "../../lib/apiClient";
import {
  X,
  Loader2,
  BarChart3,
  Users,
  UserCheck,
  Percent,
  Star,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

interface EventStatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
}

export default function EventStatisticsModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
}: EventStatisticsModalProps) {
  const [statistics, setStatistics] = useState<EventStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && eventId) {
      fetchStatistics();
    }
  }, [isOpen, eventId]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiClient.getEventStatistics(eventId);
      setStatistics(data);
    } catch (err: any) {
      const message =
        err instanceof APIError
          ? err.getUserFriendlyMessage()
          : "Failed to load statistics";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <BarChart3 size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Event Statistics</h2>
                <p className="text-indigo-100 text-sm line-clamp-1">
                  {eventTitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <button
                onClick={fetchStatistics}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          ) : statistics ? (
            <div className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Total Participants */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={18} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                      Total Registrations
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">
                    {statistics.totalParticipants}
                  </p>
                </div>

                {/* Checked In */}
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck size={18} className="text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Checked In
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-green-900">
                    {statistics.checkedInParticipants}
                  </p>
                </div>

                {/* Attendance Rate */}
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent size={18} className="text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">
                      Attendance Rate
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-purple-900">
                    {statistics.attendanceRate}%
                  </p>
                </div>

                {/* Average Rating */}
                <div className="bg-amber-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={18} className="text-amber-600" />
                    <span className="text-sm font-medium text-amber-700">
                      Avg. Rating
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-amber-900">
                    {statistics.averageRating > 0
                      ? statistics.averageRating.toFixed(1)
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Feedback Count */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={18} className="text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">
                      Total Reviews
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {statistics.feedbackCount}
                  </p>
                </div>
              </div>

              {/* Progress Bar for Attendance */}
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Check-in Progress
                  </span>
                  <span className="text-sm text-slate-500">
                    {statistics.checkedInParticipants} / {statistics.totalParticipants}
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                    style={{
                      width: `${statistics.totalParticipants > 0 ? (statistics.checkedInParticipants / statistics.totalParticipants) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
