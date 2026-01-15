export default interface Review {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  eventId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}