export const formatRole = (role: string | undefined | null): string => {
  if (!role) return "";

  const roleMap: Record<string, string> = {
    simple_user: "User",
    student_rep: "Student Rep",
    admin: "Admin",
    organizer: "Organizer",
    student: "Student",
  };

  if (roleMap[role]) {
    return roleMap[role];
  }

  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
