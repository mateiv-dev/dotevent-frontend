import { Search, Calendar, MapPin, Users, Filter, Heart, Star, ChevronLeft, ChevronRight, Grid, CalendarDays, Check } from "lucide-react";
import { useState } from "react";
import Event from "../types/event";
import { useApp } from "../context/AppContext";
import { getCategoryStyles } from "../utils/categoryStyles";
import { getImageUrl } from "../utils/imageUtils";
import { useTranslation } from "../hooks/useTranslation";

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
  const { t } = useTranslation();

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
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-blue-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder={t("eventList.searchPlaceholder")}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm hover:shadow-md focus:shadow-lg"
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
              <option value="All Categories">{t("eventList.allCategories")}</option>
              <option value="Academic">{t("eventList.category.academic")}</option>
              <option value="Social">{t("eventList.category.social")}</option>
              <option value="Sports">{t("eventList.category.sports")}</option>
              <option value="Career">{t("eventList.category.career")}</option>
            </select>
            <div className="w-full h-full px-4 py-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-3">
              <Filter className="text-[var(--muted-foreground)] shrink-0" size={20} />
              <span className="truncate">
                {selectedCategory === "All Categories"
                  ? t("eventList.allCategories")
                  : t(`eventList.category.${selectedCategory.toLowerCase()}` as any) || selectedCategory}
              </span>
              <svg className="ml-auto text-[var(--muted-foreground)] shrink-0" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-3 flex items-center gap-2 transition-colors ${viewMode === "grid" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]"}`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-3 flex items-center gap-2 transition-colors ${viewMode === "calendar" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]"}`}
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
                : "bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)] hover:border-pink-200 hover:text-pink-600"
                }`}
            >
              <Heart size={16} fill={showFavoritesOnly ? "currentColor" : "none"} />
              {t("eventList.favorites")}
            </button>
          )}

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all shrink-0 font-medium ${showAdvancedFilters
              ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
              : "bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] shadow-sm"
              }`}
          >
            <Filter size={18} />
            <span className="hidden sm:inline">{t("eventList.advancedFilters")}</span>
            {Object.values(filters).filter(v => v).length > 0 && (
              <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {Object.values(filters).filter(v => v).length}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
            >
              {t("eventList.clearAll")}
            </button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-lg shadow-blue-500/5 animate-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[var(--foreground)] flex items-center gap-2">
                <Filter size={20} className="text-blue-500" />
                {t("eventList.advancedFilters")}
              </h3>
              <button
                onClick={() => {
                  setFilters({});
                  setSelectedCategory("All Categories");
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                {t("eventList.clearAll")}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                  {t("eventList.faculty")}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Engineering"
                  className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-[var(--foreground)] placeholder-[var(--muted-foreground)]"
                  value={filters.faculty || ""}
                  onChange={(e) => setFilters({ ...filters, faculty: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                  {t("eventList.department")}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-[var(--foreground)] placeholder-[var(--muted-foreground)]"
                  value={filters.department || ""}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                  {t("eventList.location")}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Room EC105"
                  className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-[var(--foreground)] placeholder-[var(--muted-foreground)]"
                  value={filters.location || ""}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                  {t("eventList.organizer")}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-[var(--foreground)] placeholder-[var(--muted-foreground)]"
                  value={filters.organizer || ""}
                  onChange={(e) => setFilters({ ...filters, organizer: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                  {t("eventList.fromDate")}
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-[var(--foreground)]"
                  value={filters.startDate || ""}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                  {t("eventList.toDate")}
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-[var(--foreground)]"
                  value={filters.endDate || ""}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-[var(--card)] rounded-2xl border border-dashed border-[var(--border)] animate-in fade-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-[var(--secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-[var(--muted-foreground)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">{t("eventList.noEventsTitle")}</h3>
          <p className="text-[var(--muted-foreground)] max-w-md mx-auto mb-6">
            {t("eventList.noEventsDesc")}
          </p>
          <button
            onClick={clearAllFilters}
            className="mt-6 text-blue-600 font-semibold hover:text-blue-700 cursor-pointer"
          >
            {t("eventList.clearFilters")}
          </button>
        </div>
      ) : viewMode === "calendar" ? (
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-7 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)]">
            {/* Sidebar List */}
            <div className="lg:col-span-2 bg-[var(--muted)] p-4 max-h-[600px] overflow-y-auto">
              <h3 className="font-bold text-[var(--foreground)] mb-4 flex items-center gap-2 sticky top-0 bg-[var(--muted)] py-2 z-10">
                <Calendar className="w-5 h-5 text-blue-600" />
                {t("eventList.today")}, {new Date().toLocaleDateString('default', { month: 'long', day: 'numeric' })}
              </h3>
              <div className="space-y-3">
                {filteredEvents
                  .filter(e => new Date(e.date).getDate() === new Date().getDate())
                  .length === 0 && (
                    <div className="text-center py-8 text-[var(--muted-foreground)]">
                      <p>{t("eventList.noEventsDesc")}</p>
                    </div>
                  )}

                {filteredEvents
                  .filter(e => new Date(e.date).getDate() === new Date().getDate())
                  .map(event => (
                    <div key={event.id} onClick={() => onEventClick(event.id)} className="bg-[var(--card)] p-3 rounded-xl border border-[var(--border)] shadow-sm hover:shadow-md cursor-pointer group transition-all">
                      <div className="flex items-start justify-between mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getCategoryStyles(event.category).bg} ${getCategoryStyles(event.category).text}`}>
                          {event.time}
                        </span>
                      </div>
                      <h4 className="font-bold text-[var(--foreground)] line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm mb-1">{event.title}</h4>
                      <div className="flex items-center text-xs text-[var(--muted-foreground)]">
                        <MapPin size={10} className="mr-1" />
                        {event.location}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="lg:col-span-5 p-6 bg-[var(--card)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[var(--foreground)]">
                  {calendarDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1))}
                    className="p-2 hover:bg-[var(--accent)] rounded-lg transition-colors text-[var(--foreground)]"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCalendarDate(new Date())}
                    className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {t("eventList.today")}
                  </button>
                  <button
                    onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1))}
                    className="p-2 hover:bg-[var(--accent)] rounded-lg transition-colors text-[var(--foreground)]"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-sm font-bold text-[var(--muted-foreground)] uppercase">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {getDaysInMonth(calendarDate).map((day, index) => {
                  const dayEvents = day ? getEventsForDate(day) : [];
                  const isToday = day?.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={index}
                      className={`
                        min-h-[100px] p-1 border rounded-xl flex flex-col
                        ${day ? "bg-[var(--card)]" : "bg-[var(--muted)]"}
                        ${isToday ? "ring-2 ring-blue-500 border-blue-500" : "border-[var(--border)]"}
                      `}
                    >
                      {day && (
                        <>
                          <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : "text-[var(--foreground)]"}`}>
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
                              <div className="text-xs text-[var(--muted-foreground)] pl-1">{t("eventList.moreEvents", { count: dayEvents.length - 2 })}</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map((event, index) => {
            const categoryStyles = getCategoryStyles(event.category);
            return (
              <div
                key={event.id}
                onClick={() => onEventClick(event.id)}
                className="group bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer h-full animate-in fade-in zoom-in-95"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Image & Overlays */}
                <div className="relative h-48 overflow-hidden bg-[var(--muted)]">
                  {event.titleImage ? (
                    <img
                      src={getImageUrl(event.titleImage) || ""}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${categoryStyles.gradient}`}></div>
                  )}

                  {/* Category Badge */}
                  <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm z-10 backdrop-blur-md ${categoryStyles.bg} ${categoryStyles.text} border border-white/20`}>
                    {event.category}
                  </div>

                  {/* Favorite Button */}
                  {currentUser && !["organizer", "admin"].includes(currentUser.role) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(event.id);
                      }}
                      className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all z-10 ${event.isFavorited
                        ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30"
                        : "bg-white/90 dark:bg-slate-950/90 text-slate-700 dark:text-slate-300 border border-transparent hover:border-pink-200 dark:hover:border-pink-900 hover:text-pink-500 hover:bg-white dark:hover:bg-slate-900 shadow-sm"
                        }`}
                    >
                      <Heart size={16} fill={event.isFavorited ? "currentColor" : "none"} />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-[var(--foreground)] leading-tight mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-4 flex-1">
                    <div className="flex items-center text-sm text-[var(--muted-foreground)]">
                      <Calendar size={14} className="mr-2 shrink-0 opacity-70" />
                      <span className="truncate">
                        {new Date(event.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        • {event.time}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-[var(--muted-foreground)]">
                      <MapPin size={14} className="mr-2 shrink-0 opacity-70" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-[var(--muted-foreground)]">
                      <Users size={14} className="mr-2 shrink-0 opacity-70" />
                      <span>{t("eventList.attendees", { count: event.attendees || 0, capacity: event.capacity })}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-[var(--border)]">
                    {currentUser && ["organizer", "admin"].includes(currentUser.role) ? (
                      <div className="w-full py-2.5 rounded-xl text-sm font-medium text-[var(--muted-foreground)] text-center bg-[var(--muted)] border border-[var(--border)]">
                        {t("eventList.registrationUnavailable")}
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRegistration(event.id);
                        }}
                        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${event.isRegistered
                          ? "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20"
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30"
                          }`}
                      >
                        {event.isRegistered ? (
                          <>
                            <Check size={16} />
                            <span>{t("eventList.registered")}</span>
                          </>
                        ) : (
                          t("eventList.registerNow")
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default EventListView;