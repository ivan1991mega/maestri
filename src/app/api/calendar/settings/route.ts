import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const settings = await prisma.setting.findUnique({ where: { id: "app" } });
  return NextResponse.json({
    googleCalendarId: settings?.googleCalendarId || process.env.GOOGLE_CALENDAR_ID || "",
    configured: Boolean(
      (settings?.googleServiceAccount || process.env.GOOGLE_SERVICE_ACCOUNT_JSON) &&
        (settings?.googleCalendarId || process.env.GOOGLE_CALENDAR_ID)
    ),
  });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const body = await req.json();
  const settings = await prisma.setting.upsert({
    where: { id: "app" },
    update: {
      googleCalendarId: body.googleCalendarId || null,
      googleServiceAccount: body.googleServiceAccount || undefined,
    },
    create: {
      id: "app",
      googleCalendarId: body.googleCalendarId || null,
      googleServiceAccount: body.googleServiceAccount || null,
    },
  });
  return NextResponse.json({ ok: true, googleCalendarId: settings.googleCalendarId });
}
