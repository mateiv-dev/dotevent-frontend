"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Info,
  Building2,
  Users,
  CheckCircle2,
  Share2,
  Check,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import Layout from "../../components/Layout";
import Event from "../../types/event";
import { getCategoryStyles } from "../../utils/categoryStyles";

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { events, registerForEvent, unregisterFromEvent } = useApp();
  const [event, setEvent] = useState<Event | null>(null);
  const [id, setId] = useState<string>("");
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState("");

  useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id);
      const foundEvent = events.find((e) => e.id === resolvedParams.id);
      setEvent(foundEvent || null);
    });
  }, [params, events]);

  if (!event) {
    return (
      <Layout pageTitle="Event Details">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Event not found
            </h2>
            <p className="text-slate-500 mb-4">
              The event you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleRegistration = async () => {
    setRegistrationLoading(true);
    setRegistrationError("");

    try {
      if (event.isRegistered) {
        await unregisterFromEvent(event.id);
      } else {
        await registerForEvent(event.id);
      }
    } catch (err: any) {
      setRegistrationError(err.message || "Failed to update registration");
    } finally {
      setRegistrationLoading(false);
    }
  };

  return (
    <Layout pageTitle="Event Details">
      <div className="space-y-8 max-w-5xl mx-auto">
        <div
          className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${getCategoryStyles(event.category).gradient} p-8 md:p-12 text-white shadow-lg`}
        >
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-sm font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              {event.category}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight max-w-3xl">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-6 text-blue-50">
              <div className="flex items-center gap-2">
                <Calendar size={20} />
                <span className="font-medium">
                  {new Date(event.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={20} />
                <span className="font-medium">{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={20} />
                <span className="font-medium">{event.location}</span>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 rounded-full bg-black/10 blur-3xl"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Info className="text-blue-500" size={24} />
                About this Event
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                {event.description}
              </p>
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-500">
                <p>
                  Please arrive 15 minutes early for check-in. Don't forget to
                  bring your student ID.
                </p>
              </div>
            </section>

            <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 className="text-blue-500" size={24} />
                Organizer
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {event.organizer ? event.organizer.charAt(0) : "U"}
                </div>
                <div>
                  <p className="font-bold text-lg text-slate-900">
                    {event.organizer || "University Board"}
                  </p>
                  <p className="text-slate-500">
                    Contact: events@university.edu
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sticky top-8">
              <div className="mb-6 text-center">
                <p className="text-sm text-slate-500 mb-1">Availability</p>
                <div className="flex items-center justify-center gap-2">
                  <Users size={24} className="text-slate-400" />
                  <span className="text-3xl font-bold text-slate-900">
                    {event.capacity - event.attendees}
                  </span>
                  <span className="text-slate-400 text-lg font-medium">
                    / {event.capacity} left
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${event.isRegistered ? "bg-green-500" : "bg-blue-600"}`}
                    style={{
                      width: `${(event.attendees / event.capacity) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3">
                {registrationError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                    {registrationError}
                  </div>
                )}

                <button
                  onClick={handleRegistration}
                  disabled={registrationLoading || event.capacity - event.attendees <= 0}
                  className={`w-full py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${event.isRegistered
                      ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                  {registrationLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {event.isRegistered ? "Unregistering..." : "Registering..."}
                    </>
                  ) : event.isRegistered ? (
                    <>
                      <CheckCircle2 size={20} /> Registered
                    </>
                  ) : (
                    "Register Now"
                  )}
                </button>

                <button className="w-full py-3 rounded-xl font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                  <Share2 size={18} /> Share Event
                </button>
              </div>

              {event.isRegistered && (
                <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-xl space-y-2">
                  <div className="flex gap-3 items-start">
                    <div className="p-1 bg-green-100 rounded-full text-green-600 shrink-0">
                      <Check size={14} />
                    </div>
                    <div className="text-xs text-green-800">
                      <p className="font-bold mb-0.5">You are going!</p>
                      <p>
                        A confirmation email has been sent to your student inbox.
                      </p>
                    </div>
                  </div>

                  {event.ticketCode && (
                    <div className="pt-2 border-t border-green-200">
                      <p className="text-xs text-green-700 font-medium mb-1">Your Ticket Code:</p>
                      <code className="block bg-white border border-green-200 rounded-lg px-3 py-2 text-sm font-mono text-green-900 text-center tracking-wider">
                        {event.ticketCode}
                      </code>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
