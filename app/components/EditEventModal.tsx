"use client";

import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Tag,
  Users,
  User,
  Loader2,
  Upload,
  Building,
  GraduationCap,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { TextArea } from "./ui/TextArea";

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    category: string;
    capacity: number;
    organizer: string;
    description: string;
    faculty?: string;
    department?: string;
    attachments?: Array<{ url: string; name: string }>;
  };
  onSave: (eventId: string, eventData: any, files?: File[], filesToDelete?: string[]) => Promise<boolean>;
}

export default function EditEventModal({
  isOpen,
  onClose,
  event,
  onSave,
}: EditEventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [existingFiles, setExistingFiles] = useState<Array<{ url: string; name: string }>>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    category: "Academic",
    description: "",
    capacity: 100,
    organizer: "",
    faculty: "",
    department: "",
  });

  useEffect(() => {
    if (event && isOpen) {
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toISOString().split("T")[0];

      setFormData({
        title: event.title,
        date: formattedDate,
        time: event.time,
        location: event.location,
        category: event.category,
        description: event.description,
        capacity: event.capacity,
        organizer: event.organizer,
        faculty: event.faculty || "",
        department: event.department || "",
      });
      setExistingFiles(event.attachments || []);
      setFilesToDelete([]);
      setFiles([]);
      setFilePreviews([]);
    }
  }, [event, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    const totalFiles = existingFiles.length - filesToDelete.length + files.length + imageFiles.length;
    if (totalFiles > 10) {
      setError("You can have a maximum of 10 images");
      return;
    }

    const oversizedFiles = imageFiles.filter(
      (file) => file.size > 5 * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      setError("Some files are too large. Maximum size is 5MB per file.");
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

  const removeNewFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setFilePreviews(filePreviews.filter((_, i) => i !== index));
  };

  const markExistingFileForDeletion = (fileUrl: string) => {
    setFilesToDelete((prev) => [...prev, fileUrl]);
  };

  const restoreExistingFile = (fileUrl: string) => {
    setFilesToDelete((prev) => prev.filter((url) => url !== fileUrl));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const success = await onSave(event.id, formData, files, filesToDelete);
      if (success) {
        onClose();
      } else {
        setError("Failed to update event. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed top-16 left-0 right-0 bottom-14 lg:left-64 lg:bottom-0 z-[100] flex items-center justify-center bg-black/50 p-4 transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] md:h-auto md:max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0 bg-white">
          <h2 className="text-xl font-bold text-slate-900">Edit Event</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <Input
              label="Event Title"
              required
              placeholder="e.g., Annual Science Fair"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              disabled={isSubmitting}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date"
                required
                type="date"
                leftIcon={<Calendar size={16} />}
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                disabled={isSubmitting}
              />
              <Input
                label="Time"
                required
                type="time"
                leftIcon={<Clock size={16} />}
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Location"
                required
                placeholder="Room number or Building"
                leftIcon={<MapPin size={16} />}
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                disabled={isSubmitting}
              />
              <Select
                label="Category"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Capacity"
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
                label="Organizer"
                required
                placeholder="Organization or Person Name"
                leftIcon={<User size={16} />}
                value={formData.organizer}
                onChange={(e) =>
                  setFormData({ ...formData, organizer: e.target.value })
                }
                disabled={isSubmitting}
              />
            </div>

            {/* Faculty & Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Faculty (Optional)"
                placeholder="e.g., Faculty of Engineering"
                leftIcon={<Building size={16} />}
                value={formData.faculty}
                onChange={(e) =>
                  setFormData({ ...formData, faculty: e.target.value })
                }
                disabled={isSubmitting}
              />
              <Input
                label="Department (Optional)"
                placeholder="e.g., Computer Science"
                leftIcon={<GraduationCap size={16} />}
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                disabled={isSubmitting}
              />
            </div>

            <TextArea
              label="Description"
              rows={4}
              placeholder="What is this event about?"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={isSubmitting}
            />

            {/* Existing Files */}
            {existingFiles.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Current Images
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {existingFiles.map((file, index) => {
                    const isMarkedForDeletion = filesToDelete.includes(file.url);
                    return (
                      <div
                        key={index}
                        className={`relative group rounded-lg overflow-hidden border ${isMarkedForDeletion
                          ? "border-red-300 opacity-50"
                          : "border-slate-200"
                          }`}
                      >
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-24 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            isMarkedForDeletion
                              ? restoreExistingFile(file.url)
                              : markExistingFileForDeletion(file.url)
                          }
                          className={`absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${isMarkedForDeletion
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                            }`}
                        >
                          <X size={14} />
                        </button>
                        {isMarkedForDeletion && (
                          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                            <span className="text-xs text-red-700 font-medium bg-white px-2 py-1 rounded">
                              Will be deleted
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* New File Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Add New Images
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                    className="hidden"
                    id="edit-file-upload"
                  />
                  <label
                    htmlFor="edit-file-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-xl transition-colors cursor-pointer border-slate-300 hover:border-blue-500 hover:bg-blue-50"
                  >
                    <Upload size={20} className="text-slate-400" />
                    <span className="text-sm text-slate-600">
                      Click to upload images (max 10 total, 5MB each)
                    </span>
                  </label>
                </div>

                {/* New File Previews */}
                {filePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {filePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden border border-slate-200"
                      >
                        <img
                          src={preview}
                          alt={`New ${index + 1}`}
                          className="w-full h-24 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewFile(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1">
                          <p className="text-xs text-white truncate">New</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 shrink-0 bg-white">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              leftIcon={
                isSubmitting ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : null
              }
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}