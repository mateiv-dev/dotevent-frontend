export default interface Notification {
  _id: string;
  id?: number;
  title: string;
  message: string;
  time?: string;
  isRead: boolean;
  type?: string;
  createdAt?: string;
}
