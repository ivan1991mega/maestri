"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  name: string;
  role: string;
  children: React.ReactNode;
};

export function Shell({ name, role, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const admin = role === "ADMIN";

  const links = admin
    ? [
        { href: "/admin/calendario", label: "Calendario" },
        { href: "/admin/export", label: "Fogli paga" },
        { href: "/admin/utenti", label: "Maestri" },
      ]
    : [{ href: "/dashboard", label: "Le mie lezioni" }];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh pb-16 md:pb-0">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-semibold text-ice-800 dark:text-sky-300">
              Sci Lezioni
            </Link>
            <nav className="hidden md:flex gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    pathname.startsWith(l.href)
                      ? "bg-ice-100 text-ice-800 dark:bg-slate-800 dark:text-sky-300"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden sm:block text-slate-500 dark:text-slate-400 max-w-[10rem] truncate">
              {name}
            </span>
            <button onClick={logout} className="btn-ghost py-1.5 hidden md:inline-flex">
              Esci
            </button>
            <button
              className="btn-ghost md:hidden px-3"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? "Chiudi" : "Menu"}
            </button>
          </div>
        </div>
        {open && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-3 space-y-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm ${
                  pathname.startsWith(l.href)
                    ? "bg-ice-100 text-ice-800 dark:bg-slate-800 dark:text-sky-300"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="block w-full text-left rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400"
            >
              Esci
            </button>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className={`grid ${admin ? "grid-cols-3" : "grid-cols-1"} text-xs`}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`py-3 text-center ${
                pathname.startsWith(l.href)
                  ? "text-ice-800 font-medium dark:text-sky-300"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
