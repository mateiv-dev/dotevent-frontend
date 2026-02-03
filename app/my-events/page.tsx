"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import { useTranslation } from "../hooks/useTranslation";
import Layout from "../components/Layout";
import EditEventModal from "../components/EditEventModal";
import ParticipantsModal from "../components/ParticipantsModal";
import CheckInModal from "../components/CheckInModal";
import EventStatisticsModal from "../components/EventStatisticsModal";
import { apiClient } from "../../lib/apiClient";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Edit,
  Trash2,
  Plus,
  UserCheck,
  ScanLine,
  BarChart3,
} from "lucide-react";
import { getCategoryStyles } from "../utils/categoryStyles";
import { getImageUrl } from "../utils/imageUtils";

interface MyEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  capacity: number;
  attendees: number;
  organizer: { represents?: string | null; organizationName?: string | null; contact: string };
  description: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: string;
  faculty?: string;
  department?: string;
  titleImage?: string;
  attachments?: Array<{ url: string; name: string }>;
}

export default function MyEventsPage() {
  const router = useRouter();
  const { currentUser, isLoading, updateEvent, deleteEvent } = useApp();
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingEvent, setEditingEvent] = useState<MyEvent | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [participantsEvent, setParticipantsEvent] = useState<MyEvent | null>(null);
  const [checkInEvent, setCheckInEvent] = useState<MyEvent | null>(null);
  const [statisticsEvent, setStatisticsEvent] = useState<MyEvent | null>(null);
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

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const myEvents = await apiClient.get<MyEvent[]>("/api/users/me/events");
      setEvents(myEvents);
    } catch (err: any) {
      setError(err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchMyEvents();
    }
  }, [currentUser]);

  const handleEditEvent = async (
    eventId: string,
    eventData: any,
    files?: File[],
    filesToDelete?: string[]
  ): Promise<boolean> => {
    try {
      await updateEvent(eventId, eventData, files, filesToDelete);
      await fetchMyEvents();
      return true;
    } catch (error) {
      console.error("Failed to update event:", error);
      return false;
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    setDeletingEventId(eventId);
    try {
      await deleteEvent(eventId);
      setEvents(events.filter((e) => e.id !== eventId));
      setShowDeleteConfirm(null);
    } catch (error: any) {
      setError(error.message || "Failed to delete event");
    } finally {
      setDeletingEventId(null);
    }
  };

  if (isLoading || loading) {
    return (
      <Layout pageTitle="My Events">
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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            <Clock size={12} />
            {t("myEventsPage.status.pending")}
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-600 text-white dark:bg-green-500">
            <CheckCircle size={12} />
            {t("myEventsPage.status.approved")}
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
            <XCircle size={12} />
            {t("myEventsPage.status.rejected")}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Layout pageTitle={t("myEventsPage.title")}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">{t("myEventsPage.title")}</h1>
            <p className="text-[var(--muted-foreground)]">
              {t("myEventsPage.subtitle")}
            </p>
          </div>
          <button
            onClick={() => router.push("/events/create")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
          >
            <Plus size={18} />
            {t("myEventsPage.createButton")}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
              <XCircle size={18} />
            </button>
          </div>
        )}

        {events.length === 0 ? (
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-12 text-center shadow-sm">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
            <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
              {t("myEventsPage.noEventsTitle")}
            </h3>
            <p className="text-[var(--muted-foreground)] mb-4">
              {t("myEventsPage.noEventsDesc")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => {
              const categoryStyles = getCategoryStyles(event.category);

              return (
                <div
                  key={event.id || index}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
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
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-[var(--foreground)]">
                            {event.title}
                          </h3>
                          {getStatusBadge(event.status)}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-[var(--muted-foreground)] mb-3">
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
                            {event.attendees || 0} / {event.capacity}
                          </span>
                        </div>

                        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-3">
                          {event.description}
                        </p>

                        {event.status === "rejected" &&
                          event.rejectionReason && (
                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-3">
                              <div className="flex items-start gap-2">
                                <AlertCircle
                                  size={16}
                                  className="text-red-500 mt-0.5 flex-shrink-0"
                                />
                                <div>
                                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                                    {t("myEventsPage.rejectionReason")}:
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
                          {event.faculty && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-[var(--secondary)] text-[var(--secondary-foreground)]">
                              {event.faculty}
                            </span>
                          )}
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {t("myEventsPage.createdOn")}{" "}
                            {new Date(event.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 shrink-0">
                        {event.status === "approved" && (
                          <>
                            <button
                              onClick={() => setStatisticsEvent(event)}
                              className="p-2 text-[var(--muted-foreground)] hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                              title={t("eventStatistics.title")}
                            >
                              <BarChart3 size={18} />
                            </button>
                            <button
                              onClick={() => setCheckInEvent(event)}
                              className="p-2 text-[var(--muted-foreground)] hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                              title={t("checkInModal.title")}
                            >
                              <ScanLine size={18} />
                            </button>
                            <button
                              onClick={() => setParticipantsEvent(event)}
                              className="p-2 text-[var(--muted-foreground)] hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title={t("participantsModal.title")}
                            >
                              <UserCheck size={18} />
                            </button>
                            <button
                              onClick={() => setEditingEvent(event)}
                              className="p-2 text-[var(--muted-foreground)] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title={t("common.edit")}
                            >
                              <Edit size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setShowDeleteConfirm(event.id)}
                          className="p-2 text-[var(--muted-foreground)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title={t("common.delete")}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete Confirmation */}
                  {showDeleteConfirm === event.id && (
                    <div className="px-5 pb-5 pt-0">
                      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-3">
                          {t("myEventsPage.deleteConfirm")}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            disabled={deletingEventId === event.id}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            {deletingEventId === event.id ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                {t("myEventsPage.deleting")}
                              </>
                            ) : (
                              t("myEventsPage.deleteButton")
                            )}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            disabled={deletingEventId === event.id}
                            className="px-3 py-1.5 bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-lg text-sm font-medium hover:bg-[var(--accent)] transition-colors"
                          >
                            {t("common.cancel")}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Event Modal */}
      {editingEvent && (
        <EditEventModal
          isOpen={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          event={{
            ...editingEvent,
            contact: editingEvent.organizer.contact,
          }}
          onSave={handleEditEvent}
        />
      )}

      {/* Participants Modal */}
      {participantsEvent && (
        <ParticipantsModal
          isOpen={!!participantsEvent}
          onClose={() => setParticipantsEvent(null)}
          eventId={participantsEvent.id}
          eventTitle={participantsEvent.title}
        />
      )}

      {/* Check-In Modal */}
      {checkInEvent && (
        <CheckInModal
          isOpen={!!checkInEvent}
          onClose={() => setCheckInEvent(null)}
          eventId={checkInEvent.id}
          eventTitle={checkInEvent.title}
        />
      )}

      {/* Statistics Modal */}
      {statisticsEvent && (
        <EventStatisticsModal
          isOpen={!!statisticsEvent}
          onClose={() => setStatisticsEvent(null)}
          eventId={statisticsEvent.id}
          eventTitle={statisticsEvent.title}
        />
      )}
    </Layout>
  );
}