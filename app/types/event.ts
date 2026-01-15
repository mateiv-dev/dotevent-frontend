export type EventStatus = "pending" | "approved" | "rejected";
export type EventCategory = "Academic" | "Social" | "Career" | "Sports";

export interface Attachment {
  url: string;
  name: string;
  fileType: "image" | "document";
  size: number;
  uploadedAt: string;
}

export interface Organizer {
  represents: string | null;
  organizationName: string | null;
  contact?: string;
}

export default interface Event {
  id: string;
  createdAt: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: EventCategory;
  attendees: number;
  capacity: number;
  isRegistered?: boolean;
  isFavorited?: boolean;
  ticketCode?: string;
  organizer: Organizer | string;
  description: string;
  status?: EventStatus;
  rejectionReason?: string;
  images?: string[];
  faculty?: string;
  department?: string;
  titleImage?: string;
  attachments?: Attachment[];
  averageRating?: number;
  reviewCount?: number;
  author?: {
    name: string;
    email: string;
    role: string;
  };
}