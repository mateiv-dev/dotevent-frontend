export type EventStatus = 'pending' | 'approved' | 'rejected';

export default interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: 'Academic' | 'Social' | 'Career' | 'Sports';
  attendees: number;
  capacity: number;
  isRegistered?: boolean;
  organizer: string;
  description: string;
  status?: EventStatus;
  rejectionReason?: string;
}