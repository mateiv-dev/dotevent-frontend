'use client';

import { useState } from 'react';
import { Plus, Calendar, Clock, MapPin, Tag, Users, User } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { TextArea } from './ui/TextArea';

function CreateEventView({ onCreate, onCancel }: { onCreate: (event: any) => void, onCancel: () => void }) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="bg-slate-50/50 p-8 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900">Create New Event</h2>
          <p className="text-slate-500 mt-1">Fill in the details to publish an event to the student portal.</p>
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
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Date"
                required
                type="date"
                leftIcon={<Calendar size={16} />}
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
              <Input
                label="Time"
                required
                type="time"
                leftIcon={<Clock size={16} />}
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
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
              />
              <Select
                label="Category"
                leftIcon={<Tag size={16} />}
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
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
              />
              <Input
                label="Organizer"
                required
                placeholder="Organization or Person Name"
                leftIcon={<User size={16} />}
                value={formData.organizer}
                onChange={e => setFormData({ ...formData, organizer: e.target.value })}
              />
            </div>

            <TextArea
              label="Description"
              rows={4}
              placeholder="What is this event about?"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              leftIcon={<Plus size={20} />}
            >
              Publish Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEventView;