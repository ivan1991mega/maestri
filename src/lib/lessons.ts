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
