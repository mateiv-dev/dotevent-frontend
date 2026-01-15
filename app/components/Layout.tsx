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
} from "lucide-react";

import SettingsModal from "./SettingsModal";
import { getNotificationText, getNotificationTitle } from "../utils/notificationUtils";
import { formatRole } from "../utils/formatters";

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
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <aside className="w-64 bg-slate-900 text-white flex-col hidden lg:flex z-10">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white">d</span>
            </div>
            dotEvent
          </div>
          <p className="text-xs text-slate-400 mt-2">Portal for Students</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {currentUser.role && currentUser.role === "admin" && (
            <Link
              href="/admin"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "admin" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <Shield size={20} />
              Admin
            </Link>
          )}

          {currentUser.role !== "admin" && (
            <Link
              href="/dashboard"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "dashboard" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </Link>
          )}
          <Link
            href="/events"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "events" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Calendar size={20} />
            Browse Events
          </Link>
          {currentUser.role && ["student_rep", "organizer"].includes(currentUser.role) && (
            <Link
              href="/events/create"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "create" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <Plus size={20} />
              Create Event
            </Link>
          )}
          {currentUser.role && ["student_rep", "organizer"].includes(currentUser.role) && (
            <Link
              href="/my-events"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "my-events" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <FileText size={20} />
              My Events
            </Link>
          )}
          {currentUser.role && currentUser.role !== "admin" && (
            <Link
              href="/my-requests"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === "/my-requests" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <ClipboardList size={20} />
              My Requests
            </Link>
          )}

        </nav>

        <div className="p-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">© 2025 Softwave Team</p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8 z-40 relative">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={() => router.back()}
                className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 className="text-lg font-semibold capitalize text-slate-700 truncate max-w-[200px] sm:max-w-none">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {currentUser?.role !== "admin" && (
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={`p-2 rounded-full relative transition-colors ${isNotifOpen ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-100"}`}
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
                    <div className="absolute top-full right-0 mt-3 w-80 md:w-96 z-50 bg-white rounded-xl shadow-2xl ring-1 ring-black/5 border border-slate-100/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 backdrop-blur-sm">
                        <h3 className="font-semibold text-slate-900">
                          Notifications
                        </h3>
                        <div className="flex gap-3">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                            >
                              Mark all read
                            </button>
                          )}
                          <button
                            onClick={() => setIsNotifOpen(false)}
                            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="max-h-[60vh] lg:max-h-[400px] overflow-y-auto bg-white">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-500 text-sm">
                            <Bell
                              size={32}
                              className="mx-auto mb-3 text-slate-300 opacity-50"
                            />
                            <p>No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 group ${notif.isRead ? "opacity-75" : "bg-blue-50/30"}`}
                            >
                              <div
                                className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.isRead ? "bg-slate-300" : "bg-blue-500"}`}
                              />
                              <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-start gap-2">
                                  <p
                                    className={`text-sm ${notif.isRead ? "text-slate-600 font-medium" : "text-slate-900 font-bold"}`}
                                  >
                                    {getNotificationTitle(notif)}
                                  </p>
                                  <span className="text-[10px] text-slate-400 whitespace-nowrap mt-0.5">
                                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                  {getNotificationText(notif)}
                                </p>
                              </div>
                              <div className="flex flex-col gap-1 justify-center pl-2 border-l border-slate-100 ml-1">
                                {!notif.isRead && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notif.id);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Mark as read"
                                  >
                                    <Check size={14} />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notif.id);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
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
              className="flex items-center gap-3 p-2 sm:pl-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-left"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">
                  {currentUser.name}
                </p>
                <p className="text-xs text-slate-500">
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

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 text-white border-t border-slate-800 z-50 safe-area-pb mobile-nav">
        <div className="flex h-14 w-full">
          <Link
            href="/dashboard"
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === "dashboard" ? "text-blue-400" : "text-slate-400"}`}
          >
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-medium">Dash</span>
          </Link>

          <Link
            href="/events"
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === "events" ? "text-blue-400" : "text-slate-400"}`}
          >
            <Calendar size={20} />
            <span className="text-[10px] font-medium">Events</span>
          </Link>

          {currentUser.role && ["student_rep", "organizer"].includes(currentUser.role) && (
            <Link
              href="/events/create"
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === "create" ? "text-blue-400" : "text-slate-400"}`}
            >
              <Plus size={20} />
              <span className="text-[10px] font-medium">Create</span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
