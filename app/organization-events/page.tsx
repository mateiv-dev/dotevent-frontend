"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import Layout from "../components/Layout";
import { apiClient, APIError, OrganizationEvent } from "../../lib/apiClient";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Building2,
  AlertCircle,
} from "lucide-react";
import { getCategoryStyles } from "../utils/categoryStyles";
import { getImageUrl } from "../utils/imageUtils";
import { useTranslation } from "../hooks/useTranslation";

export default function OrganizationEventsPage() {
  const router = useRouter();
  const { currentUser, isLoading } = useApp();
  const [events, setEvents] = useState<OrganizationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    if (
      !isLoading &&
      currentUser &&
      currentUser.role &&
      !["student_rep", "organizer"].includes(currentUser.role)
    ) {
      router.push("/dashboard");
    }
  }, [currentUser, isLoading, router]);

  const fetchOrganizationEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiClient.getOrganizationEvents();
      setEvents(data);
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
    if (currentUser) {
      fetchOrganizationEvents();
    }
  }, [currentUser]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
            <Clock size={12} />
            {t("organizationEvents.pending")}
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-600 text-white dark:bg-green-500">
            <CheckCircle size={12} />
            {t("organizationEvents.approved")}
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
            <XCircle size={12} />
            {t("organizationEvents.rejected")}
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading || loading) {
    return (
      <Layout pageTitle={t("organizationEvents.title")}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  const organizationName =
    currentUser?.role === "student_rep"
      ? (currentUser as any).represents
      : (currentUser as any)?.organizationName || t("common.orgEvents");

  return (
    <Layout pageTitle={t("organizationEvents.title")}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Building2 className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              {t("organizationEvents.title")}
            </h1>
            <p className="text-[var(--muted-foreground)]">
              {t("organizationEvents.subtitle")} {organizationName}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchOrganizationEvents}
              className="text-red-600 hover:text-red-800 dark:hover:text-red-200 font-medium text-sm"
            >
              {t("organizationEvents.tryAgain")}
            </button>
          </div>
        )}

        {events.length === 0 && !error ? (
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-12 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)] opacity-50" />
            <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
              {t("organizationEvents.noEvents")}
            </h3>
            <p className="text-[var(--muted-foreground)]">
              {t("organizationEvents.noEventsDesc")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => {
              const categoryStyles = getCategoryStyles(event.category as any);

              return (
                <div
                  key={event.id || index}
                  onClick={() => router.push(`/events/${event.id}`)}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <div
                    className={`h-2 bg-gradient-to-r ${categoryStyles.gradient}`}
                  />
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {event.titleImage && (
                        <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-[var(--muted)] border border-[var(--border)]">
                          <img
                            src={getImageUrl(event.titleImage) || ""}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-[var(--foreground)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {event.title}
                          </h3>
                          {getStatusBadge(event.status)}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-[var(--muted-foreground)] mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(event.date).toLocaleDateString()} •{" "}
                            {event.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {event.attendees || 0} / {event.capacity}
                          </span>
                        </div>

                        {event.status === "rejected" && event.rejectionReason && (
                          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-2">
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
                          {event.author && (
                            <span className="text-xs text-[var(--muted-foreground)]">
                              {t("organizationEvents.createdBy")} {event.author.name}
                            </span>
                          )}
                          <span className="text-xs text-[var(--muted-foreground)]">
                            •{" "}
                            {new Date(event.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
