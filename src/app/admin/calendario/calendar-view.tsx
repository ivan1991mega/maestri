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
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch(`/api/lessons?month=${month}`)
      .then((r) => r.json())
      .then((d) => setLessons(d.lessons || []));
  }, [month]);

  const instructors = useMemo(() => {
    const map = new Map<string, string>();
    lessons.forEach((l) => map.set(l.user.id, l.user.name));
    return Array.from(map.entries());
  }, [lessons]);

  const colorOf = (id: string) => {
    const idx = instructors.findIndex(([i]) => i === id);
    return COLORS[idx % COLORS.length];
  };

  const [year, mon] = month.split("-").map(Number);
  const first = new Date(year, mon - 1, 1);
  const startWeekday = (first.getDay() + 6) % 7; // lunedì
  const daysInMonth = new Date(year, mon, 0).getDate();
  const cells = Array.from({ length: startWeekday + daysInMonth }, (_, i) =>
    i < startWeekday ? null : i - startWeekday + 1
  );

  const byDay = (day: number) =>
    lessons.filter((l) => {
      const d = new Date(l.startAt);
      if (filter && l.user.id !== filter) return false;
      return d.getDate() === day && d.getMonth() === mon - 1 && d.getFullYear() === year;
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <label className="text-sm">
          Mese
          <input
            className="mt-1"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </label>
        <label className="text-sm">
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

      <div className="card overflow-x-auto">
        <div className="min-w-[640px]">
        <div className="grid grid-cols-7 bg-ice-100 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((d) => (
            <div key={d} className="px-2 py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => (
            <div key={i} className="min-h-24 sm:min-h-28 border-t border-r border-slate-100 dark:border-slate-800 p-1.5 align-top">
              {day && (
                <>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mb-1">{day}</div>
                  <div className="space-y-1">
                    {byDay(day).map((l) => (
                      <div
                        key={l.id}
                        className={`rounded-md px-1.5 py-1 text-[11px] leading-tight ${colorOf(l.user.id)}`}
                      >
                        <div className="font-medium truncate">{l.user.name}</div>
                        <div>
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
    </div>
  );
}
