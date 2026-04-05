export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const NAV_ITEMS = [
    { id: 'users', label: 'All Users' },
    { id: 'home', label: 'Home' },
    { id: 'public-event', label: 'Public Event' },
    { id: 'family', label: 'Family' },
    { id: 'stage1', label: 'Stage1' },
    { id: 'stage2', label: 'Stage2' },
    { id: 'stage3', label: 'Stage3' },
    { id: 'search', label: 'Search User' },
    { id: 'profile', label: 'Profile' },
];

export const DURATION_OPTIONS = Array.from({ length: 6 }, (_, index) => {
    const minutes = (index + 1) * 10;
    return {
        value: String(minutes),
        label: `${minutes} minutes`,
    };
});

export const PAGE_TO_STATUS = {
    home: 'published',
    stage1: 'stage1',
    stage2: 'stage2',
    stage3: 'stage3',
};

export const STATUS_LABELS = {
    stage3: 'Stage3',
    stage2: 'Stage2',
    stage1: 'Stage1',
    published: 'Published',
    archived: 'Archived',
};
