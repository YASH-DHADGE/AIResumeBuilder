const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { analyzeJob } = require('../controllers/job.controller');

router.use(authMiddleware);

router.post('/analyze', analyzeJob);

module.exports = router;
