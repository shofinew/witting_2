const Event = require('../models/Event');
const User = require('../models/User');
const { STATUS_ORDER, VALID_STATUSES, DEFAULT_STATUS } = require('../utils/constants');

const eventService = {
    // Create a new event
    createEvent: async (creatorId, targetId, description, date, timeDuration) => {
        const [creator, target] = await Promise.all([
            User.findById(creatorId).lean(),
            User.findById(targetId).lean(),
        ]);

        if (!creator || !target) {
            const error = new Error('Creator or target user not found.');
            error.statusCode = 404;
            throw error;
        }

        const event = new Event({
            creatorId,
            targetId,
            description: description.trim(),
            date: new Date(date),
            timeDuration: timeDuration,
            status: DEFAULT_STATUS,
        });

        await event.save();
        await event.populate([
            { path: 'creatorId', select: 'name profession' },
            { path: 'targetId', select: 'name profession' },
        ]);

        return event;
    },

    // Get events by status (optionally filtered by userId - shows events where user is creator or target)
    getEventsByStatus: async (status, userId) => {
        if (!VALID_STATUSES.includes(status)) {
            const error = new Error('A valid status query is required.');
            error.statusCode = 400;
            throw error;
        }

        const query = { status };
        if (userId) {
            query.$or = [{ creatorId: userId }, { targetId: userId }];
        }

        const events = await Event.find(query)
            .populate('creatorId', 'name profession')
            .populate('targetId', 'name profession')
            .sort({ createdAt: -1 })
            .lean();

        return events;
    },

    // Update event details
    updateEvent: async (eventId, updates) => {
        const event = await Event.findById(eventId);
        if (!event) {
            const error = new Error('Event not found.');
            error.statusCode = 404;
            throw error;
        }

        if (!['stage3', 'stage2'].includes(event.status)) {
            const error = new Error('Only stage3 and stage2 events can be edited.');
            error.statusCode = 400;
            throw error;
        }

        event.description = updates.description.trim();
        event.date = new Date(updates.date);
        event.timeDuration = updates.timeDuration;
        await event.save();
        await event.populate([
            { path: 'creatorId', select: 'name profession' },
            { path: 'targetId', select: 'name profession' },
        ]);

        return event;
    },

    // Delete event
    deleteEvent: async (eventId) => {
        const event = await Event.findById(eventId);
        if (!event) {
            const error = new Error('Event not found.');
            error.statusCode = 404;
            throw error;
        }

        if (!['stage3', 'stage2'].includes(event.status)) {
            const error = new Error('Only stage3 and stage2 events can be deleted.');
            error.statusCode = 400;
            throw error;
        }

        await Event.findByIdAndDelete(eventId);
    },

    // Advance event to next stage
    advanceEvent: async (eventId) => {
        const event = await Event.findById(eventId);
        if (!event) {
            const error = new Error('Event not found.');
            error.statusCode = 404;
            throw error;
        }

        const nextStatus = STATUS_ORDER[event.status];
        if (!nextStatus) {
            const error = new Error('This event cannot be advanced from its current stage.');
            error.statusCode = 400;
            throw error;
        }

        event.status = nextStatus;
        await event.save();
        await event.populate([
            { path: 'creatorId', select: 'name profession' },
            { path: 'targetId', select: 'name profession' },
        ]);

        return event;
    },

    // Publish event
    publishEvent: async (eventId) => {
        const event = await Event.findById(eventId);
        if (!event) {
            const error = new Error('Event not found.');
            error.statusCode = 404;
            throw error;
        }

        if (event.status !== 'stage1') {
            const error = new Error('Only stage1 events can be published.');
            error.statusCode = 400;
            throw error;
        }

        event.status = 'published';
        await event.save();
        await event.populate([
            { path: 'creatorId', select: 'name profession' },
            { path: 'targetId', select: 'name profession' },
        ]);

        return event;
    },
};

module.exports = eventService;
