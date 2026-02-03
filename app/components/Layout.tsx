"use client";

import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import {
  Calendar,
  Plus,
  LayoutDashboard,
  Bell,
  Trash2,
  Check,
  X,
  ArrowLeft,
  Shield,
  FileText,
  ClipboardList,
  Building2,
} from "lucide-react";

import SettingsModal from "./SettingsModal";
import { getNotificationText, getNotificationTitle } from "../utils/notificationUtils";
import { formatRole } from "../utils/formatters";
import { useTranslation } from "../hooks/useTranslation";

interface LayoutProps {
  children: ReactNode;
  pageTitle: string;
}

export default function Layout({ children, pageTitle }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    isLoading,
    notifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
  } = useApp();
  const { t } = useTranslation();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const activeTab =
    pathname === "/dashboard"
      ? "dashboard"
      : pathname === "/events/create"
        ? "create"
        : pathname === "/my-events"
          ? "my-events"
          : pathname === "/admin"
            ? "admin"
            : pathname.startsWith("/events")
              ? "events"
              : "";

  const showBackButton = pathname.match(/^\/events\/[^\/]+$/);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push("/login");
    }
  }, [isLoading, currentUser, router]);

  if (isLoading || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--muted)] font-sans text-[var(--foreground)] overflow-hidden">
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <aside className="w-64 bg-[var(--card)] text-[var(--foreground)] flex-col hidden lg:flex z-10 border-r border-[var(--border)] shadow-xl">
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-[var(--foreground)]">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white">d</span>
            </div>
            dotEvent
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-2">{t("common.portalForStudents")}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {currentUser.role && currentUser.role === "admin" && (
            <Link
              href="/admin"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === "admin" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"}`}
            >
              <Shield size={20} />
              {t("common.admin")}
            </Link>
          )}

          <div className="px-4 py-2 mb-1 text-[10px] font-bold text-[var(--muted-foreground)]/50 uppercase tracking-widest">
            {t("common.menu")}
          </div>

          {currentUser.role !== "admin" && (
            <Link
              href="/dashboard"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === "dashboard" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"}`}
            >
              <LayoutDashboard size={20} />
              {t("common.dashboard")}
            </Link>
          )}
          <Link
            href="/events"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === "events" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"}`}
          >
            <Calendar size={20} />
            {t("common.browseEvents")}
          </Link>

          {(["student_rep", "organizer"].includes(currentUser.role || "") || (currentUser.role !== "admin" && currentUser.role /* ensure regular users access requests */)) && (
            <div className="px-4 py-2 mt-6 mb-1 text-[10px] font-bold text-[var(--muted-foreground)]/50 uppercase tracking-widest">
              {t("common.manage")}
            </div>
          )}

          {currentUser.role && ["student_rep", "organizer"].includes(currentUser.role) && (
            <Link
              href="/events/create"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === "create" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"}`}
            >
              <Plus size={20} />
              {t("common.createEvent")}
            </Link>
          )}
          {currentUser.role && ["student_rep", "organizer"].includes(currentUser.role) && (
            <Link
              href="/my-events"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === "my-events" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"}`}
            >
              <FileText size={20} />
              {t("common.myEvents")}
            </Link>
          )}
          {currentUser.role && ["student_rep", "organizer"].includes(currentUser.role) && (
            <Link
              href="/organization-events"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${pathname === "/organization-events" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"}`}
            >
              <Building2 size={20} />
              {t("common.orgEvents")}
            </Link>
          )}
          {currentUser.role && currentUser.role !== "admin" && (
            <Link
              href="/my-requests"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${pathname === "/my-requests" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"}`}
            >
              <ClipboardList size={20} />
              {t("common.myRequests")}
            </Link>
          )}

        </nav>

        <div className="p-6 border-t border-[var(--border)] text-center">
          <p className="text-xs text-[var(--muted-foreground)]">{t("common.copyright")}</p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-[var(--card)] border-b border-[var(--border)] flex items-center justify-between px-6 md:px-8 z-40 relative">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={() => router.back()}
                className="p-2 -ml-2 text-[var(--muted-foreground)] hover:bg-[var(--accent)] rounded-full transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 className="text-lg font-semibold capitalize text-[var(--foreground)] truncate max-w-[200px] sm:max-w-none">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {currentUser?.role !== "admin" && (
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={`p-2 rounded-full relative transition-colors ${isNotifOpen ? "bg-blue-50 text-blue-600" : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]"}`}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                  )}
                </button>

                {isNotifOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-black/5"
                      onClick={() => setIsNotifOpen(false)}
                    />
                    <div className="absolute top-full right-0 mt-3 w-80 md:w-96 z-50 bg-[var(--popover)] rounded-xl shadow-2xl ring-1 ring-black/5 border border-[var(--border)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--muted)]/80 backdrop-blur-sm">
                        <h3 className="font-semibold text-[var(--foreground)]">
                          {t("common.notifications")}
                        </h3>
                        <div className="flex gap-3">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                            >
                              {t("common.markAllRead")}
                            </button>
                          )}
                          <button
                            onClick={() => setIsNotifOpen(false)}
                            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="max-h-[60vh] lg:max-h-[400px] overflow-y-auto bg-[var(--card)]">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-[var(--muted-foreground)] text-sm">
                            <Bell
                              size={32}
                              className="mx-auto mb-3 text-[var(--muted-foreground)] opacity-50"
                            />
                            <p>{t("common.noNotifications")}</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-4 border-b border-[var(--border)] transition-colors flex gap-3 group ${notif.isRead ? "hover:bg-[var(--accent)] opacity-75" : "bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20"}`}
                            >
                              <div
                                className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.isRead ? "bg-[var(--border)]" : "bg-blue-500"}`}
                              />
                              <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-start gap-2">
                                  <p
                                    className={`text-sm ${notif.isRead ? "text-[var(--muted-foreground)] font-medium" : "text-[var(--foreground)] font-bold"}`}
                                  >
                                    {getNotificationTitle(notif)}
                                  </p>
                                  <span className="text-[10px] text-[var(--muted-foreground)] whitespace-nowrap mt-0.5">
                                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                                  {getNotificationText(notif)}
                                </p>
                              </div>
                              <div className="flex flex-col gap-1 justify-center pl-2 border-l border-[var(--border)] ml-1">
                                {!notif.isRead && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notif.id);
                                    }}
                                    className="p-1.5 text-[var(--muted-foreground)] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title={t("common.markAsRead")}
                                  >
                                    <Check size={14} />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notif.id);
                                  }}
                                  className="p-1.5 text-[var(--muted-foreground)] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title={t("common.delete")}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-3 p-2 sm:pl-4 hover:bg-[var(--accent)] rounded-xl transition-colors text-left"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {currentUser.name}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {formatRole(currentUser.role)}
                </p>
              </div>
              <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                {currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-0 pb-18 lg:pb-8 mobile-safe-pb">
          {children}
        </div>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--card)] text-[var(--foreground)] border-t border-[var(--border)] z-50 safe-area-pb mobile-nav">
        <div className="flex h-14 w-full">
          <Link
            href="/dashboard"
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === "dashboard" ? "text-blue-600" : "text-[var(--muted-foreground)]"}`}
          >
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-medium">{t("common.nav.dash")}</span>
          </Link>

          <Link
            href="/events"
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === "events" ? "text-blue-600" : "text-[var(--muted-foreground)]"}`}
          >
            <Calendar size={20} />
            <span className="text-[10px] font-medium">{t("common.nav.events")}</span>
          </Link>

          {currentUser.role && ["student_rep", "organizer"].includes(currentUser.role) && (
            <Link
              href="/events/create"
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === "create" ? "text-blue-600" : "text-[var(--muted-foreground)]"}`}
            >
              <Plus size={20} />
              <span className="text-[10px] font-medium">{t("common.nav.create")}</span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
