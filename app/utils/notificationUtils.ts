import Notification from "../types/notification";
import { formatRole } from "./formatters";

export const getNotificationText = (notification: Notification): string => {
  const { type, relatedEvent, relatedRequest, title } = notification;

  switch (type) {
    case "event_approved":
      return `Your event "${relatedEvent?.title || "Unknown Event"}" has been approved.`;
    case "event_rejected":
      return `Your event "${relatedEvent?.title || "Unknown Event"}" has been rejected.`;
    case "role_approved":
      return `Your request to become a "${formatRole(relatedRequest?.requestedRole)}" has been approved.`;
    case "role_rejected":
      return `Your request to become a "${formatRole(relatedRequest?.requestedRole)}" has been rejected.`;
    case "registered_event_reminder":
      return `Reminder: "${relatedEvent?.title || "Event"}" is starting soon!`;
    case "favorite_event_reminder":
      return `Don't forget: "${relatedEvent?.title || "Event"}" is coming up!`;
    case "registered_event_updated":
      return `Update: Details for "${relatedEvent?.title || "Event"}" have changed.`;
    case "favorite_event_updated":
      return `Update: Details for "${relatedEvent?.title || "Event"}" have changed.`;
    case "event_deleted":
      return `The event "${relatedEvent?.title || "Unknown Event"}" has been cancelled.`;
    default:
      return title;
  }
};

export const getNotificationTitle = (notification: Notification): string => {
  const { type, title } = notification;

  switch (type) {
    case "event_approved":
      return "Event Approved";
    case "event_rejected":
      return "Event Rejected";
    case "role_approved":
      return "Role Request Approved";
    case "role_rejected":
      return "Role Request Rejected";
    case "registered_event_reminder":
    case "favorite_event_reminder":
      return "Event Reminder";
    case "registered_event_updated":
    case "favorite_event_updated":
      return "Event Update";
    case "event_deleted":
      return "Event Cancelled";
    default:
      return title;
  }
};
