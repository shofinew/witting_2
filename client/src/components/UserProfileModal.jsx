import React, { useEffect, useState } from 'react';
import { getCountryLabel } from '../utils/countries';
import { canManageUsers, getUserUniqueId } from '../utils/user';
import { authAPI, eventAPI, userAPI } from '../api';

const DETAIL_FIELDS = [
    { label: 'Designation', key: 'designation' },
    { label: 'Achievement', key: 'achievement' },
    { label: 'Country', key: 'country' },
    { label: 'Specialist At', key: 'specialistAt' },
    { label: 'Profession', key: 'profession' },
    { label: 'Chamber', key: 'chamber' },
];

export function UserProfileModal({ user, currentUser, onClose, onUserChange, onCurrentUserUpdate }) {
    const [followError, setFollowError] = useState('');
    const [isFollowSubmitting, setIsFollowSubmitting] = useState(false);
    const [isBlockSubmitting, setIsBlockSubmitting] = useState(false);
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
    const initials = String(user.name || 'U')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('');

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

    const handleBlockClick = async () => {
        if (!currentUser?._id || currentUser._id === user._id) {
            return;
        }

        try {
            setFollowError('');
            setBlockMessage('');
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-3 py-4 backdrop-blur-sm sm:px-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-profile-modal-title"
            onClick={onClose}
        >
            <div
                className="flex max-h-[calc(100dvh-1rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/70 bg-slate-50 shadow-2xl sm:max-h-[calc(100dvh-1.5rem)]"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="border-b border-slate-200 bg-white px-2.5 py-2.5 sm:px-3">
                    <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-base font-black text-white shadow-md shadow-indigo-200">
                                {initials || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">User Profile</p>
                                <h3 id="user-profile-modal-title" className="mt-0.5 break-words text-xl font-black leading-tight text-slate-950 sm:text-2xl">
                                    {user.name}
                                </h3>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                    <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                                        ID: {uniqueIdLabel}
                                    </span>
                                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                                        {user.profession || 'Profession not set'}
                                    </span>
                                    <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">
                                        {getCountryLabel(user.country)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1 sm:flex sm:flex-wrap sm:justify-end">
                            {canFollow && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleToggleFollow}
                                        disabled={isFollowSubmitting}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${user.isFollowing
                                            ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            }`}
                                    >
                                        {isFollowSubmitting ? 'Updating...' : user.isFollowing ? 'Unfollow' : 'Follow'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleBlockClick}
                                        disabled={isBlockSubmitting}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${isBlocked
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                            : 'bg-amber-100 text-amber-900 ring-1 ring-amber-200 hover:bg-amber-200'
                                            }`}
                                    >
                                        {isBlockSubmitting ? 'Updating...' : isBlocked ? 'Unblock' : 'Block'}
                                    </button>
                                </>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2.5 sm:p-3">
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
                </div>
            </div>
        </div>
    );
}
