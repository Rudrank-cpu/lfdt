const registrationService = require('../services/registration.service');

async function register(req, res, next) {
  try {
    const result = registrationService.registerForEvent(req.params.id, req.user.id);
    const statusCode = result.status === 'CONFIRMED' ? 201 : 200;
    res.status(statusCode).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function cancel(req, res, next) {
  try {
    const result = registrationService.cancelRegistration(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function getMyRegistrations(req, res, next) {
  try {
    const registrations = registrationService.getMyRegistrations(req.user.id);
    res.status(200).json({
      success: true,
      data: {
        registrations,
        count: registrations.length
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getEventAttendees(req, res, next) {
  try {
    const result = registrationService.getEventAttendees(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function exportCsv(req, res, next) {
  try {
    const { eventTitle, csvContent } = registrationService.exportAttendeesCsv(req.params.id, req.user.id);
    const filename = `attendees-${eventTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
}

async function checkin(req, res, next) {
  try {
    const { ticketCode } = req.body;
    const result = registrationService.checkinAttendee(req.params.id, req.user.id, ticketCode);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  cancel,
  getMyRegistrations,
  getEventAttendees,
  exportCsv,
  checkin
};
