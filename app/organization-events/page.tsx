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

export default function OrganizationEventsPage() {
  const router = useRouter();
  const { currentUser, isLoading } = useApp();
  const [events, setEvents] = useState<OrganizationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          : "Failed to load organization events";
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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <Clock size={12} />
            Pending
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

  if (isLoading || loading) {
    return (
      <Layout pageTitle="Organization Events">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  const organizationName =
    currentUser?.role === "student_rep"
      ? (currentUser as any).represents
      : (currentUser as any)?.organizationName || "Your Organization";

  return (
    <Layout pageTitle="Organization Events">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Building2 className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Organization Events
            </h1>
            <p className="text-slate-500">
              All events from {organizationName}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchOrganizationEvents}
              className="text-red-600 hover:text-red-800 font-medium text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {events.length === 0 && !error ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No organization events
            </h3>
            <p className="text-slate-500">
              No events have been created for your organization yet
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
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
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
                            {new Date(event.date).toLocaleDateString()} at{" "}
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
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
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
                          {event.author && (
                            <span className="text-xs text-slate-400">
                              Created by {event.author.name}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
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
