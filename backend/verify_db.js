const db = require('./services/db');

db.all("PRAGMA table_info(applications)", (err, rows) => {
    if (err) {
        console.error('Error fetching table info:', err);
    } else {
        const columns = rows.map(r => r.name);
        console.log('Columns in applications table:', columns);
        if (columns.includes('missing_skills')) {
            console.log('✅ Status: missing_skills column exists.');
        } else {
            console.log('❌ Status: missing_skills column is MISSING.');
        }
    }
    db.close();
});
