import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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

function TimePicker({ label, value, onChange, disabled }) {
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
            <span className="mb-1 block text-sm font-semibold text-indigo-700">{label}</span>
            <div className="grid grid-cols-[1fr_1.15fr_1fr] gap-1.5">
                <select
                    aria-label={`${label} hour`}
                    value={parts.hour}
                    onChange={(event) => updatePart('hour', event.target.value)}
                    disabled={disabled}
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
                    disabled={disabled}
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
                    disabled={disabled}
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
    location,
    setLocation,
    startDate,
    setStartDate,
    startTime,
    setStartTime,
    endDate,
    setEndDate,
    endTime,
    setEndTime,
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

    const setEndDateTo = (daysFromToday) => {
        setEndDate(getDateAfterDays(daysFromToday));
    };

    return (
        <div className="fixed inset-x-3 top-20 z-50 flex justify-center pointer-events-none sm:top-24">
            <div className="pointer-events-auto w-full max-w-[22.5rem] overflow-y-auto rounded-2xl border border-indigo-100 bg-white p-3 shadow-2xl max-h-[calc(100vh-6rem)]">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-indigo-700">Create Public Event</h3>
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

                <div className="mt-2 space-y-1.5">
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-indigo-700">Title</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            type="text"
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-indigo-200 px-3 py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            placeholder="Write event title..."
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-indigo-700">Location</label>
                        <input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            type="text"
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-indigo-200 px-3 py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            placeholder="Enter event location..."
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-indigo-700">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-indigo-200 px-3 py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            placeholder="Write event details..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                        <div>
                            <label htmlFor="public-event-start-date" className="mb-1 block text-sm font-semibold text-indigo-700">Start date</label>
                            <input
                                id="public-event-start-date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                type="date"
                                min={minEventDate}
                                disabled={isSubmitting}
                                className="w-full rounded-xl border border-indigo-200 px-2.5 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                            <div className="mt-1.5 flex gap-2">
                                <button type="button" onClick={() => setStartDateTo(0)} disabled={isSubmitting} className="rounded-lg border border-indigo-200 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-60">Today</button>
                                <button type="button" onClick={() => setStartDateTo(1)} disabled={isSubmitting} className="rounded-lg border border-indigo-200 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-60">Tomorrow</button>
                            </div>
                        </div>
                        <TimePicker label="Start time" value={startTime} onChange={setStartTime} disabled={isSubmitting} />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                        <div>
                            <label htmlFor="public-event-end-date" className="mb-1 block text-sm font-semibold text-indigo-700">End date</label>
                            <input
                                id="public-event-end-date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                type="date"
                                min={startDate || minEventDate}
                                disabled={isSubmitting}
                                className="w-full rounded-xl border border-indigo-200 px-2.5 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                            <div className="mt-1.5 flex gap-2">
                                <button type="button" onClick={() => startDate && setEndDate(startDate)} disabled={isSubmitting || !startDate} className="rounded-lg border border-indigo-200 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-60">Same day</button>
                                <button type="button" onClick={() => setEndDateTo(1)} disabled={isSubmitting} className="rounded-lg border border-indigo-200 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-60">Tomorrow</button>
                            </div>
                        </div>
                        <TimePicker label="End time" value={endTime} onChange={setEndTime} disabled={isSubmitting} />
                    </div>
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

export function PublicPage({ currentUser }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [error, setError] = useState('');
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeEventActionId, setActiveEventActionId] = useState(null);
    const [activeEventActionType, setActiveEventActionType] = useState(null);

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
        const refreshTimer = window.setInterval(loadPublicEvents, 30000);

        return () => {
            isMounted = false;
            window.clearInterval(refreshTimer);
        };
    }, [currentUser?._id, location.search]);

    const closeModal = () => {
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        setEventLocation('');
        setStartDate('');
        setStartTime('');
        setEndDate('');
        setEndTime('');
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

        const dateLabel = parsedDate.toISOString().split('T')[0];
        return timeValue ? `${dateLabel} ${String(timeValue).trim()}` : dateLabel;
    };

    const handleCreateEvent = () => {
        const run = async () => {
            if (!currentUser?._id) {
                setError('User information is missing. Please log in again.');
                return;
            }

            if (!title.trim() || !description.trim() || !eventLocation.trim() || !startDate || !startTime || !endDate || !endTime) {
                setError('Title, description, location, start date/time, and end date/time are required.');
                return;
            }

            const startDateTime = new Date(`${startDate}T${startTime}`);
            if (Number.isNaN(startDateTime.getTime()) || startDateTime <= new Date()) {
                setError('Start date and time must be in the future.');
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
                    startTime,
                    endDate,
                    endTime
                );
                setEvents((prev) => [data.event, ...prev]);
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
            <div className={`w-full rounded-3xl border border-indigo-100 bg-white/95 shadow-2xl backdrop-blur-sm ${isMyPublicView ? 'p-4 sm:p-6' : 'p-8'}`}>
                {isMyPublicView && (
                    <div className="mb-6">
                        <ProfileHeader currentUser={currentUser} />
                        <ProfileTabs currentUser={currentUser} activeTab="public" />
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
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="rounded-xl bg-[#161080] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                        Create Event
                    </button>
                </div>

                {error && !isModalOpen && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-100 px-3 py-2 text-sm text-red-900">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 px-6 py-10 text-center text-slate-600">
                        Loading public events...
                    </div>
                ) : events.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 px-6 py-10 text-center text-slate-600">
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
                                    className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="space-y-1">
                                        <p className="text-lg font-bold text-slate-900">{event.title}</p>
                                        <p className="text-base font-semibold text-slate-700">
                                            {event.description}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            Created by: {event.creator?.name || 'Unknown user'}
                                        </p>
                                        {event.location && (
                                            <p className="text-sm text-slate-500">
                                                Location: {event.location}
                                            </p>
                                        )}
                                        {event.duration != null && (
                                            <p className="text-sm text-slate-500">
                                                Duration: {formatDuration(event.duration)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex shrink-0 flex-col gap-3">
                                        <div className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700">
                                            <span>Start: {formatPublicEventDateTime(event.date, event.time)}</span>
                                            <br />
                                            <span>End: {formatPublicEventDateTime(event.endDate, event.endTime)}</span>
                                        </div>
                                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                                            {event.likeCount || 0} liked it
                                        </div>
                                        {canLike && (
                                            <button
                                                type="button"
                                                onClick={() => handleLikeEvent(event._id)}
                                                disabled={isLikeLoading || event.likedByCurrentUser}
                                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${event.likedByCurrentUser
                                                    ? 'bg-emerald-700 text-white'
                                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                    }`}
                                            >
                                                {isLikeLoading ? 'Saving...' : event.likedByCurrentUser ? 'LIKED' : 'I LIKE IT'}
                                            </button>
                                        )}
                                        {isCreator && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteEvent(event._id)}
                                                disabled={isDeleteLoading}
                                                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                {isDeleteLoading
                                                    ? 'Deleting...'
                                                    : 'Delete'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <PublicEventModal
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    location={eventLocation}
                    setLocation={setEventLocation}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    startTime={startTime}
                    setStartTime={setStartTime}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    endTime={endTime}
                    setEndTime={setEndTime}
                    error={error}
                    isSubmitting={isSubmitting}
                    onSubmit={handleCreateEvent}
                    onCancel={closeModal}
                />
            )}
        </>
    );
}
