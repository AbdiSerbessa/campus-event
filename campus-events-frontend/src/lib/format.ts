// Dates are shown in UTC so the server-rendered and browser-rendered output always match.
const dateTime = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});
const timeOnly = new Intl.DateTimeFormat("en-GB", {
  timeStyle: "short",
  timeZone: "UTC",
});
const month = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" });
const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", timeZone: "UTC" });

function valid(iso: string): Date | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(iso: string): string {
  const date = valid(iso);
  return date ? `${dateTime.format(date)} UTC` : "Date to be announced";
}

export function formatTime(iso: string): string {
  const date = valid(iso);
  return date ? `${timeOnly.format(date)} UTC` : "-";
}

export function dateTile(iso: string): { month: string; day: string } {
  const date = valid(iso);
  return date
    ? { month: month.format(date), day: day.format(date) }
    : { month: "TBA", day: "-" };
}
