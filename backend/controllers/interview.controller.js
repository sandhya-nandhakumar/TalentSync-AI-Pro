const db = require('../services/db');
const crypto = require('crypto');
const emailService = require('../services/email.service');

/**
 * Schedule a new interview
 */
exports.scheduleInterview = (req, res) => {
    const { application_id, interview_date } = req.body;
    const recruiter_id = req.user.id;
    const token = crypto.randomUUID();
    const meeting_link = `/interview/${token}`;

    const sql = `INSERT INTO interviews (application_id, recruiter_id, interview_date, meeting_link, token, status) VALUES (?, ?, ?, ?, ?, 'scheduled')`;

    db.run(sql, [application_id, recruiter_id, interview_date, meeting_link, token], async function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to schedule interview: ' + err.message });
        }

        const interviewId = this.lastID;

        // Fetch application details to send email
        const appSql = `
            SELECT a.candidate_name, a.candidate_email, j.title as job_title
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE a.id = ?
        `;

        db.get(appSql, [application_id], async (appErr, application) => {
            console.log('Fetching application for email:', { application_id, appErr, application });
            if (!appErr && application) {
                try {
                    const fullMeetingLink = `http://10.55.184.213:5174${meeting_link}`;
                    console.log('Sending interview invitation:', {
                        to: application.candidate_email,
                        link: fullMeetingLink,
                        date: interview_date
                    });
                    await emailService.sendInterviewInvitation(
                        application.candidate_email,
                        application.candidate_name,
                        application.job_title,
                        interview_date,
                        fullMeetingLink
                    );
                    console.log('Interview invitation sent successfully');
                } catch (emailErr) {
                    console.error('Failed to send interview invitation email:', emailErr);
                }
            } else {
                console.warn('Could not find application or error fetching it:', { appErr, application });
            }

            res.status(201).json({
                id: interviewId,
                application_id,
                recruiter_id,
                interview_date,
                meeting_link,
                token,
                status: 'scheduled'
            });
        });
    });
};

/**
 * Get interview details by token
 */
exports.getInterviewByToken = (req, res) => {
    const { token } = req.params;

    const sql = `
        SELECT i.*, a.candidate_name, a.candidate_email, j.title as job_title, a.skills as candidate_skills
        FROM interviews i
        JOIN applications a ON i.application_id = a.id
        JOIN jobs j ON a.job_id = j.id
        WHERE i.token = ?
    `;

    db.get(sql, [token], (err, interview) => {
        if (err || !interview) {
            return res.status(404).json({ error: 'Interview not found' });
        }
        res.json(interview);
    });
};

/**
 * Update interview status
 */
exports.updateInterviewStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const sql = `UPDATE interviews SET status = ? WHERE id = ?`;
    db.run(sql, [status, id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update status' });
        }
        res.json({ message: 'Status updated successfully' });
    });
};

/**
 * Submit interview evaluation
 */
exports.submitEvaluation = (req, res) => {
    const { interview_id, notes, technical_rating, communication_rating, evaluation_data, final_score, recommendation } = req.body;

    const sql = `
        INSERT INTO interview_evaluations (interview_id, notes, technical_rating, communication_rating, evaluation_data, final_score, recommendation)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(interview_id) DO UPDATE SET
            notes = excluded.notes,
            technical_rating = excluded.technical_rating,
            communication_rating = excluded.communication_rating,
            evaluation_data = excluded.evaluation_data,
            final_score = excluded.final_score,
            recommendation = excluded.recommendation
    `;

    db.run(sql, [interview_id, notes, technical_rating, communication_rating, JSON.stringify(evaluation_data), final_score, recommendation], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to submit evaluation: ' + err.message });
        }

        // Also update interview status to completed
        db.run(`UPDATE interviews SET status = 'completed' WHERE id = ?`, [interview_id]);

        res.status(201).json({ message: 'Evaluation submitted successfully' });
    });
};

/**
 * Get all interviews for recruiter
 */
exports.getRecruiterInterviews = (req, res) => {
    const recruiter_id = req.user.id;

    const sql = `
        SELECT i.*, a.candidate_name, j.title as job_title
        FROM interviews i
        JOIN applications a ON i.application_id = a.id
        JOIN jobs j ON a.job_id = j.id
        WHERE i.recruiter_id = ?
        ORDER BY i.interview_date DESC
    `;

    db.all(sql, [recruiter_id], (err, rows) => {
        console.log('Fetching recruiter interviews:', { recruiter_id, count: rows?.length, err });
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
};
