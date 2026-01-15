"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import DashboardView from "../components/DashboardView";
import Layout from "../components/Layout";
import { apiClient } from "../../lib/apiClient";

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, events } = useApp();
  const [createdEvents, setCreatedEvents] = useState<any[]>([]);

  useEffect(() => {
    if (currentUser && currentUser.role === "admin") {
      router.push("/admin");
    }
    const fetchCreatedEvents = async () => {
      if (currentUser && ["organizer", "student_rep"].includes(currentUser.role)) {
        try {
          const myEvents = await apiClient.get<any[]>("/api/users/me/events");
          setCreatedEvents(myEvents);
        } catch (error) {
          console.error("Failed to fetch created events:", error);
        }
      }
    };
    fetchCreatedEvents();
  }, [currentUser, router]);

  const registeredCount = events.filter((e) => e.isRegistered).length;

  const handleEventClick = (id: string) => {
    router.push(`/events/${id}`);
  };

  const toEvents = () => {
    router.push("/events");
  };

  const toCreateEvent = () => {
    router.push("/events/create");
  };

  return (
    <Layout pageTitle="Dashboard">
      {currentUser && (
        <DashboardView
          currentUser={currentUser}
          events={events}
          createdEvents={createdEvents}
          registeredCount={registeredCount}
          toEvents={toEvents}
          toCreateEvent={toCreateEvent}
          onEventClick={handleEventClick}
        />
      )}
    </Layout>
  );
}
