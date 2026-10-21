import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { publicEventAPI } from '../api';
import { ProfileTabs } from '../components/ProfileTabs';
import { ProfileHeader } from '../components/ProfileHeader';

const getLocalDateInputValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getDateAfterDays = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return getLocalDateInputValue(date);
};

const formatEventDate = (value) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
    if (!match) return '';

    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).replace(',', '/').replace(' ', '/');
};

const parseTimeValue = (value) => {
    const match = /^(\d{2}):(\d{2})$/.exec(String(value || ''));
    if (!match) {
        return { hour: '', minute: '', period: '' };
    }

    const hour24 = Number(match[1]);
    const minute = match[2];
    return {
        hour: String(hour24 % 12 || 12),
        minute,
        period: hour24 >= 12 ? 'PM' : 'AM',
    };
};

const formatTimeValue = ({ hour, minute, period }) => {
    if (!hour || !minute || !period) {
        return '';
    }

    let hour24 = Number(hour) % 12;
    if (period === 'PM') {
        hour24 += 12;
    }

    return `${String(hour24).padStart(2, '0')}:${minute}`;
};

function TimePicker({ label, value, onChange, disabled, enabled, onToggle }) {
    const [parts, setParts] = useState(() => parseTimeValue(value));

    useEffect(() => {
        setParts(parseTimeValue(value));
    }, [value]);

    const updatePart = (key, nextValue) => {
        const nextParts = { ...parts, [key]: nextValue };
        setParts(nextParts);
        const formattedValue = formatTimeValue(nextParts);
        if (formattedValue) {
            onChange(formattedValue);
        }
    };

    return (
        <div>
            <div className="mb-1 flex items-center justify-between gap-2">
                <span className="block text-sm font-semibold text-indigo-700">{label}</span>
                <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label={`${label} toggle`}
                    onClick={() => onToggle(!enabled)}
                    disabled={disabled}
                    className={`flex items-center gap-1.5 text-[11px] font-semibold ${enabled ? 'text-indigo-700' : 'text-slate-500'}`}
                >
                    <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                        <span className={`h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : 'translate-x-1'}`} />
                    </span>
                    {enabled ? 'On' : 'Off'}
                </button>
            </div>
            <div className="grid grid-cols-[1fr_1.15fr_1fr] gap-1.5">
                <select
                    aria-label={`${label} hour`}
                    value={parts.hour}
                    onChange={(event) => updatePart('hour', event.target.value)}
                    disabled={disabled || !enabled}
                    className="w-full rounded-xl border border-indigo-200 bg-white px-2 py-2.5 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                    <option value="">Hour</option>
                    {Array.from({ length: 12 }, (_, index) => index + 1).map((hour) => (
                        <option key={hour} value={hour}>{String(hour).padStart(2, '0')}</option>
                    ))}
                </select>
                <select
                    aria-label={`${label} minute`}
                    value={parts.minute}
                    onChange={(event) => updatePart('minute', event.target.value)}
                    disabled={disabled || !enabled}
                    className="w-full rounded-xl border border-indigo-200 bg-white px-2 py-2.5 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                    <option value="">Minute</option>
                    {Array.from({ length: 60 }, (_, minute) => {
                        const formattedMinute = String(minute).padStart(2, '0');
                        return <option key={formattedMinute} value={formattedMinute}>{formattedMinute}</option>;
                    })}
                </select>
                <select
                    aria-label={`${label} AM or PM`}
                    value={parts.period}
                    onChange={(event) => updatePart('period', event.target.value)}
                    disabled={disabled || !enabled}
                    className="w-full rounded-xl border border-indigo-200 bg-white px-2 py-2.5 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                    <option value="">AM/PM</option>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                </select>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Choose hour, minute, and AM/PM</p>
        </div>
    );
}

function PublicEventModal({
    title,
    setTitle,
    description,
    setDescription,
    note,
    setNote,
    location,
    setLocation,
    startDate,
    setStartDate,
    startTime,
    setStartTime,
    startTimeEnabled,
    onStartTimeToggle,
    endDate,
    setEndDate,
    endTime,
    setEndTime,
    endTimeEnabled,
    onEndTimeToggle,
    error,
    isSubmitting,
    onSubmit,
    onCancel,
}) {
    const minEventDate = getDateAfterDays(0);

    const setStartDateTo = (daysFromToday) => {
        const nextDate = getDateAfterDays(daysFromToday);
        setStartDate(nextDate);
        if (!endDate || endDate < nextDate) {
            setEndDate(nextDate);
        }
    };

    const handleStartDateChange = (nextDate) => {
        setStartDate(nextDate);
        if (!endDate || endDate < nextDate) {
            setEndDate(nextDate);
        }
    };

    const setEndDateTo = (daysFromToday) => {
        const nextDate = getDateAfterDays(daysFromToday);
        setEndDate(startDate && startDate > nextDate ? startDate : nextDate);
    };

    const handleEndDateChange = (nextDate) => {
        if (startDate && nextDate < startDate) {
            return;
        }

        setEndDate(nextDate);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/30 px-3 py-6 pointer-events-none sm:py-10">
            <div className="pointer-events-auto w-full max-w-md overflow-y-auto rounded-2xl border border-indigo-100 bg-white p-4 shadow-2xl max-h-[calc(100vh-3rem)] sm:p-5 sm:max-h-[calc(100vh-5rem)]">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-bold text-indigo-700">Create Public Event</h3>
                        <p className="mt-0.5 text-xs text-slate-500">Add the details people need to attend.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
                        aria-label="Close create public event modal"
                    >
                        &times;
                    </button>
                </div>

                {error && (
                    <div className="mt-2 rounded-lg border border-red-200 bg-red-100 px-2.5 py-1.5 text-sm text-red-900">
                        {error}
                    </div>
                )}

                <div className="mt-4 space-y-3">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-indigo-700">Title</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            type="text"
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-indigo-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            placeholder="Write event title..."
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-indigo-700">Location</label>
                        <input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            type="text"
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-indigo-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            placeholder="Enter event location..."
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-indigo-700">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-indigo-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            placeholder="Write event details..."
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-indigo-700">N.B. (Remember)</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-indigo-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-100 disabled:text-gray-500"
                            placeholder="Add a note to remember..."
                        />
                    </div>
                    <fieldset className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
                        <legend className="px-1 text-xs font-bold uppercase tracking-wide text-indigo-700">Starts</legend>
                        <div className="space-y-2">
                            <div>
                                <label htmlFor="public-event-start-date" className="mb-1 block text-xs font-semibold text-slate-600">Date</label>
                            <input
                                id="public-event-start-date"
                                value={startDate}
                                onChange={(event) => handleStartDateChange(event.target.value)}
                                type="date"
                                min={minEventDate}
                                disabled={isSubmitting}
                                className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                                <div className="mt-1.5 flex gap-2">
                                    <button type="button" onClick={() => setStartDateTo(0)} disabled={isSubmitting} className="rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-60">Today</button>
                                    <button type="button" onClick={() => setStartDateTo(1)} disabled={isSubmitting} className="rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-60">Tomorrow</button>
                                </div>
                            </div>
                            <TimePicker label="Time" value={startTime} onChange={setStartTime} enabled={startTimeEnabled} onToggle={onStartTimeToggle} disabled={isSubmitting} />
                        </div>
                    </fieldset>
                    <fieldset className="rounded-xl border border-fuchsia-100 bg-fuchsia-50/50 p-3">
                        <legend className="px-1 text-xs font-bold uppercase tracking-wide text-fuchsia-700">Ends</legend>
                        <div className="space-y-2">
                            <div>
                                <label htmlFor="public-event-end-date" className="mb-1 block text-xs font-semibold text-slate-600">Date</label>
                            <input
                                id="public-event-end-date"
                                value={endDate}
                                onChange={(event) => handleEndDateChange(event.target.value)}
                                type="date"
                                min={startDate || minEventDate}
                                disabled={isSubmitting}
                                className="w-full rounded-xl border border-fuchsia-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                            />
                                <div className="mt-1.5 flex gap-2">
                                    <button type="button" onClick={() => startDate && setEndDate(startDate)} disabled={isSubmitting || !startDate} className="rounded-lg border border-fuchsia-200 bg-white px-2.5 py-1 text-xs font-semibold text-fuchsia-700 hover:bg-fuchsia-50 disabled:opacity-60">Same day</button>
                                    <button type="button" onClick={() => setEndDateTo(1)} disabled={isSubmitting} className="rounded-lg border border-fuchsia-200 bg-white px-2.5 py-1 text-xs font-semibold text-fuchsia-700 hover:bg-fuchsia-50 disabled:opacity-60">Tomorrow</button>
                                </div>
                            </div>
                            <TimePicker label="Time" value={endTime} onChange={setEndTime} enabled={endTimeEnabled} onToggle={onEndTimeToggle} disabled={isSubmitting} />
                        </div>
                    </fieldset>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-1.5">
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Event'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="rounded-lg bg-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export function PublicPage({ currentUser, onLogout, homeEvents, now }) {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [note, setNote] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [startTimeEnabled, setStartTimeEnabled] = useState(false);
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [endTimeEnabled, setEndTimeEnabled] = useState(false);
    const [error, setError] = useState('');
    const [events, setEvents] = useState([]);
    const [totalEvents, setTotalEvents] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshNonce, setRefreshNonce] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeEventActionId, setActiveEventActionId] = useState(null);
    const [activeEventActionType, setActiveEventActionType] = useState(null);
    const [openEventMenuId, setOpenEventMenuId] = useState(null);

    const location = useLocation();
    const creatorId = new URLSearchParams(location.search).get('creatorId');
    const isMyPublicView = creatorId && creatorId === currentUser?._id;

    useEffect(() => {
        let isMounted = true;

        const loadPublicEvents = async () => {
            try {
                setIsLoading(true);
                setError('');
                const params = new URLSearchParams(location.search);
                const creatorId = params.get('creatorId');
                const data = await publicEventAPI.getAll(creatorId || undefined, currentUser?._id);
                if (isMounted) {
                    setEvents(data.events || []);
                    setTotalEvents(Number.isFinite(Number(data.total)) ? Number(data.total) : (data.events || []).length);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message || 'Failed to load public events.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadPublicEvents();

        return () => {
            isMounted = false;
        };
    }, [currentUser?._id, location.search, refreshNonce]);

    useEffect(() => {
        if (!openEventMenuId) {
            return undefined;
        }

        const closeMenuOnOutsideClick = (event) => {
            if (!event.target.closest('[data-event-menu]')) {
                setOpenEventMenuId(null);
            }
        };
        const closeMenuOnEscape = (event) => {
            if (event.key === 'Escape') {
                setOpenEventMenuId(null);
            }
        };

        document.addEventListener('pointerdown', closeMenuOnOutsideClick);
        document.addEventListener('keydown', closeMenuOnEscape);

        return () => {
            document.removeEventListener('pointerdown', closeMenuOnOutsideClick);
            document.removeEventListener('keydown', closeMenuOnEscape);
        };
    }, [openEventMenuId]);

    const closeModal = () => {
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        setNote('');
        setEventLocation('');
        setStartDate('');
        setStartTime('');
        setStartTimeEnabled(false);
        setEndDate('');
        setEndTime('');
        setEndTimeEnabled(false);
        setError('');
    };

    const formatDuration = (minutes) => {
        if (minutes == null || Number.isNaN(minutes)) {
            return 'TBD';
        }

        const totalMinutes = Math.max(0, Number(minutes));
        const days = Math.floor(totalMinutes / 1440);
        const hours = Math.floor((totalMinutes % 1440) / 60);
        const mins = totalMinutes % 60;
        const parts = [];

        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (mins > 0 || parts.length === 0) parts.push(`${mins}m`);

        return parts.join(' ');
    };

    const formatPublicEventDateTime = (dateValue, timeValue) => {
        if (!dateValue) {
            return timeValue ? String(timeValue).trim() : 'TBD';
        }

        const parsedDate = new Date(dateValue);
        if (Number.isNaN(parsedDate.getTime())) {
            return timeValue ? String(timeValue).trim() : 'TBD';
        }

        // Public event dates are calendar dates. Keep the date portion sent by
        // the API instead of converting midnight through UTC, which can turn
        // Oct/18 into Oct/17 in some time zones.
        const datePartMatch = /^(\d{4}-\d{2}-\d{2})/.exec(String(dateValue));
        const datePart = datePartMatch
            ? datePartMatch[1]
            : `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`;
        const dateLabel = formatEventDate(datePart);
        return timeValue ? `${dateLabel} ${String(timeValue).trim()}` : dateLabel;
    };

    const getPublicEventDuration = (event) => {
        const savedDuration = Number(event.duration ?? event.timeDuration);
        if (Number.isFinite(savedDuration) && savedDuration > 0) {
            return savedDuration;
        }

        const start = new Date(`${event.startDate || event.date || ''}T${event.startTime || event.time || '00:00'}`);
        const end = new Date(`${event.endDate || ''}T${event.endTime || '00:00'}`);
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end > start) {
            return Math.round((end - start) / 60000);
        }

        return null;
    };

    const handleCreateEvent = () => {
        const run = async () => {
            if (!currentUser?._id) {
                setError('User information is missing. Please log in again.');
                return;
            }

            if (!title.trim() || !description.trim() || !eventLocation.trim() || !startDate || !endDate) {
                setError('Title, description, location, start date, and end date are required.');
                return;
            }

            if ((startTimeEnabled && !startTime) || (endTimeEnabled && !endTime)) {
                setError('Select a start/end time or switch that time off.');
                return;
            }

            const selectedStartTime = startTimeEnabled ? startTime : '00:00';
            const selectedEndTime = endTimeEnabled ? endTime : '00:00';
            const startDateTime = new Date(`${startDate}T${selectedStartTime}`);
            if (Number.isNaN(startDateTime.getTime())) {
                setError('Start date is invalid.');
                return;
            }

            const todayDate = getLocalDateInputValue(new Date());
            if (startTimeEnabled && startDateTime <= new Date()) {
                setError('Start date and time must be in the future.');
                return;
            }

            if (!startTimeEnabled && startDate < todayDate) {
                setError('Start date must be today or a future date.');
                return;
            }

            const endDateTime = new Date(`${endDate}T${selectedEndTime}`);
            // A disabled end time means the event runs through the selected
            // end date. Use the following midnight as the exclusive boundary
            // so the same start/end date represents one full calendar day.
            if (!endTimeEnabled) {
                endDateTime.setDate(endDateTime.getDate() + 1);
            }
            if (Number.isNaN(endDateTime.getTime()) || endDateTime <= startDateTime) {
                setError('End date and time must be after the start date and time.');
                return;
            }

            try {
                setIsSubmitting(true);
                setError('');
                const data = await publicEventAPI.create(
                    currentUser._id,
                    title.trim(),
                    description.trim(),
                    eventLocation.trim(),
                    startDate,
                    selectedStartTime,
                    endDate,
                    selectedEndTime,
                    note.trim(),
                    startTimeEnabled,
                    endTimeEnabled
                );
                setEvents((prev) => [data.event, ...prev]);
                setTotalEvents((previous) => previous + 1);
                closeModal();
            } catch (err) {
                setError(err.message || 'Failed to create public event.');
            } finally {
                setIsSubmitting(false);
            }
        };

        run();
    };

    const handleDeleteEvent = (eventId) => {
        const run = async () => {
            if (!currentUser?._id) {
                setError('User information is missing. Please log in again.');
                return;
            }

            const shouldDelete = window.confirm('Are you sure you want to delete this public event?');
            if (!shouldDelete) {
                return;
            }

            try {
                setActiveEventActionId(eventId);
                setActiveEventActionType('delete');
                setError('');
                await publicEventAPI.remove(eventId, currentUser._id);
                setEvents((prev) => prev.filter((event) => event._id !== eventId));
                setTotalEvents((previous) => Math.max(0, previous - 1));
            } catch (err) {
                setError(err.message || 'Failed to delete public event.');
            } finally {
                setActiveEventActionId(null);
                setActiveEventActionType(null);
            }
        };

        run();
    };

    const handleLikeEvent = (eventId) => {
        const run = async () => {
            if (!currentUser?._id) {
                setError('User information is missing. Please log in again.');
                return;
            }

            try {
                setActiveEventActionId(eventId);
                setActiveEventActionType('like');
                setError('');
                const data = await publicEventAPI.like(eventId, currentUser._id);
                setEvents((prev) => prev.map((event) => (event._id === eventId ? data.event : event)));
            } catch (err) {
                setError(err.message || 'Failed to like public event.');
            } finally {
                setActiveEventActionId(null);
                setActiveEventActionType(null);
            }
        };

        run();
    };

    return (
        <>
            <div className="w-full rounded-[10px] border border-indigo-100 bg-white/95 p-[10px] shadow-2xl backdrop-blur-sm">
                {isMyPublicView && (
                    <div className="mb-6">
                        <ProfileHeader currentUser={currentUser} />
                        <ProfileTabs currentUser={currentUser} activeTab="public" events={homeEvents} now={now} hideContent />
                    </div>
                )}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-3xl">
                        {!isMyPublicView && (
                            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">
                                Public
                            </h2>
                        )}
                        <p className="mt-3 text-base text-slate-600">
                            Create and manage public-facing events from here.
                        </p>
                        {isMyPublicView && (
                            <p className="mt-2 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
                                Total created public events: {totalEvents}
                            </p>
                        )}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setRefreshNonce((value) => value + 1)}
                            disabled={isLoading}
                            className="rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoading ? 'Refreshing...' : 'Refresh'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="rounded-xl bg-[#161080] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                            Create Event
                        </button>
                    </div>
                </div>

                {error && !isModalOpen && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-100 px-3 py-2 text-sm text-red-900">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="rounded-[10px] border border-dashed border-indigo-200 bg-indigo-50/50 px-6 py-10 text-center text-slate-600">
                        Loading public events...
                    </div>
                ) : events.length === 0 ? (
                    <div className="rounded-[10px] border border-dashed border-indigo-200 bg-indigo-50/50 px-6 py-10 text-center text-slate-600">
                        No public events yet.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {events.map((event) => {
                            const isCreator = currentUser?._id && currentUser._id === event.creatorId;
                            const canLike = currentUser?._id && !isCreator;
                            const isLikeLoading = activeEventActionId === event._id && activeEventActionType === 'like';
                            const isDeleteLoading = activeEventActionId === event._id && activeEventActionType === 'delete';

                            return (
                                <div
                                    key={event._id}
                                    className={`relative rounded-[10px] border border-indigo-100 bg-white p-[10px] shadow-sm ${isCreator ? 'pt-14' : ''}`}
                                >
                                    {isCreator && (
                                        <div data-event-menu className="absolute right-3 top-3 z-10">
                                            <button
                                                type="button"
                                                aria-label={`More actions for ${event.title}`}
                                                aria-expanded={openEventMenuId === event._id}
                                                onClick={() => setOpenEventMenuId((currentId) => (
                                                    currentId === event._id ? null : event._id
                                                ))}
                                                className="flex h-9 w-9 items-center justify-center rounded-full text-xl font-bold leading-none text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                            >
                                                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                                                    <circle cx="5" cy="12" r="1.8" />
                                                    <circle cx="12" cy="12" r="1.8" />
                                                    <circle cx="19" cy="12" r="1.8" />
                                                </svg>
                                            </button>
                                            {openEventMenuId === event._id && (
                                                <div className="absolute right-0 top-10 min-w-32 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setOpenEventMenuId(null);
                                                            handleDeleteEvent(event._id);
                                                        }}
                                                        disabled={isDeleteLoading}
                                                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                                                    >
                                                        {isDeleteLoading ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className={`space-y-1 ${isCreator ? 'pr-10' : ''}`}>
                                        <p className="text-lg font-bold text-slate-900">{event.title}</p>
                                        <p className="text-base font-semibold text-slate-700">
                                            {event.description}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            Created by: {event.creator?.name || 'Unknown user'}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            Location: {event.location || event.venue || 'Not specified'}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            Duration: {formatDuration(getPublicEventDuration(event))}
                                        </p>
                                        {event.note?.trim() && (
                                            <p className="text-sm text-slate-500">
                                                N.B. (Remember): {event.note}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex shrink-0 flex-col gap-3">
                                        <div className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700">
                                            <span>Start: {formatPublicEventDateTime(event.startDate || event.date, event.startTime || event.time)}</span>
                                            <br />
                                            <span>End: {formatPublicEventDateTime(event.endDate || event.finishDate, event.endTime || event.finishTime)}</span>
                                        </div>
                                        <div className="flex items-stretch gap-2 sm:flex-col sm:gap-3">
                                            <div className="min-w-0 flex-1 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-center text-sm font-semibold text-emerald-700">
                                                {event.likeCount || 0} liked it
                                            </div>
                                            {canLike && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleLikeEvent(event._id)}
                                                    disabled={isLikeLoading || event.likedByCurrentUser}
                                                    className={`min-w-0 flex-1 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${event.likedByCurrentUser
                                                        ? 'bg-emerald-700 text-white'
                                                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                        }`}
                                                >
                                                    {isLikeLoading ? 'Saving...' : event.likedByCurrentUser ? 'LIKED' : 'I LIKE IT'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}

                {isMyPublicView && (
                    <div className="mt-8 border-t border-slate-200 pt-5">
                        <div className="flex flex-col items-start gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/setting')}
                            className="text-sm font-semibold text-indigo-700 transition hover:text-fuchsia-600"
                        >
                            Setting
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/feedback')}
                            className="text-sm font-semibold text-indigo-700 transition hover:text-fuchsia-600"
                        >
                            Feedback
                        </button>
                        <button
                            type="button"
                            onClick={onLogout}
                            className="text-sm font-semibold text-slate-700 transition hover:text-red-600"
                        >
                            {currentUser.name} (Logout)
                        </button>
                        </div>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <PublicEventModal
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    note={note}
                    setNote={setNote}
                    location={eventLocation}
                    setLocation={setEventLocation}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    startTime={startTime}
                    setStartTime={setStartTime}
                    startTimeEnabled={startTimeEnabled}
                    onStartTimeToggle={(enabled) => {
                        setStartTimeEnabled(enabled);
                        if (!enabled) setStartTime('');
                    }}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    endTime={endTime}
                    setEndTime={setEndTime}
                    endTimeEnabled={endTimeEnabled}
                    onEndTimeToggle={(enabled) => {
                        setEndTimeEnabled(enabled);
                        if (!enabled) setEndTime('');
                    }}
                    error={error}
                    isSubmitting={isSubmitting}
                    onSubmit={handleCreateEvent}
                    onCancel={closeModal}
                />
            )}
        </>
    );
}
