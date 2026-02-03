"use client";

import { useState } from "react";
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  Tag,
  Users,
  User,
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
  Building,
  GraduationCap,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { TextArea } from "./ui/TextArea";
import { useTranslation } from "../hooks/useTranslation";

interface CreateEventViewProps {
  onCreate: (event: any, files: File[]) => Promise<boolean>;
  onCancel: () => void;
}

function CreateEventView({ onCreate, onCancel }: CreateEventViewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    category: "Academic",
    description: "",
    capacity: 100,
    contact: "",
    faculty: "",
    department: "",
  });
  const { t } = useTranslation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length + imageFiles.length > 10) {
      setError(t("createEvent.images.errorTooMany"));
      return;
    }

    const oversizedFiles = imageFiles.filter(
      (file) => file.size > 5 * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      setError(t("createEvent.images.errorTooBig"));
      return;
    }

    setError("");
    const newFiles = [...files, ...imageFiles];
    setFiles(newFiles);

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setFilePreviews(filePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const success = await onCreate(formData, files);
      if (!success) {
        setError("Failed to create event. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-xl shadow-slate-200/50 overflow-hidden dark:shadow-none">
        <div className="bg-[var(--muted)] p-8 border-b border-[var(--border)]">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">
            {t("createEvent.title")}
          </h2>
          <p className="text-[var(--muted-foreground)] mt-1">
            {t("createEvent.subtitle")}
          </p>
          <p className="text-amber-600 text-sm mt-2">
            {t("createEvent.approvalNote")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-6">
            <Input
              label={t("createEvent.fields.title")}
              required
              placeholder={t("createEvent.placeholders.title")}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="text-lg placeholder:font-normal"
              disabled={isSubmitting}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={t("createEvent.fields.date")}
                required
                type="date"
                leftIcon={<Calendar size={16} />}
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                onClick={(e) => e.currentTarget.showPicker?.()}
                disabled={isSubmitting}
              />
              <Input
                label={t("createEvent.fields.time")}
                required
                type="time"
                leftIcon={<Clock size={16} />}
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                onClick={(e) => e.currentTarget.showPicker?.()}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={t("createEvent.fields.location")}
                required
                placeholder={t("createEvent.placeholders.location")}
                leftIcon={<MapPin size={16} />}
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                disabled={isSubmitting}
              />
              <Select
                label={t("createEvent.fields.category")}
                leftIcon={<Tag size={16} />}
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                disabled={isSubmitting}
              >
                <option>Academic</option>
                <option>Social</option>
                <option>Career</option>
                <option>Sports</option>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={t("createEvent.fields.capacity")}
                required
                type="number"
                min="1"
                leftIcon={<Users size={16} />}
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: parseInt(e.target.value) || 0,
                  })
                }
                disabled={isSubmitting}
              />
              <Input
                label={t("createEvent.fields.contact")}
                required
                placeholder={t("createEvent.placeholders.contact")}
                leftIcon={<User size={16} />}
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                disabled={isSubmitting}
              />
            </div>

            {/* Faculty & Department - Optional fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={t("createEvent.fields.faculty")}
                placeholder={t("createEvent.placeholders.faculty")}
                leftIcon={<Building size={16} />}
                value={formData.faculty}
                onChange={(e) =>
                  setFormData({ ...formData, faculty: e.target.value })
                }
                disabled={isSubmitting}
              />
              <Input
                label={t("createEvent.fields.department")}
                placeholder={t("createEvent.placeholders.department")}
                leftIcon={<GraduationCap size={16} />}
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                disabled={isSubmitting}
              />
            </div>

            <TextArea
              label={t("createEvent.fields.description")}
              rows={4}
              placeholder={t("createEvent.placeholders.description")}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={isSubmitting}
            />

            {/* File upload section */}
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                {t("createEvent.images.label")}
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    disabled={isSubmitting || files.length >= 10}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-xl transition-colors cursor-pointer ${files.length >= 10
                      ? "border-[var(--border)] bg-[var(--muted)] cursor-not-allowed"
                      : "border-[var(--muted-foreground)]/30 hover:border-blue-500 hover:bg-blue-50/50"
                      }`}
                  >
                    <Upload size={20} className="text-[var(--muted-foreground)]" />
                    <span className="text-sm text-[var(--muted-foreground)]">
                      {files.length >= 10
                        ? t("createEvent.images.maxReached")
                        : t("createEvent.images.uploadPrompt")}
                    </span>
                  </label>
                </div>

                {/* File previews */}
                {filePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {filePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden border border-[var(--border)]"
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1">
                          <p className="text-xs text-white truncate">
                            {files[index]?.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-[var(--muted-foreground)]">
                  <ImageIcon size={12} className="inline mr-1" />
                  {t("createEvent.images.supportedFormats")}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-[var(--border)]">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {t("createEvent.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              variant="primary"
              leftIcon={
                isSubmitting ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Plus size={20} />
                )
              }
              disabled={isSubmitting}
            >
              {isSubmitting ? t("createEvent.buttons.creating") : t("createEvent.buttons.publish")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEventView;