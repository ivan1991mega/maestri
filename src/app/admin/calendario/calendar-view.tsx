"use client";

import { useEffect, useMemo, useState } from "react";

type Lesson = {
  id: string;
  startAt: string;
  endAt: string;
  breakMinutes: number;
  location: string;
  user: { id: string; name: string };
};

type UserOpt = { id: string; name: string; role: string };

const COLORS = [
  "bg-sky-100 text-sky-900 dark:bg-sky-900/50 dark:text-sky-100",
  "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100",
  "bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100",
  "bg-violet-100 text-violet-900 dark:bg-violet-900/50 dark:text-violet-100",
  "bg-rose-100 text-rose-900 dark:bg-rose-900/50 dark:text-rose-100",
];

export function AdminCalendar() {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [users, setUsers] = useState<UserOpt[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch(`/api/lessons?month=${month}`)
      .then((r) => r.json())
      .then((d) => setLessons(d.lessons || []));
  }, [month]);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => setUsers((d.users || []).filter((u: UserOpt) => u.role === "INSTRUCTOR")));
  }, []);

  const instructors = useMemo(() => {
    if (users.length) return users.map((u) => [u.id, u.name] as [string, string]);
    const map = new Map<string, string>();
    lessons.forEach((l) => map.set(l.user.id, l.user.name));
    return Array.from(map.entries());
  }, [users, lessons]);

  const colorOf = (id: string) => {
    const idx = instructors.findIndex(([i]) => i === id);
    return COLORS[(idx < 0 ? 0 : idx) % COLORS.length];
  };

  const [year, mon] = month.split("-").map(Number);
  const first = new Date(year, mon - 1, 1);
  const startWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, mon, 0).getDate();
  const cells = Array.from({ length: startWeekday + daysInMonth }, (_, i) =>
    i < startWeekday ? null : i - startWeekday + 1
  );

  const visible = lessons.filter((l) => !filter || l.user.id === filter);

  const byDay = (day: number) =>
    visible.filter((l) => {
      const d = new Date(l.startAt);
      return d.getDate() === day && d.getMonth() === mon - 1 && d.getFullYear() === year;
    });

  const daysWithLessons = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(
    (day) => byDay(day).length > 0
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <label className="text-sm block">
          Mese
          <input className="mt-1" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </label>
        <label className="text-sm block">
          Maestro
          <select className="mt-1" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Tutti</option>
            {instructors.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Mobile: lista per giorno, 7 colonne non ci stanno su iPhone */}
      <div className="space-y-3 sm:hidden">
        {daysWithLessons.length === 0 && (
          <div className="card p-5 text-sm text-slate-500 dark:text-slate-400">
            Nessuna lezione in questo mese.
          </div>
        )}
        {daysWithLessons.map((day) => (
          <div key={day} className="card p-3">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              {day}/{String(mon).padStart(2, "0")}/{year}
            </p>
            <div className="space-y-2">
              {byDay(day).map((l) => (
                <div key={l.id} className={`rounded-lg px-3 py-2 text-sm ${colorOf(l.user.id)}`}>
                  <div className="font-medium">{l.user.name}</div>
                  <div className="text-xs opacity-90">
                    {new Date(l.startAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                    {" – "}
                    {new Date(l.endAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                    {" · "}
                    {l.location}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop / tablet */}
      <div className="card overflow-hidden hidden sm:block">
        <div className="grid grid-cols-7 bg-ice-100 text-[11px] sm:text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((d) => (
            <div key={d} className="px-1 sm:px-2 py-2 text-center">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => (
            <div
              key={i}
              className="min-h-20 border-t border-r border-slate-100 dark:border-slate-800 p-1 align-top"
            >
              {day && (
                <>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mb-1">{day}</div>
                  <div className="space-y-1">
                    {byDay(day).map((l) => (
                      <div key={l.id} className={`rounded-md px-1 py-1 text-[10px] leading-tight ${colorOf(l.user.id)}`}>
                        <div className="font-medium truncate">{l.user.name}</div>
                        <div className="truncate">
                          {new Date(l.startAt).toLocaleTimeString("it-IT", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          {l.location}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
