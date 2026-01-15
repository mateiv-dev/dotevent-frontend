"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
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
  organizer: string;
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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <Clock size={12} />
            Pending Review
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle size={12} />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle size={12} />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Layout pageTitle="My Events">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Events</h1>
            <p className="text-slate-500">
              View and manage events you've created
            </p>
          </div>
          <button
            onClick={() => router.push("/events/create")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus size={18} />
            Create Event
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
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No events yet
            </h3>
            <p className="text-slate-500 mb-4">
              Create your first event to see it here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => {
              const categoryStyles = getCategoryStyles(event.category);

              return (
                <div
                  key={event.id || index}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className={`h-2 bg-gradient-to-r ${categoryStyles.gradient}`}
                  />
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {event.titleImage && (
                        <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                          <img
                            src={getImageUrl(event.titleImage) || ""}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-slate-900">
                            {event.title}
                          </h3>
                          {getStatusBadge(event.status)}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
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

                        <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                          {event.description}
                        </p>

                        {event.status === "rejected" &&
                          event.rejectionReason && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                              <div className="flex items-start gap-2">
                                <AlertCircle
                                  size={16}
                                  className="text-red-500 mt-0.5 flex-shrink-0"
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
                          {event.faculty && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                              {event.faculty}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            Created:{" "}
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
                              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="View statistics"
                            >
                              <BarChart3 size={18} />
                            </button>
                            <button
                              onClick={() => setCheckInEvent(event)}
                              className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Check-in participants"
                            >
                              <ScanLine size={18} />
                            </button>
                            <button
                              onClick={() => setParticipantsEvent(event)}
                              className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="View participants"
                            >
                              <UserCheck size={18} />
                            </button>
                            <button
                              onClick={() => setEditingEvent(event)}
                              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit event"
                            >
                              <Edit size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setShowDeleteConfirm(event.id)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete event"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete Confirmation */}
                  {showDeleteConfirm === event.id && (
                    <div className="px-5 pb-5 pt-0">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-red-800 mb-3">
                          Are you sure you want to delete this event? This action cannot be undone.
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
                                Deleting...
                              </>
                            ) : (
                              "Delete"
                            )}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            disabled={deletingEventId === event.id}
                            className="px-3 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                          >
                            Cancel
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
          event={editingEvent}
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