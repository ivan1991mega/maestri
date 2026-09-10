import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Shell } from "@/components/shell";
import { ExportPanel } from "./export-panel";

export default async function ExportPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");
  return (
    <Shell name={session.name} role={session.role}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ice-900 dark:text-white">Fogli paga</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Scarica un Excel per maestro e mese, con ore nette e importo.
        </p>
      </div>
      <ExportPanel />
    </Shell>
  );
}
