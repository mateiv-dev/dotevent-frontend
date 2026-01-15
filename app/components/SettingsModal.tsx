"use client";

import { useState, useEffect } from "react";
import {
  X,
  User,
  Bell,
  Palette,
  Shield,
  LogOut,
  Trash2,
  Key,
  Mail,
  Building,
  Loader2,
  ArrowUpCircle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Checkbox } from "./ui/Checkbox";
import RoleRequestModal from "./RoleRequestModal";
import { formatRole } from "../utils/formatters";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "profile" | "notifications" | "appearance" | "account";

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { currentUser, updateUser, settings, updateSettings } = useApp();
  const { signOut, deleteAccount } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isRoleRequestOpen, setIsRoleRequestOpen] = useState(false);

  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [university, setUniversity] = useState("");
  const [represents, setRepresents] = useState("");
  const [organizationName, setOrganizationName] = useState("");

  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setSaveError("");

      if (currentUser.role === "student") {
        setUniversity((currentUser as any).university || "");
      } else if (currentUser.role === "organizer") {
        setOrganizationName((currentUser as any).organizationName || "");
      } else if (currentUser.role === "student_rep") {
        setRepresents((currentUser as any).represents || "");
        setUniversity((currentUser as any).university || "");
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;
  if (!currentUser) return null;

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    setSaveError("");

    if (email !== currentUser.email) {
      setSaveError("Changing email address is not currently available.");
      setIsSaving(false);
      return;
    }

    const userUpdates: any = { name };

    if (currentUser.role === "student") {
      userUpdates.university = university;
    } else if (currentUser.role === "organizer") {
      userUpdates.organizationName = organizationName;
    } else if (currentUser.role === "student_rep") {
      userUpdates.represents = represents;
      userUpdates.university = university;
    }

    try {
      await updateUser(userUpdates);
      onClose();
    } catch (error: any) {
      setSaveError(
        error.message || "Failed to save profile. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };



  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "account", label: "Account", icon: Shield },
  ].filter(tab => currentUser?.role !== "admin" || tab.id !== "notifications");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[calc(95vh-6rem)] lg:max-h-[90vh] mb-16 lg:mb-0 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <h2 className="text-lg sm:text-lg font-semibold text-slate-900">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex sm:flex-row flex-col flex-1 overflow-hidden min-h-0">
          <div className="w-48 bg-slate-50 border-r border-slate-100 p-3 space-y-1 hidden sm:block shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="sm:hidden flex overflow-x-auto border-b border-slate-100 px-4 py-3 gap-2 shrink-0 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 bg-slate-100"
                  }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 p-5 sm:p-6 overflow-y-auto min-h-0">
            {activeTab === "profile" && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg sm:text-lg font-medium text-slate-900 mb-1">
                    Personal Information
                  </h3>
                  <p className="text-sm sm:text-sm text-slate-500 mb-3 sm:mb-4">
                    Manage your personal details.
                  </p>

                  <div className="space-y-3 sm:space-y-4">
                    <Input
                      label="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      leftIcon={<Mail size={16} />}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 sm:pt-6 border-t border-slate-100">
                  <h3 className="text-lg sm:text-lg font-medium text-slate-900 mb-1">
                    Role Information
                  </h3>
                  <p className="text-sm sm:text-sm text-slate-500 mb-3 sm:mb-4">
                    Your current role:{" "}
                    <span className="font-medium capitalize">
                      {formatRole(currentUser.role)}
                    </span>
                  </p>

                  {/* Student University Input */}
                  {currentUser.role === "student" && (
                    <Input
                      label="University / Department"
                      leftIcon={<Building size={16} />}
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      containerClassName="mb-4"
                    />
                  )}

                  {/* Student Rep Inputs */}
                  {currentUser.role === "student_rep" && (
                    <>
                      <Input
                        label="University"
                        leftIcon={<Building size={16} />}
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        containerClassName="mb-4"
                      />
                      <Input
                        label="Represents (Faculty/Dorm/Organization)"
                        leftIcon={<Building size={16} />}
                        value={represents}
                        onChange={(e) => setRepresents(e.target.value)}
                        containerClassName="mb-4"
                      />
                    </>
                  )}

                  {/* Organizer Input */}
                  {currentUser.role === "organizer" && (
                    <Input
                      label="Organization"
                      leftIcon={<Building size={16} />}
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      containerClassName="mb-4"
                    />
                  )}

                  {currentUser.role && currentUser.role !== "admin" &&
                    currentUser.role !== "organizer" && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsRoleRequestOpen(true)}
                        leftIcon={<ArrowUpCircle size={18} />}
                        className="w-full"
                      >
                        Request Role Upgrade
                      </Button>
                    )}
                </div>

                <RoleRequestModal
                  isOpen={isRoleRequestOpen}
                  onClose={() => setIsRoleRequestOpen(false)}
                  currentRole={currentUser.role || "simple_user"}
                />
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg sm:text-lg font-medium text-slate-900 mb-1">
                    Event Reminders
                  </h3>
                  <p className="text-sm sm:text-sm text-slate-500 mb-3 sm:mb-4">
                    Choose when you want to be notified about upcoming events.
                  </p>

                  <div className="space-y-2.5 sm:space-y-3">
                    <div
                      className="flex items-center justify-between p-3.5 sm:p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() =>
                        updateSettings({
                          notifications: {
                            ...settings.notifications,
                            reminder24h: !settings.notifications.reminder24h,
                          },
                        })
                      }
                    >
                      <span className="text-sm sm:text-sm font-medium text-slate-700">
                        24 hours before
                      </span>
                      <Checkbox
                        checked={settings.notifications.reminder24h}
                        readOnly
                        containerClassName="pointer-events-none"
                      />
                    </div>
                    <div
                      className="flex items-center justify-between p-3.5 sm:p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() =>
                        updateSettings({
                          notifications: {
                            ...settings.notifications,
                            eventUpdates: !settings.notifications.eventUpdates,
                          },
                        })
                      }
                    >
                      <span className="text-sm sm:text-sm font-medium text-slate-700">
                        Event updates
                      </span>
                      <Checkbox
                        checked={settings.notifications.eventUpdates}
                        readOnly
                        containerClassName="pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg sm:text-lg font-medium text-slate-900 mb-1">
                    Theme
                  </h3>
                  <p className="text-sm sm:text-sm text-slate-500 mb-3 sm:mb-4">
                    Customize the look and feel of the application.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        updateSettings({
                          appearance: {
                            ...settings.appearance,
                            theme: "light",
                          },
                        })
                      }
                      className={`p-3 sm:p-3 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${settings.appearance.theme === "light"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      <div className="w-full h-20 sm:h-20 bg-white border border-slate-200 rounded-lg shadow-sm"></div>
                      <span
                        className={`text-sm sm:text-sm font-medium ${settings.appearance.theme === "light"
                          ? "text-blue-700"
                          : "text-slate-600"
                          }`}
                      >
                        Light
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        updateSettings({
                          appearance: { ...settings.appearance, theme: "dark" },
                        })
                      }
                      className={`p-3 sm:p-3 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${settings.appearance.theme === "dark"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      <div className="w-full h-20 sm:h-20 bg-slate-900 border border-slate-700 rounded-lg shadow-sm"></div>
                      <span
                        className={`text-sm sm:text-sm font-medium ${settings.appearance.theme === "dark"
                          ? "text-blue-700"
                          : "text-slate-600"
                          }`}
                      >
                        Dark
                      </span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 sm:pt-6 border-t border-slate-100">
                  <h3 className="text-lg sm:text-lg font-medium text-slate-900 mb-1">
                    Language
                  </h3>
                  <p className="text-sm sm:text-sm text-slate-500 mb-3 sm:mb-4">
                    Select your preferred language.
                  </p>

                  <Select
                    value={settings.appearance.language}
                    onChange={(e) =>
                      updateSettings({
                        appearance: {
                          ...settings.appearance,
                          language: e.target.value as "en" | "ro",
                        },
                      })
                    }
                  >
                    <option value="en">English</option>
                    <option value="ro">Română</option>
                  </Select>
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg sm:text-lg font-medium text-slate-900 mb-1">
                    Security
                  </h3>
                  <p className="text-sm sm:text-sm text-slate-500 mb-3 sm:mb-4">
                    Manage your password and account access.
                  </p>

                  <button className="w-full flex items-center justify-between p-3.5 sm:p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <Key size={18} />
                      </div>
                      <div>
                        <p className="text-sm sm:text-sm font-medium text-slate-900">
                          Change Password
                        </p>
                        <p className="text-xs sm:text-xs text-slate-500">
                          Update your password regularly
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="pt-4 sm:pt-6 border-t border-slate-100">
                  <h3 className="text-lg sm:text-lg font-medium text-slate-900 mb-1">
                    Session
                  </h3>
                  <p className="text-sm sm:text-sm text-slate-500 mb-3 sm:mb-4">
                    Sign out of your account.
                  </p>

                  <Button
                    variant="ghost"
                    className="w-full justify-start bg-slate-100 hover:bg-slate-200 border-none shadow-none text-slate-700"
                    leftIcon={<LogOut size={18} />}
                    onClick={() => {
                      signOut();
                      onClose();
                    }}
                  >
                    Log Out
                  </Button>
                </div>

                <div className="pt-4 sm:pt-6 border-t border-slate-100">
                  <h3 className="text-lg sm:text-lg font-medium text-red-600 mb-1">
                    Danger Zone
                  </h3>
                  <p className="text-sm sm:text-sm text-slate-500 mb-3 sm:mb-4">
                    Irreversible actions for your account.
                  </p>

                  <Button
                    variant="danger"
                    className="w-full justify-start"
                    leftIcon={<Trash2 size={18} />}
                    onClick={async () => {
                      if (
                        confirm(
                          "Are you sure you want to delete your account? This action cannot be undone.",
                        )
                      ) {
                        await deleteAccount();
                        onClose();
                      }
                    }}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          {saveError && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {saveError}
            </div>
          )}
          <div className="flex justify-end gap-3 sm:gap-3">
            <Button variant="ghost" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
              leftIcon={
                isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : undefined
              }
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
