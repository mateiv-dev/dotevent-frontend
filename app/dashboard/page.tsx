'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import DashboardView from '../components/DashboardView';
import Layout from '../components/Layout';

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, events } = useApp();

  const registeredCount = events.filter(e => e.isRegistered).length;

  const handleEventClick = (id: number) => {
    router.push(`/events/${id}`);
  };

  const toEvents = () => {
    router.push('/events');
  };

  return (
    <Layout
      pageTitle="Student Dashboard"
    >
      <DashboardView
        currentUser={currentUser}
        events={events}
        registeredCount={registeredCount}
        toEvents={toEvents}
        onEventClick={handleEventClick}
      />
    </Layout>
  );
}