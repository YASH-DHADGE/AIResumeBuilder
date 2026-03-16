const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const {
  uploadResume,
  getResume,
  updateSections,
  patchSkills,
} = require('../controllers/resume.controller');

// All resume routes require authentication
router.use(authMiddleware);

router.post('/upload', upload.single('file'), uploadResume);
router.get('/:id', getResume);
router.put('/:id/sections', updateSections);
router.patch('/:id/skills', patchSkills);

module.exports = router;
