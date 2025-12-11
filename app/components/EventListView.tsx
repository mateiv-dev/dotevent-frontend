import { Search, Calendar, MapPin, Users, Filter } from "lucide-react";
import Event from "../types/event";
import { useApp } from "../context/AppContext";
import { getCategoryStyles } from "../utils/categoryStyles";

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
  const { selectedCategory, setSelectedCategory } = useApp();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Search events by title or category..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm hover:shadow-md focus:shadow-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative min-w-[200px] h-full">
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

          <div className="w-full h-full px-4 py-4 rounded-2xl border border-slate-200 bg-white text-slate-700 font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <Filter className="text-slate-400 shrink-0" size={20} />
            <span className="truncate">{selectedCategory}</span>
            <div className="ml-auto lg:ml-0 text-slate-400 shrink-0">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.5 4.5L6 8L9.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Search size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            No events found
          </h3>
          <p className="text-slate-500 max-w-sm">
            We couldn't find any events matching your search criteria. Try
            adjusting your filters or search term.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All Categories");
            }}
            className="mt-6 text-blue-600 font-semibold hover:text-blue-700 cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event: Event) => (
            <div
              key={event.id}
              onClick={() => onEventClick(event.id)}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer h-full"
            >
              <div className="h-32 relative overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${getCategoryStyles(event.category).gradient}`}
                ></div>
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 uppercase tracking-wide shadow-sm">
                  {event.category}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-xl text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                    {event.title}
                  </h3>
                </div>

                <div className="space-y-3 text-sm text-slate-500 mb-6 flex-1">
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

                <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRegistration(event.id);
                    }}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      event.isRegistered
                        ? "bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30"
                    }`}
                  >
                    {event.isRegistered ? (
                      <>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Registered</span>
                      </>
                    ) : (
                      "Register Now"
                    )}
                  </button>
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
