"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Info,
  Building2,
  Users,
  CheckCircle2,
  Share2,
  Check,
  Heart,
  Star,
  Navigation,
  ExternalLink,
  MessageSquare,
  Trash2,
  X,
  Paperclip,
  FileText,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import Layout from "../../components/Layout";
import Event from "../../types/event";
import Review from "../../types/review";
import { getCategoryStyles } from "../../utils/categoryStyles";
import { getImageUrl } from "../../utils/imageUtils";

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const {
    events,
    registerForEvent,
    unregisterFromEvent,
    toggleFavorite,
    currentUser,
    fetchEventReviews,
    addReview,
    deleteReview,
  } = useApp();
  const [event, setEvent] = useState<Event | null>(null);
  const [id, setId] = useState<string>("");
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id);
      const foundEvent = events.find((e) => e.id === resolvedParams.id);
      setEvent(foundEvent || null);
    });
  }, [params, events]);

  useEffect(() => {
    const loadReviews = async () => {
      if (!id) return;
      setReviewsLoading(true);
      try {
        const reviewsData = await fetchEventReviews(id);
        setReviews(reviewsData);
      } catch (error) {
        console.error("Failed to load reviews:", error);
      } finally {
        setReviewsLoading(false);
      }
    };
    loadReviews();
  }, [id, fetchEventReviews]);

  if (!event) {
    return (
      <Layout pageTitle="Event Details">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Event not found
            </h2>
            <p className="text-slate-500 mb-4">
              The event you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleRegistration = async () => {
    setRegistrationLoading(true);
    setRegistrationError("");

    try {
      if (event.isRegistered) {
        await unregisterFromEvent(event.id);
      } else {
        await registerForEvent(event.id);
      }
    } catch (err: any) {
      setRegistrationError(err.message || "Failed to update registration");
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!currentUser) return;
    setFavoriteLoading(true);
    try {
      await toggleFavorite(event.id);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: `Check out this event: ${event.title} on ${new Date(event.date).toLocaleDateString()} at ${event.location}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert("Event link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleGetDirections = () => {
    const encodedLocation = encodeURIComponent(event.location);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedLocation}`, "_blank");
  };

  const handleOpenMap = () => {
    const encodedLocation = encodeURIComponent(event.location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, "_blank");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewError("");

    try {
      await addReview(event.id, newRating, newComment || undefined);
      const updatedReviews = await fetchEventReviews(event.id);
      setReviews(updatedReviews);
      setShowReviewForm(false);
      setNewComment("");
      setNewRating(5);
    } catch (err: any) {
      setReviewError(err.getUserFriendlyMessage?.() || err.message || "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete your review?")) return;
    try {
      await deleteReview(reviewId, event.id);
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  const eventDate = new Date(event.date);
  const canReview = currentUser && event.isRegistered && eventDate <= new Date();
  const userHasReviewed = reviews.some(r => r.user.id === currentUser?.id);

  const organizerName = typeof event.organizer === 'string'
    ? event.organizer
    : (event.organizer?.represents || event.organizer?.organizationName || "?");

  const qrCodeUrl = event.ticketCode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(event.ticketCode)}`
    : null;

  const displayAttachments = [...(event.attachments || [])];
  if (event.titleImage && !displayAttachments.some(a => a.url === event.titleImage)) {
    displayAttachments.unshift({
      url: event.titleImage,
      name: "Cover Image",
      fileType: "image",
      size: 0,
      uploadedAt: event.createdAt
    });
  }

  return (
    <Layout pageTitle="Event Details">
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Hero Section */}
        <div
          className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${getCategoryStyles(event.category).gradient} p-8 md:p-12 text-white shadow-lg`}
        >
          {event.titleImage && (
            <>
              <div className="absolute inset-0 bg-black/40 z-0"></div>
              <img
                src={getImageUrl(event.titleImage) || ""}
                alt={event.title}
                className="absolute inset-0 w-full h-full object-cover -z-10"
              />
            </>
          )}

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                {event.category}
              </div>

              {/* Rating Badge */}
              {event.averageRating !== undefined && event.averageRating > 0 && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md">
                  <Star size={16} fill="currentColor" className="text-amber-300" />
                  <span className="font-bold">{event.averageRating.toFixed(1)}</span>
                  <span className="text-white/70">({event.reviewCount} reviews)</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight max-w-3xl drop-shadow-lg">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-6 text-blue-50">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-white" />
                <span className="font-medium text-white text-shadow">
                  {new Date(event.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-white" />
                <span className="font-medium text-white text-shadow">{event.time}</span>
              </div>
              <button
                onClick={handleOpenMap}
                className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
              >
                <MapPin size={20} className="text-white" />
                <span className="font-medium text-white underline decoration-dotted text-shadow">{event.location}</span>
              </button>
            </div>

            {/* Faculty & Department */}
            {(event.faculty || event.department) && (
              <div className="mt-4 flex flex-wrap gap-3">
                {event.faculty && (
                  <span className="px-3 py-1 rounded-full bg-white/10 text-sm backdrop-blur-sm">
                    Faculty: {event.faculty}
                  </span>
                )}
                {event.department && (
                  <span className="px-3 py-1 rounded-full bg-white/10 text-sm backdrop-blur-sm">
                    Department: {event.department}
                  </span>
                )}
              </div>
            )}
          </div>
          {!event.titleImage && (
            <>
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 rounded-full bg-black/10 blur-3xl"></div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Attachments Section */}
            {displayAttachments.length > 0 && (
              <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Paperclip className="text-blue-500" size={24} />
                  Attachments
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {displayAttachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={getImageUrl(attachment.url) || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex flex-col bg-slate-50 border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="aspect-video w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                        {attachment.fileType === "image" ? (
                          <img
                            src={getImageUrl(attachment.url) || ""}
                            alt={attachment.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <FileText size={40} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                        )}
                      </div>
                      <div className="p-3 bg-white border-t border-slate-100 flex-1 flex flex-col justify-center">
                        <p className="text-sm font-medium text-slate-700 truncate" title={attachment.name}>
                          {attachment.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {attachment.size > 0 ? `${(attachment.size / 1024).toFixed(1)} KB` : "View file"}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* About Section */}
            <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Info className="text-blue-500" size={24} />
                About this Event
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                {event.description}
              </p>
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-500">
                <p>
                  Please arrive 15 minutes early for check-in. Don't forget to
                  bring your student ID.
                </p>
              </div>
            </section>

            {/* Organizer Section */}
            <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 className="text-blue-500" size={24} />
                Organizer
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {organizerName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-lg text-slate-900">
                    {organizerName}
                  </p>
                  <p className="text-slate-500">
                    Contact: {(typeof event.organizer !== 'string' && event.organizer?.contact) || event.author?.email || "events@university.edu"}
                  </p>
                </div>
              </div>
            </section>

            {/* Reviews Section */}
            <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="text-blue-500" size={24} />
                  Reviews
                  {reviews.length > 0 && (
                    <span className="text-sm font-normal text-slate-500">({reviews.length})</span>
                  )}
                </h2>

                {canReview && !userHasReviewed && !showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Write a Review
                  </button>
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-slate-900">Your Review</h3>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <X size={18} className="text-slate-500" />
                    </button>
                  </div>

                  {/* Star Rating */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            size={28}
                            className={star <= newRating ? "text-amber-500" : "text-slate-300"}
                            fill={star <= newRating ? "currentColor" : "none"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Comment (optional)
                    </label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      maxLength={500}
                      rows={3}
                      placeholder="Share your experience..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">{newComment.length}/500</p>
                  </div>

                  {reviewError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                      {reviewError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}

              {/* Reviews List */}
              {reviewsLoading ? (
                <div className="text-center py-8 text-slate-500">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-medium text-slate-600">
                            {review.user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{review.user.name}</p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={14}
                                  className={star <= review.rating ? "text-amber-500" : "text-slate-300"}
                                  fill={star <= review.rating ? "currentColor" : "none"}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                          {currentUser?.id === review.user.id && (
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="p-1 hover:bg-red-100 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-slate-600 mt-2">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sticky top-8">
              <div className="mb-6 text-center">
                <p className="text-sm text-slate-500 mb-1">Availability</p>
                <div className="flex items-center justify-center gap-2">
                  <Users size={24} className="text-slate-400" />
                  <span className="text-3xl font-bold text-slate-900">
                    {event.capacity - event.attendees}
                  </span>
                  <span className="text-slate-400 text-lg font-medium">
                    / {event.capacity} left
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${event.isRegistered ? "bg-green-500" : "bg-blue-600"}`}
                    style={{
                      width: `${(event.attendees / event.capacity) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3">
                {registrationError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                    {registrationError}
                  </div>
                )}

                {currentUser && ["organizer", "admin"].includes(currentUser.role) ? (
                  <div className="w-full py-3.5 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 text-center font-medium">
                    This action is not available for {currentUser.role}s
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleRegistration}
                      disabled={registrationLoading || event.capacity - event.attendees <= 0}
                      className={`w-full py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${event.isRegistered
                        ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                    >
                      {registrationLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {event.isRegistered ? "Unregistering..." : "Registering..."}
                        </>
                      ) : event.isRegistered ? (
                        <>
                          <CheckCircle2 size={20} /> Registered
                        </>
                      ) : (
                        "Register Now"
                      )}
                    </button>

                    {/* Favorite Button */}
                    {currentUser && (
                      <button
                        onClick={handleFavorite}
                        disabled={favoriteLoading}
                        className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${event.isFavorited
                          ? "bg-pink-100 text-pink-600 border border-pink-200 hover:bg-pink-200"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-pink-200 hover:text-pink-600"
                          }`}
                      >
                        <Heart size={18} fill={event.isFavorited ? "currentColor" : "none"} />
                        {event.isFavorited ? "Saved to Favorites" : "Add to Favorites"}
                      </button>
                    )}
                  </>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleGetDirections}
                    className="py-2.5 rounded-xl font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Navigation size={16} /> Directions
                  </button>
                  <button
                    onClick={handleShare}
                    className="py-2.5 rounded-xl font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Share2 size={16} /> Share
                  </button>
                </div>

                <button
                  onClick={handleOpenMap}
                  className="w-full py-2.5 rounded-xl font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <ExternalLink size={16} /> View on Maps
                </button>
              </div>

              {/* Ticket Section */}
              {event.isRegistered && (
                <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-xl space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="p-1 bg-green-100 rounded-full text-green-600 shrink-0">
                      <Check size={14} />
                    </div>
                    <div className="text-xs text-green-800">
                      <p className="font-bold mb-0.5">You are going!</p>
                      <p>
                        A confirmation email has been sent to your inbox.
                      </p>
                    </div>
                  </div>

                  {event.ticketCode && (
                    <div className="pt-3 border-t border-green-200">
                      <p className="text-xs text-green-700 font-medium mb-2">Your Ticket Code:</p>
                      <code className="block bg-white border border-green-200 rounded-lg px-3 py-2 text-sm font-mono text-green-900 text-center tracking-wider mb-3">
                        {event.ticketCode}
                      </code>

                      {/* QR Code */}
                      {qrCodeUrl && (
                        <div className="flex flex-col items-center">
                          <img
                            src={qrCodeUrl}
                            alt="Ticket QR Code"
                            className="w-32 h-32 rounded-lg border border-green-200"
                          />
                          <p className="text-xs text-green-600 mt-2">Scan to check in</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}