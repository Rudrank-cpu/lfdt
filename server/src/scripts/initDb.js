const { exec } = require('../config/db');

function initSchema() {
  console.log('🔄 Initializing database schema...');

  const ddl = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('HEAD', 'VIEWER')) DEFAULT 'VIEWER',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      head_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      banner_url TEXT,
      location_type TEXT NOT NULL CHECK(location_type IN ('IN_PERSON', 'VIRTUAL')) DEFAULT 'IN_PERSON',
      venue_or_url TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      max_capacity INTEGER NOT NULL CHECK(max_capacity > 0),
      status TEXT NOT NULL CHECK(status IN ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED')) DEFAULT 'DRAFT',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL CHECK(status IN ('CONFIRMED', 'WAITLISTED', 'CANCELLED')) DEFAULT 'CONFIRMED',
      ticket_code TEXT UNIQUE NOT NULL,
      registered_at TEXT NOT NULL DEFAULT (datetime('now')),
      cancelled_at TEXT,
      checked_in_at TEXT,
      UNIQUE(event_id, user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_events_status_start ON events(status, start_time);
    CREATE INDEX IF NOT EXISTS idx_events_head ON events(head_user_id);
    CREATE INDEX IF NOT EXISTS idx_registrations_event_status ON registrations(event_id, status);
    CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id);
  `;

  exec(ddl);

  // Safe migration for existing databases without checked_in_at column
  try {
    exec("ALTER TABLE registrations ADD COLUMN checked_in_at TEXT;");
  } catch (_) {
    // Column already exists, ignore
  }

  console.log('✅ Database schema initialized successfully!');
}

if (require.main === module) {
  initSchema();
}

module.exports = { initSchema };
