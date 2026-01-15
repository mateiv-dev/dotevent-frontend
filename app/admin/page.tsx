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

type AdminTab = "statistics" | "role-requests" | "pending-events" | "rejected-events" | "users";

export default function AdminPage() {
  const router = useRouter();
  const { currentUser, isLoading } = useApp();
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
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser || !currentUser.role || currentUser.role !== "admin") {
    return null;
  }

  const tabs = [
    { id: "statistics" as AdminTab, label: "Statistics", icon: BarChart3 },
    { id: "role-requests" as AdminTab, label: "Role Requests", icon: Users },
    {
      id: "pending-events" as AdminTab,
      label: "Pending Events",
      icon: Calendar,
    },
    {
      id: "rejected-events" as AdminTab,
      label: "Rejected Events",
      icon: XCircle,
    },
    {
      id: "users" as AdminTab,
      label: "All Users",
      icon: UserCog,
    },
  ];

  return (
    <Layout pageTitle="Admin Dashboard">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="text-slate-500 text-sm">
              Manage role requests, pending events, and users
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
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
