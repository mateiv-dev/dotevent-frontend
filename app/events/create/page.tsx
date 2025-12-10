'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import CreateEventView from '../../components/CreateEventView';
import Layout from '../../components/Layout';

export default function CreateEventPage() {
  const router = useRouter();
  const { createEvent, currentUser } = useApp();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    if (!['student_rep', 'organizer', 'admin'].includes(currentUser.role)) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  const handleCreate = async (newEvent: any): Promise<boolean> => {
    const success = await createEvent(newEvent);
    if (success) {
      setShowSuccess(true);
    }
    return success;
  };

  const onCancel = () => {
    router.back();
  };

  if (showSuccess) {
    return (
      <Layout pageTitle="Create New Event">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Event Created Successfully!</h2>
            <p className="text-slate-500 mb-4">
              Your event has been submitted for review. It will be visible once approved by an admin.
            </p>
            <button
              className="w-auto py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => router.push('/events')}
            >
              Go to Events
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Create New Event">
      <CreateEventView onCreate={handleCreate} onCancel={onCancel} />
    </Layout>
  );
}