const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validate');

// Public catalog routes
router.get('/', eventController.listEvents);
router.get('/:id', eventController.getEventById);

// Head user protected routes
router.post(
  '/',
  authenticateToken,
  requireRole('HEAD'),
  validateBody(['title', 'description', 'category', 'venueOrUrl', 'startTime', 'endTime', 'maxCapacity']),
  eventController.createEvent
);

router.put('/:id', authenticateToken, requireRole('HEAD'), eventController.updateEvent);
router.patch('/:id/status', authenticateToken, requireRole('HEAD'), eventController.updateEventStatus);
router.delete('/:id', authenticateToken, requireRole('HEAD'), eventController.deleteEvent);

module.exports = router;
