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
            { path: 'creatorId', select: 'name email' },
            { path: 'targetId', select: 'name email' },
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
            .populate('creatorId', 'name email')
            .populate('targetId', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        return events;
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
            { path: 'creatorId', select: 'name email' },
            { path: 'targetId', select: 'name email' },
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
            { path: 'creatorId', select: 'name email' },
            { path: 'targetId', select: 'name email' },
        ]);

        return event;
    },
};

module.exports = eventService;
