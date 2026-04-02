const eventService = require('../services/eventService');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateCreateEventInput, validateUpdateEventInput } = require('../utils/validators');
const { DURATION_CONSTRAINTS } = require('../utils/constants');

// Ensure ordered payload for event objects (creatorId, targetId, description)
const formatEventResponse = (event) => {
    const e = event.toObject ? event.toObject() : event;
    return {
        _id: e._id,
        creatorId: e.creatorId,
        targetId: e.targetId,
        description: e.description,
        date: e.date,
        timeDuration: e.timeDuration,
        status: e.status,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
    };
};

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
            event: formatEventResponse(event),
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
        return res.status(200).json({ events: events.map(formatEventResponse) });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error while fetching events.';
        return res.status(statusCode).json({ message });
    }
});

// Update Event Controller
const updateEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { description, date, timeDuration } = req.body;

    try {
        const validation = validateUpdateEventInput(description, date, timeDuration, DURATION_CONSTRAINTS);

        if (!validation.valid) {
            return res.status(400).json({ message: validation.message });
        }

        const event = await eventService.updateEvent(eventId, {
            description,
            date,
            timeDuration: validation.durationNumber,
        });

        return res.status(200).json({
            message: 'Event updated successfully.',
            event: formatEventResponse(event),
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error while updating event.';
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
            event: formatEventResponse(event),
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
            event: formatEventResponse(event),
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error while publishing event.';
        return res.status(statusCode).json({ message });
    }
});

// Delete Event Controller
const deleteEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    try {
        await eventService.deleteEvent(eventId);
        return res.status(200).json({ message: 'Event deleted successfully.' });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error while deleting event.';
        return res.status(statusCode).json({ message });
    }
});

module.exports = {
    createEvent,
    getEventsByStatus,
    updateEvent,
    advanceEvent,
    publishEvent,
    deleteEvent,
};
