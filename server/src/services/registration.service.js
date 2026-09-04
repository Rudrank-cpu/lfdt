const { v4: uuidv4 } = require('uuid');
const { transaction, query, get, run } = require('../config/db');

function generateTicketCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'EF-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function registerForEvent(eventId, userId) {
  return transaction(db => {
    // 1. Fetch event
    const eventStmt = db.prepare('SELECT id, max_capacity, status, title FROM events WHERE id = ?');
    const event = eventStmt.get(eventId);

    if (!event) {
      const err = new Error('Event not found.');
      err.status = 404;
      throw err;
    }

    if (event.status !== 'PUBLISHED') {
      const err = new Error('Registrations are only open for PUBLISHED events.');
      err.status = 400;
      throw err;
    }

    // 2. Check if user already has an active registration
    const existingStmt = db.prepare('SELECT id, status, ticket_code FROM registrations WHERE event_id = ? AND user_id = ?');
    const existing = existingStmt.get(eventId, userId);

    if (existing && existing.status === 'CONFIRMED') {
      const err = new Error('You are already registered for this event.');
      err.status = 409;
      throw err;
    }

    // 3. Count confirmed attendees
    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status = 'CONFIRMED'`);
    const { count: confirmedCount } = countStmt.get(eventId);

    let targetStatus = 'CONFIRMED';
    let message = 'Your seat has been confirmed!';

    if (Number(confirmedCount) >= Number(event.max_capacity)) {
      targetStatus = 'WAITLISTED';
      message = 'Event capacity reached. You have been placed on the waitlist.';
    }

    const ticketCode = existing ? existing.ticket_code : generateTicketCode();
    let regId;

    if (existing) {
      regId = existing.id;
      db.prepare(`
        UPDATE registrations 
        SET status = ?, registered_at = datetime('now'), cancelled_at = NULL 
        WHERE id = ?
      `).run(targetStatus, regId);
    } else {
      regId = uuidv4();
      db.prepare(`
        INSERT INTO registrations (id, event_id, user_id, status, ticket_code) 
        VALUES (?, ?, ?, ?, ?)
      `).run(regId, eventId, userId, targetStatus, ticketCode);
    }

    return {
      registrationId: regId,
      eventId: event.id,
      eventTitle: event.title,
      status: targetStatus,
      ticketCode,
      message
    };
  });
}

function cancelRegistration(eventId, userId) {
  return transaction(db => {
    const regStmt = db.prepare('SELECT id, status FROM registrations WHERE event_id = ? AND user_id = ?');
    const reg = regStmt.get(eventId, userId);

    if (!reg || reg.status === 'CANCELLED') {
      const err = new Error('No active registration found to cancel.');
      err.status = 404;
      throw err;
    }

    const wasConfirmed = reg.status === 'CONFIRMED';

    // Mark registration as cancelled
    db.prepare(`
      UPDATE registrations 
      SET status = 'CANCELLED', cancelled_at = datetime('now') 
      WHERE id = ?
    `).run(reg.id);

    let promotedUserId = null;

    // If a confirmed ticket was cancelled, automatically promote the oldest waitlisted attendee!
    if (wasConfirmed) {
      const waitlistStmt = db.prepare(`
        SELECT id, user_id FROM registrations 
        WHERE event_id = ? AND status = 'WAITLISTED' 
        ORDER BY registered_at ASC LIMIT 1
      `);
      const nextAttendee = waitlistStmt.get(eventId);

      if (nextAttendee) {
        db.prepare(`UPDATE registrations SET status = 'CONFIRMED' WHERE id = ?`).run(nextAttendee.id);
        promotedUserId = nextAttendee.user_id;
      }
    }

    return {
      cancelled: true,
      registrationId: reg.id,
      autoPromotedNextWaitlist: Boolean(promotedUserId)
    };
  });
}

function getMyRegistrations(userId) {
  const sql = `
    SELECT 
      r.id as registration_id,
      r.status as registration_status,
      r.ticket_code,
      r.registered_at,
      r.cancelled_at,
      e.id as event_id,
      e.title as event_title,
      e.description as event_description,
      e.category as event_category,
      e.banner_url,
      e.location_type,
      e.venue_or_url,
      e.start_time,
      e.end_time,
      e.status as event_status
    FROM registrations r
    JOIN events e ON r.event_id = e.id
    WHERE r.user_id = ?
    ORDER BY r.registered_at DESC
  `;

  return query(sql, [userId]);
}

function getEventAttendees(eventId, headUserId) {
  // Check authorization
  const event = get('SELECT id, head_user_id, title, max_capacity FROM events WHERE id = ?', [eventId]);
  if (!event) {
    const err = new Error('Event not found.');
    err.status = 404;
    throw err;
  }

  if (event.head_user_id !== headUserId) {
    const err = new Error('Forbidden: You can only view attendee rosters for your own events.');
    err.status = 403;
    throw err;
  }

  const sql = `
    SELECT 
      r.id as registration_id,
      r.status,
      r.ticket_code,
      r.registered_at,
      r.cancelled_at,
      r.checked_in_at,
      u.id as user_id,
      u.full_name,
      u.email
    FROM registrations r
    JOIN users u ON r.user_id = u.id
    WHERE r.event_id = ?
    ORDER BY r.registered_at ASC
  `;

  const attendees = query(sql, [eventId]);

  const confirmedCount = attendees.filter(a => a.status === 'CONFIRMED').length;
  const waitlistedCount = attendees.filter(a => a.status === 'WAITLISTED').length;

  return {
    event: {
      id: event.id,
      title: event.title,
      maxCapacity: event.max_capacity,
      confirmedCount,
      waitlistedCount,
      remainingSeats: Math.max(0, event.max_capacity - confirmedCount)
    },
    attendees
  };
}

function exportAttendeesCsv(eventId, headUserId) {
  const { event, attendees } = getEventAttendees(eventId, headUserId);

  const headers = ['Registration ID', 'Ticket Code', 'Full Name', 'Email', 'Status', 'Registered At', 'Checked In At'];
  const rows = attendees.map(a => [
    `"${a.registration_id}"`,
    `"${a.ticket_code}"`,
    `"${a.full_name.replace(/"/g, '""')}"`,
    `"${a.email}"`,
    `"${a.status}"`,
    `"${a.registered_at}"`,
    `"${a.checked_in_at || 'Not Checked In'}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  return {
    eventTitle: event.title,
    csvContent
  };
}

/**
 * QR Code Check-in / Entrance Verification
 * Aligned with idea.md Section 8 Phase 3
 */
function checkinAttendee(eventId, headUserId, ticketCode) {
  const event = get('SELECT id, head_user_id, title FROM events WHERE id = ?', [eventId]);
  if (!event) {
    const err = new Error('Event not found.');
    err.status = 404;
    throw err;
  }

  if (event.head_user_id !== headUserId) {
    const err = new Error('Forbidden: You can only check in attendees for your own events.');
    err.status = 403;
    throw err;
  }

  const cleanCode = (ticketCode || '').trim().toUpperCase();
  if (!cleanCode) {
    const err = new Error('Ticket code is required.');
    err.status = 400;
    throw err;
  }

  const sql = `
    SELECT 
      r.id as registration_id,
      r.status,
      r.ticket_code,
      r.checked_in_at,
      u.full_name,
      u.email
    FROM registrations r
    JOIN users u ON r.user_id = u.id
    WHERE r.event_id = ? AND UPPER(r.ticket_code) = ?
  `;

  const reg = get(sql, [eventId, cleanCode]);
  if (!reg) {
    const err = new Error(`Ticket code "${cleanCode}" was not found for this event.`);
    err.status = 404;
    throw err;
  }

  if (reg.status !== 'CONFIRMED') {
    const err = new Error(`Cannot check in ticket: registration status is ${reg.status}.`);
    err.status = 400;
    throw err;
  }

  if (reg.checked_in_at) {
    return {
      alreadyCheckedIn: true,
      message: `Attendee already checked in at ${new Date(reg.checked_in_at).toLocaleTimeString()}`,
      attendee: {
        registrationId: reg.registration_id,
        ticketCode: reg.ticket_code,
        fullName: reg.full_name,
        email: reg.email,
        checkedInAt: reg.checked_in_at
      }
    };
  }

  const checkinTime = new Date().toISOString();
  run('UPDATE registrations SET checked_in_at = ? WHERE id = ?', [checkinTime, reg.registration_id]);

  return {
    alreadyCheckedIn: false,
    checkedIn: true,
    message: `Attendee "${reg.full_name}" successfully checked in!`,
    attendee: {
      registrationId: reg.registration_id,
      ticketCode: reg.ticket_code,
      fullName: reg.full_name,
      email: reg.email,
      checkedInAt: checkinTime
    }
  };
}

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventAttendees,
  exportAttendeesCsv,
  checkinAttendee
};
