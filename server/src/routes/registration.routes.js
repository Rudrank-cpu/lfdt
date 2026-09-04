const express = require('express');
const router = express.Router();
const regController = require('../controllers/registration.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');
const { registerLimiter } = require('../middlewares/rateLimit.middleware');

// Viewer registrations
router.post('/events/:id/register', registerLimiter, authenticateToken, regController.register);
router.delete('/events/:id/register', authenticateToken, regController.cancel);
router.get('/users/me/registrations', authenticateToken, regController.getMyRegistrations);

// Head Organizer routes
router.get('/events/:id/attendees', authenticateToken, requireRole('HEAD'), regController.getEventAttendees);
router.get('/events/:id/export', authenticateToken, requireRole('HEAD'), regController.exportCsv);
router.post('/events/:id/checkin', authenticateToken, requireRole('HEAD'), regController.checkin);

module.exports = router;
