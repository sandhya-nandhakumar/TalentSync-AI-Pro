const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const applicationController = require('../controllers/application.controller');
const authMiddleware = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post('/submit', upload.single('resume'), applicationController.submitApplication);
router.get('/', authMiddleware, applicationController.getAllApplications);
router.get('/stats', authMiddleware, applicationController.getDashboardStats);
router.get('/job/:job_id', authMiddleware, applicationController.getApplicationsByJob);
router.put('/:id/status', authMiddleware, applicationController.updateApplicationStatus);
router.post('/:id/send-email', authMiddleware, applicationController.sendManualEmail);
router.post('/job/:job_id/recalculate', authMiddleware, applicationController.recalculateScores);

module.exports = router;
