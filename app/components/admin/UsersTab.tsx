"use client";

import { useState, useEffect } from "react";
import { apiClient, APIError } from "../../../lib/apiClient";
import {
  User,
  Loader2,
  Search,
  Mail,
  Shield,
  GraduationCap,
  Building,
  Users as UsersIcon,
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

interface UserData {
  _id: string;
  firebaseId: string;
  name: string;
  email: string;
  role: string;
  university?: string;
  represents?: string;
  organizationName?: string;
  createdAt: string;
}

export default function UsersTab() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();

  const fetchUsers = async () => {
    try {
      const data = await apiClient.get<UserData[]>("/api/users");
      setUsers(data);
    } catch (err: any) {
      const message =
        err instanceof APIError
          ? err.getUserFriendlyMessage()
          : t("common.error");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield size={16} className="text-purple-600 dark:text-purple-400" />;
      case "organizer":
        return <Building size={16} className="text-blue-600 dark:text-blue-400" />;
      case "student_rep":
        return <UsersIcon size={16} className="text-green-600 dark:text-green-400" />;
      case "student":
        return <GraduationCap size={16} className="text-amber-600 dark:text-amber-400" />;
      default:
        return <User size={16} className="text-[var(--muted-foreground)]" />;
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400";
      case "organizer":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "student_rep":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "student":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300";
    }
  };

  const formatRole = (role: string) => {
    return role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted-foreground)]"
          size={18}
        />
        <input
          type="text"
          placeholder={t("admin.users.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--input)] bg-[var(--background)] text-[var(--foreground)] focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-[var(--muted-foreground)] outline-none"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-[var(--foreground)]">{users.length}</p>
          <p className="text-xs text-[var(--muted-foreground)]">{t("admin.users.title")}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {users.filter((u) => u.role === "admin").length}
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400">{t("admin.users.admins")}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {users.filter((u) => u.role === "organizer").length}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">{t("admin.users.organizers")}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {users.filter((u) => u.role === "student_rep").length}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">{t("admin.users.studentReps")}</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {users.filter((u) => u.role === "student" || u.role === "simple_user").length}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">{t("admin.users.students")}</p>
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-8 text-[var(--muted-foreground)]">
          {searchTerm ? t("admin.users.noMatches") : t("admin.users.noUsers")}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user, index) => (
            <div
              key={user._id || index}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--muted)] rounded-full flex items-center justify-center">
                    {getRoleIcon(user.role)}
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--foreground)]">{user.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
                      <Mail size={14} />
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeStyle(user.role)}`}
                  >
                    {getRoleIcon(user.role)}
                    {formatRole(user.role)}
                  </span>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    {t("admin.users.joined")} {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              {/* Additional info based on role */}
              {(user.university || user.represents || user.organizationName) && (
                <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-wrap gap-3 text-sm text-[var(--muted-foreground)]">
                  {user.university && (
                    <span className="flex items-center gap-1">
                      <GraduationCap size={14} />
                      {user.university}
                    </span>
                  )}
                  {user.represents && (
                    <span className="flex items-center gap-1">
                      <UsersIcon size={14} />
                      {t("admin.users.represents")}: {user.represents}
                    </span>
                  )}
                  {user.organizationName && (
                    <span className="flex items-center gap-1">
                      <Building size={14} />
                      {user.organizationName}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
