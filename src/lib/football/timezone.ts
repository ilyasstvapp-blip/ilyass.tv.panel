export const TIMEZONE_OPTIONS = [
  { label: "Browser Local", value: "browser" },
  { label: "UTC", value: "UTC" },
  { label: "Africa/Casablanca", value: "Africa/Casablanca" },
  { label: "Africa/Algiers", value: "Africa/Algiers" },
  { label: "Africa/Tunis", value: "Africa/Tunis" },
  { label: "Africa/Cairo", value: "Africa/Cairo" },
  { label: "Africa/Johannesburg", value: "Africa/Johannesburg" },
  { label: "Africa/Lagos", value: "Africa/Lagos" },
  { label: "Africa/Nairobi", value: "Africa/Nairobi" },
  { label: "Europe/Madrid", value: "Europe/Madrid" },
  { label: "Europe/London", value: "Europe/London" },
  { label: "Europe/Paris", value: "Europe/Paris" },
  { label: "Europe/Berlin", value: "Europe/Berlin" },
  { label: "Europe/Rome", value: "Europe/Rome" },
  { label: "Europe/Istanbul", value: "Europe/Istanbul" },
  { label: "Europe/Moscow", value: "Europe/Moscow" },
  { label: "Asia/Dubai", value: "Asia/Dubai" },
  { label: "Asia/Riyadh", value: "Asia/Riyadh" },
  { label: "Asia/Tehran", value: "Asia/Tehran" },
  { label: "Asia/Kolkata", value: "Asia/Kolkata" },
  { label: "Asia/Bangkok", value: "Asia/Bangkok" },
  { label: "Asia/Shanghai", value: "Asia/Shanghai" },
  { label: "Asia/Tokyo", value: "Asia/Tokyo" },
  { label: "America/New_York", value: "America/New_York" },
  { label: "America/Chicago", value: "America/Chicago" },
  { label: "America/Denver", value: "America/Denver" },
  { label: "America/Los_Angeles", value: "America/Los_Angeles" },
  { label: "America/Sao_Paulo", value: "America/Sao_Paulo" },
  { label: "America/Argentina/Buenos_Aires", value: "America/Argentina/Buenos_Aires" },
  { label: "Pacific/Auckland", value: "Pacific/Auckland" },
  { label: "Australia/Sydney", value: "Australia/Sydney" },
]

export function formatMatchTime(
  timeStr: string | null,
  tz: string,
  locale = "en",
): { date: string; time: string; full: string; relative: string } {
  if (!timeStr) return { date: "TBD", time: "TBD", full: "TBD", relative: "" }

  const d = new Date(timeStr)
  if (isNaN(d.getTime())) return { date: "Invalid", time: "Invalid", full: "Invalid", relative: "" }

  const tzOpts: Intl.DateTimeFormatOptions = tz === "browser"
    ? {}
    : { timeZone: tz }

  const dateStr = d.toLocaleDateString(locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US", {
    weekday: "short", month: "short", day: "numeric", ...tzOpts,
  })
  const timeStrFormatted = d.toLocaleTimeString(locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US", {
    hour: "2-digit", minute: "2-digit", ...tzOpts,
  })

  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffMins = Math.round(diffMs / 60000)
  let relative = ""
  if (diffMins < 0) relative = `${Math.abs(diffMins)}m ago`
  else if (diffMins < 60) relative = `in ${diffMins}m`
  else if (diffMins < 1440) relative = `in ${Math.round(diffMins / 60)}h`
  else relative = `in ${Math.round(diffMins / 1440)}d`

  return {
    date: dateStr,
    time: timeStrFormatted,
    full: `${dateStr} ${timeStrFormatted}`,
    relative,
  }
}

export function isMatchLive(timeStr: string | null): boolean {
  if (!timeStr) return false
  const d = new Date(timeStr)
  if (isNaN(d.getTime())) return false
  const now = new Date()
  const diffHrs = Math.abs(d.getTime() - now.getTime()) / 3600000
  return diffHrs < 2
}

export function isMatchUpcoming(timeStr: string | null): boolean {
  if (!timeStr) return false
  const d = new Date(timeStr)
  if (isNaN(d.getTime())) return false
  return d.getTime() > Date.now()
}
