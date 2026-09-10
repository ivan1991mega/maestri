import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { syncLessonToCalendar } from "@/lib/google-calendar";
import { monthRangeRome } from "@/lib/lessons";

export async function GET(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // YYYY-MM
  const userId = searchParams.get("userId");

  const where: Record<string, unknown> = {};
  if (user.role !== "ADMIN") where.userId = user.id;
  else if (userId) where.userId = userId;

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const { start, end } = monthRangeRome(month);
    where.startAt = { gte: start, lt: end };
  }

  const lessons = await prisma.lesson.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true, hourlyRate: true } } },
    orderBy: { startAt: "desc" },
  });
  return NextResponse.json({ lessons });
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const body = await req.json();
  const startAt = new Date(body.startAt);
  const endAt = new Date(body.endAt);
  const breakMinutes = Number(body.breakMinutes || 0);
  const location = String(body.location || "").trim();
  const notes = body.notes ? String(body.notes) : null;

  if (!location || Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return NextResponse.json({ error: "Dati incompleti" }, { status: 400 });
  }
  if (endAt <= startAt) {
    return NextResponse.json({ error: "L'orario di fine deve essere dopo l'inizio" }, { status: 400 });
  }
  if (breakMinutes < 0) {
    return NextResponse.json({ error: "Pausa non valida" }, { status: 400 });
  }

  const ownerId = user.role === "ADMIN" && body.userId ? body.userId : user.id;

  const lesson = await prisma.lesson.create({
    data: { userId: ownerId, startAt, endAt, breakMinutes, location, notes },
    include: { user: true },
  });

  try {
    const eventId = await syncLessonToCalendar(
      {
        id: lesson.id,
        title: `Lezione — ${lesson.user.name} — ${location}`,
        startAt,
        endAt,
        location,
        description: notes || undefined,
      },
      null
    );
    if (eventId) {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { googleEventId: eventId },
      });
    }
  } catch (e) {
    console.error("Google Calendar sync failed", e);
  }

  return NextResponse.json({ lesson });
}
