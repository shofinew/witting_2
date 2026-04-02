const STATUS_ORDER = {
    stage3: 'stage2',
    stage2: 'stage1',
};

const VALID_STATUSES = ['stage3', 'stage2', 'stage1', 'published'];

const DEFAULT_STATUS = 'stage3';

const DURATION_CONSTRAINTS = {
    MIN: 10,
    MAX: 60,
};

module.exports = {
    STATUS_ORDER,
    VALID_STATUSES,
    DEFAULT_STATUS,
    DURATION_CONSTRAINTS,
};
