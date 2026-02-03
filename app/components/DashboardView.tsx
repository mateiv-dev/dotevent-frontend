import { Calendar, CheckCircle2, Users, Clock, Heart, Ticket, QrCode } from "lucide-react";
import Event from "../types/event";
import { User } from "../types/user";
import StatCard from "./StatCard";
import { getCategoryStyles } from "../utils/categoryStyles";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import RecommendedEvents from "./RecommendedEvents";
import { useState } from "react";
import { useTranslation } from "../hooks/useTranslation";

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
  const { t } = useTranslation();
  const [selectedTicket, setSelectedTicket] = useState<Event | null>(null);

  const unregisteredEvents = events.filter((e) => !e.isRegistered);
  const nextUnregisteredEvent =
    unregisteredEvents.length > 0 ? unregisteredEvents[0] : null;

  const isStudent = ["simple_user", "student", "student_rep"].includes(currentUser.role);
  const isOrganizer = ["organizer", "admin"].includes(currentUser.role);

  const myEvents = isOrganizer
    ? createdEvents
    : events.filter(e => e.isRegistered);

  const myTickets = events.filter(e => e.isRegistered && e.ticketCode).slice(0, 3);

  const nextUpEvents = myEvents.filter(e => new Date(e.date) >= new Date()).slice(0, 3);

  const welcomeMessage = isOrganizer
    ? t("dashboard.manageEventsDesc")
    : unregisteredEvents.length > 0
      ? t("dashboard.newEventsAvailable", { count: unregisteredEvents.length })
      : t("dashboard.allCaughtUp");

  const favoritedCount = events.filter((e) => e.isFavorited).length;

  const thirdStatLabel = isOrganizer ? t("dashboard.eventsCreated") : t("dashboard.favoriteEvents");
  const thirdStatValue = isOrganizer
    ? myEvents.length.toString()
    : favoritedCount.toString();

  const nextUpTitle = isOrganizer ? t("dashboard.yourUpcomingEvents") : t("dashboard.nextUp");
  const emptyStateMessage = isOrganizer ? t("dashboard.noCreatedEvents") : t("dashboard.noUpcomingEvents");

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-10 text-white shadow-lg shadow-blue-600/10 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
            {t("dashboard.welcome", { name: currentUser.name })}
          </h2>
          <div className="text-blue-100 mb-4 max-w-lg text-base md:text-lg leading-relaxed">
            {welcomeMessage}
            {isStudent && nextUnregisteredEvent && (
              <div>
                {t("dashboard.dontMiss", { title: nextUnregisteredEvent.title })}
              </div>
            )}
          </div>
          <Button onClick={isOrganizer ? toCreateEvent : toEvents} variant="secondary">
            {isOrganizer ? t("dashboard.manageEvents") : t("dashboard.findEvents")}
          </Button>
        </div>
        <div className="absolute right-0 top-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-indigo-500 opacity-20 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={<Calendar size={24} />}
          label={t("dashboard.totalActiveEvents")}
          value={events.length.toString()}
          iconClassName="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
        />
        {isStudent && (
          <StatCard
            icon={<CheckCircle2 size={24} />}
            label={t("dashboard.registrations")}
            value={registeredCount.toString()}
            iconClassName="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
          />
        )}
        <StatCard
          icon={
            isOrganizer ? (
              <Users size={24} />
            ) : (
              <Heart size={24} />
            )
          }
          label={thirdStatLabel}
          value={thirdStatValue}
          iconClassName={
            isOrganizer
              ? "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
              : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
          }
        />
      </div>

      {/* Recommendations Section - Only for students */}
      {isStudent && <RecommendedEvents onEventClick={onEventClick} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 bg-[var(--card)]">
          <h3 className="font-bold text-xl text-[var(--foreground)] mb-6 flex items-center gap-3">
            <div className="p-2 bg-[var(--secondary)] rounded-lg text-[var(--muted-foreground)]">
              <Clock size={20} />
            </div>
            {nextUpTitle}
          </h3>
          {nextUpEvents.length > 0 ? (
            <div className="space-y-4">
              {nextUpEvents.map((event: Event) => {
                const colorMap: Record<string, string> = {
                  blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:group-hover:bg-blue-900/30",
                  purple:
                    "bg-purple-50 text-purple-600 group-hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:group-hover:bg-purple-900/30",
                  orange:
                    "bg-orange-50 text-orange-600 group-hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:group-hover:bg-orange-900/30",
                  indigo:
                    "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:group-hover:bg-indigo-900/30",
                  green:
                    "bg-green-50 text-green-600 group-hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:group-hover:bg-green-900/30",
                };
                const color = getCategoryStyles(event.category).color;
                const colorClasses = colorMap[color] || colorMap.green;

                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--accent)] transition-all cursor-pointer group border border-transparent hover:border-[var(--border)]"
                    onClick={() => onEventClick(event.id)}
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
                      <h4 className="font-bold text-[var(--foreground)] line-clamp-1 text-lg group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                        {event.title}
                      </h4>
                      <p className="text-sm text-[var(--muted-foreground)] font-medium mt-0.5">
                        {event.time} • {event.location}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-[var(--muted)] rounded-2xl border border-dashed border-[var(--border)]">
              <p className="text-[var(--muted-foreground)] font-medium">
                {emptyStateMessage}
              </p>
              <Button
                onClick={isOrganizer ? toCreateEvent : toEvents}
                variant="ghost"
                className="text-blue-600 hover:bg-transparent hover:underline p-0 h-auto mt-2"
              >
                {isOrganizer ? t("dashboard.createEvent") : t("dashboard.browseEvents")}
              </Button>
            </div>
          )}
        </Card>

        {/* My Tickets Card - Only for students */}
        {isStudent && (
          <Card className="p-8 bg-[var(--card)]">
            <h3 className="font-bold text-xl text-[var(--foreground)] mb-6 flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                <Ticket size={20} />
              </div>
              {t("dashboard.myTickets")}
            </h3>
            {myTickets.length > 0 ? (
              <div className="space-y-4">
                {myTickets.map((event: Event) => (
                  <div
                    key={event.id}
                    className="p-4 bg-[var(--card)] shadow-sm hover:shadow-md border border-[var(--border)]/50 hover:border-purple-200 dark:hover:border-purple-700 cursor-pointer rounded-2xl transition-all group"
                    onClick={() => setSelectedTicket(selectedTicket?.id === event.id ? null : event)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[var(--foreground)] line-clamp-1 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                          {event.title}
                        </h4>
                        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </p>
                      </div>
                      <div className="ml-3 p-2 bg-[var(--secondary)] text-[var(--muted-foreground)] rounded-lg">
                        <QrCode size={20} />
                      </div>
                    </div>

                    {/* Expandable ticket details */}
                    {selectedTicket?.id === event.id && event.ticketCode && (
                      <div className="mt-4 pt-6 border-t border-[var(--border)] animate-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="text-center w-full">
                            <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-widest font-semibold mb-2">
                              {t("dashboard.yourTicketCode")}
                            </p>
                            <div className="bg-[var(--secondary)] rounded-xl py-3 px-4 w-full">
                              <code className="text-lg font-mono font-bold text-[var(--foreground)] tracking-[0.2em]">
                                {event.ticketCode}
                              </code>
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-xl shadow-sm">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(event.ticketCode)}`}
                              alt="Ticket QR Code"
                              className="w-32 h-32"
                            />
                          </div>

                          <p className="text-xs text-[var(--muted-foreground)]">
                            {t("dashboard.showTicket")}
                          </p>
                        </div>

                        <div className="mt-6 flex justify-center">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event.id);
                            }}
                            variant="secondary"
                            className="w-full text-sm"
                          >
                            {t("dashboard.viewEventDetails")}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[var(--muted)] rounded-2xl border border-dashed border-[var(--border)]">
                <Ticket className="mx-auto h-10 w-10 text-[var(--muted-foreground)] mb-3" />
                <p className="text-[var(--muted-foreground)] font-medium">
                  {t("dashboard.noTickets")}
                </p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1 opacity-70">
                  {t("dashboard.registerForTickets")}
                </p>
                <Button
                  onClick={toEvents}
                  variant="ghost"
                  className="text-purple-600 dark:text-purple-400 hover:bg-transparent hover:underline p-0 h-auto mt-2"
                >
                  {t("dashboard.browseEvents")}
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

export default DashboardView;
