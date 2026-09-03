const assert = require('node:assert');
const app = require('../src/app');
const { seedData } = require('../src/scripts/seed');

let server;
let baseUrl;

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const contentType = response.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return {
    status: response.status,
    headers: response.headers,
    data
  };
}

async function runTests() {
  console.log('================================================================');
  console.log('🧪 EventFlow Exhaustive Backend Feature Verification Test Suite');
  console.log('================================================================\n');

  // 1. Reset and seed database
  await seedData();

  // 2. Start server on dynamic port
  await new Promise(resolve => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`📡 Test server running at ${baseUrl}\n`);
      resolve();
    });
  });

  try {
    // ----------------------------------------------------------------
    // SECTION 1: Health & Base API
    // ----------------------------------------------------------------
    console.log('--- SECTION 1: Health & Base API ---');
    const healthRes = await request('/health');
    assert.strictEqual(healthRes.status, 200, 'Health endpoint should return 200');
    assert.strictEqual(healthRes.data.status, 'healthy');
    console.log('✔ [PASS] Health check is operational.\n');

    // ----------------------------------------------------------------
    // SECTION 2: Authentication & RBAC Engine
    // ----------------------------------------------------------------
    console.log('--- SECTION 2: Authentication & RBAC Engine ---');

    // 2.1 Role validation on registration
    const invalidRoleRes = await request('/api/v1/auth/register', {
      method: 'POST',
      body: {
        email: 'hacker@example.com',
        password: 'Password123!',
        fullName: 'Evil Hacker',
        role: 'SUPERADMIN' // Invalid role
      }
    });
    assert.strictEqual(invalidRoleRes.status, 400, 'Should reject invalid role');
    console.log('✔ [PASS] Invalid user role rejected with 400 Bad Request.');

    // 2.2 Register Head User A
    const head1Reg = await request('/api/v1/auth/register', {
      method: 'POST',
      body: {
        email: 'sarah.head1@eventflow.dev',
        password: 'Password123!',
        fullName: 'Sarah Head Organizer',
        role: 'HEAD'
      }
    });
    assert.strictEqual(head1Reg.status, 201);
    assert.strictEqual(head1Reg.data.data.user.role, 'HEAD');
    const head1Token = head1Reg.data.data.token;
    const head1Id = head1Reg.data.data.user.id;
    console.log('✔ [PASS] Head User A registered successfully.');

    // 2.3 Register Head User B (for cross-tenant security check)
    const head2Reg = await request('/api/v1/auth/register', {
      method: 'POST',
      body: {
        email: 'dave.head2@eventflow.dev',
        password: 'Password123!',
        fullName: 'Dave Organizer Two',
        role: 'HEAD'
      }
    });
    assert.strictEqual(head2Reg.status, 201);
    const head2Token = head2Reg.data.data.token;
    console.log('✔ [PASS] Head User B registered successfully.');

    // 2.4 Duplicate email registration check
    const duplicateEmailRes = await request('/api/v1/auth/register', {
      method: 'POST',
      body: {
        email: 'sarah.head1@eventflow.dev',
        password: 'DifferentPassword123!',
        fullName: 'Duplicate Sarah',
        role: 'VIEWER'
      }
    });
    assert.strictEqual(duplicateEmailRes.status, 409, 'Duplicate email should return 409 Conflict');
    console.log('✔ [PASS] Duplicate email registration blocked with 409 Conflict.');

    // 2.5 Register Viewers 1, 2, and 3
    const viewer1Reg = await request('/api/v1/auth/register', {
      method: 'POST',
      body: {
        email: 'alice.v1@eventflow.dev',
        password: 'Password123!',
        fullName: 'Alice Viewer',
        role: 'VIEWER'
      }
    });
    const viewer1Token = viewer1Reg.data.data.token;

    const viewer2Reg = await request('/api/v1/auth/register', {
      method: 'POST',
      body: {
        email: 'bob.v2@eventflow.dev',
        password: 'Password123!',
        fullName: 'Bob Viewer',
        role: 'VIEWER'
      }
    });
    const viewer2Token = viewer2Reg.data.data.token;

    const viewer3Reg = await request('/api/v1/auth/register', {
      method: 'POST',
      body: {
        email: 'charlie.v3@eventflow.dev',
        password: 'Password123!',
        fullName: 'Charlie Viewer',
        role: 'VIEWER'
      }
    });
    const viewer3Token = viewer3Reg.data.data.token;
    console.log('✔ [PASS] Registered 3 Viewer attendees with VIEWER role.');

    // 2.6 Login & Profile retrieval
    const loginRes = await request('/api/v1/auth/login', {
      method: 'POST',
      body: { email: 'alice.v1@eventflow.dev', password: 'Password123!' }
    });
    assert.strictEqual(loginRes.status, 200);
    assert(loginRes.data.data.token, 'Should return valid JWT');

    const wrongLogin = await request('/api/v1/auth/login', {
      method: 'POST',
      body: { email: 'alice.v1@eventflow.dev', password: 'WrongPassword' }
    });
    assert.strictEqual(wrongLogin.status, 401, 'Invalid credentials should return 401');

    const meRes = await request('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${viewer1Token}` }
    });
    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meRes.data.data.user.email, 'alice.v1@eventflow.dev');
    console.log('✔ [PASS] Login and /auth/me profile verification successful.\n');

    // ----------------------------------------------------------------
    // SECTION 3: Event Creation & Input Validation
    // ----------------------------------------------------------------
    console.log('--- SECTION 3: Event Creation & Validation ---');

    // 3.1 Viewer cannot create event (RBAC test)
    const viewerCreateAttempt = await request('/api/v1/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${viewer1Token}` },
      body: {
        title: 'Viewer Event',
        description: 'Should be rejected',
        category: 'Tech',
        venueOrUrl: 'Auditorium',
        startTime: '2026-10-01T10:00:00Z',
        endTime: '2026-10-01T12:00:00Z',
        maxCapacity: 50
      }
    });
    assert.strictEqual(viewerCreateAttempt.status, 403, 'Viewer should be forbidden from creating events');
    console.log('✔ [PASS] Viewer event creation denied with 403 Forbidden.');

    // 3.2 Invalid maxCapacity (negative or zero)
    const badCapacity = await request('/api/v1/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${head1Token}` },
      body: {
        title: 'Invalid Capacity Event',
        description: 'Testing capacity validation',
        category: 'Tech',
        venueOrUrl: 'Auditorium',
        startTime: '2026-10-01T10:00:00Z',
        endTime: '2026-10-01T12:00:00Z',
        maxCapacity: 0
      }
    });
    assert.strictEqual(badCapacity.status, 400, 'Zero capacity should fail');

    // 3.3 Invalid End Time (endTime <= startTime)
    const badTimes = await request('/api/v1/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${head1Token}` },
      body: {
        title: 'Invalid Times Event',
        description: 'Testing time validation',
        category: 'Tech',
        venueOrUrl: 'Auditorium',
        startTime: '2026-10-01T12:00:00Z',
        endTime: '2026-10-01T10:00:00Z',
        maxCapacity: 50
      }
    });
    assert.strictEqual(badTimes.status, 400, 'End time before start time should fail');
    console.log('✔ [PASS] Form validation correctly blocks invalid capacity and chronological errors.');

    // 3.4 Valid Event Creation by Head User (Capacity = 2 for testing waitlists)
    const validEvent = await request('/api/v1/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${head1Token}` },
      body: {
        title: 'Supabase Architecture Summit 2026',
        description: 'Deep dive into Postgres RLS, Database Functions, and real-time event streams.',
        category: 'Database & Cloud',
        bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
        locationType: 'IN_PERSON',
        venueOrUrl: 'Tech Park Hall 4',
        startTime: '2026-12-01T09:00:00Z',
        endTime: '2026-12-01T17:00:00Z',
        maxCapacity: 2, // Only 2 seats!
        status: 'PUBLISHED'
      }
    });
    assert.strictEqual(validEvent.status, 201);
    const eventId = validEvent.data.data.event.id;
    assert.strictEqual(validEvent.data.data.event.remainingSeats, 2);
    console.log(`✔ [PASS] Head User created event '${validEvent.data.data.event.title}' (ID: ${eventId}, Max Seats: 2).\n`);

    // ----------------------------------------------------------------
    // SECTION 4: Event Editing, Status Transitions & Cross-Tenant Security
    // ----------------------------------------------------------------
    console.log('--- SECTION 4: Event Updates & Security Boundaries ---');

    // 4.1 Head User B attempts to edit Head User A's event -> 403 Forbidden
    const crossTenantEdit = await request(`/api/v1/events/${eventId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${head2Token}` },
      body: { title: 'Malicious Hijack' }
    });
    assert.strictEqual(crossTenantEdit.status, 403, 'Head B should not be able to edit Head A event');
    console.log('✔ [PASS] Cross-organizer modification blocked with 403 Forbidden.');

    // 4.2 Head User A updates their own event
    const updateRes = await request(`/api/v1/events/${eventId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${head1Token}` },
      body: {
        title: 'Supabase & Next.js Architecture Summit 2026',
        venueOrUrl: 'Main Auditorium Innovation Center'
      }
    });
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.data.data.event.title, 'Supabase & Next.js Architecture Summit 2026');
    assert.strictEqual(updateRes.data.data.event.venueOrUrl, 'Main Auditorium Innovation Center');
    console.log('✔ [PASS] Head User A updated event details successfully.');

    // 4.3 Lifecycle state toggle
    const statusUpdate = await request(`/api/v1/events/${eventId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${head1Token}` },
      body: { status: 'PUBLISHED' }
    });
    assert.strictEqual(statusUpdate.status, 200);
    assert.strictEqual(statusUpdate.data.data.event.status, 'PUBLISHED');
    console.log('✔ [PASS] Event lifecycle state transitions verified.\n');

    // ----------------------------------------------------------------
    // SECTION 5: Public Catalog Discovery, Search & Filters
    // ----------------------------------------------------------------
    console.log('--- SECTION 5: Public Catalog & Search ---');

    // 5.1 Search query filter
    const searchRes = await request('/api/v1/events?search=Summit');
    assert.strictEqual(searchRes.status, 200);
    const foundEvents = searchRes.data.data.events;
    assert(foundEvents.some(e => e.id === eventId));
    console.log('✔ [PASS] Public keyword search finds published events.');

    // 5.2 Category filter
    const categoryRes = await request('/api/v1/events?category=' + encodeURIComponent('Database & Cloud'));
    assert.strictEqual(categoryRes.status, 200);
    assert(categoryRes.data.data.events.some(e => e.id === eventId));
    console.log('✔ [PASS] Category filtering operates as expected.\n');

    // ----------------------------------------------------------------
    // SECTION 6: Concurrency, RSVP Engine & Automated Waitlist
    // ----------------------------------------------------------------
    console.log('--- SECTION 6: RSVP, Capacity Limits & Waitlist ---');

    // 6.1 Viewer 1 RSVPs (Seat 1/2)
    const rsvp1 = await request(`/api/v1/events/${eventId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${viewer1Token}` }
    });
    assert.strictEqual(rsvp1.status, 201);
    assert.strictEqual(rsvp1.data.data.status, 'CONFIRMED');
    assert(rsvp1.data.data.ticketCode.startsWith('EF-'));
    console.log(`✔ [PASS] Viewer 1 RSVP -> CONFIRMED (Seat 1/2, Ticket: ${rsvp1.data.data.ticketCode}).`);

    // 6.2 Duplicate RSVP attempt by Viewer 1 -> 409 Conflict
    const dupRsvp = await request(`/api/v1/events/${eventId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${viewer1Token}` }
    });
    assert.strictEqual(dupRsvp.status, 409, 'Duplicate registration should return 409 Conflict');
    console.log('✔ [PASS] Duplicate RSVP blocked with 409 Conflict.');

    // 6.3 Viewer 2 RSVPs (Seat 2/2 -> Event reaches 100% capacity)
    const rsvp2 = await request(`/api/v1/events/${eventId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${viewer2Token}` }
    });
    assert.strictEqual(rsvp2.status, 201);
    assert.strictEqual(rsvp2.data.data.status, 'CONFIRMED');
    console.log('✔ [PASS] Viewer 2 RSVP -> CONFIRMED (Seat 2/2 - Event Full).');

    // Verify event details reflects remainingSeats = 0, isFull = true
    const checkFull = await request(`/api/v1/events/${eventId}`);
    assert.strictEqual(checkFull.data.data.event.remainingSeats, 0);
    assert.strictEqual(checkFull.data.data.event.isFull, true);
    console.log('✔ [PASS] Live capacity accurately calculates remainingSeats = 0, isFull = true.');

    // 6.4 Viewer 3 RSVPs -> Automatic WAITLIST placement
    const rsvp3 = await request(`/api/v1/events/${eventId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${viewer3Token}` }
    });
    assert.strictEqual(rsvp3.status, 200);
    assert.strictEqual(rsvp3.data.data.status, 'WAITLISTED');
    console.log('✔ [PASS] Viewer 3 RSVP -> Automatically placed on WAITLIST.');

    // Verify waitlisted count
    const checkWaitlist = await request(`/api/v1/events/${eventId}`);
    assert.strictEqual(checkWaitlist.data.data.event.waitlistedAttendees, 1);
    console.log('✔ [PASS] Waitlist count verified on event record.\n');

    // ----------------------------------------------------------------
    // SECTION 7: Viewer Personal Dashboard
    // ----------------------------------------------------------------
    console.log('--- SECTION 7: Viewer Personal Dashboard ---');
    const myRegistrations = await request('/api/v1/users/me/registrations', {
      headers: { Authorization: `Bearer ${viewer1Token}` }
    });
    assert.strictEqual(myRegistrations.status, 200);
    assert.strictEqual(myRegistrations.data.data.registrations.length, 1);
    assert.strictEqual(myRegistrations.data.data.registrations[0].event_title, 'Supabase & Next.js Architecture Summit 2026');
    assert.strictEqual(myRegistrations.data.data.registrations[0].registration_status, 'CONFIRMED');
    console.log('✔ [PASS] Viewer personal dashboard correctly returns active RSVP bookings.\n');

    // ----------------------------------------------------------------
    // SECTION 8: Head Attendee Rosters & CSV Export
    // ----------------------------------------------------------------
    console.log('--- SECTION 8: Attendee Rosters & CSV Export ---');

    // 8.1 Viewer cannot view attendee list (RBAC check)
    const viewerRosterDenied = await request(`/api/v1/events/${eventId}/attendees`, {
      headers: { Authorization: `Bearer ${viewer1Token}` }
    });
    assert.strictEqual(viewerRosterDenied.status, 403);
    console.log('✔ [PASS] Viewer denied access to attendee roster.');

    // 8.2 Head User A views attendee list
    const rosterRes = await request(`/api/v1/events/${eventId}/attendees`, {
      headers: { Authorization: `Bearer ${head1Token}` }
    });
    assert.strictEqual(rosterRes.status, 200);
    assert.strictEqual(rosterRes.data.data.attendees.length, 3);
    assert.strictEqual(rosterRes.data.data.event.confirmedCount, 2);
    assert.strictEqual(rosterRes.data.data.event.waitlistedCount, 1);
    console.log('✔ [PASS] Head User retrieved complete attendee roster with confirmed & waitlisted breakdown.');

    // 8.3 Head User A exports CSV
    const csvExport = await request(`/api/v1/events/${eventId}/export`, {
      headers: { Authorization: `Bearer ${head1Token}` }
    });
    assert.strictEqual(csvExport.status, 200);
    assert(csvExport.data.includes('Registration ID,Ticket Code,Full Name,Email,Status,Registered At'));
    assert(csvExport.data.includes('alice.v1@eventflow.dev'));
    assert(csvExport.data.includes('charlie.v3@eventflow.dev'));
    console.log('✔ [PASS] CSV download streams valid attendee roster file.\n');

    // ----------------------------------------------------------------
    // SECTION 9: Cancellation & Automatic Waitlist Promotion
    // ----------------------------------------------------------------
    console.log('--- SECTION 9: Cancellation & Auto-Waitlist Promotion ---');

    // 9.1 Viewer 1 cancels their confirmed reservation
    const cancelRes = await request(`/api/v1/events/${eventId}/register`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${viewer1Token}` }
    });
    assert.strictEqual(cancelRes.status, 200);
    assert.strictEqual(cancelRes.data.data.cancelled, true);
    assert.strictEqual(cancelRes.data.data.autoPromotedNextWaitlist, true);
    console.log('✔ [PASS] Viewer 1 cancelled ticket; waitlist auto-promotion triggered.');

    // 9.2 Verify Viewer 3 is now automatically CONFIRMED!
    const postCancelRoster = await request(`/api/v1/events/${eventId}/attendees`, {
      headers: { Authorization: `Bearer ${head1Token}` }
    });
    const charlie = postCancelRoster.data.data.attendees.find(a => a.email === 'charlie.v3@eventflow.dev');
    assert.strictEqual(charlie.status, 'CONFIRMED');
    const alice = postCancelRoster.data.data.attendees.find(a => a.email === 'alice.v1@eventflow.dev');
    assert.strictEqual(alice.status, 'CANCELLED');
    console.log('✔ [PASS] Charlie (Viewer 3) automatically promoted from WAITLISTED to CONFIRMED.');
    console.log('✔ [PASS] Alice (Viewer 1) marked as CANCELLED.\n');

    // ----------------------------------------------------------------
    // SECTION 10: Event Deletion
    // ----------------------------------------------------------------
    console.log('--- SECTION 10: Event Deletion ---');
    // Create temporary event to delete
    const tempEvent = await request('/api/v1/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${head1Token}` },
      body: {
        title: 'Temporary Event To Delete',
        description: 'Testing deletion endpoint',
        category: 'Test',
        venueOrUrl: 'Room 5',
        startTime: '2026-11-20T10:00:00Z',
        endTime: '2026-11-20T12:00:00Z',
        maxCapacity: 10
      }
    });
    const tempId = tempEvent.data.data.event.id;

    // Head User deletes event
    const deleteRes = await request(`/api/v1/events/${tempId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${head1Token}` }
    });
    assert.strictEqual(deleteRes.status, 200);
    assert.strictEqual(deleteRes.data.data.deleted, true);

    // Fetching deleted event should return 404
    const getDeleted = await request(`/api/v1/events/${tempId}`);
    assert.strictEqual(getDeleted.status, 404);
    console.log('✔ [PASS] Event deletion and 404 cascade verified.\n');

    console.log('================================================================');
    console.log('🎉 ALL 10 COMPREHENSIVE BACKEND VERIFICATION SECTIONS PASSED! 🎉');
    console.log('================================================================\n');
  } finally {
    if (server) {
      server.close();
    }
  }
}

runTests().catch(err => {
  console.error('\n❌ Test suite execution error:', err);
  if (server) server.close();
  process.exit(1);
});
