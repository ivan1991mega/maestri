"use client";

import { useEffect, useState } from "react";

type User = { id: string; name: string; email: string; role: string; hourlyRate: string };

export function ExportPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState("");
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => {
        const list = (d.users || []).filter((u: User) => u.role === "INSTRUCTOR");
        setUsers(list);
        if (list[0]) setUserId(list[0].id);
      });
  }, []);

  function download() {
    window.location.href = `/api/export?month=${month}&userId=${userId}`;
  }

  return (
    <div className="card p-6 max-w-xl space-y-4">
      <label className="text-sm block">
        Maestro
        <select className="mt-1" value={userId} onChange={(e) => setUserId(e.target.value)}>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email}) — {u.hourlyRate} €/h
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm block">
        Mese
        <input className="mt-1" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </label>
      <button className="btn-primary" disabled={!userId} onClick={download}>
        Scarica Excel
      </button>
    </div>
  );
}
