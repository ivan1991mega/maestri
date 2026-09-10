import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatEuro, netHours } from "@/lib/lessons";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // YYYY-MM
  const userId = searchParams.get("userId");
  if (!month || !/^\d{4}-\d{2}$/.test(month) || !userId) {
    return NextResponse.json({ error: "Mese e utente obbligatori" }, { status: 400 });
  }

  const start = new Date(`${month}-01T00:00:00`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  const lessons = await prisma.lesson.findMany({
    where: { userId, startAt: { gte: start, lt: end } },
    orderBy: { startAt: "asc" },
  });

  const rate = Number(user.hourlyRate);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sci Lezioni";
  const sheet = workbook.addWorksheet("Lezioni");

  sheet.columns = [
    { header: "Data", key: "data", width: 16 },
    { header: "Giorno", key: "giorno", width: 14 },
    { header: "Inizio", key: "inizio", width: 10 },
    { header: "Fine", key: "fine", width: 10 },
    { header: "Pausa (min)", key: "pausa", width: 14 },
    { header: "Luogo", key: "luogo", width: 22 },
    { header: "Note", key: "note", width: 28 },
    { header: "Ore nette", key: "ore", width: 12 },
    { header: "Tariffa €/h", key: "tariffa", width: 14 },
    { header: "Importo €", key: "importo", width: 14 },
  ];

  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F3D5E" },
  };

  let totalHours = 0;
  let totalPay = 0;

  for (const l of lessons) {
    const hours = netHours(l.startAt, l.endAt, l.breakMinutes);
    const pay = hours * rate;
    totalHours += hours;
    totalPay += pay;
    sheet.addRow({
      data: format(l.startAt, "dd/MM/yyyy"),
      giorno: format(l.startAt, "EEEE", { locale: it }),
      inizio: format(l.startAt, "HH:mm"),
      fine: format(l.endAt, "HH:mm"),
      pausa: l.breakMinutes,
      luogo: l.location,
      note: l.notes || "",
      ore: hours,
      tariffa: rate,
      importo: Math.round(pay * 100) / 100,
    });
  }

  sheet.addRow({});
  const tot = sheet.addRow({
    data: "TOTALE",
    ore: Math.round(totalHours * 100) / 100,
    importo: Math.round(totalPay * 100) / 100,
  });
  tot.font = { bold: true };

  const info = workbook.addWorksheet("Riepilogo");
  info.addRow(["Maestro", user.name]);
  info.addRow(["Email", user.email]);
  info.addRow(["Mese", format(start, "MMMM yyyy", { locale: it })]);
  info.addRow(["Lezioni", lessons.length]);
  info.addRow(["Ore nette", Math.round(totalHours * 100) / 100]);
  info.addRow(["Tariffa oraria", formatEuro(rate)]);
  info.addRow(["Totale da pagare", formatEuro(totalPay)]);

  const buf = await workbook.xlsx.writeBuffer();
  const filename = `lezioni-${user.name.replace(/\s+/g, "_")}-${month}.xlsx`;
  return new NextResponse(Buffer.from(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
