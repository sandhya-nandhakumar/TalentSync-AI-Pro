const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../talentsync.db');
const db = new sqlite3.Database(dbPath);

const jobs = [
    {
        title: 'Senior Frontend Engineer',
        description: 'We are looking for a React expert to build beautiful, high-performance UIs. Experience with Tailwind CSS, Framer Motion, and state management is required. You will lead the development of our core product features.',
        location: 'Remote / San Francisco',
        experience: '5+ Years',
        type: 'Full-time'
    },
    {
        title: 'Lead Product Designer',
        description: 'Help us define the future of recruitment tech. We need a designer who understands glassmorphism, micro-interactions, and user-centric workflows. Mastery of Figma and UI/UX principles is essential.',
        location: 'Hybrid (New York)',
        experience: '4+ Years',
        type: 'Full-time'
    },
    {
        title: 'Backend Node.js Developer',
        description: 'Build scalable APIs and AI-driven background tasks. Familiarity with SQLite, Express, JWT, and NLP libraries (like Natural) is a plus. You will focus on the performance and security of our ATS infrastructure.',
        location: 'Remote',
        experience: '3+ Years',
        type: 'Contract'
    }
];

db.serialize(() => {
    // Ensure table exists
    db.run(`CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    experience TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'Open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

    const stmt = db.prepare(`INSERT INTO jobs (title, description, location, experience, type) VALUES (?, ?, ?, ?, ?)`);

    jobs.forEach(job => {
        stmt.run([job.title, job.description, job.location, job.experience, job.type]);
    });

    stmt.finalize();

    console.log('Successfully seeded 3 job postings!');
    db.close();
});
