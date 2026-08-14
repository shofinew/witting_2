const Event = require('../models/Event');
const Archived = require('../models/Archived');
const PublicEvent = require('../models/PublicEvent');
const PublicArchived = require('../models/PublicArchived');
const User = require('../models/User');
const Follower = require('../models/Follower');
const notificationService = require('./notificationService');
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
                    message: event.message || '',
                    messageAuthorId: event.messageAuthorId || null,
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

const archiveExpiredPublicEvents = async () => {
    const now = new Date();
    const expiredEvents = await PublicEvent.find({
        endDate: { $lte: now },
    }).lean();

    if (expiredEvents.length === 0) {
        return [];
    }

    const archiveOperations = expiredEvents.map((event) => ({
        updateOne: {
            filter: { originalPublicEventId: event._id },
            update: {
                $set: {
                    creatorId: event.creatorId,
                    title: event.title,
                    description: event.description,
                    location: event.location,
                    duration: event.duration,
                    date: event.date,
                    time: event.time,
                    endDate: event.endDate,
                    endTime: event.endTime,
                    likedBy: event.likedBy || [],
                    archivedAt: event.updatedAt || event.createdAt || now,
                    createdAt: event.createdAt,
                    updatedAt: event.updatedAt || event.createdAt || now,
                    status: 'archived',
                },
                $setOnInsert: {
                    originalPublicEventId: event._id,
                },
            },
            upsert: true,
        },
    }));

    await PublicArchived.bulkWrite(archiveOperations);
    await PublicEvent.deleteMany({ _id: { $in: expiredEvents.map((event) => event._id) } });

    return expiredEvents;
};

const eventService = {
    // Create a new event
    createEvent: async (creatorId, targetId, description, message, date, timeDuration) => {
        const [creator, target] = await Promise.all([
            User.findById(creatorId).lean(),
            User.findById(targetId).lean(),
        ]);

        if (!creator || !target) {
            const error = new Error('Creator or target user not found.');
            error.statusCode = 404;
            throw error;
        }

        const trimmedMessage = message ? message.trim() : '';
        const initialMessage = trimmedMessage ? `${creator.name}: ${trimmedMessage}` : '';
        const event = new Event({
            creatorId,
            targetId,
            description: description.trim(),
            message: initialMessage,
            messageAuthorId: trimmedMessage ? creatorId : null,
            date: new Date(date),
            timeDuration: timeDuration,
            remainingSeconds: timeDuration * 60,
            status: DEFAULT_STATUS,
        });

        await event.save();
        await notificationService.createEventNotification({
            event,
            recipientId: targetId,
            actorId: creatorId,
            type: 'event-created',
            stage: event.status,
            message: `${creator.name} created an event for you.`,
            sourceKey: `event:${event._id}:created:${targetId}`,
        });
        await event.populate([
            { path: 'creatorId', select: 'name profession' },
            { path: 'targetId', select: 'name profession' },
            { path: 'messageAuthorId', select: 'name profession' },
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
                .populate('messageAuthorId', 'name profession')
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
            .populate('messageAuthorId', 'name profession')
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

        const nextMessage = updates.message ? updates.message.trim() : '';
        const currentMessage = event.message ? event.message.trim() : '';

        if (nextMessage) {
            if (!updates.actorUserId || !event.creatorId || !event.targetId) {
                const error = new Error('User information is required to add a message.');
                error.statusCode = 400;
                throw error;
            }

            const actorId = updates.actorUserId.toString();
            const creatorId = event.creatorId.toString();
            const targetId = event.targetId.toString();

            if (actorId !== creatorId && actorId !== targetId) {
                const error = new Error('Only event participants can add messages.');
                error.statusCode = 403;
                throw error;
            }

            const actor = await User.findById(updates.actorUserId).select('name').lean();
            if (!actor) {
                const error = new Error('Actor user not found.');
                error.statusCode = 404;
                throw error;
            }

            const formattedMessage = `${actor.name}: ${nextMessage}`;
            event.message = currentMessage ? `${currentMessage}\n${formattedMessage}` : formattedMessage;
            event.messageAuthorId = updates.actorUserId;
        }

        event.date = new Date(updates.date);
        event.timeDuration = updates.timeDuration;
        event.remainingSeconds = updates.timeDuration * 60;
        event.timerStartedAt = null;
        await event.save();
        if (nextMessage) {
            const actorId = String(updates.actorUserId);
            const creatorId = String(event.creatorId);
            const targetId = String(event.targetId);
            const recipientId = actorId === creatorId ? targetId : creatorId;
            await notificationService.createEventNotification({
                event,
                recipientId,
                actorId,
                type: 'message-added',
                stage: event.status,
                message: 'A new message was added to your event.',
                sourceKey: `event:${event._id}:message:${event.updatedAt?.getTime() || Date.now()}`,
            });
        }
        await event.populate([
            { path: 'creatorId', select: 'name profession' },
            { path: 'targetId', select: 'name profession' },
            { path: 'messageAuthorId', select: 'name profession' },
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
    advanceEvent: async (eventId, actorUserId) => {
        const event = await Event.findById(eventId);
        if (!event) {
            const error = new Error('Event not found.');
            error.statusCode = 404;
            throw error;
        }

        const actorId = String(actorUserId || '');
        if (actorId !== String(event.creatorId) && actorId !== String(event.targetId)) {
            const error = new Error('You are not allowed to advance this event.');
            error.statusCode = 403;
            throw error;
        }

        const previousStatus = event.status;
        const nextStatus = STATUS_ORDER[previousStatus];
        if (!nextStatus) {
            const error = new Error('This event cannot be advanced from its current stage.');
            error.statusCode = 400;
            throw error;
        }

        event.status = nextStatus;
        await event.save();
        const nextActionRecipientId = nextStatus === 'stage2' ? event.creatorId : event.targetId;
        await notificationService.createEventNotification({
            event,
            recipientId: nextActionRecipientId,
            actorId: actorUserId,
            type: 'stage-action',
            stage: nextStatus,
            message: `The event moved from ${previousStatus} to ${nextStatus}.`,
            sourceKey: `event:${event._id}:stage:${nextStatus}:${nextActionRecipientId}`,
        });
        await event.populate([
            { path: 'creatorId', select: 'name profession' },
            { path: 'targetId', select: 'name profession' },
            { path: 'messageAuthorId', select: 'name profession' },
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
        const otherParticipantId = String(event.creatorId) === String(actorUserId)
            ? event.targetId
            : event.creatorId;
        await notificationService.createEventNotification({
            event,
            recipientId: otherParticipantId,
            actorId: actorUserId,
            type: 'event-published',
            stage: event.status,
            message: 'The event was confirmed and published.',
            sourceKey: `event:${event._id}:published:${otherParticipantId}`,
        });
        await event.populate([
            { path: 'creatorId', select: 'name profession' },
            { path: 'targetId', select: 'name profession' },
            { path: 'messageAuthorId', select: 'name profession' },
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
            message: event.message || '',
            messageAuthorId: event.messageAuthorId || null,
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
            { path: 'messageAuthorId', select: 'name profession' },
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
            { path: 'messageAuthorId', select: 'name profession' },
        ]);

        return event;
    },

    createPublicEvent: async (creatorId, title, description, location, startDate, startTime, endDate, endTime, duration) => {
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
            location: location.trim(),
            duration: Number(duration),
            date: new Date(`${startDate}T${startTime}`),
            time: String(startTime).trim(),
            endDate: new Date(`${endDate}T${endTime}`),
            endTime: String(endTime).trim(),
        });

        await publicEvent.save();
        await publicEvent.populate({ path: 'creatorId', select: 'name profession' });

        return publicEvent;
    },

    getPublicEvents: async (creatorId, viewerUserId) => {
        await archiveExpiredPublicEvents();

        const query = {};
        if (creatorId) {
            query.creatorId = creatorId;
        } else if (viewerUserId) {
            const followedUsers = await Follower.find({ followerUser: viewerUserId })
                .select('followeeUser')
                .lean();
            const visibleCreatorIds = [
                viewerUserId,
                ...followedUsers.map((relationship) => relationship.followeeUser),
            ];

            query.creatorId = { $in: visibleCreatorIds };
        }

        return PublicEvent.find(query)
            .populate('creatorId', 'name profession')
            .sort({ date: 1, time: 1, createdAt: -1 })
            .lean();
    },

    likePublicEvent: async (eventId, actorUserId) => {
        const [event, actor] = await Promise.all([
            PublicEvent.findById(eventId),
            User.findById(actorUserId).select('_id').lean(),
        ]);

        if (!event) {
            const error = new Error('Public event not found.');
            error.statusCode = 404;
            throw error;
        }

        if (!actor) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        const creatorId = event.creatorId?.toString();
        const actorId = actorUserId?.toString();

        if (!actorId || actorId === creatorId) {
            const error = new Error('You cannot like your own public event.');
            error.statusCode = 403;
            throw error;
        }

        const updatedEvent = await PublicEvent.findByIdAndUpdate(
            eventId,
            { $addToSet: { likedBy: actorUserId } },
            { new: true }
        ).populate('creatorId', 'name profession');

        return updatedEvent;
    },

    deletePublicEvent: async (eventId, actorUserId) => {
        const event = await PublicEvent.findById(eventId);
        if (!event) {
            const error = new Error('Public event not found.');
            error.statusCode = 404;
            throw error;
        }

        const creatorId = event.creatorId?.toString();
        const actorId = actorUserId?.toString();

        if (!actorId || actorId !== creatorId) {
            const error = new Error('Only the creator can delete this public event.');
            error.statusCode = 403;
            throw error;
        }

        await PublicEvent.findByIdAndDelete(eventId);
    },
};

module.exports = eventService;
