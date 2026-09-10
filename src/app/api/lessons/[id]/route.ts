import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { deleteCalendarEvent, syncLessonToCalendar } from "@/lib/google-calendar";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const existing = await prisma.lesson.findUnique({
    where: { id: params.id },
    include: { user: true },
  });
  if (!existing) return NextResponse.json({ error: "Non trovata" }, { status: 404 });
  if (user.role !== "ADMIN" && existing.userId !== user.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const body = await req.json();
  const startAt = body.startAt ? new Date(body.startAt) : existing.startAt;
  const endAt = body.endAt ? new Date(body.endAt) : existing.endAt;
  const breakMinutes =
    body.breakMinutes !== undefined ? Number(body.breakMinutes) : existing.breakMinutes;
  const location = body.location !== undefined ? String(body.location).trim() : existing.location;
  const notes = body.notes !== undefined ? body.notes : existing.notes;

  if (endAt <= startAt) {
    return NextResponse.json({ error: "Orari non validi" }, { status: 400 });
  }

  const lesson = await prisma.lesson.update({
    where: { id: params.id },
    data: { startAt, endAt, breakMinutes, location, notes },
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
      lesson.googleEventId
    );
    if (eventId && eventId !== lesson.googleEventId) {
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

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const existing = await prisma.lesson.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Non trovata" }, { status: 404 });
  if (user.role !== "ADMIN" && existing.userId !== user.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  if (existing.googleEventId) {
    try {
      await deleteCalendarEvent(existing.googleEventId);
    } catch (e) {
      console.error(e);
    }
  }

  await prisma.lesson.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
