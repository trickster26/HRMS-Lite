const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db;

function getDatabase() {
    if (!db) {
        const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/hrms.db');
        const dbDir = path.dirname(dbPath);

        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        db = new Database(dbPath);
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
    }
    return db;
}

function initializeDatabase() {
    const database = getDatabase();

    database.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      department TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT NOT NULL,
      date DATE NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Present', 'Absent')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(employee_id, date),
      FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance_records(employee_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
  `);

    console.log('Database initialized successfully');
}

module.exports = { getDatabase, initializeDatabase };
