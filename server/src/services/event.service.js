const { v4: uuidv4 } = require('uuid');
const { query, get, run } = require('../config/db');

function listEvents({ category, search, status = 'PUBLISHED', headUserId } = {}) {
  let sql = `
    SELECT 
      e.*,
      u.full_name as organizer_name,
      u.email as organizer_email,
      (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'CONFIRMED') as confirmed_count,
      (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'WAITLISTED') as waitlisted_count
    FROM events e
    JOIN users u ON e.head_user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (status && status !== 'ALL') {
    sql += ` AND e.status = ?`;
    params.push(status);
  }

  if (category && category !== 'All') {
    sql += ` AND LOWER(e.category) = LOWER(?)`;
    params.push(category);
  }

  if (headUserId) {
    sql += ` AND e.head_user_id = ?`;
    params.push(headUserId);
  }

  if (search) {
    sql += ` AND (e.title LIKE ? OR e.description LIKE ? OR e.category LIKE ?)`;
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  sql += ` ORDER BY e.start_time ASC`;

  const rows = query(sql, params);

  return rows.map(event => {
    const confirmedCount = Number(event.confirmed_count);
    const maxCapacity = Number(event.max_capacity);
    const remainingSeats = Math.max(0, maxCapacity - confirmedCount);

    return {
      id: event.id,
      headUserId: event.head_user_id,
      organizer: {
        name: event.organizer_name,
        email: event.organizer_email
      },
      title: event.title,
      description: event.description,
      category: event.category,
      bannerUrl: event.banner_url,
      locationType: event.location_type,
      venueOrUrl: event.venue_or_url,
      startTime: event.start_time,
      endTime: event.end_time,
      maxCapacity,
      confirmedAttendees: confirmedCount,
      waitlistedAttendees: Number(event.waitlisted_count),
      remainingSeats,
      isFull: remainingSeats === 0,
      status: event.status,
      createdAt: event.created_at,
      updatedAt: event.updated_at
    };
  });
}

function getEventById(eventId) {
  const sql = `
    SELECT 
      e.*,
      u.full_name as organizer_name,
      u.email as organizer_email,
      (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'CONFIRMED') as confirmed_count,
      (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'WAITLISTED') as waitlisted_count
    FROM events e
    JOIN users u ON e.head_user_id = u.id
    WHERE e.id = ?
  `;

  const event = get(sql, [eventId]);
  if (!event) {
    const err = new Error('Event not found.');
    err.status = 404;
    throw err;
  }

  const confirmedCount = Number(event.confirmed_count);
  const maxCapacity = Number(event.max_capacity);
  const remainingSeats = Math.max(0, maxCapacity - confirmedCount);

  return {
    id: event.id,
    headUserId: event.head_user_id,
    organizer: {
      name: event.organizer_name,
      email: event.organizer_email
    },
    title: event.title,
    description: event.description,
    category: event.category,
    bannerUrl: event.banner_url,
    locationType: event.location_type,
    venueOrUrl: event.venue_or_url,
    startTime: event.start_time,
    endTime: event.end_time,
    maxCapacity,
    confirmedAttendees: confirmedCount,
    waitlistedAttendees: Number(event.waitlisted_count),
    remainingSeats,
    isFull: remainingSeats === 0,
    status: event.status,
    createdAt: event.created_at,
    updatedAt: event.updated_at
  };
}

function createEvent(headUserId, data) {
  const {
    title,
    description,
    category,
    bannerUrl = null,
    locationType = 'IN_PERSON',
    venueOrUrl,
    startTime,
    endTime,
    maxCapacity,
    status = 'PUBLISHED'
  } = data;

  const capacityNum = parseInt(maxCapacity, 10);
  if (isNaN(capacityNum) || capacityNum <= 0) {
    const err = new Error('maxCapacity must be a positive integer.');
    err.status = 400;
    throw err;
  }

  if (new Date(endTime) <= new Date(startTime)) {
    const err = new Error('endTime must be after startTime.');
    err.status = 400;
    throw err;
  }

  const validStatuses = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'];
  if (!validStatuses.includes(status)) {
    const err = new Error(`Invalid status '${status}'. Must be one of: ${validStatuses.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const eventId = uuidv4();

  run(
    `INSERT INTO events (
      id, head_user_id, title, description, category, banner_url,
      location_type, venue_or_url, start_time, end_time, max_capacity, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      eventId,
      headUserId,
      title.trim(),
      description.trim(),
      category.trim(),
      bannerUrl,
      locationType,
      venueOrUrl.trim(),
      startTime,
      endTime,
      capacityNum,
      status
    ]
  );

  return getEventById(eventId);
}

function updateEvent(eventId, headUserId, data) {
  const event = get('SELECT head_user_id FROM events WHERE id = ?', [eventId]);
  if (!event) {
    const err = new Error('Event not found.');
    err.status = 404;
    throw err;
  }

  if (event.head_user_id !== headUserId) {
    const err = new Error('Forbidden: You can only edit events that you created.');
    err.status = 403;
    throw err;
  }

  const existing = getEventById(eventId);

  const title = data.title !== undefined ? data.title.trim() : existing.title;
  const description = data.description !== undefined ? data.description.trim() : existing.description;
  const category = data.category !== undefined ? data.category.trim() : existing.category;
  const bannerUrl = data.bannerUrl !== undefined ? data.bannerUrl : existing.bannerUrl;
  const locationType = data.locationType !== undefined ? data.locationType : existing.locationType;
  const venueOrUrl = data.venueOrUrl !== undefined ? data.venueOrUrl.trim() : existing.venueOrUrl;
  const startTime = data.startTime !== undefined ? data.startTime : existing.startTime;
  const endTime = data.endTime !== undefined ? data.endTime : existing.endTime;
  const maxCapacity = data.maxCapacity !== undefined ? parseInt(data.maxCapacity, 10) : existing.maxCapacity;
  const status = data.status !== undefined ? data.status : existing.status;

  if (new Date(endTime) <= new Date(startTime)) {
    const err = new Error('endTime must be after startTime.');
    err.status = 400;
    throw err;
  }

  run(
    `UPDATE events SET
      title = ?, description = ?, category = ?, banner_url = ?,
      location_type = ?, venue_or_url = ?, start_time = ?, end_time = ?,
      max_capacity = ?, status = ?, updated_at = datetime('now')
    WHERE id = ?`,
    [
      title, description, category, bannerUrl,
      locationType, venueOrUrl, startTime, endTime,
      maxCapacity, status, eventId
    ]
  );

  return getEventById(eventId);
}

function updateEventStatus(eventId, headUserId, newStatus) {
  const validStatuses = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'];
  if (!validStatuses.includes(newStatus)) {
    const err = new Error(`Invalid status '${newStatus}'. Allowed: ${validStatuses.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const event = get('SELECT head_user_id FROM events WHERE id = ?', [eventId]);
  if (!event) {
    const err = new Error('Event not found.');
    err.status = 404;
    throw err;
  }

  if (event.head_user_id !== headUserId) {
    const err = new Error('Forbidden: You can only modify your own events.');
    err.status = 403;
    throw err;
  }

  run(`UPDATE events SET status = ?, updated_at = datetime('now') WHERE id = ?`, [newStatus, eventId]);
  return getEventById(eventId);
}

function deleteEvent(eventId, headUserId) {
  const event = get('SELECT head_user_id FROM events WHERE id = ?', [eventId]);
  if (!event) {
    const err = new Error('Event not found.');
    err.status = 404;
    throw err;
  }

  if (event.head_user_id !== headUserId) {
    const err = new Error('Forbidden: You can only delete your own events.');
    err.status = 403;
    throw err;
  }

  run('DELETE FROM events WHERE id = ?', [eventId]);
  return { id: eventId, deleted: true };
}

module.exports = {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  updateEventStatus,
  deleteEvent
};
