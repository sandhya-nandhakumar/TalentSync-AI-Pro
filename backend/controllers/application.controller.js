const db = require('../services/db');
const fs = require('fs');
const pdf = require('pdf-parse');
const aiService = require('../services/ai.service');
const emailService = require('../services/email.service');

exports.submitApplication = async (req, res) => {
    const { job_id, candidate_name, candidate_email } = req.body;
    const resumeFile = req.file;

    if (!resumeFile) {
        return res.status(400).json({ error: 'Resume file is required' });
    }

    try {
        // 1. Get Job Description for matching
        const job = await new Promise((resolve, reject) => {
            db.get(`SELECT title, description, required_skills FROM jobs WHERE id = ?`, [job_id], (err, row) => {
                if (err || !row) reject(new Error('Job not found'));
                else resolve(row);
            });
        });

        // 2. Parse Resume PDF
        const dataBuffer = fs.readFileSync(resumeFile.path);
        const pdfData = await pdf(dataBuffer);
        let resumeText = pdfData.text;

        console.log(`[DEBUG] Initial text length: ${resumeText?.length || 0}`);
        console.log(`[DEBUG] Initial text snippet: "${resumeText?.substring(0, 100).replace(/\n/g, ' ')}..."`);

        // OCR Fallback: if text is too short, it's likely an image-based PDF
        if (!resumeText || resumeText.trim().length < 100) {
            console.log('[DEBUG] Low text density detected, attempting OCR...');
            resumeText = await aiService.performOCR(resumeFile.path);
            console.log(`[DEBUG] OCR result length: ${resumeText?.length || 0}`);
        } else {
            console.log('[DEBUG] Sufficient text found via pdf-parse.');
        }

        // 3. Skill Extraction and Gap Analysis
        const { score, skillScore, expScore, missingSkills, presentSkills } = aiService.calculateMatchScore(
            job.description,
            resumeText,
            job.required_skills,
            job.experience
        );

        // 4. Save Application
        const sql = `INSERT INTO applications (job_id, candidate_name, candidate_email, resume_path, skills, missing_skills, ai_match_score, skill_match_score, exp_match_score) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.run(sql, [job_id, candidate_name, candidate_email, resumeFile.path, presentSkills, missingSkills, score, skillScore, expScore], async function (err) {
            if (err) return res.status(500).json({ error: err.message });

            // Send Emails
            await emailService.sendConfirmationEmail(candidate_email, candidate_name, job.title, this.lastID);
            await emailService.sendAdminNotification(job.title, candidate_name, score);

            res.status(201).json({
                id: this.lastID,
                message: 'Application submitted successfully',
                match_score: score,
                detected_skills: presentSkills,
                missing_skills: missingSkills
            });
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getApplicationsByJob = (req, res) => {
    const sql = `SELECT * FROM applications WHERE job_id = ? ORDER BY ai_match_score DESC`;
    db.all(sql, [req.params.job_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

exports.updateApplicationStatus = (req, res) => {
    const { status } = req.body;
    const sql = `UPDATE applications SET status = ? WHERE id = ?`;
    db.run(sql, [status, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Status updated successfully' });
    });
};

exports.getAllApplications = (req, res) => {
    const sql = `SELECT * FROM applications ORDER BY ai_match_score DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

exports.sendManualEmail = async (req, res) => {
    const { id } = req.params;

    try {
        const application = await new Promise((resolve, reject) => {
            const sql = `
                SELECT a.*, j.title as job_title 
                FROM applications a 
                JOIN jobs j ON a.job_id = j.id 
                WHERE a.id = ?
            `;
            db.get(sql, [id], (err, row) => {
                if (err || !row) reject(new Error('Application not found'));
                else resolve(row);
            });
        });

        await emailService.sendStatusUpdateEmail(
            application.candidate_email,
            application.candidate_name,
            application.job_title,
            application.status
        );

        res.json({ message: 'Email sent successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.recalculateScores = async (req, res) => {
    const { job_id } = req.params;

    try {
        // 1. Get Job Details
        const job = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM jobs WHERE id = ?`, [job_id], (err, row) => {
                if (err || !row) reject(new Error('Job not found'));
                else resolve(row);
            });
        });

        // 2. Get all applications for this job
        const applications = await new Promise((resolve, reject) => {
            db.all(`SELECT * FROM applications WHERE job_id = ?`, [job_id], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // 3. Re-calculate each application
        const updates = applications.map(async (app) => {
            try {
                if (!app.resume_path) return;
                const dataBuffer = fs.readFileSync(app.resume_path);
                const pdfData = await pdf(dataBuffer);
                let resumeText = pdfData.text;

                if (!resumeText || resumeText.trim().length < 100) {
                    resumeText = await aiService.performOCR(app.resume_path);
                }

                const { score, skillScore, expScore, missingSkills, presentSkills } = aiService.calculateMatchScore(
                    job.description,
                    resumeText,
                    job.required_skills,
                    job.experience
                );

                return new Promise((resolve, reject) => {
                    db.run(
                        `UPDATE applications SET ai_match_score = ?, skill_match_score = ?, exp_match_score = ?, skills = ?, missing_skills = ? WHERE id = ?`,
                        [score, skillScore, expScore, presentSkills, missingSkills, app.id],
                        (err) => {
                            if (err) reject(err);
                            else resolve();
                        }
                    );
                });
            } catch (err) {
                console.error(`Error recalculating for app ${app.id}:`, err);
            }
        });

        await Promise.all(updates);
        res.json({ message: 'Scores recalculated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const stats = await new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    (SELECT COUNT(*) FROM applications) as total_candidates,
                    (SELECT COUNT(*) FROM jobs WHERE status = 'active') as active_jobs,
                    (SELECT AVG(ai_match_score) FROM applications) as avg_match_score,
                    (SELECT MAX(ai_match_score) FROM applications) as best_match_score
            `;
            db.get(sql, [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        const bestMatch = await new Promise((resolve, reject) => {
            const sql = `
                SELECT a.*, j.title as job_title 
                FROM applications a
                JOIN jobs j ON a.job_id = j.id
                ORDER BY a.ai_match_score DESC LIMIT 1
            `;
            db.get(sql, [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        res.json({
            ...stats,
            avg_match_score: Math.round(stats.avg_match_score || 0),
            best_match_score: Math.round(stats.best_match_score || 0),
            best_candidate: bestMatch
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
