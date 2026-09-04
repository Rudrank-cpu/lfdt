const eventService = require('../services/event.service');
const notificationService = require('../services/notification.service');

async function listEvents(req, res, next) {
  try {
    const { category, search, status, headUserId } = req.query;
    const events = eventService.listEvents({
      category,
      search,
      status: status || 'PUBLISHED',
      headUserId
    });

    res.status(200).json({
      success: true,
      data: {
        events,
        count: events.length
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getEventById(req, res, next) {
  try {
    const event = eventService.getEventById(req.params.id);
    res.status(200).json({
      success: true,
      data: { event }
    });
  } catch (error) {
    next(error);
  }
}

async function createEvent(req, res, next) {
  try {
    const event = eventService.createEvent(req.user.id, req.body);
    res.status(201).json({
      success: true,
      data: { event }
    });
  } catch (error) {
    next(error);
  }
}

async function updateEvent(req, res, next) {
  try {
    const event = eventService.updateEvent(req.params.id, req.user.id, req.body);
    res.status(200).json({
      success: true,
      data: { event }
    });
  } catch (error) {
    next(error);
  }
}

async function updateEventStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status field is required.' });
    }
    const event = eventService.updateEventStatus(req.params.id, req.user.id, status);
    res.status(200).json({
      success: true,
      data: { event }
    });
  } catch (error) {
    next(error);
  }
}

async function deleteEvent(req, res, next) {
  try {
    const result = eventService.deleteEvent(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function downloadIcs(req, res, next) {
  try {
    const event = eventService.getEventById(req.params.id);
    const icsContent = notificationService.generateIcs(event);
    const filename = `${event.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.ics`;

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(icsContent);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  updateEventStatus,
  deleteEvent,
  downloadIcs
};
