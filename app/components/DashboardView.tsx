import { Calendar, CheckCircle2, Users, Clock, Heart } from "lucide-react";
import Event from "../types/event";
import { User } from "../types/user";
import StatCard from "./StatCard";
import { getCategoryStyles } from "../utils/categoryStyles";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

function DashboardView({
  currentUser,
  events,
  createdEvents = [],
  registeredCount,
  toEvents,
  toCreateEvent,
  onEventClick,
}: {
  currentUser: User;
  events: Event[];
  createdEvents?: any[];
  registeredCount: number;
  toEvents: () => void;
  toCreateEvent: () => void;
  onEventClick: (id: string) => void;
}) {
  const unregisteredEvents = events.filter((e) => !e.isRegistered);
  const nextUnregisteredEvent =
    unregisteredEvents.length > 0 ? unregisteredEvents[0] : null;

  const isStudent = ["simple_user", "student", "student_rep"].includes(currentUser.role);
  const isOrganizer = ["organizer", "admin"].includes(currentUser.role);

  const myEvents = isOrganizer
    ? createdEvents
    : events.filter(e => e.isRegistered);

  const nextUpEvents = myEvents.filter(e => new Date(e.date) >= new Date()).slice(0, 3);

  const welcomeMessage = isOrganizer
    ? "Manage your events and track attendance."
    : unregisteredEvents.length > 0
      ? `There ${unregisteredEvents.length === 1 ? "is" : "are"} ${unregisteredEvents.length} new ${unregisteredEvents.length === 1 ? "event" : "events"} available for you to join.`
      : "You're all caught up! No new events at the moment.";

  const favoritedCount = events.filter((e) => e.isFavorited).length;

  const thirdStatLabel = isOrganizer ? "Events Created" : "Favorite Events";
  const thirdStatValue = isOrganizer
    ? myEvents.length.toString()
    : favoritedCount.toString();

  const nextUpTitle = isOrganizer ? "Your Upcoming Events" : "Next Up For You";
  const emptyStateMessage = isOrganizer ? "You haven't created any upcoming events." : "No upcoming registrations.";

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-10 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
            Welcome back, {currentUser.name}!
          </h2>
          <p className="text-blue-100 mb-8 max-w-lg text-base md:text-lg leading-relaxed">
            {welcomeMessage}
            {isStudent && nextUnregisteredEvent && (
              <>
                <br />
                {`Don't miss the ${nextUnregisteredEvent.title}!`}
              </>
            )}
          </p>
          <Button onClick={isOrganizer ? toCreateEvent : toEvents} variant="secondary">
            {isOrganizer ? "Manage Events" : "Find Events"}
          </Button>
        </div>
        <div className="absolute right-0 top-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-indigo-500 opacity-20 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={<Calendar className="text-blue-600" size={24} />}
          label="Total Active Events"
          value={events.length.toString()}
        />
        {isStudent && (
          <StatCard
            icon={<CheckCircle2 className="text-green-600" size={24} />}
            label="Registrations"
            value={registeredCount.toString()}
          />
        )}
        <StatCard
          icon={
            isOrganizer ? (
              <Users className="text-purple-600" size={24} />
            ) : (
              <Heart className="text-red-500" size={24} />
            )
          }
          label={thirdStatLabel}
          value={thirdStatValue}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8">
          <h3 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
              <Clock size={20} />
            </div>
            {nextUpTitle}
          </h3>
          {nextUpEvents.length > 0 ? (
            <div className="space-y-4">
              {nextUpEvents.map((event: Event) => {
                const colorMap: Record<string, string> = {
                  blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
                  purple:
                    "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
                  orange:
                    "bg-orange-50 text-orange-600 group-hover:bg-orange-100",
                  indigo:
                    "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100",
                  green:
                    "bg-green-50 text-green-600 group-hover:bg-green-100",
                };
                const color = getCategoryStyles(event.category).color;
                const colorClasses = colorMap[color] || colorMap.green;

                return (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event.id)}
                    className="flex items-center gap-5 p-4 border border-slate-100 hover:border-blue-200 cursor-pointer hover:bg-blue-50/30 rounded-2xl transition-all group"
                  >
                    <div
                      className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-sm font-bold shrink-0 transition-colors ${colorClasses}`}
                    >
                      <span>{new Date(event.date).getDate()}</span>
                      <span className="uppercase text-[10px] font-extrabold opacity-70">
                        {new Date(event.date).toLocaleString("default", {
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 line-clamp-1 text-lg group-hover:text-blue-700 transition-colors">
                        {event.title}
                      </h4>
                      <p className="text-sm text-slate-500 font-medium mt-0.5">
                        {event.time} • {event.location}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">
                {emptyStateMessage}
              </p>
              <Button
                onClick={isOrganizer ? toCreateEvent : toEvents}
                variant="ghost"
                className="text-blue-600 hover:bg-transparent hover:underline p-0 h-auto mt-2"
              >
                {isOrganizer ? "Create Event" : "Browse events"}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default DashboardView;
