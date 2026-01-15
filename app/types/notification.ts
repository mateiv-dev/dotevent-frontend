export interface RelatedEvent {
  id: string;
  title: string;
}

export interface RelatedRequest {
  id: string;
  requestedRole: string;
}

export default interface Notification {
  id: string;
  title: string;
  type: string;
  isRead: boolean;
  relatedEvent: RelatedEvent | null;
  relatedRequest: RelatedRequest | null;
  createdAt: string;
}
