const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../talentsync.db');
const db = new sqlite3.Database(dbPath);

async function seed() {
    const name = 'Admin User';
    const email = 'admin@talentsync.ai';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    db.serialize(() => {
        // Ensure table exists
        db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

        db.run(`INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')`,
            [name, email, hashedPassword],
            function (err) {
                if (err) {
                    console.error('Error seeding admin:', err.message);
                } else {
                    console.log('Admin user seeded successfully!');
                    console.log('Email: admin@talentsync.ai');
                    console.log('Password: admin123');
                }
                db.close();
            }
        );
    });
}

seed().catch(err => console.error(err));
