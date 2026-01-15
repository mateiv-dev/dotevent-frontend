"use client";

import { useState, useEffect } from "react";
import {
  apiClient,
  APIError,
  TotalStatistics,
  MonthlyActivity,
} from "../../../lib/apiClient";
import {
  Loader2,
  Calendar,
  Users,
  TrendingUp,
  Building2,
  BarChart3,
  AlertCircle,
} from "lucide-react";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function StatisticsTab() {
  const [statistics, setStatistics] = useState<TotalStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiClient.getTotalStatistics();
      setStatistics(data);
    } catch (err: any) {
      const message =
        err instanceof APIError
          ? err.getUserFriendlyMessage()
          : "Failed to load statistics";
      setError(message);
    } finally {
      setLoading(false);
    }
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
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={fetchStatistics}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  const maxMonthlyCount = Math.max(
    ...statistics.monthlyActivity.map((m) => m.count),
    1
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Calendar size={20} />
            </div>
            <span className="text-blue-100 font-medium">Total Events</span>
          </div>
          <p className="text-3xl font-bold">{statistics.totalEventsAllTime}</p>
          <p className="text-blue-200 text-sm mt-1">All time</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg shadow-green-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <span className="text-green-100 font-medium">Last Month</span>
          </div>
          <p className="text-3xl font-bold">{statistics.eventsLastMonth}</p>
          <p className="text-green-200 text-sm mt-1">Events created</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg shadow-purple-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users size={20} />
            </div>
            <span className="text-purple-100 font-medium">Avg. Occupancy</span>
          </div>
          <p className="text-3xl font-bold">{statistics.averageOccupancy}%</p>
          <p className="text-purple-200 text-sm mt-1">Registration rate</p>
        </div>
      </div>

      {/* Monthly Activity Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-slate-100 rounded-lg">
            <BarChart3 size={20} className="text-slate-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Monthly Activity</h3>
            <p className="text-sm text-slate-500">
              Events created per month (Academic Year)
            </p>
          </div>
        </div>

        <div className="flex items-end gap-2 h-48">
          {statistics.monthlyActivity.map((item: MonthlyActivity, index) => {
            const height =
              item.count > 0 ? (item.count / maxMonthlyCount) * 100 : 4;
            const monthName = MONTH_NAMES[item.month - 1] || "?";

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <span className="text-xs font-medium text-slate-600">
                  {item.count}
                </span>
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500"
                  style={{ height: `${height}%`, minHeight: "4px" }}
                />
                <span className="text-xs text-slate-500 font-medium">
                  {monthName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Organizations */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Building2 size={20} className="text-slate-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Top Organizations</h3>
            <p className="text-sm text-slate-500">Most active event creators</p>
          </div>
        </div>

        {statistics.topOrganizations.length > 0 ? (
          <div className="space-y-4">
            {statistics.topOrganizations.map((org, index) => {
              const maxEvents = statistics.topOrganizations[0]?.events || 1;
              const percentage = (org.events / maxEvents) * 100;
              const colors = [
                "bg-yellow-400",
                "bg-slate-400",
                "bg-amber-600",
              ];

              return (
                <div key={index} className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-full ${colors[index] || "bg-slate-300"} flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-900">
                        {org.name}
                      </span>
                      <span className="text-sm text-slate-500">
                        {org.events} events
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">
            No organization data available
          </p>
        )}
      </div>
    </div>
  );
}
