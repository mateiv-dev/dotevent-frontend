'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import CreateEventView from '../../components/CreateEventView';
import Layout from '../../components/Layout';

export default function CreateEventPage() {
  const router = useRouter();
  const { createEvent, currentUser } = useApp();

  useEffect(() => {
    if (!['student_rep', 'organizer', 'admin'].includes(currentUser.role)) {
      router.push('/');
    }
  }, [currentUser, router]);

  const handleCreate = (newEvent: any) => {
    createEvent(newEvent);
    router.push('/events');
  };

  const onCancel = () => {
    router.back();
  };

  return (
    <Layout
      pageTitle="Create New Event"
    >
      <CreateEventView onCreate={handleCreate} onCancel={onCancel} />
    </Layout>
  );
}