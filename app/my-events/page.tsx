"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import Layout from "../components/Layout";
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
} from "lucide-react";
import { getCategoryStyles } from "../utils/categoryStyles";

interface MyEvent {
  _id: string;
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
}

export default function MyEventsPage() {
  const router = useRouter();
  const { currentUser, isLoading } = useApp();
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (
      !isLoading &&
      currentUser &&
      !["student_rep", "organizer", "admin"].includes(currentUser.role)
    ) {
      router.push("/dashboard");
    }
  }, [currentUser, isLoading, router]);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const allEvents = await apiClient.get<MyEvent[]>("/api/events");
        const pendingEvents = await apiClient
          .get<MyEvent[]>("/api/events/pending")
          .catch(() => []);

        const combined = [...allEvents, ...pendingEvents];
        const uniqueEvents = combined.filter(
          (event, index, self) =>
            index === self.findIndex((e) => e._id === event._id),
        );

        setEvents(uniqueEvents);
      } catch (err: any) {
        setError(err.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchMyEvents();
    }
  }, [currentUser]);

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Events</h1>
          <p className="text-slate-500">
            View and manage events you've created
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
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
            <button
              onClick={() => router.push("/events/create")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Event
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => {
              const categoryStyles = getCategoryStyles(event.category);

              return (
                <div
                  key={event._id || `event-${index}`}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className={`h-2 bg-gradient-to-r ${categoryStyles.gradient}`}
                  />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
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
                            {event.date} at {event.time}
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
                          <span className="text-xs text-slate-400">
                            Created:{" "}
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
