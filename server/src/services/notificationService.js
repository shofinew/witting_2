const Notification = require('../models/Notification');
const User = require('../models/User');

const getStageLabel = (stage) => ({
    stage3: 'Stage3',
    stage2: 'Stage2',
    stage1: 'Stage1',
    published: 'Waiting Event',
    archived: 'Archived',
}[stage] || 'Event');

const createEventNotification = async ({
    event,
    recipientId,
    actorId = null,
    type,
    stage,
    message,
    sourceKey,
}) => {
    if (!event || !recipientId || !sourceKey) {
        return null;
    }

    const participantIds = [event.creatorId, event.targetId].filter(Boolean);
    const participants = await User.find({ _id: { $in: participantIds } }).select('name').lean();
    const namesById = new Map(participants.map((user) => [String(user._id), user.name]));
    const creatorName = namesById.get(String(event.creatorId)) || 'Unknown creator';
    const targetName = namesById.get(String(event.targetId)) || 'Unknown target';
    const isAction = type === 'event-created' || type === 'stage-action';
    const stageLabel = getStageLabel(stage);

    return Notification.findOneAndUpdate(
        { sourceKey },
        {
            $setOnInsert: {
                recipientId,
                actorId,
                eventId: event._id,
                type,
                stage,
                title: isAction ? `${stageLabel} action needed` : `${stageLabel} update`,
                message,
                creatorName,
                targetName,
                isRead: false,
                sourceKey,
            },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
};

const getNotificationsForUser = async (recipientId, limit = 30) => Notification.find({ recipientId })
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(Number(limit) || 30, 1), 100))
    .lean();

const markNotificationRead = async (notificationId, recipientId) => Notification.findOneAndUpdate(
    { _id: notificationId, recipientId },
    { $set: { isRead: true } },
    { new: true }
).lean();

const markAllNotificationsRead = async (recipientId) => {
    const result = await Notification.updateMany(
        { recipientId, isRead: false },
        { $set: { isRead: true } }
    );
    return result.modifiedCount || 0;
};

module.exports = {
    createEventNotification,
    getNotificationsForUser,
    markNotificationRead,
    markAllNotificationsRead,
};
