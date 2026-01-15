import { Search, Calendar, MapPin, Users, Filter, Heart, Star, ChevronLeft, ChevronRight, Grid, CalendarDays } from "lucide-react";
import { useState } from "react";
import Event from "../types/event";
import { useApp } from "../context/AppContext";
import { getCategoryStyles } from "../utils/categoryStyles";
import { getImageUrl } from "../utils/imageUtils";

function EventListView({
  events,
  searchTerm,
  setSearchTerm,
  toggleRegistration,
  onEventClick,
}: {
  events: Event[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  toggleRegistration: (id: string) => void;
  onEventClick: (id: string) => void;
}) {
  const {
    selectedCategory,
    setSelectedCategory,
    toggleFavorite,
    showFavoritesOnly,
    setShowFavoritesOnly,
    filters,
    setFilters,
    currentUser
  } = useApp();

  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const filteredEvents = events.filter((event) => {
    const matchesSearch = !searchTerm ||
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "All Categories" || event.category === selectedCategory;

    const matchesFavorites = !showFavoritesOnly || event.isFavorited;

    const matchesFaculty = !filters.faculty || event.faculty?.toLowerCase().includes(filters.faculty.toLowerCase());
    const matchesDepartment = !filters.department || event.department?.toLowerCase().includes(filters.department.toLowerCase());
    const matchesLocation = !filters.location || event.location.toLowerCase().includes(filters.location.toLowerCase());

    const organizerName = typeof event.organizer === 'string'
      ? event.organizer
      : (event.organizer?.represents || event.organizer?.organizationName || "");

    const matchesOrganizer = !filters.organizer || organizerName.toLowerCase().includes(filters.organizer.toLowerCase());

    const eventDate = new Date(event.date);
    const matchesStartDate = !filters.startDate || eventDate >= new Date(filters.startDate);
    const matchesEndDate = !filters.endDate || eventDate <= new Date(filters.endDate);

    return matchesSearch && matchesCategory && matchesFavorites &&
      matchesFaculty && matchesDepartment && matchesLocation &&
      matchesOrganizer && matchesStartDate && matchesEndDate;
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const handleFavoriteClick = async (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    if (!currentUser) return;
    try {
      await toggleFavorite(eventId);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All Categories");
    setShowFavoritesOnly(false);
    setFilters({});
  };

  const hasActiveFilters = searchTerm || selectedCategory !== "All Categories" ||
    showFavoritesOnly || Object.values(filters).some(v => v);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Search and Primary Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search events by title, category, or location..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm hover:shadow-md focus:shadow-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Select */}
          <div className="relative min-w-[180px]">
            <select
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option>All Categories</option>
              <option>Academic</option>
              <option>Social</option>
              <option>Sports</option>
              <option>Career</option>
            </select>
            <div className="w-full h-full px-4 py-4 rounded-2xl border border-slate-200 bg-white text-slate-700 font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-3">
              <Filter className="text-slate-400 shrink-0" size={20} />
              <span className="truncate">{selectedCategory}</span>
              <svg className="ml-auto text-slate-400 shrink-0" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-3 flex items-center gap-2 transition-colors ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-3 flex items-center gap-2 transition-colors ${viewMode === "calendar" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <CalendarDays size={20} />
            </button>
          </div>
        </div>

        {/* Secondary Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Favorites Toggle */}
          {currentUser && !["organizer", "admin"].includes(currentUser.role) && (
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all ${showFavoritesOnly
                ? "bg-pink-100 text-pink-600 border border-pink-200"
                : "bg-white text-slate-600 border border-slate-200 hover:border-pink-200 hover:text-pink-600"
                }`}
            >
              <Heart size={16} fill={showFavoritesOnly ? "currentColor" : "none"} />
              Favorites
            </button>
          )}

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all ${showAdvancedFilters || Object.values(filters).some(v => v)
              ? "bg-blue-100 text-blue-600 border border-blue-200"
              : "bg-white text-slate-600 border border-slate-200 hover:border-blue-200 hover:text-blue-600"
              }`}
          >
            <Filter size={16} />
            Advanced Filters
            {Object.values(filters).filter(v => v).length > 0 && (
              <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {Object.values(filters).filter(v => v).length}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Faculty</label>
                <input
                  type="text"
                  placeholder="Filter by faculty..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={filters.faculty || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, faculty: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  placeholder="Filter by department..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={filters.department || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Filter by location..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={filters.location || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Organizer</label>
                <input
                  type="text"
                  placeholder="Filter by organizer..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={filters.organizer || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, organizer: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={filters.startDate || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={filters.endDate || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Search size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No events found</h3>
          <p className="text-slate-500 max-w-sm">
            We couldn't find any events matching your criteria. Try adjusting your filters.
          </p>
          <button
            onClick={clearAllFilters}
            className="mt-6 text-blue-600 font-semibold hover:text-blue-700 cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : viewMode === "calendar" ? (
        /* Calendar View */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">
              {calendarDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1))}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCalendarDate(new Date())}
                className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1))}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
                {day}
              </div>
            ))}
            {getDaysInMonth(calendarDate).map((day, index) => {
              const dayEvents = day ? getEventsForDate(day) : [];
              const isToday = day?.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-1 border border-slate-100 rounded-lg ${day ? "bg-white" : "bg-slate-50"
                    } ${isToday ? "ring-2 ring-blue-500" : ""}`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : "text-slate-700"}`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <button
                            key={event.id}
                            onClick={() => onEventClick(event.id)}
                            className={`w-full text-left text-xs px-1.5 py-0.5 rounded truncate ${getCategoryStyles(event.category).bg} ${getCategoryStyles(event.category).text}`}
                          >
                            {event.title}
                          </button>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-slate-500 pl-1">+{dayEvents.length - 2} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event: Event) => (
            <div
              key={event.id}
              onClick={() => onEventClick(event.id)}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer h-full"
            >
              <div className="h-48 relative overflow-hidden group-hover:opacity-90 transition-opacity bg-slate-100">
                {event.titleImage ? (
                  <img
                    src={getImageUrl(event.titleImage) || ""}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryStyles(event.category).gradient}`}></div>
                )}

                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 uppercase tracking-wide shadow-sm z-10">
                  {event.category}
                </div>

                {/* Favorite Button */}
                {currentUser && !["organizer", "admin"].includes(currentUser.role) && (
                  <button
                    onClick={(e) => handleFavoriteClick(e, event.id)}
                    className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all z-10 ${event.isFavorited
                      ? "bg-pink-500 text-white"
                      : "bg-white/80 text-slate-400 hover:text-pink-500"
                      }`}
                  >
                    <Heart size={16} fill={event.isFavorited ? "currentColor" : "none"} />
                  </button>
                )}

                {/* Rating Badge */}
                {event.averageRating && event.averageRating > 0 && (
                  <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm z-10">
                    <Star size={12} className="text-amber-500" fill="currentColor" />
                    <span className="text-xs font-bold text-slate-700">{event.averageRating.toFixed(1)}</span>
                    <span className="text-xs text-slate-500">({event.reviewCount})</span>
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-bold text-xl text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-3">
                  {event.title}
                </h3>

                <div className="space-y-2.5 text-sm text-slate-500 mb-4 flex-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                      <Calendar size={16} />
                    </div>
                    <span className="font-medium text-slate-700">
                      {new Date(event.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      • {event.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                      <MapPin size={16} />
                    </div>
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                      <Users size={16} />
                    </div>
                    <span>
                      {event.attendees} / {event.capacity} attendees
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100">
                  {currentUser && ["organizer", "admin"].includes(currentUser.role) ? (
                    <div className="w-full py-3 rounded-xl text-sm font-medium text-slate-400 text-center bg-slate-50 border border-slate-100">
                      Registration Unavailable
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRegistration(event.id);
                      }}
                      className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${event.isRegistered
                        ? "bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30"
                        }`}
                    >
                      {event.isRegistered ? (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>Registered</span>
                        </>
                      ) : (
                        "Register Now"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventListView;