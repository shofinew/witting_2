import React, { useEffect, useState } from 'react';
import { getCountryLabel } from '../utils/countries';
import { canManageUsers, getUserUniqueId } from '../utils/user';
import { authAPI, eventAPI, myNoticeAPI, userAPI } from '../api';

const DETAIL_FIELDS = [
    { label: 'Designation', key: 'designation' },
    { label: 'Achievement', key: 'achievement' },
    { label: 'Country', key: 'country' },
    { label: 'Specialist At', key: 'specialistAt' },
    { label: 'Profession', key: 'profession' },
    { label: 'Chamber', key: 'chamber' },
];

const PROFILE_COMPLETION_FIELDS = [
    'designation',
    'achievement',
    'phone',
    'country',
    'dateOfBirth',
    'gender',
    'specialistAt',
    'profession',
    'chamber',
];

const formatAvailabilityDate = (value) => {
    if (!value) return null;

    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? null
        : date.toLocaleDateString([], { dateStyle: 'medium' });
};

export function UserProfileModal({ user, currentUser, onClose, onUserChange, onCurrentUserUpdate }) {
    const [activeSection, setActiveSection] = useState('profile');
    const [userNotices, setUserNotices] = useState([]);
    const [isNoticesLoading, setIsNoticesLoading] = useState(false);
    const [noticesError, setNoticesError] = useState('');
    const [followError, setFollowError] = useState('');
    const [isFollowSubmitting, setIsFollowSubmitting] = useState(false);
    const [isBlockSubmitting, setIsBlockSubmitting] = useState(false);
    const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
    const [blockMessage, setBlockMessage] = useState('');
    const [viewerRole, setViewerRole] = useState(currentUser?.role || '');
    const [activeEventView, setActiveEventView] = useState(null);
    const [profileEvents, setProfileEvents] = useState([]);
    const [isEventsLoading, setIsEventsLoading] = useState(false);
    const [eventsError, setEventsError] = useState('');
    const [accountDataView, setAccountDataView] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [accountDataLoading, setAccountDataLoading] = useState(false);
    const [accountDataError, setAccountDataError] = useState('');
    const canViewEventHistory = canManageUsers({ role: viewerRole });
    const canFollow = currentUser?._id && currentUser._id !== user._id && !user.isPaused;
    const isBlocked = Boolean(user.isBlockedByViewer || user.isBlockedByUser);
    const uniqueIdLabel = getUserUniqueId(user);
    const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== '';
    const identityCompletion = ['name', 'email'].filter((field) => hasValue(user[field])).length * 10;
    const additionalCompletion = PROFILE_COMPLETION_FIELDS.filter((field) => hasValue(user[field])).length;
    const profileCompletion = Math.min(100, Math.round(identityCompletion + (additionalCompletion / PROFILE_COMPLETION_FIELDS.length) * 80));
    const progressColor = profileCompletion === 100
        ? 'bg-emerald-500'
        : profileCompletion >= 31
            ? 'bg-yellow-400'
            : 'bg-red-500';
    const initials = String(user.name || 'U')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('');
    const availabilityType = user.availabilityType || 'everyday';
    const savedAvailabilityDates = Array.isArray(user.availableDates) && user.availableDates.length > 0
        ? user.availableDates
        : (user.availableDate ? [user.availableDate] : []);
    const availabilityDates = [...new Set(savedAvailabilityDates.map(formatAvailabilityDate).filter(Boolean))];

    useEffect(() => {
        let isMounted = true;
        const loadViewerRole = async () => {
            if (!currentUser?._id) return;
            if (currentUser.role) {
                setViewerRole(currentUser.role);
                return;
            }
            try {
                const response = await userAPI.getById(currentUser._id, currentUser._id);
                if (isMounted) setViewerRole(response.user?.role || '');
            } catch {
                if (isMounted) setViewerRole('');
            }
        };
        loadViewerRole();
        return () => { isMounted = false; };
    }, [currentUser?._id, currentUser?.role]);

    useEffect(() => {
        if (activeSection !== 'notice' || !user?._id) return undefined;

        let isMounted = true;
        const loadUserNotices = async () => {
            try {
                setIsNoticesLoading(true);
                setNoticesError('');
                const response = await myNoticeAPI.getByUser(user._id);
                if (isMounted) setUserNotices(Array.isArray(response.notices) ? response.notices : []);
            } catch (error) {
                if (isMounted) setNoticesError(error.message || 'Failed to load notices.');
            } finally {
                if (isMounted) setIsNoticesLoading(false);
            }
        };

        loadUserNotices();
        return () => { isMounted = false; };
    }, [activeSection, user?._id]);

    const loadProfileEvents = async (view) => {
        if (!canViewEventHistory || !user?._id) return;
        try {
            setActiveEventView(view);
            setAccountDataView(null);
            setIsEventsLoading(true);
            setEventsError('');
            const statuses = view === 'archive' ? ['archived'] : ['stage3', 'stage2', 'stage1', 'published'];
            const responses = await Promise.all(statuses.map((status) => eventAPI.getByStatus(status, user._id)));
            const loadedEvents = responses.flatMap((response) => response.events || []);
            setProfileEvents(view === 'expired'
                ? loadedEvents.filter((event) => event.date && new Date(event.date) < new Date())
                : loadedEvents);
        } catch (error) {
            setEventsError(error.message || `Failed to load ${view} events.`);
            setProfileEvents([]);
        } finally {
            setIsEventsLoading(false);
        }
    };

    const loadAccountData = async (view) => {
        if (!canViewEventHistory || !user?._id) return;
        try {
            setAccountDataView(view);
            setActiveEventView(null);
            setAccountDataLoading(true);
            setAccountDataError('');
            if (view === 'audit') {
                const response = await authAPI.getAuditLogs(user._id);
                setAuditLogs(response.logs || []);
            } else {
                const response = await authAPI.getBlockedUsers(user._id);
                setBlockedUsers(response.blockedUsers || []);
            }
        } catch (error) {
            setAccountDataError(error.message || `Failed to load ${view === 'audit' ? 'audit logs' : 'blocked users'}.`);
        } finally {
            setAccountDataLoading(false);
        }
    };

    const handleToggleFollow = async () => {
        if (!canFollow) {
            return;
        }

        try {
            setFollowError('');
            setBlockMessage('');
            setIsFollowSubmitting(true);
            const response = await authAPI.toggleFollow(currentUser._id, user._id);
            onUserChange(response.targetUser);
            onCurrentUserUpdate(response.currentUser);
        } catch (error) {
            setFollowError(error.message || 'Failed to update follow status.');
        } finally {
            setIsFollowSubmitting(false);
        }
    };

    const handleBlockClick = async (confirmed = false) => {
        if (!currentUser?._id || currentUser._id === user._id) {
            return;
        }

        if (!isBlocked && !confirmed) {
            setIsBlockConfirmOpen(true);
            return;
        }

        try {
            setFollowError('');
            setBlockMessage('');
            setIsBlockConfirmOpen(false);
            setIsBlockSubmitting(true);
            const response = await authAPI.toggleBlock(currentUser._id, user._id);
            onUserChange({ ...user, isBlockedByViewer: response.isBlocked, isBlockedByUser: user.isBlockedByUser });
            onCurrentUserUpdate(response.currentUser);
            setBlockMessage(response.isBlocked ? 'User blocked successfully.' : 'User unblocked successfully.');
        } catch (error) {
            setBlockMessage(error.message || 'Failed to update block status.');
        } finally {
            setIsBlockSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/55 px-3 py-4 backdrop-blur-sm sm:px-5 sm:py-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-profile-modal-title"
            onClick={onClose}
        >
            <div
                className="mt-0 flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/70 bg-slate-50 shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="relative border-b border-indigo-900/20 bg-gradient-to-br from-[#161080] via-indigo-700 to-[#0084ff] px-3 py-3 text-white sm:px-4">
                    <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-start gap-2.5 pr-16 sm:gap-3 lg:pr-0">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/20 text-base font-black text-white shadow-md backdrop-blur-sm">
                                {initials || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-100">User Profile</p>
                                <h3 id="user-profile-modal-title" className="mt-0.5 break-words text-xl font-black leading-tight text-white sm:text-2xl">
                                    {user.name}
                                </h3>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                    <span className="rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                                        ID: {uniqueIdLabel}
                                    </span>
                                    <span className="rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                                        {user.profession || 'Profession not set'}
                                    </span>
                                    <span className="rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                                        {getCountryLabel(user.country)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-end gap-1 self-end">
                            {canFollow && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleToggleFollow}
                                        disabled={isFollowSubmitting}
                                        className={`rounded-lg px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${user.isFollowing
                                            ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            }`}
                                    >
                                        {isFollowSubmitting ? 'Updating...' : user.isFollowing ? 'Unfollow' : 'Follow'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleBlockClick()}
                                        disabled={isBlockSubmitting}
                                        className={`rounded-lg px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${isBlocked
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                            : 'bg-red-50 text-red-600 ring-1 ring-red-200 hover:bg-red-100'
                                            }`}
                                    >
                                        {isBlockSubmitting ? 'Updating...' : isBlocked ? 'Unblock' : 'Block'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-3 top-3 rounded-lg border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:border-red-500 hover:bg-red-600"
                    >
                        Close
                    </button>
                </div>

                <div className="flex gap-2 border-t border-slate-100 bg-slate-50 px-2.5 py-2.5 sm:px-3" role="tablist" aria-label="User profile sections">
                    <button
                        type="button"
                        onClick={() => setActiveSection('profile')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition ${activeSection === 'profile' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
                    >
                        Profile
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSection('notice')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition ${activeSection === 'notice' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
                    >
                        Notice
                    </button>
                </div>

                {isBlockConfirmOpen && !isBlocked && (
                    <div className="border-b border-red-200 bg-red-50 px-3 py-3 sm:px-4" role="alertdialog" aria-label="Confirm blocking user">
                        <p className="text-sm font-bold text-red-900">Block {user.name}?</p>
                        <p className="mt-1 text-xs text-red-700">This user will be blocked from interacting with you.</p>
                        <div className="mt-3 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsBlockConfirmOpen(false)}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleBlockClick(true)}
                                disabled={isBlockSubmitting}
                                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Yes, Block
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-2.5 sm:p-3">
                    {activeSection === 'notice' ? (
                        <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
                            <div className="mb-4">
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Notice</p>
                                <h4 className="mt-1 text-lg font-black text-slate-900">{user.name}&apos;s notices</h4>
                                <p className="mt-1 text-xs text-slate-500">Only notice content is shown here.</p>
                            </div>
                            {isNoticesLoading && <p className="text-sm text-indigo-700">Loading notices...</p>}
                            {!isNoticesLoading && noticesError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{noticesError}</p>}
                            {!isNoticesLoading && !noticesError && userNotices.length === 0 && <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-5 text-center text-sm text-slate-500">No notices published.</p>}
                            {!isNoticesLoading && !noticesError && userNotices.length > 0 && <div className="space-y-3">{userNotices.map((notice) => <article key={notice._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">{notice.content}</p><p className="mt-2 text-[11px] text-slate-500">{notice.createdAt ? new Date(notice.createdAt).toLocaleString() : 'Saved notice'}</p></article>)}</div>}
                        </div>
                    ) : (
                    <div className="space-y-2.5">
                    {followError && (
                        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900">
                            {followError}
                        </div>
                    )}
                    {blockMessage && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                            {blockMessage}
                        </div>
                    )}
                    {user.isPaused && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
                            This account is paused. Actions are currently disabled.
                        </div>
                    )}

                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3" aria-label={`Profile completion: ${profileCompletion}%`}>
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-bold text-indigo-900">Profile completion</p>
                            <p className="text-xs font-black text-indigo-700">{profileCompletion}%</p>
                        </div>
                        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={profileCompletion}>
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                                style={{ width: `${profileCompletion}%` }}
                            />
                        </div>
                        <p className="mt-2 text-[11px] text-indigo-700">
                            Given user information we can not varifiy , Be carefull !
                        </p>
                    </div>

                    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3" aria-label="Available Date">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <p className="text-sm font-bold text-indigo-900">Available Date</p>
                                <p className="mt-1 text-[11px] text-indigo-700">
                                    {availabilityType === 'everyday' ? 'Available every day.' : 'Custom availability dates'}
                                </p>
                            </div>
                            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold capitalize text-indigo-700">
                                {availabilityType}
                            </span>
                        </div>
                        {availabilityType === 'custom' && (
                            availabilityDates.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-2" aria-label="Available dates">
                                    {availabilityDates.map((dateLabel) => (
                                        <span key={dateLabel} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-indigo-800">
                                            {dateLabel}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-2 text-xs text-slate-600">No custom dates selected.</p>
                            )
                        )}
                    </div>

                    {canViewEventHistory && (
                        <div className="rounded-xl border border-slate-200 bg-slate-100 p-1.5">
                            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                                <button
                                    type="button"
                                    onClick={() => loadProfileEvents('archive')}
                                    className={`rounded-lg px-3 py-2 text-xs font-bold transition ${activeEventView === 'archive' ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                                >
                                    Archive
                                </button>
                                <button
                                    type="button"
                                    onClick={() => loadProfileEvents('expired')}
                                    className={`rounded-lg px-3 py-2 text-xs font-bold transition ${activeEventView === 'expired' ? 'bg-rose-600 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                                >
                                    Expired
                                </button>
                                <button
                                    type="button"
                                    onClick={() => loadAccountData('audit')}
                                    className={`rounded-lg px-3 py-2 text-xs font-bold transition ${accountDataView === 'audit' ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                                >
                                    Audit Log
                                </button>
                                <button
                                    type="button"
                                    onClick={() => loadAccountData('blocked')}
                                    className={`rounded-lg px-3 py-2 text-xs font-bold transition ${accountDataView === 'blocked' ? 'bg-amber-600 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                                >
                                    Blocked Users
                                </button>
                            </div>
                        </div>
                    )}

                    {canViewEventHistory && activeEventView && (
                        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
                            <div className="mb-2 flex items-center justify-between gap-2">
                                <div>
                                    <h4 className="text-sm font-black text-slate-900">{activeEventView === 'archive' ? 'Event Archive' : 'Expired Events'}</h4>
                                    <p className="text-[11px] text-slate-500">Admin view for {user.name}</p>
                                </div>
                                <button type="button" onClick={() => setActiveEventView(null)} className="text-[11px] font-semibold text-slate-500 hover:text-slate-800">Close</button>
                            </div>
                            {isEventsLoading && <p className="text-xs text-indigo-700">Loading events...</p>}
                            {!isEventsLoading && eventsError && <p className="rounded-lg bg-red-50 px-2.5 py-2 text-xs text-red-700">{eventsError}</p>}
                            {!isEventsLoading && !eventsError && profileEvents.length === 0 && <p className="text-xs text-slate-500">No {activeEventView} events found.</p>}
                            {!isEventsLoading && !eventsError && profileEvents.length > 0 && (
                                <div className="space-y-1.5">
                                    {profileEvents.map((event) => (
                                        <div key={event._id} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${activeEventView === 'archive' ? 'bg-slate-200 text-slate-700' : 'bg-rose-100 text-rose-700'}`}>{activeEventView === 'archive' ? 'Archived' : event.status || 'Expired'}</span>
                                                <span className="text-[10px] text-slate-500">{event.date ? new Date(event.date).toLocaleDateString() : 'Date unavailable'}</span>
                                            </div>
                                            <p className="mt-1 text-xs font-semibold text-slate-800">{event.description}</p>
                                            <p className="mt-0.5 text-[10px] text-slate-600">Creator: {event.creator?.name || 'Unknown'} · Target: {event.target?.name || 'Unknown'}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {canViewEventHistory && accountDataView && (
                        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
                            <div className="mb-2 flex items-center justify-between gap-2">
                                <div>
                                    <h4 className="text-sm font-black text-slate-900">{accountDataView === 'audit' ? 'Audit Log' : 'Blocked Users'}</h4>
                                    <p className="text-[11px] text-slate-500">Admin view for {user.name}</p>
                                </div>
                                <button type="button" onClick={() => setAccountDataView(null)} className="text-[11px] font-semibold text-slate-500 hover:text-slate-800">Close</button>
                            </div>
                            {accountDataLoading && <p className="text-xs text-indigo-700">Loading {accountDataView === 'audit' ? 'audit logs' : 'blocked users'}...</p>}
                            {!accountDataLoading && accountDataError && <p className="rounded-lg bg-red-50 px-2.5 py-2 text-xs text-red-700">{accountDataError}</p>}
                            {!accountDataLoading && !accountDataError && accountDataView === 'audit' && auditLogs.length === 0 && <p className="text-xs text-slate-500">No audit log entries found.</p>}
                            {!accountDataLoading && !accountDataError && accountDataView === 'audit' && auditLogs.length > 0 && (
                                <div className="space-y-1.5">
                                    {auditLogs.map((log) => (
                                        <div key={log._id} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${log.status === 'success' ? 'bg-emerald-100 text-emerald-700' : log.status === 'failed' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'}`}>{log.status}</span>
                                                <span className="text-[10px] text-slate-500">{log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Date unavailable'}</span>
                                            </div>
                                            <p className="mt-1 text-xs font-semibold text-slate-800">{String(log.action || '').replaceAll('_', ' ')}</p>
                                            <p className="mt-0.5 text-[10px] text-slate-600">{log.details || 'No details available.'}</p>
                                            <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-slate-500">
                                                <span className="rounded-full bg-white px-2 py-0.5 font-medium">
                                                    Browser: {log.browserName || 'Not available'}
                                                </span>
                                                <span className="rounded-full bg-white px-2 py-0.5 font-medium">
                                                    OS: {log.operatingSystem || 'Not available'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {!accountDataLoading && !accountDataError && accountDataView === 'blocked' && blockedUsers.length === 0 && <p className="text-xs text-slate-500">No blocked users found.</p>}
                            {!accountDataLoading && !accountDataError && accountDataView === 'blocked' && blockedUsers.length > 0 && (
                                <div className="space-y-1.5">
                                    {blockedUsers.map((entry) => (
                                        <div key={entry._id} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                                            <p className="text-xs font-bold text-slate-900">{entry.user?.name || 'Unknown user'}</p>
                                            <p className="mt-0.5 text-[10px] text-slate-600">{entry.user?.profession || 'Profession not provided'} · ID: {getUserUniqueId(entry.user)}</p>
                                            <p className="mt-0.5 text-[10px] text-slate-500">{entry.blockedAt ? `Blocked ${new Date(entry.blockedAt).toLocaleString()}` : 'Blocked date unavailable'}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid gap-1.5 sm:grid-cols-3">
                        <div className="rounded-xl border border-indigo-100 bg-white p-2.5 shadow-sm">
                            <p className="text-xs font-bold text-indigo-500">Followers</p>
                            <p className="mt-1.5 text-xl font-black text-slate-900">{user.totalFollowers || 0}</p>
                            <p className="mt-0.5 text-[11px] text-slate-500">People following this user</p>
                        </div>
                        <div className="rounded-xl border border-sky-100 bg-white p-2.5 shadow-sm">
                            <p className="text-xs font-bold text-cyan-600">Following</p>
                            <p className="mt-1.5 text-xl font-black text-slate-900">{user.totalFollowee || 0}</p>
                            <p className="mt-0.5 text-[11px] text-slate-500">Accounts this user follows</p>
                        </div>
                        <div className="rounded-xl border border-emerald-100 bg-white p-2.5 shadow-sm">
                            <p className="text-xs font-bold text-emerald-600">Status</p>
                            <p className="mt-1.5 text-sm font-black text-slate-900">
                                {canFollow ? (user.isFollowing ? 'Already Connected' : 'Not Following Yet') : 'Your Profile'}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500">Live relationship status</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm sm:p-3">
                        <div className="mb-2.5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400">Profile Details</p>
                                <h4 className="mt-0.5 text-base font-black text-slate-900">Personal Information</h4>
                            </div>
                                <div className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                                Snapshot
                            </div>
                        </div>

                        <div className="grid gap-1.5 sm:grid-cols-2">
                            {DETAIL_FIELDS.map((field) => (
                                <div
                                    key={field.key}
                                    className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-2 transition hover:border-slate-300 hover:bg-white"
                                >
                                    <p className="text-[11px] font-bold text-slate-400">
                                        {field.label}
                                    </p>
                                    <p className="mt-1 break-words text-sm font-bold text-slate-900">
                                        {field.key === 'country'
                                            ? getCountryLabel(user[field.key])
                                            : (user[field.key] || 'Not provided')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
                        <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400">Quick Summary</p>
                                <p className="mt-1 text-xs text-slate-600">
                                    {user.name} is listed as <span className="font-semibold text-slate-900">{user.profession || 'a user without a profession set'}</span>
                                    {user.specialistAt ? ` and specializes in ${user.specialistAt}.` : '.'}
                                </p>
                            </div>
                            <div className="text-xs font-semibold text-slate-500">
                                {canFollow ? (user.isFollowing ? 'You are following this user.' : 'You are not following this user yet.') : 'This is your own profile preview.'}
                            </div>
                        </div>
                    </div>
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
}
