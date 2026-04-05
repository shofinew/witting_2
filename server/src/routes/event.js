const express = require('express');
const eventController = require('../controllers/eventController');
const { validateObjectIdParam } = require('../middleware/validation');

const router = express.Router();

// Event Routes
router.post('/event/add', eventController.createEvent);
router.get('/events', eventController.getEventsByStatus);
router.patch('/event/:eventId', validateObjectIdParam('eventId'), eventController.updateEvent);
router.patch('/event/:eventId/advance', validateObjectIdParam('eventId'), eventController.advanceEvent);
router.patch('/event/:eventId/publish', validateObjectIdParam('eventId'), eventController.publishEvent);
router.patch('/event/:eventId/archive', validateObjectIdParam('eventId'), eventController.archiveEvent);
router.patch('/event/:eventId/start', validateObjectIdParam('eventId'), eventController.startEventTimer);
router.delete('/event/:eventId', validateObjectIdParam('eventId'), eventController.deleteEvent);

module.exports = router;
