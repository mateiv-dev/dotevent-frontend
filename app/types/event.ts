export default interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  category: 'Academic' | 'Social' | 'Career' | 'Sports';
  attendees: number;
  capacity: number;
  isRegistered: boolean;
  organizer: string;
  description: string;
}