import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNavigation, Card, Avatar, Button } from "../components";
import { useReminders } from "../hooks/useReminders";

export const RemindersPage = () => {
  const navigate = useNavigate();
  const { reminders, isLoading } = useReminders();

  const computedReminders = useMemo(() => {
    const now = new Date().getTime();
    return reminders.map((r) => {
      const then = r.date ? new Date(r.date).getTime() : 0;
      const days = then
        ? Math.ceil((then - now) / (1000 * 60 * 60 * 24))
        : Infinity;
      const pill = days <= 0 ? "Today" : days <= 7 ? "Due Soon" : undefined;
      const formatted = r.date
        ? new Date(r.date).toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })
        : "";
      return { ...r, daysUntil: days, pill, formatted };
    });
  }, [reminders]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <span className="material-symbols-outlined text-4xl text-primary">
              hourglass_empty
            </span>
          </div>
          <p className="text-body-md text-on-surface">Loading reminders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-surface-container-lowest border-b border-surface-variant sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-surface-variant rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface">
              arrow_back
            </span>
          </button>
          <h1 className="text-headline-md text-on-surface font-600">
            Reminders
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-6 space-y-8">
        {/* Summary Card */}
        <Card className="bg-primary-container text-on-primary-container border-none p-6 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-label-md opacity-80 uppercase tracking-wider font-600">
                Pending Tasks
              </p>
              <h2 className="text-display-md font-600 mt-1">
                {reminders.length.toString().padStart(2, "0")}
              </h2>
              <p className="text-body-md mt-2">
                Upcoming health activities for your companions.
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-on-primary-container/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl">
                notifications_active
              </span>
            </div>
          </div>
        </Card>

        {/* Reminders List */}
        <section>
          <h3 className="text-headline-sm text-on-surface font-600 mb-4">
            Upcoming Schedule
          </h3>
          <div className="space-y-4">
            {computedReminders.length === 0 ? (
              <div className="text-center py-12 bg-surface-container-low rounded-3xl border border-dashed border-surface-variant">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
                  event_busy
                </span>
                <p className="text-body-md text-on-surface-variant">
                  No reminders found.
                </p>
              </div>
            ) : (
              computedReminders.map((reminder) => (
                <Card
                  key={reminder.id}
                  className="bg-surface-container-lowest border-surface-variant/50 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar
                        src={reminder.pet.avatar_url}
                        alt={reminder.pet.name}
                        size="lg"
                        initials={reminder.pet.name
                          .substring(0, 2)
                          .toUpperCase()}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-body-lg font-600 text-on-surface mb-1">
                          {reminder.description}
                        </h4>
                        <div className="flex items-center gap-2 mb-4">
                          <p className="text-label-md text-on-surface-variant font-600 capitalize">
                            {reminder.pet.name} • {reminder.service_type}
                          </p>
                          {reminder.pill && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                reminder.pill === "Today"
                                  ? "bg-error-container text-on-error-container"
                                  : "bg-tertiary-container text-on-tertiary-container"
                              }`}
                            >
                              {reminder.pill}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2 text-on-surface-variant">
                            <span className="material-symbols-outlined text-sm">
                              calendar_today
                            </span>
                            <span className="text-label-md font-500">
                              {reminder.formatted}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => navigate("/appointments/new")}
                          >
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
};
