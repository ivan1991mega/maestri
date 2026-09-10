"use client";

import { useEffect, useMemo, useState } from "react";
import { LessonForm } from "@/components/lesson-form";

type Lesson = {
  id: string;
  startAt: string;
  endAt: string;
  breakMinutes: number;
  location: string;
  notes: string | null;
};

function hours(l: Lesson) {
  const h =
    (new Date(l.endAt).getTime() - new Date(l.startAt).getTime()) / 36e5 -
    l.breakMinutes / 60;
  return Math.max(0, Math.round(h * 100) / 100);
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function InstructorBoard() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [editing, setEditing] = useState<Lesson | null>(null);

  async function load() {
    const res = await fetch(`/api/lessons?month=${month}`);
    const data = await res.json();
    setLessons(data.lessons || []);
  }

  useEffect(() => {
    load();
  }, [month]);

  const total = useMemo(() => lessons.reduce((s, l) => s + hours(l), 0), [lessons]);

  async function remove(id: string) {
    if (!confirm("Eliminare questa lezione?")) return;
    await fetch(`/api/lessons/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <LessonForm
        key={editing?.id || "new"}
        initial={
          editing
            ? {
                id: editing.id,
                startAt: toLocalInput(editing.startAt),
                endAt: toLocalInput(editing.endAt),
                breakMinutes: editing.breakMinutes,
                location: editing.location,
                notes: editing.notes,
              }
            : undefined
        }
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-medium">Lezioni del mese</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Ore nette: {total.toFixed(2)}</p>
        </div>
        <label className="text-sm">
          Mese
          <input
            className="mt-1"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </label>
      </div>

      <div className="space-y-3 md:hidden">
        {lessons.length === 0 && (
          <div className="card p-6 text-center text-slate-500 dark:text-slate-400">
            Nessuna lezione in questo mese.
          </div>
        )}
        {lessons.map((l) => (
          <div key={l.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{new Date(l.startAt).toLocaleDateString("it-IT")}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {new Date(l.startAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                  {" – "}
                  {new Date(l.endAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                  {" · "}
                  {l.breakMinutes} min pausa
                </p>
                <p className="text-sm mt-1">{l.location}</p>
              </div>
              <p className="text-sm font-medium">{hours(l).toFixed(2)} h</p>
            </div>
            <div className="mt-3 flex gap-3 text-sm">
              <button className="text-ice-800 dark:text-sky-300" onClick={() => setEditing(l)}>
                Modifica
              </button>
              <button className="text-red-600 dark:text-red-400" onClick={() => remove(l.id)}>
                Elimina
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card overflow-x-auto hidden md:block">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-ice-100 text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Orario</th>
              <th className="px-4 py-3">Pausa</th>
              <th className="px-4 py-3">Luogo</th>
              <th className="px-4 py-3">Ore</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {lessons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  Nessuna lezione in questo mese.
                </td>
              </tr>
            )}
            {lessons.map((l) => (
              <tr key={l.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3">
                  {new Date(l.startAt).toLocaleDateString("it-IT")}
                </td>
                <td className="px-4 py-3">
                  {new Date(l.startAt).toLocaleTimeString("it-IT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" – "}
                  {new Date(l.endAt).toLocaleTimeString("it-IT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3">{l.breakMinutes} min</td>
                <td className="px-4 py-3">{l.location}</td>
                <td className="px-4 py-3">{hours(l).toFixed(2)}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button className="text-ice-800 dark:text-sky-300" onClick={() => setEditing(l)}>
                    Modifica
                  </button>
                  <button className="text-red-600 dark:text-red-400" onClick={() => remove(l.id)}>
                    Elimina
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
