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
import { useTranslation } from "../../hooks/useTranslation";

export default function RejectedEventsTab() {
  const [events, setEvents] = useState<RejectedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useTranslation();

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
          : t("common.error");
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
          {t("admin.rejected.tryAgain")}
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted-foreground)]">
        <XCircle className="w-12 h-12 mx-auto mb-4 text-[var(--muted)]" />
        <p>{t("admin.rejected.noRejected")}</p>
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
          t("admin.pending.unknown");

        return (
          <div
            key={event.id || index}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm"
          >
            <div className={`h-2 bg-gradient-to-r ${categoryStyles.gradient}`} />
            <div className="p-5">
              <div className="flex items-start gap-4">
                {/* Image */}
                {event.titleImage && (
                  <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-[var(--muted)] border border-[var(--border)]">
                    <img
                      src={getImageUrl(event.titleImage) || ""}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-[var(--foreground)]">
                      {event.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                      <XCircle size={12} />
                      {t("organizationEvents.rejected")}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-[var(--muted-foreground)] mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(event.date).toLocaleDateString()} • {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {t("admin.pending.capacity")}: {event.capacity}
                    </span>
                  </div>

                  <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-3">
                    {event.description}
                  </p>

                  {/* Rejection Reason */}
                  {event.rejectionReason && (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle
                          size={16}
                          className="text-red-500 shrink-0 mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-medium text-red-700 dark:text-red-300">
                            {t("myRequests.rejectionReason")}
                          </p>
                          <p className="text-sm text-red-600 dark:text-red-400">
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
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {t("admin.rejected.by")} {organizerName}
                    </span>
                    {event.author && (
                      <span className="text-xs text-[var(--muted-foreground)]">
                        • {t("organizationEvents.createdBy")} {event.author.name}
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
