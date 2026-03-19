const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { getProfile, patchUserSkills, updateProfile } = require('../controllers/user.controller');

// All user routes require authentication
router.use(authMiddleware);

router.get('/profile', getProfile);
router.patch('/skills', patchUserSkills);
router.put('/profile', updateProfile);

module.exports = router;
