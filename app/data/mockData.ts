import Notification from '../types/notification';

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: "Event Reminder",
    message: "Intro to React Workshop starts in 1 hour.",
    time: "1:00 PM",
    isRead: false
  },
  {
    id: 2,
    title: "New Registration",
    message: "You successfully registered for the Basketball Competition.",
    time: "Yesterday",
    isRead: false
  },
  {
    id: 3,
    title: "System Update",
    message: "Maintenance scheduled for tonight at 2 AM.",
    time: "2 days ago",
    isRead: true
  }
];