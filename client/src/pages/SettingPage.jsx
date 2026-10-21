import React, { useEffect, useMemo, useState } from 'react';
import { authAPI } from '../api';
import { getCountryLabel } from '../utils/countries';
import { getUserUniqueId } from '../utils/user';

const getLocalDateKey = (value) => {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
    ].join('-');
};

const getArchiveFilterRange = (filter) => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (filter.type === 'today') {
        return [todayStart, todayStart];
    }

    if (filter.type === 'week') {
        const start = new Date(todayStart);
        const daysSinceMonday = (start.getDay() + 6) % 7;
        start.setDate(start.getDate() - daysSinceMonday);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return [start, end];
    }

    if (filter.type === 'month') {
        return [
            new Date(today.getFullYear(), today.getMonth(), 1),
            new Date(today.getFullYear(), today.getMonth() + 1, 0),
        ];
    }

    if (filter.type === 'date' && filter.date) {
        const selectedDate = new Date(`${filter.date}T00:00:00`);
        return Number.isNaN(selectedDate.getTime()) ? null : [selectedDate, selectedDate];
    }

    return null;
};

const isDateInRange = (value, range) => {
    if (!value || !range) {
        return false;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return false;
    }

    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return dateOnly >= range[0] && dateOnly <= range[1];
};

export function SettingPage({
    currentUser,
    onUserUpdate,
    archivedEvents = [],
    archiveLoading = false,
    archiveError = '',
    expiredEvents = [],
    expiredLoading = false,
    expiredError = '',
}) {
    const [activeTab, setActiveTab] = useState('audit');
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditLoading, setAuditLoading] = useState(false);
    const [auditError, setAuditError] = useState('');
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [blockedLoading, setBlockedLoading] = useState(false);
    const [blockedError, setBlockedError] = useState('');
    const [blockedMessage, setBlockedMessage] = useState('');
    const [updatingBlockedUserId, setUpdatingBlockedUserId] = useState('');
    const [archiveDateInput, setArchiveDateInput] = useState('');
    const [archiveFilter, setArchiveFilter] = useState({ type: 'all', date: '' });
    const [expiredDateInput, setExpiredDateInput] = useState('');
    const [expiredFilter, setExpiredFilter] = useState({ type: 'all', date: '' });

    const filteredArchivedEvents = useMemo(() => {
        if (archiveFilter.type === 'all') {
            return archivedEvents;
        }

        const range = getArchiveFilterRange(archiveFilter);
        if (!range) {
            return archivedEvents;
        }

        return archivedEvents.filter((event) => (
            isDateInRange(event.date, range)
            || isDateInRange(event.archivedAt, range)
        ));
    }, [archivedEvents, archiveFilter]);
    const filteredExpiredEvents = useMemo(() => {
        if (expiredFilter.type === 'all') {
            return expiredEvents;
        }

        const range = getArchiveFilterRange(expiredFilter);
        if (!range) {
            return expiredEvents;
        }

        return expiredEvents.filter((event) => (
            isDateInRange(event.date, range)
            || isDateInRange(event.createdAt, range)
        ));
    }, [expiredEvents, expiredFilter]);
    const todayDateKey = getLocalDateKey(new Date());

    useEffect(() => {
        if (activeTab !== 'audit' || !currentUser?._id) {
            return;
        }

        let isMounted = true;

        const loadAuditLogs = async () => {
            try {
                setAuditLoading(true);
                setAuditError('');
                const response = await authAPI.getAuditLogs(currentUser._id);
                if (isMounted) {
                    setAuditLogs(response.logs || []);
                }
            } catch (error) {
                if (isMounted) {
                    setAuditError(error.message || 'Failed to load audit logs.');
                }
            } finally {
                if (isMounted) {
                    setAuditLoading(false);
                }
            }
        };

        loadAuditLogs();

        return () => {
            isMounted = false;
        };
    }, [activeTab, currentUser]);

    useEffect(() => {
        if (activeTab !== 'blocked' || !currentUser?._id) {
            return;
        }

        let isMounted = true;

        const loadBlockedUsers = async () => {
            try {
                setBlockedLoading(true);
                setBlockedError('');
                setBlockedMessage('');
                const response = await authAPI.getBlockedUsers(currentUser._id);
                if (isMounted) {
                    setBlockedUsers(response.blockedUsers || []);
                }
            } catch (error) {
                if (isMounted) {
                    setBlockedError(error.message || 'Failed to load blocked users.');
                }
            } finally {
                if (isMounted) {
                    setBlockedLoading(false);
                }
            }
        };

        loadBlockedUsers();

        return () => {
            isMounted = false;
        };
    }, [activeTab, currentUser]);

    const formatEventTimestamp = (value) => (value ? new Date(value).toLocaleString() : null);

    const handleUnblockUser = async (blockedUserId) => {
        if (!currentUser?._id || !blockedUserId) {
            return;
        }

        try {
            setBlockedError('');
            setBlockedMessage('');
            setUpdatingBlockedUserId(blockedUserId);
            const response = await authAPI.toggleBlock(currentUser._id, blockedUserId);
            onUserUpdate?.(response.currentUser);
            setBlockedUsers((prev) => prev.filter((entry) => entry.user._id !== blockedUserId));
            setBlockedMessage(response.message || 'User unblocked successfully.');
        } catch (error) {
            setBlockedError(error.message || 'Failed to update block status.');
        } finally {
            setUpdatingBlockedUserId('');
        }
    };

    return (
        <div className="w-full rounded-[10px] border border-indigo-100 bg-white/95 p-[5px] shadow-2xl backdrop-blur-sm">
            <div className="mb-6">
                <p className="text-sm font-semibold text-fuchsia-500">Setting</p>
                <h2 className="mt-2 text-2xl font-black text-slate-800 sm:text-3xl">Account settings</h2>
                <p className="mt-2 text-slate-600">
                    Manage audit history and blocked users for {currentUser?.name || 'your profile'}.
                </p>
            </div>

            <div className="rounded-[10px] border border-slate-200 bg-slate-100 p-2">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab('audit')}
                        className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${activeTab === 'audit'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        Audit Log
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('blocked')}
                        className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${activeTab === 'blocked'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        Blocked Users
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('archive')}
                        className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${activeTab === 'archive'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        Archive
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('expired')}
                        className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${activeTab === 'expired'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        Expired
                    </button>
                </div>
            </div>

            {activeTab === 'audit' && (
                <div className="mt-6 rounded-[10px] border border-slate-200 bg-white/80 p-6 shadow-sm">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Audit Log</h3>
                        <p className="mt-1 text-sm text-slate-500">Recent login and password reset activity for this account.</p>
                    </div>

                    {auditLoading && (
                        <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            Loading audit logs...
                        </div>
                    )}

                    {!auditLoading && auditError && (
                        <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {auditError}
                        </div>
                    )}

                    {!auditLoading && !auditError && auditLogs.length === 0 && (
                        <div className="rounded-[10px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                            No audit log entries found.
                        </div>
                    )}

                    {!auditLoading && !auditError && auditLogs.length > 0 && (
                        <div className="space-y-3">
                            {auditLogs.map((log) => (
                                <div key={log._id} className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                            log.status === 'success'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : log.status === 'failed'
                                                    ? 'bg-rose-100 text-rose-700'
                                                    : 'bg-slate-200 text-slate-700'
                                        }`}>
                                            {log.status}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="mt-3 text-sm font-semibold text-slate-800">{log.action.replaceAll('_', ' ')}</p>
                                    <p className="mt-1 text-sm text-slate-600">{log.details || 'No details available.'}</p>
                                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                                        <span className="rounded-full bg-white px-3 py-1 font-medium">
                                            Browser: {log.browserName || 'Not available'}
                                        </span>
                                        <span className="rounded-full bg-white px-3 py-1 font-medium">
                                            OS: {log.operatingSystem || 'Not available'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'blocked' && (
                <div className="mt-6 rounded-[10px] border border-slate-200 bg-white/80 p-6 shadow-sm">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">Blocked Users</h3>
                            <p className="mt-1 text-sm text-slate-500">Users you have blocked appear here.</p>
                        </div>
                        <div className="text-sm text-slate-500">
                            {blockedUsers.length} blocked
                        </div>
                    </div>

                    {blockedMessage && (
                        <div className="mb-4 rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            {blockedMessage}
                        </div>
                    )}

                    {blockedLoading && (
                        <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            Loading blocked users...
                        </div>
                    )}

                    {!blockedLoading && blockedError && (
                        <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {blockedError}
                        </div>
                    )}

                    {!blockedLoading && !blockedError && blockedUsers.length === 0 && (
                        <div className="rounded-[10px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                            No blocked users found.
                        </div>
                    )}

                    {!blockedLoading && !blockedError && blockedUsers.length > 0 && (
                        <div className="space-y-3">
                            {blockedUsers.map((entry) => {
                                const blockedUser = entry.user;

                                return (
                                    <div key={entry._id} className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="text-base font-semibold text-slate-900">{blockedUser.name}</p>
                                                <p className="mt-1 text-sm text-slate-600">
                                                    {blockedUser.profession || 'Profession not provided'}
                                                </p>
                                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                                                    <span className="rounded-full bg-white px-3 py-1 font-medium">
                                                        ID: {getUserUniqueId(blockedUser)}
                                                    </span>
                                                    <span className="rounded-full bg-white px-3 py-1 font-medium">
                                                        {getCountryLabel(blockedUser.country)}
                                                    </span>
                                                    <span className="rounded-full bg-white px-3 py-1 font-medium">
                                                        {entry.blockedAt ? `Blocked ${new Date(entry.blockedAt).toLocaleString()}` : 'Blocked date not available'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-start gap-2 sm:items-end">
                                                <button
                                                    type="button"
                                                    onClick={() => handleUnblockUser(blockedUser._id)}
                                                    disabled={updatingBlockedUserId === blockedUser._id}
                                                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                                                >
                                                    {updatingBlockedUserId === blockedUser._id ? 'Updating...' : 'Unblock'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'archive' && (
                <div className="mt-6 rounded-[10px] border border-slate-200 bg-white/80 p-6 shadow-sm">
                    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">Event Archive</h3>
                            <p className="mt-1 text-sm text-slate-500">Find events by date.</p>
                        </div>
                        <div className="flex min-w-0 flex-1 flex-nowrap items-end justify-start gap-1 overflow-x-auto pb-1 [scrollbar-width:thin] sm:ml-4 sm:justify-end">
                            {[
                                ['today', 'Today'],
                                ['week', 'This week'],
                                ['month', 'This month'],
                            ].map(([filterType, label]) => (
                                <button
                                    key={filterType}
                                    type="button"
                                    onClick={() => setArchiveFilter({ type: filterType, date: '' })}
                                    className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold transition ${archiveFilter.type === filterType
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                            <label className="shrink-0 text-xs font-semibold text-slate-600">
                                <span className="mb-1 block text-[10px] uppercase tracking-wide text-slate-500">Date</span>
                                <input
                                    type="date"
                                    value={archiveDateInput}
                                    max={todayDateKey}
                                    onChange={(event) => {
                                        const selectedDate = event.target.value;
                                        setArchiveDateInput(selectedDate && selectedDate > todayDateKey ? '' : selectedDate);
                                    }}
                                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                    aria-label="Select archive search date"
                                />
                            </label>
                            <button
                                type="button"
                                disabled={!archiveDateInput}
                                onClick={() => setArchiveFilter({ type: 'date', date: archiveDateInput })}
                                className="shrink-0 rounded-lg bg-indigo-600 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Search
                            </button>
                            <button
                                type="button"
                                disabled={archiveFilter.type === 'all' && !archiveDateInput}
                                onClick={() => {
                                    setArchiveFilter({ type: 'all', date: '' });
                                    setArchiveDateInput('');
                                }}
                                className="shrink-0 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {archiveLoading && (
                        <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            Loading archived events...
                        </div>
                    )}

                    {!archiveLoading && archiveError && (
                        <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {archiveError}
                        </div>
                    )}

                    {!archiveLoading && !archiveError && archivedEvents.length === 0 && (
                        <div className="rounded-[10px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                            No archived events found.
                        </div>
                    )}

                    {!archiveLoading && !archiveError && archivedEvents.length > 0 && filteredArchivedEvents.length === 0 && (
                        <div className="rounded-[10px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                            No archived events match this filter.
                        </div>
                    )}

                    {!archiveLoading && !archiveError && filteredArchivedEvents.length > 0 && (
                        <div className="space-y-4">
                            {filteredArchivedEvents.map((event) => {
                                const createdLabel = formatEventTimestamp(event.eventCreatedAt || event.createdAt);
                                const archivedLabel = formatEventTimestamp(event.archivedAt);

                                return (
                                    <div key={event._id} className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                                                Archived
                                            </span>
                                            <div className="text-xs text-slate-500">
                                                <div>{createdLabel ? `Created ${createdLabel}` : 'Created date not available'}</div>
                                                <div>{archivedLabel ? `Archived ${archivedLabel}` : 'Archived date not available'}</div>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-base font-semibold text-slate-800">{event.description}</p>
                                        {event.message && (
                                            <div className="mt-3 rounded-[10px] border border-indigo-100 bg-white p-3 text-sm text-slate-700">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <p className="text-xs font-bold text-indigo-500">Message</p>
                                                </div>
                                                <p className="mt-1 whitespace-pre-wrap font-medium">{event.message}</p>
                                            </div>
                                        )}
                                        <div className="mt-3 space-y-1 text-sm text-slate-600">
                                            <p>Date: {event.date ? new Date(event.date).toLocaleDateString() : 'Not available'}</p>
                                            <p>Duration: {event.timeDuration ? `${event.timeDuration} minutes` : 'Not available'}</p>
                                            <p>Creator: {event.creator?.name || 'Unknown user'}</p>
                                            <p>Target: {event.target?.name || 'Unknown user'}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'expired' && (
                <div className="mt-6 rounded-[10px] border border-slate-200 bg-white/80 p-6 shadow-sm">
                    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">Expired Events</h3>
                            <p className="mt-1 text-sm text-slate-500">Find events by date.</p>
                        </div>
                        <div className="flex min-w-0 flex-1 flex-nowrap items-end justify-start gap-1 overflow-x-auto pb-1 [scrollbar-width:thin] sm:ml-4 sm:justify-end">
                            {[
                                ['today', 'Today'],
                                ['week', 'This week'],
                                ['month', 'This month'],
                            ].map(([filterType, label]) => (
                                <button
                                    key={filterType}
                                    type="button"
                                    onClick={() => setExpiredFilter({ type: filterType, date: '' })}
                                    className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold transition ${expiredFilter.type === filterType
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                            <label className="shrink-0 text-xs font-semibold text-slate-600">
                                <span className="mb-1 block text-[10px] uppercase tracking-wide text-slate-500">Date</span>
                                <input
                                    type="date"
                                    value={expiredDateInput}
                                    max={todayDateKey}
                                    onChange={(event) => {
                                        const selectedDate = event.target.value;
                                        setExpiredDateInput(selectedDate && selectedDate > todayDateKey ? '' : selectedDate);
                                    }}
                                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                    aria-label="Select expired event search date"
                                />
                            </label>
                            <button
                                type="button"
                                disabled={!expiredDateInput}
                                onClick={() => setExpiredFilter({ type: 'date', date: expiredDateInput })}
                                className="shrink-0 rounded-lg bg-indigo-600 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Search
                            </button>
                            <button
                                type="button"
                                disabled={expiredFilter.type === 'all' && !expiredDateInput}
                                onClick={() => {
                                    setExpiredFilter({ type: 'all', date: '' });
                                    setExpiredDateInput('');
                                }}
                                className="shrink-0 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {expiredLoading && (
                        <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            Loading expired events...
                        </div>
                    )}

                    {!expiredLoading && expiredError && (
                        <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {expiredError}
                        </div>
                    )}

                    {!expiredLoading && !expiredError && expiredEvents.length === 0 && (
                        <div className="rounded-[10px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                            No expired events found.
                        </div>
                    )}

                    {!expiredLoading && !expiredError && expiredEvents.length > 0 && filteredExpiredEvents.length === 0 && (
                        <div className="rounded-[10px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                            No expired events match this filter.
                        </div>
                    )}

                    {!expiredLoading && !expiredError && filteredExpiredEvents.length > 0 && (
                        <div className="space-y-4">
                            {filteredExpiredEvents.map((event) => {
                                const createdLabel = formatEventTimestamp(event.createdAt);
                                const expiredLabel = formatEventTimestamp(event.date);

                                return (
                                    <div key={event._id} className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                                                {event.status || 'Expired'}
                                            </span>
                                            <div className="text-xs text-slate-500">
                                                <div>{createdLabel ? `Created ${createdLabel}` : 'Created date not available'}</div>
                                                <div>{expiredLabel ? `Expired ${expiredLabel}` : 'Expired date not available'}</div>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-base font-semibold text-slate-800">{event.description}</p>
                                        {event.message && (
                                            <div className="mt-3 rounded-[10px] border border-indigo-100 bg-white p-3 text-sm text-slate-700">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <p className="text-xs font-bold text-indigo-500">Message</p>
                                                </div>
                                                <p className="mt-1 whitespace-pre-wrap font-medium">{event.message}</p>
                                            </div>
                                        )}
                                        <div className="mt-3 space-y-1 text-sm text-slate-600">
                                            <p>Date: {event.date ? new Date(event.date).toLocaleDateString() : 'Not available'}</p>
                                            <p>Duration: {event.timeDuration ? `${event.timeDuration} minutes` : 'Not available'}</p>
                                            <p>Creator: {event.creator?.name || 'Unknown user'}</p>
                                            <p>Target: {event.target?.name || 'Unknown user'}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SettingPage;
