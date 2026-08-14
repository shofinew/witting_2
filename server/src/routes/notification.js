const express = require('express');
const notificationController = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/auth');
const { validateObjectIdParam } = require('../middleware/validation');

const router = express.Router();

router.use(requireAuth);
router.get('/notifications', notificationController.getNotifications);
router.patch('/notifications/read-all', notificationController.markAllNotificationsRead);
router.patch(
    '/notifications/:notificationId/read',
    validateObjectIdParam('notificationId'),
    notificationController.markNotificationRead
);

module.exports = router;
