"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import Layout from "../components/Layout";
import RoleRequestsTab from "../components/admin/RoleRequestsTab";
import PendingEventsTab from "../components/admin/PendingEventsTab";
import RejectedEventsTab from "../components/admin/RejectedEventsTab";
import UsersTab from "../components/admin/UsersTab";
import StatisticsTab from "../components/admin/StatisticsTab";
import { Users, Calendar, Shield, UserCog, BarChart3, XCircle } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

type AdminTab = "statistics" | "role-requests" | "pending-events" | "rejected-events" | "users";

export default function AdminPage() {
  const router = useRouter();
  const { currentUser, isLoading } = useApp();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<AdminTab>("statistics");

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        router.push("/login");
      }
    }
  }, [currentUser, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser || !currentUser.role || currentUser.role !== "admin") {
    return null;
  }

  const tabs = [
    { id: "statistics" as AdminTab, label: t("admin.tabs.statistics"), icon: BarChart3 },
    { id: "role-requests" as AdminTab, label: t("admin.tabs.roleRequests"), icon: Users },
    {
      id: "pending-events" as AdminTab,
      label: t("admin.tabs.pendingEvents"),
      icon: Calendar,
    },
    {
      id: "rejected-events" as AdminTab,
      label: t("admin.tabs.rejectedEvents"),
      icon: XCircle,
    },
    {
      id: "users" as AdminTab,
      label: t("admin.tabs.users"),
      icon: UserCog,
    },
  ];

  return (
    <Layout pageTitle={t("admin.title")}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              {t("admin.title")}
            </h1>
            <p className="text-[var(--muted-foreground)] text-sm">
              {t("admin.description")}
            </p>
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="flex overflow-x-auto border-b border-[var(--border)]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap min-w-fit ${activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
                    }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === "statistics" && <StatisticsTab />}
            {activeTab === "role-requests" && <RoleRequestsTab />}
            {activeTab === "pending-events" && <PendingEventsTab />}
            {activeTab === "rejected-events" && <RejectedEventsTab />}
            {activeTab === "users" && <UsersTab />}
          </div>
        </div>
      </div>
    </Layout>
  );
}
