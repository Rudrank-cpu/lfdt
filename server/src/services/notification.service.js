/**
 * Notification & Calendar Export Service
 * Aligned with architecture.md Section 2.3 & backend.md Section 1
 */

/**
 * Format a Date object into iCalendar UTC format (YYYYMMDDTHHmmssZ)
 */
function formatIcsDate(dateStr) {
  const d = new Date(dateStr);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Escape iCalendar text values (newlines, commas, semicolons)
 */
function escapeIcsText(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate standard RFC 5545 iCalendar (.ics) string for an event
 */
function generateIcs(event) {
  const start = formatIcsDate(event.startTime || event.start_time);
  const end = formatIcsDate(event.endTime || event.end_time);
  const now = formatIcsDate(new Date());
  const uid = `eventflow-${event.id}@eventflow.dev`;
  const summary = escapeIcsText(event.title);
  const description = escapeIcsText(event.description);
  const location = escapeIcsText(event.venueOrUrl || event.venue_or_url || 'Online');
  const organizerName = escapeIcsText(event.organizer?.name || 'EventFlow Organizer');
  const organizerEmail = event.organizer?.email || 'noreply@eventflow.dev';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EventFlow//Event Management Platform//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `ORGANIZER;CN="${organizerName}":mailto:${organizerEmail}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return lines.join('\r\n');
}

module.exports = {
  generateIcs
};
