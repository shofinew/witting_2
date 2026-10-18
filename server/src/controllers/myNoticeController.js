const MyNotice = require('../models/MyNotice');
const { asyncHandler } = require('../middleware/errorHandler');

const MAX_NOTICE_LENGTH = 1000;

const formatNotice = (notice) => {
    const value = notice.toObject ? notice.toObject() : notice;
    return {
        _id: value._id,
        ownerId: value.ownerId,
        content: value.content,
        createdAt: value.createdAt,
        updatedAt: value.updatedAt,
    };
};

const getMyNotices = asyncHandler(async (req, res) => {
    const notices = await MyNotice.find({ ownerId: req.auth.userId })
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json({ notices: notices.map(formatNotice) });
});

const getUserNotices = asyncHandler(async (req, res) => {
    const notices = await MyNotice.find({ ownerId: req.params.userId })
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json({ notices: notices.map(formatNotice) });
});

const createMyNotice = asyncHandler(async (req, res) => {
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';

    if (!content) {
        return res.status(400).json({ message: 'Notice content is required.' });
    }

    if (content.length > MAX_NOTICE_LENGTH) {
        return res.status(400).json({ message: `Notice content must be ${MAX_NOTICE_LENGTH} characters or fewer.` });
    }

    const notice = await MyNotice.create({
        ownerId: req.auth.userId,
        content,
    });

    return res.status(201).json({ notice: formatNotice(notice) });
});

module.exports = {
    getMyNotices,
    getUserNotices,
    createMyNotice,
};
