const Event = require('../models/Event');
const Archived = require('../models/Archived');
const PublicEvent = require('../models/PublicEvent');
const User = require('../models/User');
const { STATUS_ORDER, VALID_STATUSES, DEFAULT_STATUS } = require('../utils/constants');

const getCurrentRemainingSeconds = (event) => {
    const baseSeconds = typeof event.remainingSeconds === 'number' ? event.remainingSeconds : event.timeDuration * 60;

    if (!event.timerStartedAt) {
        return Math.max(0, baseSeconds);
    }

    const elapsedSeconds = Math.floor((Date.now() - new Date(event.timerStartedAt).getTime()) / 1000);
    return Math.max(0, baseSeconds - elapsedSeconds);
};

const buildParticipantQuery = (userId) => {
    if (!userId) {
        return {};
    }

    return {
        $or: [{ creatorId: userId }, { targetId: userId }],
    };
};

const addPublishedSerialNumbers = (events) => {
    const targetSerialMap = new Map();

    return events.map((event) => {
        const eventDate = event.date ? new Date(event.date).toISOString().slice(0, 10) : 'unknown-date';
        const targetId = String(event.targetId?._id || event.targetId || '');
        const serialKey = `${eventDate}:${targetId}`;
        const currentSerial = (targetSerialMap.get(serialKey) || 0) + 1;
        targetSerialMap.set(serialKey, currentSerial);

        return {
            ...event,
            serialNo: currentSerial,
        };
    });
};

const migrateLegacyArchivedEvents = async (userId) => {
    const participantQuery = buildParticipantQuery(userId);
    const legacyArchivedEvents = await Event.find({ status: 'archived', ...participantQuery }).lean();

    if (legacyArchivedEvents.length === 0) {
        return;
    }

    const archivedOperations = legacyArchivedEvents.map((event) => ({
        updateOne: {
            filter: { originalEventId: event._id },
            update: {
                $set: {
                    creatorId: event.creatorId,
                    targetId: event.targetId,
                    description: event.description,
                    date: event.date,
                    timeDuration: event.timeDuration,
                    remainingSeconds: typeof event.remainingSeconds === 'number'
                        ? event.remainingSeconds
                        : event.timeDuration * 60,
                    archivedAt: event.archivedAt || event.updatedAt || event.createdAt,
                    eventCreatedAt: event.createdAt,
                    createdAt: event.createdAt,
                    updatedAt: event.updatedAt || event.createdAt,
                    status: 'archived',
                },
                $setOnInsert: {
                    originalEventId: event._id,
                },
            },
            upsert: true,
        },
    }));

    await Archived.bulkWrite(archivedOperations);
    await Event.deleteMany({ _id: { $in: legacyArchivedEvents.map((event) => event._id) } });
};

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
            remainingSeconds: timeDuration * 60,
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

        const participantQuery = buildParticipantQuery(userId);

        if (status === 'archived') {
            await migrateLegacyArchivedEvents(userId);

            return Archived.find({ status, ...participantQuery })
                .populate('creatorId', 'name profession')
                .populate('targetId', 'name profession')
                .sort({ archivedAt: -1 })
                .lean();
        }

        const sortOrder = ['stage3', 'stage2', 'stage1', 'published'].includes(status)
            ? { createdAt: 1 }
            : { createdAt: -1 };

        const query = status === 'published' ? { status } : { status, ...participantQuery };

        const events = await Event.find(query)
            .populate('creatorId', 'name profession')
            .populate('targetId', 'name profession')
            .sort(sortOrder)
            .lean();

        if (status === 'published') {
            const publishedEvents = addPublishedSerialNumbers(events);

            if (!userId) {
                return publishedEvents;
            }

            return publishedEvents.filter((event) => {
                const creatorId = String(event.creatorId?._id || event.creatorId || '');
                const targetId = String(event.targetId?._id || event.targetId || '');
                return creatorId === userId || targetId === userId;
            });
        }

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
        event.remainingSeconds = updates.timeDuration * 60;
        event.timerStartedAt = null;
        await event.save();
        await event.populate([
            { path: 'creatorId', select: 'name profession' },
            { path: 'targetId', select: 'name profession' },
        ]);

        return event;
    },

    // Delete event
    deleteEvent: async (eventId, actorUserId) => {
        const event = await Event.findById(eventId);
        if (!event) {
            const error = new Error('Event not found.');
            error.statusCode = 404;
            throw error;
        }

        const creatorId = event.creatorId?.toString();
        const targetId = event.targetId?.toString();
        const actorId = actorUserId?.toString();

        if (event.status === 'stage3') {
            if (!actorId || actorId !== targetId) {
                const error = new Error('Only the target user can delete a stage3 event.');
                error.statusCode = 403;
                throw error;
            }
        } else if (event.status === 'stage2') {
            if (!actorId || actorId !== creatorId) {
                const error = new Error('Only the creator can delete a stage2 event.');
                error.statusCode = 403;
                throw error;
            }
        } else if (event.status === 'stage1') {
            if (!actorId || actorId !== targetId) {
                const error = new Error('Only the target user can delete a stage1 event.');
                error.statusCode = 403;
                throw error;
            }
        } else {
            const error = new Error('Only stage3, stage2, and stage1 events can be deleted.');
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
    publishEvent: async (eventId, actorUserId) => {
        const event = await Event.findById(eventId);
        if (!event) {
            const error = new Error('Event not found.');
            error.statusCode = 404;
            throw error;
        }

        if (!['stage3', 'stage2', 'stage1'].includes(event.status)) {
            const error = new Error('Only stage3, stage2, and stage1 events can be published.');
            error.statusCode = 400;
            throw error;
        }

        const actorId = actorUserId?.toString();
        const creatorId = event.creatorId?.toString();
        const targetId = event.targetId?.toString();
        const canPublish = (event.status === 'stage2' && actorId === creatorId)
            || ((event.status === 'stage3' || event.status === 'stage1') && actorId === targetId);

        if (!actorId || !canPublish) {
            const error = new Error('Only the assigned user can confirm and publish this event.');
            error.statusCode = 403;
            throw error;
        }

        event.status = 'published';
        if (typeof event.remainingSeconds !== 'number') {
            event.remainingSeconds = event.timeDuration * 60;
        }
        event.timerStartedAt = null;
        await event.save();
        await event.populate([
            { path: 'creatorId', select: 'name profession' },
            { path: 'targetId', select: 'name profession' },
        ]);

        return event;
    },

    archiveEvent: async (eventId, actorUserId) => {
        const event = await Event.findById(eventId);
        if (!event) {
            const error = new Error('Event not found.');
            error.statusCode = 404;
            throw error;
        }

        if (event.status !== 'published') {
            const error = new Error('Only published events can be archived.');
            error.statusCode = 400;
            throw error;
        }

        const actorId = actorUserId?.toString();
        const creatorId = event.creatorId?.toString();
        const targetId = event.targetId?.toString();

        if (!actorId || (actorId !== creatorId && actorId !== targetId)) {
            const error = new Error('Only an event participant can archive this event.');
            error.statusCode = 403;
            throw error;
        }

        const archivedEvent = new Archived({
            originalEventId: event._id,
            creatorId: event.creatorId,
            targetId: event.targetId,
            description: event.description,
            date: event.date,
            timeDuration: event.timeDuration,
            remainingSeconds: getCurrentRemainingSeconds(event),
            archivedAt: new Date(),
            eventCreatedAt: event.createdAt,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt || event.createdAt,
            status: 'archived',
        });

        await archivedEvent.save();
        await Event.findByIdAndDelete(eventId);
        await archivedEvent.populate([
            { path: 'creatorId', select: 'name profession' },
            { path: 'targetId', select: 'name profession' },
        ]);

        return archivedEvent;
    },

    startEventTimer: async (eventId, actorUserId) => {
        const event = await Event.findById(eventId);
        if (!event) {
            const error = new Error('Event not found.');
            error.statusCode = 404;
            throw error;
        }

        if (event.status !== 'published') {
            const error = new Error('Only published events can be started.');
            error.statusCode = 400;
            throw error;
        }

        if (!actorUserId || event.creatorId?.toString() !== actorUserId.toString()) {
            const error = new Error('Only the creator can start this event.');
            error.statusCode = 403;
            throw error;
        }

        if (event.timerStartedAt) {
            const error = new Error('This event timer is already running.');
            error.statusCode = 400;
            throw error;
        }

        const remainingSeconds = getCurrentRemainingSeconds(event);
        if (remainingSeconds <= 0) {
            const error = new Error('This event timer has already finished.');
            error.statusCode = 400;
            throw error;
        }

        event.remainingSeconds = remainingSeconds;
        event.timerStartedAt = new Date();
        await event.save();
        await event.populate([
            { path: 'creatorId', select: 'name profession' },
            { path: 'targetId', select: 'name profession' },
        ]);

        return event;
    },

    createPublicEvent: async (creatorId, title, description, date, time) => {
        const creator = await User.findById(creatorId).lean();

        if (!creator) {
            const error = new Error('Creator user not found.');
            error.statusCode = 404;
            throw error;
        }

        const publicEvent = new PublicEvent({
            creatorId,
            title: title.trim(),
            description: description.trim(),
            date: new Date(date),
            time: String(time).trim(),
        });

        await publicEvent.save();
        await publicEvent.populate({ path: 'creatorId', select: 'name profession' });

        return publicEvent;
    },

    getPublicEvents: async () => {
        return PublicEvent.find({})
            .populate('creatorId', 'name profession')
            .sort({ date: 1, time: 1, createdAt: -1 })
            .lean();
    },
};

module.exports = eventService;
