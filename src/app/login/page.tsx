"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Accesso non riuscito");
      return;
    }
    router.push(data.redirect);
    router.refresh();
  }

  return (
    <main className="min-h-dvh grid lg:grid-cols-2">
      <section className="relative overflow-hidden bg-ice-800 text-white px-6 py-10 sm:p-12 flex flex-col justify-between min-h-[36vh] lg:min-h-dvh dark:bg-slate-900">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,_#38bdf8,_transparent_45%)]" />
        <div className="relative">
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-white/70">Scuola sci</p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold leading-tight">
            Registro lezioni
            <br />
            chiaro e veloce.
          </h1>
        </div>
        <p className="relative mt-8 max-w-md text-white/80 text-base sm:text-lg">
          I maestri segnano orari, pause e piste. L&apos;ufficio vede il calendario e
          scarica i fogli paga a fine mese.
        </p>
      </section>
      <section className="flex items-center justify-center p-5 sm:p-8">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
          <div>
            <h2 className="text-2xl font-semibold text-ice-900 dark:text-white">Accedi</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Usa le credenziali della scuola.
            </p>
          </div>
          <label className="block text-sm">
            Email
            <input
              className="mt-1"
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="block text-sm">
            Password
            <input
              className="mt-1"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Accesso..." : "Entra"}
          </button>
        </form>
      </section>
    </main>
  );
}
