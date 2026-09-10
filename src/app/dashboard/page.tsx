import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Shell } from "@/components/shell";
import { InstructorBoard } from "./board";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) redirect("/login");

  return (
    <Shell name={user.name} role={user.role}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ice-900 dark:text-white">Ciao, {user.name.split(" ")[0]}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Segna lezione con inizio, fine, pausa e luogo. Verrà copiata sul calendario della scuola.
        </p>
      </div>
      <InstructorBoard />
    </Shell>
  );
}
