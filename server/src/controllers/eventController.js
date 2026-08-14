const eventService = require('../services/eventService');
const { asyncHandler } = require('../middleware/errorHandler');
const {
    isValidObjectId,
    validateCreateEventInput,
    validateCreatePublicEventInput,
    validateUpdateEventInput,
} = require('../utils/validators');
const { DURATION_CONSTRAINTS } = require('../utils/constants');

// Ensure ordered payload for event objects (creatorId, targetId, description)
const formatEventResponse = (event) => {
    const e = event.toObject ? event.toObject() : event;
    return {
        _id: e._id,
        originalEventId: e.originalEventId,
        creatorId: e.creatorId?._id || e.creatorId,
        targetId: e.targetId?._id || e.targetId,
        creator: e.creatorId,
        target: e.targetId,
        description: e.description,
        message: e.message || '',
        messageAuthorId: e.messageAuthorId?._id || e.messageAuthorId || null,
        messageAuthor: e.messageAuthorId || null,
        date: e.date,
        timeDuration: e.timeDuration,
        serialNo: e.serialNo,
        remainingSeconds: e.remainingSeconds,
        timerStartedAt: e.timerStartedAt,
        status: e.status,
        archivedAt: e.archivedAt,
        eventCreatedAt: e.eventCreatedAt,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
    };
};

const formatPublicEventResponse = (event, viewerUserId = null) => {
    const e = event.toObject ? event.toObject() : event;
    const likedBy = Array.isArray(e.likedBy) ? e.likedBy : [];
    const viewerId = viewerUserId ? String(viewerUserId) : '';
    const startDate = e.date || e.startDate || null;
    const startTime = e.time || e.startTime || '';
    const endDate = e.endDate || e.finishDate || null;
    const endTime = e.endTime || e.finishTime || '';
    const duration = e.duration ?? e.timeDuration ?? null;

    return {
        _id: e._id,
        creatorId: e.creatorId?._id || e.creatorId,
        creator: e.creatorId,
        title: e.title,
        description: e.description,
        location: e.location || e.venue || '',
        duration,
        date: startDate,
        time: startTime,
        startDate,
        startTime,
        endDate,
        endTime,
        likeCount: likedBy.length,
        likedByCurrentUser: viewerId
            ? likedBy.some((userId) => String(userId?._id || userId) === viewerId)
            : false,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
    };
};

// Create Event Controller
const createEvent = asyncHandler(async (req, res) => {
    const { creator, target, creatorId, targetId, description, message, date, timeDuration } = req.body;
    const creatorUserId = req.auth.userId;
    const targetUserId = target || targetId;

    try {
        const validation = validateCreateEventInput(
            creatorUserId,
            targetUserId,
            description,
            date,
            timeDuration,
            DURATION_CONSTRAINTS
        );

        if (!validation.valid) {
            return res.status(400).json({ message: validation.message });
        }

        const event = await eventService.createEvent(
            creatorUserId,
            targetUserId,
            description,
            message,
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
        const canViewAnotherUser = ['admin', 'superAdmin'].includes(req.auth.role);
        const requestedUserId = userId || req.auth.userId;
        const participantUserId = canViewAnotherUser ? requestedUserId : req.auth.userId;

        if (!isValidObjectId(participantUserId)) {
            return res.status(400).json({ message: 'Invalid user ID.' });
        }

        const events = await eventService.getEventsByStatus(status, participantUserId);
        return res.status(200).json({ events: events.map(formatEventResponse) });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error while fetching events.';
        return res.status(statusCode).json({ message });
    }
});

const createPublicEvent = asyncHandler(async (req, res) => {
    const { title, description, location, startDate, startTime, endDate, endTime } = req.body;
    const creatorId = req.auth.userId;

    try {
        const validation = validateCreatePublicEventInput(creatorId, title, description, location, startDate, startTime, endDate, endTime);

        if (!validation.valid) {
            return res.status(400).json({ message: validation.message });
        }

        const event = await eventService.createPublicEvent(
            creatorId,
            title,
            description,
            location,
            startDate,
            startTime,
            endDate,
            endTime,
            validation.durationMinutes
        );
        return res.status(201).json({
            message: 'Public event created successfully.',
            event: formatPublicEventResponse(event),
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error while creating public event.';
        return res.status(statusCode).json({ message });
    }
});

const getPublicEvents = asyncHandler(async (req, res) => {
    const { creatorId } = req.query;
    const viewerUserId = req.auth.userId;

    try {
        const events = await eventService.getPublicEvents(creatorId, viewerUserId);
        return res.status(200).json({ events: events.map((event) => formatPublicEventResponse(event, viewerUserId)) });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error while fetching public events.';
        return res.status(statusCode).json({ message });
    }
});

const likePublicEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const actorUserId = req.auth.userId;

    try {
        if (!actorUserId || !isValidObjectId(actorUserId)) {
            return res.status(400).json({ message: 'Invalid user ID.' });
        }

        const event = await eventService.likePublicEvent(eventId, actorUserId);
        return res.status(200).json({
            message: 'Public event liked successfully.',
            event: formatPublicEventResponse(event, actorUserId),
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error while liking public event.';
        return res.status(statusCode).json({ message });
    }
});

const deletePublicEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const actorUserId = req.auth.userId;

    try {
        await eventService.deletePublicEvent(eventId, actorUserId);
        return res.status(200).json({ message: 'Public event deleted successfully.' });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error while deleting public event.';
        return res.status(statusCode).json({ message });
    }
});

// Update Event Controller
const updateEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { description, message, actorUserId, date, timeDuration } = req.body;

    try {
        const validation = validateUpdateEventInput(description, date, timeDuration, DURATION_CONSTRAINTS);

        if (!validation.valid) {
            return res.status(400).json({ message: validation.message });
        }

        const event = await eventService.updateEvent(eventId, {
            description,
            message,
            actorUserId: req.auth.userId,
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
        const event = await eventService.advanceEvent(eventId, req.auth.userId);
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
    const actorUserId = req.auth.userId;

    try {
    const event = await eventService.publishEvent(eventId, req.auth.userId);
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

const archiveEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const actorUserId = req.auth.userId;

    try {
    const event = await eventService.archiveEvent(eventId, req.auth.userId);
        return res.status(200).json({
            message: 'Event archived successfully.',
            event: formatEventResponse(event),
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error while archiving event.';
        return res.status(statusCode).json({ message });
    }
});

const startEventTimer = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const actorUserId = req.auth.userId;

    try {
    const event = await eventService.startEventTimer(eventId, req.auth.userId);
        return res.status(200).json({
            message: 'Event timer started successfully.',
            event: formatEventResponse(event),
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error while starting event timer.';
        return res.status(statusCode).json({ message });
    }
});

// Delete Event Controller
const deleteEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    try {
        await eventService.deleteEvent(eventId, req.auth.userId);
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
    createPublicEvent,
    getPublicEvents,
    likePublicEvent,
    deletePublicEvent,
    updateEvent,
    advanceEvent,
    publishEvent,
    archiveEvent,
    startEventTimer,
    deleteEvent,
};
