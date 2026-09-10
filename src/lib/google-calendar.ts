import { google } from "googleapis";
import { prisma } from "./prisma";

type LessonPayload = {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date;
  location: string;
  description?: string;
};

function getAuth(json: string) {
  const creds = JSON.parse(json);
  return new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
}

export async function syncLessonToCalendar(lesson: LessonPayload, existingEventId?: string | null) {
  const settings = await prisma.setting.findUnique({ where: { id: "app" } });
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || settings?.googleServiceAccount;
  const calendarId = process.env.GOOGLE_CALENDAR_ID || settings?.googleCalendarId;
  if (!json || !calendarId) return null;

  const calendar = google.calendar({ version: "v3", auth: getAuth(json) });
  const body = {
    summary: lesson.title,
    location: lesson.location,
    description: lesson.description || `Lezione registrata da Sci Lezioni (id: ${lesson.id})`,
    start: { dateTime: lesson.startAt.toISOString(), timeZone: "Europe/Rome" },
    end: { dateTime: lesson.endAt.toISOString(), timeZone: "Europe/Rome" },
  };

  if (existingEventId) {
    const updated = await calendar.events.update({
      calendarId,
      eventId: existingEventId,
      requestBody: body,
    });
    return updated.data.id || existingEventId;
  }

  const created = await calendar.events.insert({ calendarId, requestBody: body });
  return created.data.id || null;
}

export async function deleteCalendarEvent(eventId: string) {
  const settings = await prisma.setting.findUnique({ where: { id: "app" } });
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || settings?.googleServiceAccount;
  const calendarId = process.env.GOOGLE_CALENDAR_ID || settings?.googleCalendarId;
  if (!json || !calendarId) return;
  const calendar = google.calendar({ version: "v3", auth: getAuth(json) });
  try {
    await calendar.events.delete({ calendarId, eventId });
  } catch {
    // evento già rimosso o calendar non configurato
  }
}
