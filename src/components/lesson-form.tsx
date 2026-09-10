"use client";

import { FormEvent, useState } from "react";

type Lesson = {
  id?: string;
  startAt: string;
  endAt: string;
  breakMinutes: number;
  location: string;
  notes?: string | null;
};

export function LessonForm({
  initial,
  onSaved,
}: {
  initial?: Partial<Lesson>;
  onSaved: () => void;
}) {
  const [startAt, setStartAt] = useState(initial?.startAt || "");
  const [endAt, setEndAt] = useState(initial?.endAt || "");
  const [breakMinutes, setBreakMinutes] = useState(initial?.breakMinutes ?? 0);
  const [location, setLocation] = useState(initial?.location || "");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const payload = {
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
      breakMinutes: Number(breakMinutes),
      location,
      notes: notes || null,
    };
    const url = initial?.id ? `/api/lessons/${initial.id}` : "/api/lessons";
    const res = await fetch(url, {
      method: initial?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Errore nel salvataggio");
      return;
    }
    if (!initial?.id) {
      setStartAt("");
      setEndAt("");
      setBreakMinutes(0);
      setLocation("");
      setNotes("");
    }
    onSaved();
  }

  return (
    <form onSubmit={onSubmit} className="card p-4 sm:p-5 grid gap-4 sm:grid-cols-2">
      <label className="text-sm">
        Inizio
        <input
          className="mt-1"
          type="datetime-local"
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
          required
        />
      </label>
      <label className="text-sm">
        Fine
        <input
          className="mt-1"
          type="datetime-local"
          value={endAt}
          onChange={(e) => setEndAt(e.target.value)}
          required
        />
      </label>
      <label className="text-sm">
        Pausa (minuti)
        <input
          className="mt-1"
          type="number"
          min={0}
          value={breakMinutes}
          onChange={(e) => setBreakMinutes(Number(e.target.value))}
        />
      </label>
      <label className="text-sm">
        Luogo / pista
        <input
          className="mt-1"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Es. Sauze d'Oulx — piste blu"
          required
        />
      </label>
      <label className="text-sm sm:col-span-2">
        Note (opzionale)
        <textarea
          className="mt-1"
          rows={2}
          value={notes || ""}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>
      {error && <p className="text-sm text-red-600 dark:text-red-400 sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button className="btn-primary w-full sm:w-auto" disabled={loading}>
          {loading ? "Salvataggio..." : initial?.id ? "Aggiorna lezione" : "Registra lezione"}
        </button>
      </div>
    </form>
  );
}
