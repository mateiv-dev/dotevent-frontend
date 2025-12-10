'use client';

import { useState } from 'react';
import { Plus, Calendar, Clock, MapPin, Tag, Users, User, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { TextArea } from './ui/TextArea';

interface CreateEventViewProps {
  onCreate: (event: any) => Promise<boolean>;
  onCancel: () => void;
}

function CreateEventView({ onCreate, onCancel }: CreateEventViewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    category: 'Academic',
    description: '',
    capacity: 100,
    organizer: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const success = await onCreate(formData);
      if (!success) {
        setError('Failed to create event. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="bg-slate-50/50 p-8 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900">Create New Event</h2>
          <p className="text-slate-500 mt-1">Fill in the details to publish an event to the student portal.</p>
          <p className="text-amber-600 text-sm mt-2">Note: Events require admin approval before they become visible.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-6">
            <Input
              label="Event Title"
              required
              placeholder="e.g., Annual Science Fair"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="text-lg placeholder:font-normal"
              disabled={isSubmitting}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Date"
                required
                type="date"
                leftIcon={<Calendar size={16} />}
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                disabled={isSubmitting}
              />
              <Input
                label="Time"
                required
                type="time"
                leftIcon={<Clock size={16} />}
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Location"
                required
                placeholder="Room number or Building"
                leftIcon={<MapPin size={16} />}
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                disabled={isSubmitting}
              />
              <Select
                label="Category"
                leftIcon={<Tag size={16} />}
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                disabled={isSubmitting}
              >
                <option>Academic</option>
                <option>Social</option>
                <option>Career</option>
                <option>Sports</option>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Capacity"
                required
                type="number"
                min="1"
                leftIcon={<Users size={16} />}
                value={formData.capacity}
                onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                disabled={isSubmitting}
              />
              <Input
                label="Organizer"
                required
                placeholder="Organization or Person Name"
                leftIcon={<User size={16} />}
                value={formData.organizer}
                onChange={e => setFormData({ ...formData, organizer: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <TextArea
              label="Description"
              rows={4}
              placeholder="What is this event about?"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              leftIcon={isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Publish Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEventView;