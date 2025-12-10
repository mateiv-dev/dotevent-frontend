interface BaseUser {
  id: string;
  name: string;
  email: string;
}

export interface NormalUser extends BaseUser {
  role: "simple_user";
}

export interface Student extends BaseUser {
  role: "student";
  university: string;
}

export interface StudentRep extends BaseUser {
  role: "student_rep";
  represents: string;
}

export interface Organizer extends BaseUser {
  role: "organizer";
  organizationName: string;
}

export interface Admin extends BaseUser {
  role: "admin";
}

export type User = NormalUser | Student | StudentRep | Organizer | Admin;