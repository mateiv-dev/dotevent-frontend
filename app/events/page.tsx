"use client";

import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import EventListView from "../components/EventListView";
import Layout from "../components/Layout";
import { useTranslation } from "../hooks/useTranslation";

export default function EventsPage() {
  const router = useRouter();
  const {
    events,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    toggleRegistration,
  } = useApp();

  const handleEventClick = (id: string) => {
    router.push(`/events/${id}`);
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const { t } = useTranslation();

  return (
    <Layout pageTitle={t("common.browseEvents")}>
      <EventListView
        events={filteredEvents}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        toggleRegistration={toggleRegistration}
        onEventClick={handleEventClick}
      />
    </Layout>
  );
}
