const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { exportDocx, exportPdf, exportEmail } = require('../controllers/export.controller');

router.use(authMiddleware);

router.post('/:id/docx', exportDocx);
router.post('/:id/pdf', exportPdf);
router.post('/:id/email', exportEmail);

module.exports = router;
