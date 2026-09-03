const assert = require('node:assert');
const app = require('../src/app');
const { seedData } = require('../src/scripts/seed');

let server;
let baseUrl;

// Simulated Frontend API Client (mirroring Axios / Fetch wrapper)
class FrontendApiClient {
  constructor(token = null) {
    this.token = token;
  }

  setToken(token) {
    this.token = token;
  }

  async request(path, { method = 'GET', body = null, headers = {} } = {}) {
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    if (this.token) {
      reqHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: reqHeaders,
      body: body ? JSON.stringify(body) : undefined
    });

    const contentType = res.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    return {
      status: res.status,
      headers: res.headers,
      data
    };
  }
}

async function runFrontendSimulation() {
  console.log('================================================================');
  console.log('🖥️  EVENTFLOW FRONTEND-TO-BACKEND COMPLETE WORKFLOW SIMULATION');
  console.log('================================================================\n');

  // Re-seed database
  await seedData();

  // Spin up test server
  await new Promise(resolve => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`🚀 Simulated Backend Server running at ${baseUrl}\n`);
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------------------
    // WORKFLOW 1: Public Guest Browsing (Before Logging In)
    // -------------------------------------------------------------------------
    console.log('📍 [WORKFLOW 1] Public Guest User Browsing Public Event Catalog');
    const guestClient = new FrontendApiClient();

    // 1.1 Guest lands on home / catalog page
    const catalogRes = await guestClient.request('/api/v1/events');
    assert.strictEqual(catalogRes.status, 200);
    assert.strictEqual(catalogRes.data.success, true);
    const publishedEvents = catalogRes.data.data.events;
    assert(publishedEvents.length >= 2, 'Should return active published events');
    console.log(`  ✔ Guest catalog rendered with ${publishedEvents.length} events.`);

    // 1.2 Guest uses Category Filter Chip: "Technology"
    const techFilterRes = await guestClient.request('/api/v1/events?category=' + encodeURIComponent('Technology'));
    assert.strictEqual(techFilterRes.status, 200);
    assert(techFilterRes.data.data.events.every(e => e.category.toLowerCase() === 'technology'));
    console.log('  ✔ Category filter chip applied correctly.');

    // 1.3 Guest types search query in searchbar: "React"
    const searchRes = await guestClient.request('/api/v1/events?search=React');
    assert.strictEqual(searchRes.status, 200);
    assert(searchRes.data.data.events.some(e => e.title.includes('React')));
    console.log('  ✔ Live search bar returned matching results.');

    // 1.4 Guest clicks an event to open detail modal / page
    const sampleEvent = publishedEvents[0];
    const detailRes = await guestClient.request(`/api/v1/events/${sampleEvent.id}`);
    assert.strictEqual(detailRes.status, 200);
    assert.strictEqual(detailRes.data.data.event.id, sampleEvent.id);
    assert(detailRes.data.data.event.organizer.name, 'Should include organizer profile');
    assert(typeof detailRes.data.data.event.remainingSeats === 'number');
    console.log(`  ✔ Event details view loaded for '${sampleEvent.title}' (Remaining Seats: ${detailRes.data.data.event.remainingSeats}).\n`);

    // -------------------------------------------------------------------------
    // WORKFLOW 2: Attendee User Registration & Login (Maya - Viewer)
    // -------------------------------------------------------------------------
    console.log('📍 [WORKFLOW 2] Attendee User Signs Up, Logs In & Hydrates Auth State');
    const attendeeClient = new FrontendApiClient();

    // 2.1 Sign up on /register page
    const signupRes = await attendeeClient.request('/api/v1/auth/register', {
      method: 'POST',
      body: {
        email: 'maya.attendee@example.com',
        password: 'Password123!',
        fullName: 'Maya Lin',
        role: 'VIEWER'
      }
    });
    assert.strictEqual(signupRes.status, 201);
    assert.strictEqual(signupRes.data.data.user.role, 'VIEWER');
    attendeeClient.setToken(signupRes.data.data.token);
    console.log('  ✔ Maya registered with role: VIEWER.');

    // 2.2 Hydrate session on app reload via /auth/me
    const hydrateRes = await attendeeClient.request('/api/v1/auth/me');
    assert.strictEqual(hydrateRes.status, 200);
    assert.strictEqual(hydrateRes.data.data.user.email, 'maya.attendee@example.com');
    console.log('  ✔ AuthContext hydrated successfully with user profile.\n');

    // -------------------------------------------------------------------------
    // WORKFLOW 3: Organizer Signs In & Creates a New Workshop (Sarah - Head)
    // -------------------------------------------------------------------------
    console.log('📍 [WORKFLOW 3] Head Organizer Manages Event Lifecycle (Create & Edit)');
    const organizerClient = new FrontendApiClient();

    // 3.1 Log in as Head Organizer
    const orgLogin = await organizerClient.request('/api/v1/auth/login', {
      method: 'POST',
      body: {
        email: 'sarah.head@eventflow.dev',
        password: 'Password123!'
      }
    });
    assert.strictEqual(orgLogin.status, 200);
    assert.strictEqual(orgLogin.data.data.user.role, 'HEAD');
    organizerClient.setToken(orgLogin.data.data.token);
    console.log('  ✔ Sarah logged in with role: HEAD.');

    // 3.2 Organizer opens dashboard and queries own events (including drafts)
    const orgEvents = await organizerClient.request(`/api/v1/events?headUserId=${orgLogin.data.data.user.id}&status=ALL`);
    assert.strictEqual(orgEvents.status, 200);
    console.log(`  ✔ Organizer Studio loaded ${orgEvents.data.data.events.length} existing events.`);

    // 3.3 Organizer submits "Create Event" form with limited capacity of 1 seat
    const createRes = await organizerClient.request('/api/v1/events', {
      method: 'POST',
      body: {
        title: 'Microservices & Supabase VIP Lab',
        description: 'Exclusive hands-on architecture lab limited to only 1 attendee.',
        category: 'Workshops',
        bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
        locationType: 'VIRTUAL',
        venueOrUrl: 'https://meet.google.com/vip-lab-room',
        startTime: '2026-11-15T10:00:00Z',
        endTime: '2026-11-15T14:00:00Z',
        maxCapacity: 1, // Strict 1-seat capacity to test instant waitlist!
        status: 'PUBLISHED'
      }
    });
    assert.strictEqual(createRes.status, 201);
    const vipLabEventId = createRes.data.data.event.id;
    console.log(`  ✔ Published new event 'Microservices & Supabase VIP Lab' (Max Seats: 1).`);

    // 3.4 Organizer updates venue URL via Edit Form
    const editRes = await organizerClient.request(`/api/v1/events/${vipLabEventId}`, {
      method: 'PUT',
      body: {
        venueOrUrl: 'https://meet.google.com/updated-vip-lab'
      }
    });
    assert.strictEqual(editRes.status, 200);
    assert.strictEqual(editRes.data.data.event.venueOrUrl, 'https://meet.google.com/updated-vip-lab');
    console.log('  ✔ Edit Event form submitted and updated successfully.\n');

    // -------------------------------------------------------------------------
    // WORKFLOW 4: Reservation, Waitlisting & Personal Dashboard
    // -------------------------------------------------------------------------
    console.log('📍 [WORKFLOW 4] Seat Reservation, Real-Time Waitlist & My Bookings');

    // 4.1 Maya RSVPs for the 1-seat VIP Lab (She gets the ONLY seat)
    const mayaRsvp = await attendeeClient.request(`/api/v1/events/${vipLabEventId}/register`, {
      method: 'POST'
    });
    assert.strictEqual(mayaRsvp.status, 201);
    assert.strictEqual(mayaRsvp.data.data.status, 'CONFIRMED');
    const mayaTicket = mayaRsvp.data.data.ticketCode;
    console.log(`  ✔ Maya reserved the 1st seat -> CONFIRMED (Ticket: ${mayaTicket}).`);

    // 4.2 Maya checks "My Registrations" view
    const mayaDashboard = await attendeeClient.request('/api/v1/users/me/registrations');
    assert.strictEqual(mayaDashboard.status, 200);
    assert.strictEqual(mayaDashboard.data.data.registrations.length, 1);
    assert.strictEqual(mayaDashboard.data.data.registrations[0].ticket_code, mayaTicket);
    console.log('  ✔ Maya views ticket in "My Registrations" dashboard.');

    // 4.3 Second attendee (Alex) attempts to RSVP for the now-full event
    const alexClient = new FrontendApiClient();
    const alexLogin = await alexClient.request('/api/v1/auth/login', {
      method: 'POST',
      body: { email: 'alex.attendee@eventflow.dev', password: 'Password123!' }
    });
    alexClient.setToken(alexLogin.data.data.token);

    const alexRsvp = await alexClient.request(`/api/v1/events/${vipLabEventId}/register`, {
      method: 'POST'
    });
    assert.strictEqual(alexRsvp.status, 200);
    assert.strictEqual(alexRsvp.data.data.status, 'WAITLISTED');
    console.log('  ✔ Alex reserved full event -> Automatically placed on WAITLIST.');

    // 4.4 Catalog view reflects 0 remaining seats
    const postRsvpDetails = await guestClient.request(`/api/v1/events/${vipLabEventId}`);
    assert.strictEqual(postRsvpDetails.data.data.event.remainingSeats, 0);
    assert.strictEqual(postRsvpDetails.data.data.event.isFull, true);
    assert.strictEqual(postRsvpDetails.data.data.event.waitlistedAttendees, 1);
    console.log('  ✔ Event details card accurately displays "0 Seats Remaining" & "1 on Waitlist".\n');

    // -------------------------------------------------------------------------
    // WORKFLOW 5: Attendee Cancellation & Automatic Waitlist Promotion
    // -------------------------------------------------------------------------
    console.log('📍 [WORKFLOW 5] Cancellation & Automatic Seat Promotion');

    // 5.1 Maya clicks "Cancel RSVP" on her dashboard
    const cancelRes = await attendeeClient.request(`/api/v1/events/${vipLabEventId}/register`, {
      method: 'DELETE'
    });
    assert.strictEqual(cancelRes.status, 200);
    assert.strictEqual(cancelRes.data.data.cancelled, true);
    assert.strictEqual(cancelRes.data.data.autoPromotedNextWaitlist, true);
    console.log('  ✔ Maya cancelled ticket; auto-promotion triggered for waitlisted attendee.');

    // 5.2 Alex checks his dashboard -> Alex is now CONFIRMED!
    const alexDashboard = await alexClient.request('/api/v1/users/me/registrations');
    const alexLabTicket = alexDashboard.data.data.registrations.find(r => r.event_id === vipLabEventId);
    assert.strictEqual(alexLabTicket.registration_status, 'CONFIRMED');
    console.log(`  ✔ Alex received instant promotion from WAITLIST to CONFIRMED (Ticket: ${alexLabTicket.ticket_code})!\n`);

    // -------------------------------------------------------------------------
    // WORKFLOW 6: Organizer Attendee Roster Modal & CSV Export
    // -------------------------------------------------------------------------
    console.log('📍 [WORKFLOW 6] Organizer Roster Management & Spreadsheet Export');

    // 6.1 Sarah clicks "View Attendees" on her dashboard
    const rosterRes = await organizerClient.request(`/api/v1/events/${vipLabEventId}/attendees`);
    assert.strictEqual(rosterRes.status, 200);
    const attendees = rosterRes.data.data.attendees;
    assert.strictEqual(attendees.length, 2);
    const confirmedAttendee = attendees.find(a => a.status === 'CONFIRMED');
    assert.strictEqual(confirmedAttendee.email, 'alex.attendee@eventflow.dev');
    const cancelledAttendee = attendees.find(a => a.status === 'CANCELLED');
    assert.strictEqual(cancelledAttendee.email, 'maya.attendee@example.com');
    console.log('  ✔ Attendee Roster table accurately lists Alex (CONFIRMED) and Maya (CANCELLED).');

    // 6.2 Sarah clicks "Export CSV" button
    const csvRes = await organizerClient.request(`/api/v1/events/${vipLabEventId}/export`);
    assert.strictEqual(csvRes.status, 200);
    assert(csvRes.data.includes('alex.attendee@eventflow.dev'));
    assert(csvRes.data.includes('CONFIRMED'));
    console.log('  ✔ CSV download generated valid spreadsheet file.\n');

    // -------------------------------------------------------------------------
    // WORKFLOW 7: Security Guard Interceptors (Client Error Handling)
    // -------------------------------------------------------------------------
    console.log('📍 [WORKFLOW 7] Frontend Error Interceptors & Route Guard Verification');

    // 7.1 Attendee tries to open Organizer Studio API -> 403
    const forbiddenRes = await attendeeClient.request(`/api/v1/events/${vipLabEventId}/attendees`);
    assert.strictEqual(forbiddenRes.status, 403);
    assert.strictEqual(forbiddenRes.data.success, false);
    console.log('  ✔ 403 Forbidden interceptor correctly triggered for unauthorized role.');

    // 7.2 Expired / invalid token -> 403
    const fakeTokenClient = new FrontendApiClient('invalid.fake.jwt.token');
    const invalidAuthRes = await fakeTokenClient.request('/api/v1/auth/me');
    assert.strictEqual(invalidAuthRes.status, 403);
    assert.strictEqual(invalidAuthRes.data.success, false);
    console.log('  ✔ 403 Token expired/invalid interceptor verified.');

    // 7.3 Unauthenticated request to protected route -> 401
    const unauthClient = new FrontendApiClient();
    const unauthRes = await unauthClient.request('/api/v1/users/me/registrations');
    assert.strictEqual(unauthRes.status, 401);
    assert.strictEqual(unauthRes.data.success, false);
    console.log('  ✔ 401 Unauthorized interceptor correctly redirects unauthenticated users.\n');

    console.log('================================================================');
    console.log('🎉 ALL 7 FRONTEND USER JOURNEYS & API CALLS VERIFIED 100%! 🎉');
    console.log('The backend is rock-solid and ready for Frontend Implementation!');
    console.log('================================================================\n');
  } finally {
    if (server) {
      server.close();
    }
  }
}

runFrontendSimulation().catch(err => {
  console.error('\n❌ Frontend simulation error:', err);
  if (server) server.close();
  process.exit(1);
});
