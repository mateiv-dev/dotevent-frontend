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
  Star,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Checkbox } from "./ui/Checkbox";
import RoleRequestModal from "./RoleRequestModal";
import { formatRole } from "../utils/formatters";
import { apiClient, APIError, UserReview } from "../../lib/apiClient";
import { useTranslation } from "../hooks/useTranslation";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "profile" | "notifications" | "appearance" | "reviews" | "account";

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { currentUser, updateUser, settings, updateSettings } = useApp();
  const { signOut, deleteAccount } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isRoleRequestOpen, setIsRoleRequestOpen] = useState(false);

  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [university, setUniversity] = useState("");
  const [represents, setRepresents] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

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

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const data = await apiClient.getUserReviews();
      setReviews(data);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "reviews" && reviews.length === 0 && !reviewsLoading) {
      fetchReviews();
    }
  }, [activeTab]);

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
    { id: "profile", label: t("settings.profile"), icon: User },
    { id: "notifications", label: t("settings.notifications"), icon: Bell },
    { id: "appearance", label: t("settings.appearance"), icon: Palette },
    { id: "reviews", label: t("settings.reviews"), icon: Star },
    { id: "account", label: t("settings.account"), icon: Shield },
  ].filter(tab => {
    if (tab.id === "notifications" && currentUser?.role === "admin") return false;
    if (tab.id === "reviews" && (currentUser?.role === "admin" || currentUser?.role === "organizer")) return false;
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[var(--card)] rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[calc(95vh-6rem)] lg:max-h-[90vh] mb-16 lg:mb-0 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--muted)]/50 shrink-0">
          <h2 className="text-lg sm:text-lg font-semibold text-[var(--foreground)]">
            {t("settings.title")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex sm:flex-row flex-col flex-1 overflow-hidden min-h-0">
          <div className="w-48 bg-[var(--muted)] border-r border-[var(--border)] p-3 space-y-1 hidden sm:block shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                  ? "bg-[var(--card)] text-blue-600 shadow-sm"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--card)] hover:text-[var(--foreground)]"
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
                  : "text-[var(--muted-foreground)] bg-[var(--muted)]"
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
                  <h3 className="text-lg sm:text-lg font-medium text-[var(--foreground)] mb-1">
                    {t("settings.personalInfo")}
                  </h3>
                  <p className="text-sm sm:text-sm text-[var(--muted-foreground)] mb-3 sm:mb-4">
                    {t("settings.personalInfoDesc")}
                  </p>

                  <div className="space-y-3 sm:space-y-4">
                    <Input
                      label={t("settings.personalInfo")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                      label={t("settings.email")}
                      type="email"
                      leftIcon={<Mail size={16} />}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 sm:pt-6 border-t border-slate-100">
                  <h3 className="text-lg sm:text-lg font-medium text-[var(--foreground)] mb-1">
                    {t("settings.roleInfo")}
                  </h3>
                  <p className="text-sm sm:text-sm text-[var(--muted-foreground)] mb-3 sm:mb-4">
                    {t("settings.currentRole")}{" "}
                    <span className="font-medium capitalize">
                      {formatRole(currentUser.role)}
                    </span>
                  </p>

                  {/* Student University Input */}
                  {currentUser.role === "student" && (
                    <Input
                      label={t("settings.university")}
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
                        label={t("settings.university")}
                        leftIcon={<Building size={16} />}
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        containerClassName="mb-4"
                      />
                      <Input
                        label={t("settings.represents")}
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
                      label={t("settings.organization")}
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
                        {t("settings.requestUpgrade")}
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
                  <h3 className="text-lg sm:text-lg font-medium text-[var(--foreground)] mb-1">
                    {t("settings.eventReminders")}
                  </h3>
                  <p className="text-sm sm:text-sm text-[var(--muted-foreground)] mb-3 sm:mb-4">
                    {t("settings.eventRemindersDesc")}
                  </p>

                  <div className="space-y-2.5 sm:space-y-3">
                    <div
                      className="flex items-center justify-between p-3.5 sm:p-3 border border-[var(--border)] rounded-xl hover:bg-[var(--muted)]/50 transition-colors cursor-pointer"
                      onClick={() =>
                        updateSettings({
                          notifications: {
                            ...settings.notifications,
                            reminder24h: !settings.notifications.reminder24h,
                          },
                        })
                      }
                    >
                      <span className="text-sm sm:text-sm font-medium text-[var(--foreground)]">
                        {t("settings.reminder24h")}
                      </span>
                      <Checkbox
                        checked={settings.notifications.reminder24h}
                        readOnly
                        containerClassName="pointer-events-none"
                      />
                    </div>
                    <div
                      className="flex items-center justify-between p-3.5 sm:p-3 border border-[var(--border)] rounded-xl hover:bg-[var(--muted)]/50 transition-colors cursor-pointer"
                      onClick={() =>
                        updateSettings({
                          notifications: {
                            ...settings.notifications,
                            eventUpdates: !settings.notifications.eventUpdates,
                          },
                        })
                      }
                    >
                      <span className="text-sm sm:text-sm font-medium text-[var(--foreground)]">
                        {t("settings.eventUpdates")}
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
                  <h3 className="text-lg sm:text-lg font-medium text-[var(--foreground)] mb-1">
                    {t("settings.theme")}
                  </h3>
                  <p className="text-sm sm:text-sm text-[var(--muted-foreground)] mb-3 sm:mb-4">
                    {t("settings.themeDesc")}
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
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                        : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                        }`}
                    >
                      <div className="w-full h-20 sm:h-20 bg-white border border-slate-200 rounded-lg shadow-sm"></div>
                      <span
                        className={`text-sm sm:text-sm font-medium ${settings.appearance.theme === "light"
                          ? "text-blue-700"
                          : "text-[var(--muted-foreground)]"
                          }`}
                      >
                        {t("settings.light")}
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        updateSettings({
                          appearance: { ...settings.appearance, theme: "dark" },
                        })
                      }
                      className={`p-3 sm:p-3 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${settings.appearance.theme === "dark"
                        ? "border-blue-500 bg-[var(--muted)]"
                        : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                        }`}
                    >
                      <div className="w-full h-20 sm:h-20 bg-slate-900 border border-slate-700 rounded-lg shadow-sm"></div>
                      <span
                        className={`text-sm sm:text-sm font-medium ${settings.appearance.theme === "dark"
                          ? "text-blue-700"
                          : "text-[var(--muted-foreground)]"
                          }`}
                      >
                        {t("settings.dark")}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 sm:pt-6 border-t border-[var(--border)]">
                  <h3 className="text-lg sm:text-lg font-medium text-[var(--foreground)] mb-1">
                    {t("settings.language")}
                  </h3>
                  <p className="text-sm sm:text-sm text-[var(--muted-foreground)] mb-3 sm:mb-4">
                    {t("settings.languageDesc")}
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

            {activeTab === "reviews" && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg sm:text-lg font-medium text-[var(--foreground)] mb-1">
                    {t("settings.myReviews")}
                  </h3>
                  <p className="text-sm sm:text-sm text-[var(--muted-foreground)] mb-3 sm:mb-4">
                    {t("settings.myReviewsDesc")}
                  </p>
                </div>

                {reviewsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="mx-auto h-12 w-12 text-[var(--muted-foreground)] mb-3 opacity-50" />
                    <p className="text-[var(--muted-foreground)]">{t("settings.noReviews")}</p>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1 opacity-70">
                      {t("settings.noReviewsDesc")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-4 border border-[var(--border)] rounded-xl hover:bg-[var(--muted)]/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-[var(--foreground)] line-clamp-1">
                            {review.event?.title || "Deleted Event"}
                          </h4>
                          <div className="flex items-center gap-1 ml-2 shrink-0">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className={
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-[var(--muted-foreground)] opacity-30"
                                }
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-[var(--foreground)] mb-2">
                            {review.comment}
                          </p>
                        )}
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "account" && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg sm:text-lg font-medium text-[var(--foreground)] mb-1">
                    {t("settings.security")}
                  </h3>
                  <p className="text-sm sm:text-sm text-[var(--muted-foreground)] mb-3 sm:mb-4">
                    {t("settings.securityDesc")}
                  </p>

                  <button className="w-full flex items-center justify-between p-3.5 sm:p-3 border border-[var(--border)] rounded-xl hover:bg-[var(--muted)]/50 transition-colors text-left group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                        <Key size={18} />
                      </div>
                      <div>
                        <p className="text-sm sm:text-sm font-medium text-[var(--foreground)]">
                          {t("settings.changePassword")}
                        </p>
                        <p className="text-xs sm:text-xs text-[var(--muted-foreground)]">
                          {t("settings.changePasswordDesc")}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="pt-4 sm:pt-6 border-t border-[var(--border)]">
                  <h3 className="text-lg sm:text-lg font-medium text-[var(--foreground)] mb-1">
                    {t("settings.session")}
                  </h3>
                  <p className="text-sm sm:text-sm text-[var(--muted-foreground)] mb-3 sm:mb-4">
                    {t("settings.sessionDesc")}
                  </p>

                  <Button
                    variant="ghost"
                    className="w-full justify-start bg-[var(--muted)] hover:bg-[var(--muted)]/80 border-none shadow-none text-[var(--foreground)]"
                    leftIcon={<LogOut size={18} />}
                    onClick={() => {
                      signOut();
                      onClose();
                    }}
                  >
                    {t("settings.logOut")}
                  </Button>
                </div>

                <div className="pt-4 sm:pt-6 border-t border-[var(--border)]">
                  <h3 className="text-lg sm:text-lg font-medium text-red-600 mb-1">
                    {t("settings.dangerZone")}
                  </h3>
                  <p className="text-sm sm:text-sm text-[var(--muted-foreground)] mb-3 sm:mb-4">
                    {t("settings.dangerZoneDesc")}
                  </p>

                  <Button
                    variant="danger"
                    className="w-full justify-start"
                    leftIcon={<Trash2 size={18} />}
                    onClick={async () => {
                      if (
                        confirm(
                          t("settings.deleteAccountConfirm")
                        )
                      ) {
                        await deleteAccount();
                        onClose();
                      }
                    }}
                  >
                    {t("settings.deleteAccount")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-4 border-t border-[var(--border)] bg-[var(--muted)]/50 shrink-0">
          {saveError && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {saveError}
            </div>
          )}
          <div className="flex justify-end gap-3 sm:gap-3">
            <Button variant="ghost" onClick={onClose} disabled={isSaving}>
              {t("common.cancel")}
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
              {isSaving ? t("common.loading") : t("common.save")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
