const { asyncHandler } = require('../middleware/errorHandler');
const notificationService = require('../services/notificationService');

const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await notificationService.getNotificationsForUser(req.auth.userId, req.query.limit);
    return res.status(200).json({ notifications });
});

const markNotificationRead = asyncHandler(async (req, res) => {
    const notification = await notificationService.markNotificationRead(req.params.notificationId, req.auth.userId);
    if (!notification) {
        return res.status(404).json({ message: 'Notification not found.' });
    }
    return res.status(200).json({ notification });
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
    const modifiedCount = await notificationService.markAllNotificationsRead(req.auth.userId);
    return res.status(200).json({ modifiedCount });
});

module.exports = {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
};
