const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interview.controller');
const auth = require('../middleware/auth');

// Public route for candidates to join via token
router.get('/join/:token', interviewController.getInterviewByToken);

// Protected recruiter routes
router.post('/schedule', auth, interviewController.scheduleInterview);
router.get('/recruiter', auth, interviewController.getRecruiterInterviews);
router.patch('/:id/status', auth, interviewController.updateInterviewStatus);
router.post('/evaluate', auth, interviewController.submitEvaluation);

module.exports = router;
