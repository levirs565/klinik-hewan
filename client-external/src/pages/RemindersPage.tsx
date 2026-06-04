import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNavigation, Card } from "../components";
import { usePets } from "../hooks/usePets";
import { useReminders } from "../hooks/useReminders";

export const RemindersPage = () => {
  const navigate = useNavigate();
  const { pets } = usePets();
  const { reminders } = useReminders();

  const computedReminders = useMemo(() => {
    // To maintain purity, we avoid calling Date.now() directly inside useMemo if possible,
    // but in practice for "relative time" we need a reference.
    // We'll use a fixed reference point or just accept it as it's a UI derivation.
    // However, to satisfy the linter, we can move it outside or use a trick.
    const now = new Date().getTime();
    return reminders.map((r) => {
      const then = r.scheduled_date ? new Date(r.scheduled_date).getTime() : 0;
      const days = then
        ? Math.ceil((then - now) / (1000 * 60 * 60 * 24))
        : Infinity;
      const pill = days <= 0 ? "Today" : days <= 7 ? "Due Soon" : undefined;
      const formatted = r.scheduled_date
        ? new Date(r.scheduled_date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "";
      return { ...r, daysUntil: days, pill, formatted };
    });
  }, [reminders]);

  const findPetName = (petId: number) =>
    pets.find((p) => p.id === petId)?.name ?? "Unknown";

  const vaccinations = computedReminders.filter((r) =>
    /vaccine|rabies|vaksin/i.test(r.title),
  );
  const medications = computedReminders.filter((r) =>
    /pill|med|daily|apoquel|medication|heartworm|worm/i.test(r.title),
  );
  const general = computedReminders.filter(
    (r) => !vaccinations.includes(r) && !medications.includes(r),
  );

  const countVacc = vaccinations.length;
  const countMed = medications.length;

  const formatDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "";

  return (
    <div className="min-h-screen bg-[#f7fbff] pb-24">
      <header className="bg-white border-b border-[#e9eef3] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#d9f8e8] text-[#0f4d35] shadow-sm">
            <span className="material-symbols-outlined text-xl">person</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#122f48]">Reminders</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 gap-5">
          <Card className="bg-[#0f4d35] border border-[#0b3a28] p-6 shadow-none rounded-[28px] text-white">
            <div className="grid gap-5 sm:grid-cols-[1.9fr_1fr] sm:items-center">
              <div>
                <p className="text-sm font-medium text-[#95d6a6]">
                  Total Outstanding
                </p>
                <h2 className="text-[3rem] font-semibold text-white mt-2">
                  {reminders.length.toString().padStart(2, "0")}
                </h2>
                <p className="text-sm leading-6 text-[#d0f0d6] mt-3">
                  Your pets have {countVacc} vaccinations and {countMed}{" "}
                  medications due this week.
                </p>
              </div>
              <div className="rounded-[28px] bg-[#0f4d35]/80 border border-[#0b3a28] p-5 text-center">
                <p className="text-sm text-[#95d6a6]">Compliance Score</p>
                <div className="mt-4 inline-flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#0b3a28] text-[1.8rem] font-semibold text-[#95d6a6]">
                  92%
                </div>
              </div>
            </div>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-2xl font-semibold text-[#122f48]">
                Vaccinations
              </h3>
              <span className="text-sm font-medium text-[#7f9cb4]">
                View Schedule
              </span>
            </div>
            <div className="space-y-4">
              {vaccinations.map((r) => {
                const pill = r.pill;
                return (
                  <Card
                    key={r.id}
                    className="flex flex-col gap-4 rounded-[28px] border border-[#dce7f8] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#f0f6ff] text-2xl">
                        🐶
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-semibold text-[#122f48]">
                            {findPetName(r.pet_id)}
                          </p>
                          {pill && (
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${pill === "Today" ? "bg-[#fbe6e8] text-[#b72832]" : "bg-[#ffeed7] text-[#9b5c08]"}`}
                            >
                              {pill}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-[#496273]">{r.title}</p>
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#f4f8ff] px-3 py-2 text-sm text-[#496273]">
                          <span className="material-symbols-outlined text-sm">
                            calendar_month
                          </span>
                          <span>
                            {r.formatted ?? formatDate(r.scheduled_date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("/appointments/new")}
                      className="w-full rounded-[24px] bg-[#0f4d35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#113e30] sm:w-auto"
                    >
                      Book Now
                    </button>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-2xl font-semibold text-[#122f48]">
                Medications
              </h3>
              <span className="text-sm font-medium text-[#7f9cb4]">
                Manage All
              </span>
            </div>
            <div className="overflow-hidden rounded-[28px] border border-[#cfe0ff] bg-[#eef6ff]">
              <div className="grid grid-cols-12 gap-2 border-b border-[#cfe0ff] px-5 py-4 text-sm font-semibold text-[#486378]">
                <div className="col-span-4">PET</div>
                <div className="col-span-6">MEDICATION</div>
                <div className="col-span-2 text-right">DUE</div>
              </div>
              <div className="divide-y divide-[#dce7f8]">
                {medications.map((r) => (
                  <div
                    key={r.id}
                    className="grid grid-cols-12 gap-2 px-5 py-4 items-center bg-[#eef6ff]"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[18px] bg-[#f0f6ff] text-lg">
                        🐶
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#122f48]">
                          {findPetName(r.pet_id)}
                        </div>
                        <div className="text-sm leading-5 text-[#486378]">
                          {r.description}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-6 text-sm text-[#122f48]">
                      {r.title}
                    </div>
                    <div className="col-span-2 text-right text-sm text-[#486378]">
                      {r.formatted ?? formatDate(r.scheduled_date)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-[#122f48] mb-3">
              General Checkups
            </h3>
            <div className="space-y-4">
              {general.map((r) => (
                <Card
                  key={r.id}
                  className="flex items-center justify-between gap-4 rounded-[28px] border border-[#dce7f8] p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#eff7ff] text-2xl">
                      <span className="material-symbols-outlined text-[#0f4d35]">
                        medical_services
                      </span>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[#122f48]">
                        {r.title}
                      </p>
                      <p className="text-sm text-[#486378]">
                        Recommended for {findPetName(r.pet_id)}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-[#486378]">
                    {r.formatted ?? formatDate(r.scheduled_date)}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};
