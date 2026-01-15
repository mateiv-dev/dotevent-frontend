"use client";

import { useState, useEffect } from "react";
import {
  apiClient,
  APIError,
  Participant,
} from "../../lib/apiClient";
import {
  X,
  Loader2,
  Users,
  Download,
  Search,
  AlertCircle,
} from "lucide-react";
import { Button } from "./ui/Button";

interface ParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
}

export default function ParticipantsModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
}: ParticipantsModalProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (isOpen && eventId) {
      fetchParticipants();
    }
  }, [isOpen, eventId]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.getEventParticipants(eventId);
      setParticipants(response.participants || []);
    } catch (err: any) {
      const message =
        err instanceof APIError
          ? err.getUserFriendlyMessage()
          : "Failed to load participants";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const csvData = await apiClient.exportParticipantsCSV(eventId);

      const blob = new Blob([csvData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${eventTitle.replace(/[^a-z0-9]/gi, "_")}_participants.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      const message =
        err instanceof APIError
          ? err.getUserFriendlyMessage()
          : "Failed to export participants";
      setError(message);
    } finally {
      setExporting(false);
    }
  };

  const filteredParticipants = participants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Users size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Event Participants
                </h2>
                <p className="text-sm text-slate-500 line-clamp-1">
                  {eventTitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          {/* Stats Bar */}
          {!loading && !error && (
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-slate-400" />
                <span className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">
                    {participants.length}
                  </span>{" "}
                  registered
                </span>
              </div>
              <div className="ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  isLoading={exporting}
                  leftIcon={<Download size={14} />}
                >
                  Export CSV
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        {!loading && !error && participants.length > 0 && (
          <div className="px-6 py-3 border-b border-slate-100">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={fetchParticipants}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500 font-medium">
                No participants registered yet
              </p>
            </div>
          ) : filteredParticipants.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500 font-medium">
                No participants match your search
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredParticipants.map((participant, index) => (
                <div
                  key={`${participant.email}-${index}`}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {participant.name}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {participant.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {participant.registeredAt && (
                      <span className="text-xs text-slate-400">
                        {new Date(participant.registeredAt).toLocaleDateString()}
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {participant.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
