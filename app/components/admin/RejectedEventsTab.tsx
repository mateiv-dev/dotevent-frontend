"use client";

import { useState, useEffect } from "react";
import { apiClient, APIError, RejectedEvent } from "../../../lib/apiClient";
import {
  Loader2,
  Calendar,
  MapPin,
  Users,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { getCategoryStyles } from "../../utils/categoryStyles";
import { getImageUrl } from "../../utils/imageUtils";

export default function RejectedEventsTab() {
  const [events, setEvents] = useState<RejectedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.getRejectedEvents();
      const eventsList = Array.isArray(response) ? response : response.events;
      setEvents(eventsList || []);
    } catch (err: any) {
      const message =
        err instanceof APIError
          ? err.getUserFriendlyMessage()
          : "Failed to load rejected events";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <button
          onClick={fetchEvents}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <XCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p>No rejected events</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        const categoryStyles = getCategoryStyles(event.category as any);
        const organizerName =
          event.organizer?.organizationName ||
          event.organizer?.represents ||
          "Unknown";

        return (
          <div
            key={event.id || index}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
          >
            <div className={`h-2 bg-gradient-to-r ${categoryStyles.gradient}`} />
            <div className="p-5">
              <div className="flex items-start gap-4">
                {/* Image */}
                {event.titleImage && (
                  <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      src={getImageUrl(event.titleImage) || ""}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-slate-900">
                      {event.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      <XCircle size={12} />
                      Rejected
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(event.date).toLocaleDateString()} at {event.time}
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

                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                    {event.description}
                  </p>

                  {/* Rejection Reason */}
                  {event.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle
                          size={16}
                          className="text-red-500 mt-0.5 shrink-0"
                        />
                        <div>
                          <p className="text-sm font-medium text-red-700">
                            Rejection Reason:
                          </p>
                          <p className="text-sm text-red-600">
                            {event.rejectionReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${categoryStyles.bg} ${categoryStyles.text}`}
                    >
                      {event.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      by {organizerName}
                    </span>
                    {event.author && (
                      <span className="text-xs text-slate-400">
                        • Created by {event.author.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
