const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, jobController.createJob);
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);
router.put('/:id', authMiddleware, jobController.updateJob);
router.delete('/:id', authMiddleware, jobController.deleteJob);
router.get('/stats', jobController.getStats);

module.exports = router;
