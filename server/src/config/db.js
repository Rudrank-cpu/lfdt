const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './data/eventflow.db';
const resolvedPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);

// Ensure data directory exists
const dir = path.dirname(resolvedPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

let dbInstance = null;

function getDb() {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(resolvedPath);
    // Enable foreign key constraints and WAL mode for better concurrency
    dbInstance.exec('PRAGMA foreign_keys = ON;');
    dbInstance.exec('PRAGMA journal_mode = WAL;');
  }
  return dbInstance;
}

/**
 * Execute a SQL query returning all matched rows
 */
function query(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

/**
 * Execute a SQL query returning the first matched row
 */
function get(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  return stmt.get(...params);
}

/**
 * Execute a write query (INSERT, UPDATE, DELETE)
 */
function run(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

/**
 * Execute multiple raw SQL statements (for schema setup)
 */
function exec(sql) {
  const db = getDb();
  return db.exec(sql);
}

/**
 * Run operations inside an atomic transaction (BEGIN IMMEDIATE / COMMIT / ROLLBACK)
 */
function transaction(fn) {
  const db = getDb();
  db.exec('BEGIN IMMEDIATE;');
  try {
    const result = fn(db);
    db.exec('COMMIT;');
    return result;
  } catch (error) {
    db.exec('ROLLBACK;');
    throw error;
  }
}

module.exports = {
  getDb,
  query,
  get,
  run,
  exec,
  transaction
};
