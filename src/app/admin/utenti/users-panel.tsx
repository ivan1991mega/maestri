"use client";

import { FormEvent, useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  hourlyRate: string | number;
  active: boolean;
};

export function UsersPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hourlyRate, setHourlyRate] = useState(25);
  const [error, setError] = useState("");
  const [calId, setCalId] = useState("");
  const [saJson, setSaJson] = useState("");
  const [calMsg, setCalMsg] = useState("");

  async function load() {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data.users || []);
  }

  useEffect(() => {
    load();
    fetch("/api/calendar/settings")
      .then((r) => r.json())
      .then((d) => setCalId(d.googleCalendarId || ""));
  }, []);

  async function createUser(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, hourlyRate, role: "INSTRUCTOR" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Errore");
      return;
    }
    setName("");
    setEmail("");
    setPassword("");
    load();
  }

  async function updateRate(id: string, rate: number) {
    await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hourlyRate: rate }),
    });
    load();
  }

  async function saveCalendar(e: FormEvent) {
    e.preventDefault();
    setCalMsg("");
    const res = await fetch("/api/calendar/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        googleCalendarId: calId,
        googleServiceAccount: saJson || undefined,
      }),
    });
    if (res.ok) setCalMsg("Impostazioni calendario salvate.");
    else setCalMsg("Salvataggio non riuscito.");
  }

  return (
    <div className="space-y-8">
      <form onSubmit={createUser} className="card p-4 sm:p-5 grid gap-4 sm:grid-cols-2">
        <h2 className="sm:col-span-2 font-medium">Nuovo maestro</h2>
        <label className="text-sm">
          Nome
          <input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="text-sm">
          Email
          <input className="mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="text-sm">
          Password iniziale
          <input className="mt-1" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </label>
        <label className="text-sm">
          Tariffa €/h
          <input
            className="mt-1"
            type="number"
            step="0.01"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
          />
        </label>
        {error && <p className="text-sm text-red-600 dark:text-red-400 sm:col-span-2">{error}</p>}
        <div className="sm:col-span-2">
          <button className="btn-primary w-full sm:w-auto">Crea account</button>
        </div>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead className="bg-ice-100 text-left dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Ruolo</th>
              <th className="px-4 py-3">€/h</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.role === "ADMIN" ? "Admin" : "Maestro"}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    step="0.01"
                    className="w-24"
                    defaultValue={Number(u.hourlyRate)}
                    onBlur={(e) => updateRate(u.id, Number(e.target.value))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={saveCalendar} className="card p-4 sm:p-5 space-y-4">
        <h2 className="font-medium">Google Calendar</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Condividi il calendario della scuola con l&apos;email del service account.
        </p>
        <label className="text-sm block">
          Calendar ID
          <input className="mt-1" value={calId} onChange={(e) => setCalId(e.target.value)} />
        </label>
        <label className="text-sm block">
          Service account JSON
          <textarea className="mt-1 font-mono text-xs" rows={6} value={saJson} onChange={(e) => setSaJson(e.target.value)} />
        </label>
        {calMsg && <p className="text-sm text-pine-500">{calMsg}</p>}
        <button className="btn-primary w-full sm:w-auto">Salva integrazione</button>
      </form>
    </div>
  );
}
