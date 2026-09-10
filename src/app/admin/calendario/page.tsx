import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Shell } from "@/components/shell";
import { AdminCalendar } from "./calendar-view";

export default async function AdminCalendarPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");
  return (
    <Shell name={session.name} role={session.role}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ice-900 dark:text-white">Andamento lezioni</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Vista mensile di tutte le lezioni. Se Google Calendar è collegato, gli stessi eventi
          compaiono anche lì.
        </p>
      </div>
      <AdminCalendar />
    </Shell>
  );
}
