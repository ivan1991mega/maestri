export const ROME = "Europe/Rome";

export function netHours(startAt: Date, endAt: Date, breakMinutes: number) {
  const ms = endAt.getTime() - startAt.getTime();
  const hours = ms / 36e5 - breakMinutes / 60;
  return Math.max(0, Math.round(hours * 100) / 100);
}

export function formatEuro(n: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

export function formatRome(
  date: Date,
  options: Intl.DateTimeFormatOptions
) {
  return new Intl.DateTimeFormat("it-IT", { timeZone: ROME, ...options }).format(date);
}

export function romeDate(date: Date) {
  return formatRome(date, { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function romeTime(date: Date) {
  return formatRome(date, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
}

export function romeWeekday(date: Date) {
  return formatRome(date, { weekday: "long" });
}

export function romeMonthLabel(date: Date) {
  return formatRome(date, { month: "long", year: "numeric" });
}

/** Inizio/fine mese in fuso Italia, così il filtro non taglia le ore. */
export function monthRangeRome(month: string) {
  const [y, m] = month.split("-").map(Number);
  const start = zonedRome(y, m, 1, 0, 0);
  const endMonth = m === 12 ? 1 : m + 1;
  const endYear = m === 12 ? y + 1 : y;
  const end = zonedRome(endYear, endMonth, 1, 0, 0);
  return { start, end };
}

function zonedRome(year: number, month: number, day: number, hour: number, minute: number) {
  const utc = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ROME,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(utc);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asRome = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  const offset = asRome - utc.getTime();
  return new Date(utc.getTime() - offset);
}
