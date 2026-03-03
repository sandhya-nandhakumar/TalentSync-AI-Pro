const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../talentsync.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite database.');
    createTables();
  }
});

function createTables() {
  db.serialize(() => {
    // Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Jobs Table
    db.run(`CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT,
      experience TEXT,
      type TEXT,
      required_skills TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Applications Table
    db.run(`CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      candidate_name TEXT NOT NULL,
      candidate_email TEXT NOT NULL,
      resume_path TEXT,
      skills TEXT,
      missing_skills TEXT,
      education TEXT,
      ai_match_score REAL DEFAULT 0,
      skill_match_score REAL DEFAULT 0,
      exp_match_score REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id)
    )`);

    // Interviews Table
    db.run(`CREATE TABLE IF NOT EXISTS interviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL,
      recruiter_id INTEGER NOT NULL,
      interview_date DATETIME NOT NULL,
      meeting_link TEXT,
      token TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'scheduled', -- scheduled, waiting, live, completed
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id),
      FOREIGN KEY (recruiter_id) REFERENCES users(id)
    )`);

    // Interview Evaluations Table
    db.run(`CREATE TABLE IF NOT EXISTS interview_evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      interview_id INTEGER UNIQUE NOT NULL,
      notes TEXT,
      technical_rating INTEGER, -- 1-5
      communication_rating INTEGER, -- 1-5
      evaluation_data TEXT, -- JSON for question ratings
      final_score REAL,
      recommendation TEXT, -- Hire, Hold, Reject
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (interview_id) REFERENCES interviews(id)
    )`);

    // Migrations for existing database
    db.run(`ALTER TABLE applications ADD COLUMN missing_skills TEXT`, (err) => {
      // Ignore error if column already exists
    });

    db.run(`ALTER TABLE applications ADD COLUMN skill_match_score REAL DEFAULT 0`, (err) => {
      // Ignore error if column already exists
    });

    db.run(`ALTER TABLE applications ADD COLUMN exp_match_score REAL DEFAULT 0`, (err) => {
      // Ignore error if column already exists
    });

    db.run(`ALTER TABLE jobs ADD COLUMN required_skills TEXT`, (err) => {
      // Ignore error if column already exists
    });
  });
}

module.exports = db;
