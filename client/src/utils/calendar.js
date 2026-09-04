/**
 * Generates an iCalendar (.ics) string and triggers a browser download.
 * @param {Object} event - The event object
 */
export function downloadIcsFile(event) {
  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const start = formatDate(event.startTime);
  const end = formatDate(event.endTime);
  const title = (event.title || 'EventFlow Event').replace(/,/g, '\\,');
  const description = (event.description || '').replace(/\n/g, '\\n').replace(/,/g, '\\,');
  const location = (event.venueOrUrl || '').replace(/,/g, '\\,');
  const uid = `eventflow-${event.id || Date.now()}@eventflow.dev`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EventFlow//Event Management System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatDate(new Date().toISOString())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title ? event.title.replace(/[^a-zA-Z0-9_-]/g, '_') : 'event'}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Builds a direct Google Calendar event creation URL.
 * @param {Object} event - The event object
 * @returns {string} Google Calendar URL
 */
export function getGoogleCalendarUrl(event) {
  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const start = formatDate(event.startTime);
  const end = formatDate(event.endTime);
  const title = encodeURIComponent(event.title || 'EventFlow Event');
  const details = encodeURIComponent(event.description || '');
  const location = encodeURIComponent(event.venueOrUrl || '');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}
