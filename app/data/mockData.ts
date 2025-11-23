import Event from '../types/event';
import Notification from '../types/notification';
import { Student, NormalUser, StudentRep, Organizer, Admin } from '../types/user';

export const INITIAL_EVENTS: Event[] = [
  {
    id: 1,
    title: "Annual Engineering Career Fair",
    date: "2023-11-15",
    time: "10:00 AM",
    location: "Main Campus Center",
    category: "Career",
    attendees: 142,
    capacity: 200,
    isRegistered: true,
    organizer: "Career Services Dept",
    description: "Connect with top tech companies and startups. Bring your resume! This event features over 50 recruiters from industries ranging from Software Development to Civil Engineering. There will be a CV review station and free professional headshots available from 11 AM to 1 PM."
  },
  {
    id: 2,
    title: "Intro to React Workshop",
    date: "2023-11-16",
    time: "02:00 PM",
    location: "Lab 304, Science Block",
    category: "Academic",
    attendees: 28,
    capacity: 30,
    isRegistered: true,
    organizer: "CS Society",
    description: "Learn the basics of React.js with the CS Society. We will cover Components, State, Props, and Hooks. Please bring your own laptop with Node.js installed. Pizza will be provided after the coding session!"
  },
  {
    id: 3,
    title: "Basketball Competition",
    date: "2023-11-18",
    time: "06:00 PM",
    location: "University Gym",
    category: "Sports",
    attendees: 45,
    capacity: 100,
    isRegistered: false,
    organizer: "Athletics Union",
    description: "Come support the home team! Free entry for students. The first 20 attendees get a free foam finger. The match is against the rival City College team, so bring your energy!"
  }
];

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

export const MOCK_NORMAL_USER: NormalUser = {
  id: 1,
  name: "John Doe",
  email: "john.doe@example.com",
  role: "user",
};

export const MOCK_STUDENT: Student = {
  id: 2,
  name: "Matei Vasilean",
  email: "matei.vasilean@student.usv.ro",
  role: "student",
  university: "Stefan cel Mare University of Suceava",
};

export const MOCK_STUDENT_REP: StudentRep = {
  id: 3,
  name: "Alice Johnson",
  email: "alice.johnson@student.usv.ro",
  role: "student_rep",
  represents: "Faculty of Electrical and Computer Engineering",
};

export const MOCK_ORGANIZER: Organizer = {
  id: 4,
  name: "David Smith",
  email: "david.smith@usv.ro",
  role: "organizer",
  organizationName: "Student Union",
};

export const MOCK_ADMIN: Admin = {
  id: 5,
  name: "Sarah Williams",
  email: "sarah.williams@admin.usv.ro",
  role: "admin",
};

export const CURRENT_USER = MOCK_STUDENT;