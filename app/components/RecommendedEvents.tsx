"use client";

import { useState, useEffect } from "react";
import { apiClient, APIError, RecommendedEvent } from "../../lib/apiClient";
import { Loader2, Sparkles, MapPin, Calendar, Star, ChevronRight } from "lucide-react";
import { getCategoryStyles } from "../utils/categoryStyles";
import { getImageUrl } from "../utils/imageUtils";
import { useTranslation } from "../hooks/useTranslation";

interface RecommendedEventsProps {
  onEventClick: (id: string) => void;
}

export default function RecommendedEvents({
  onEventClick,
}: RecommendedEventsProps) {
  const { t } = useTranslation();
  const [events, setEvents] = useState<RecommendedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiClient.getRecommendedEvents(1, 6);
      setEvents(data);
    } catch (err: any) {
      console.error("Failed to load recommendations:", err);
      setError("Unable to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-[var(--foreground)]">
              {t("dashboard.recommendations")}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              Based on your preferences
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  if (error || events.length === 0) {
    return null;
  }

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-[var(--foreground)]">
              {t("dashboard.recommendations")}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              Based on your preferences
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => {
          const categoryStyles = getCategoryStyles(event.category);
          const organizerName =
            event.organizer?.organizationName ||
            event.organizer?.represents ||
            "Organizer";

          return (
            <div
              key={event.id}
              onClick={() => onEventClick(event.id)}
              className="group bg-[var(--muted)] hover:bg-[var(--card)] rounded-xl border border-[var(--border)] hover:border-purple-200 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
            >
              {/* Image */}
              {event.titleImage && (
                <div className="h-32 w-full overflow-hidden">
                  <img
                    src={getImageUrl(event.titleImage) || ""}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-4">
                {/* Category Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${categoryStyles.bg} ${categoryStyles.text}`}
                  >
                    {event.category}
                  </span>
                  {event.averageRating !== undefined && event.averageRating > 0 && (
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={12} fill="currentColor" />
                      <span className="text-xs font-medium">
                        {event.averageRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h4 className="font-bold text-[var(--foreground)] line-clamp-2 mb-2 group-hover:text-purple-700 transition-colors">
                  {event.title}
                </h4>

                {/* Details */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <Calendar size={14} className="shrink-0" />
                    <span className="truncate">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      at {event.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <MapPin size={14} className="shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>

                {/* Organizer */}
                <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs text-[var(--muted-foreground)] truncate">
                    By {organizerName}
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-[var(--muted-foreground)] group-hover:text-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
