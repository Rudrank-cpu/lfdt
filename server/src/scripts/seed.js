const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { run, exec, get } = require('../config/db');
const { initSchema } = require('./initDb');

async function seedData() {
  console.log('🌱 Starting database seeding...');
  initSchema();

  // Clear existing demo records
  exec(`
    DELETE FROM registrations;
    DELETE FROM events;
    DELETE FROM users;
  `);

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Insert Users (1 Head, 2 Viewers)
  const headId = '11111111-1111-1111-1111-111111111111';
  const viewer1Id = '22222222-2222-2222-2222-222222222222';
  const viewer2Id = '33333333-3333-3333-3333-333333333333';

  run(
    `INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)`,
    [headId, 'sarah.head@eventflow.dev', passwordHash, 'Sarah Jenkins', 'HEAD']
  );
  run(
    `INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)`,
    [viewer1Id, 'john.viewer@eventflow.dev', passwordHash, 'John Doe', 'VIEWER']
  );
  run(
    `INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)`,
    [viewer2Id, 'alex.attendee@eventflow.dev', passwordHash, 'Alex Rivera', 'VIEWER']
  );

  // 2. Insert Events created by Head User
  const event1Id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const event2Id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const event3Id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

  run(
    `INSERT INTO events (id, head_user_id, title, description, category, banner_url, location_type, venue_or_url, start_time, end_time, max_capacity, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      event1Id,
      headId,
      'Full-Stack AI Summit 2026',
      'A comprehensive hands-on workshop covering LLM integrations, microservices, and modern UI engineering.',
      'Technology',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
      'IN_PERSON',
      'Auditorium Hall B, Tech Park, Bangalore',
      '2026-10-14T09:00:00Z',
      '2026-10-14T17:00:00Z',
      50,
      'PUBLISHED'
    ]
  );

  run(
    `INSERT INTO events (id, head_user_id, title, description, category, banner_url, location_type, venue_or_url, start_time, end_time, max_capacity, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      event2Id,
      headId,
      'React 19 & Next.js Masterclass',
      'Deep dive into server actions, optimistic mutations, and streaming SSR.',
      'Web Development',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
      'VIRTUAL',
      'https://meet.google.com/xyz-abcd-efg',
      '2026-10-20T14:00:00Z',
      '2026-10-20T18:00:00Z',
      2, // Low capacity to easily test full / waitlist
      'PUBLISHED'
    ]
  );

  run(
    `INSERT INTO events (id, head_user_id, title, description, category, banner_url, location_type, venue_or_url, start_time, end_time, max_capacity, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      event3Id,
      headId,
      'UI/UX Design Thinking Sprint',
      'Collaborative design sprint for product managers, researchers, and UI designers.',
      'Design',
      null,
      'IN_PERSON',
      'Design Studio 4, Innovation Hub',
      '2026-11-01T10:00:00Z',
      '2026-11-01T16:00:00Z',
      20,
      'DRAFT'
    ]
  );

  // 3. Insert Initial Registrations
  // John registered for Event 1
  run(
    `INSERT INTO registrations (id, event_id, user_id, status, ticket_code) VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), event1Id, viewer1Id, 'CONFIRMED', 'EF-AI-001']
  );

  // Both John and Alex registered for Event 2 (Fills 2 / 2 capacity!)
  run(
    `INSERT INTO registrations (id, event_id, user_id, status, ticket_code) VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), event2Id, viewer1Id, 'CONFIRMED', 'EF-RC-001']
  );
  run(
    `INSERT INTO registrations (id, event_id, user_id, status, ticket_code) VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), event2Id, viewer2Id, 'CONFIRMED', 'EF-RC-002']
  );

  console.log('✅ Demo seed data successfully loaded!');
  console.log('--------------------------------------------------');
  console.log('Head User:   sarah.head@eventflow.dev (Password: Password123!)');
  console.log('Viewer 1:    john.viewer@eventflow.dev (Password: Password123!)');
  console.log('Viewer 2:    alex.attendee@eventflow.dev (Password: Password123!)');
  console.log('--------------------------------------------------');
}

if (require.main === module) {
  seedData();
}

module.exports = { seedData };
