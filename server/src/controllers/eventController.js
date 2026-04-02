const eventService = require('../services/eventService');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateCreateEventInput } = require('../utils/validators');
const { DURATION_CONSTRAINTS } = require('../utils/constants');

// Create Event Controller
const createEvent = asyncHandler(async (req, res) => {
    const { creatorId, targetId, description, date, timeDuration } = req.body;

    try {
        const validation = validateCreateEventInput(
            creatorId,
            targetId,
            description,
            date,
            timeDuration,
            DURATION_CONSTRAINTS
        );

        if (!validation.valid) {
            return res.status(400).json({ message: validation.message });
        }

        const event = await eventService.createEvent(
            creatorId,
            targetId,
            description,
            date,
            validation.durationNumber
        );

        return res.status(201).json({
            message: 'Event created successfully.',
            ...event.toObject(),
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error while creating event.';
        return res.status(statusCode).json({ message });
    }
});

// Get Events by Status Controller
const getEventsByStatus = asyncHandler(async (req, res) => {
    const { status, userId } = req.query;

    try {
        const events = await eventService.getEventsByStatus(status, userId);
        return res.status(200).json({ events });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error while fetching events.';
        return res.status(statusCode).json({ message });
    }
});

// Advance Event Controller
const advanceEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    try {
        const event = await eventService.advanceEvent(eventId);
        return res.status(200).json({
            message: `Event moved to ${event.status}.`,
            ...event.toObject(),
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error while advancing event.';
        return res.status(statusCode).json({ message });
    }
});

// Publish Event Controller
const publishEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    try {
        const event = await eventService.publishEvent(eventId);
        return res.status(200).json({
            message: 'Event published successfully.',
            ...event.toObject(),
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error while publishing event.';
        return res.status(statusCode).json({ message });
    }
});

module.exports = {
    createEvent,
    getEventsByStatus,
    advanceEvent,
    publishEvent,
};
