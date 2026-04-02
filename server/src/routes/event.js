const express = require('express');
const eventController = require('../controllers/eventController');
const { validateObjectIdParam } = require('../middleware/validation');

const router = express.Router();

// Event Routes
router.post('/event/add', eventController.createEvent);
router.get('/events', eventController.getEventsByStatus);
router.patch('/event/:eventId/advance', validateObjectIdParam('eventId'), eventController.advanceEvent);
router.patch('/event/:eventId/publish', validateObjectIdParam('eventId'), eventController.publishEvent);

module.exports = router;
