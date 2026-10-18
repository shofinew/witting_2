const express = require('express');
const myNoticeController = require('../controllers/myNoticeController');
const { requireAuth } = require('../middleware/auth');
const { validateObjectIdParam } = require('../middleware/validation');

const router = express.Router();

router.use(requireAuth);
router.get('/my-notices', myNoticeController.getMyNotices);
router.get('/my-notices/user/:userId', validateObjectIdParam('userId'), myNoticeController.getUserNotices);
router.post('/my-notices', myNoticeController.createMyNotice);

module.exports = router;
