import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

const MINUTES_PER_DAY = 24 * 60;

const isSameLocalDate = (value, date) => {
    if (!value) {
        return false;
    }

    const eventDate = new Date(value);
    return eventDate.getFullYear() === date.getFullYear()
        && eventDate.getMonth() === date.getMonth()
        && eventDate.getDate() === date.getDate();
};

const getBusyRanges = (events, date) => (Array.isArray(events) ? events : [])
    .filter((event) => isSameLocalDate(event.date, date))
    .map((event) => {
        const eventDate = new Date(event.date);
        const startMinute = (eventDate.getHours() * 60) + eventDate.getMinutes();
        const duration = Number(event.timeDuration) || 0;
        const start = Math.max(0, Math.min(MINUTES_PER_DAY, startMinute));
        const end = Math.max(start, Math.min(MINUTES_PER_DAY, startMinute + duration));

        return {
            start,
            end,
            isArchived: event.status === 'archived',
        };
    })
    .filter((range) => range.end > range.start);

const getTotalBusyMinutes = (ranges) => {
    const mergedRanges = [...ranges]
        .sort((firstRange, secondRange) => firstRange.start - secondRange.start)
        .reduce((merged, range) => {
            const previous = merged[merged.length - 1];

            if (!previous || range.start > previous.end) {
                merged.push({ ...range });
            } else {
                previous.end = Math.max(previous.end, range.end);
            }

            return merged;
        }, []);

    return Math.min(MINUTES_PER_DAY, mergedRanges.reduce((total, range) => total + (range.end - range.start), 0));
};

const subtractRanges = (ranges, excludedRanges) => {
    const mergedExcludedRanges = [...excludedRanges]
        .sort((firstRange, secondRange) => firstRange.start - secondRange.start)
        .reduce((merged, range) => {
            const previous = merged[merged.length - 1];

            if (!previous || range.start > previous.end) {
                merged.push({ ...range });
            } else {
                previous.end = Math.max(previous.end, range.end);
            }

            return merged;
        }, []);

    return ranges.flatMap((range) => {
        const remainingRanges = [];
        let cursor = range.start;

        for (const excludedRange of mergedExcludedRanges) {
            if (excludedRange.end <= cursor) continue;
            if (excludedRange.start >= range.end) break;

            if (excludedRange.start > cursor) {
                remainingRanges.push({
                    start: cursor,
                    end: Math.min(excludedRange.start, range.end),
                });
            }

            cursor = Math.max(cursor, excludedRange.end);
            if (cursor >= range.end) break;
        }

        if (cursor < range.end) {
            remainingRanges.push({ start: cursor, end: range.end });
        }

        return remainingRanges;
    });
};

const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
};

const formatSummaryDate = (date) => date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
}).replace(/, /, '/').replace(' ', '/');

const formatDateInput = (value) => {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
};

const getTodayInputDate = () => formatDateInput(new Date());

const getAvailableDateInputs = (user) => {
    const savedDates = Array.isArray(user?.availableDates) && user.availableDates.length > 0
        ? user.availableDates
        : (user?.availableDate ? [user.availableDate] : []);

    return [...new Set(savedDates.map(formatDateInput).filter(Boolean))].sort();
};

const formatAvailableDate = (availabilityType, dateValues) => {
    if (availabilityType === 'everyday') return 'Available every day.';
    if (dateValues.length === 0) return 'Choose one or more custom dates to see your availability.';
    return `Available on ${dateValues.length} selected date${dateValues.length === 1 ? '' : 's'}.`;
};

export function TimeSummaryDay({ currentUser, events, date, onRefresh, isRefreshing, onUserUpdate }) {
    const eventRanges = getBusyRanges(events, date);
    const archivedRanges = eventRanges.filter((range) => range.isArchived);
    const busyRanges = eventRanges.filter((range) => !range.isArchived);
    const archiveMinutes = getTotalBusyMinutes(archivedRanges);
    const busyMinutes = getTotalBusyMinutes(subtractRanges(busyRanges, archivedRanges));
    const freeMinutes = Math.max(0, MINUTES_PER_DAY - busyMinutes - archiveMinutes);
    const [availabilityType, setAvailabilityType] = useState(currentUser?.availabilityType || 'everyday');
    const [availableDate, setAvailableDate] = useState('');
    const [availableDates, setAvailableDates] = useState(() => getAvailableDateInputs(currentUser));
    const [isSubmittingAvailability, setIsSubmittingAvailability] = useState(false);
    const [availabilityError, setAvailabilityError] = useState('');
    const [availabilitySuccess, setAvailabilitySuccess] = useState('');

    useEffect(() => {
        setAvailabilityType(currentUser?.availabilityType || 'everyday');
        setAvailableDate('');
        setAvailableDates(getAvailableDateInputs(currentUser));
    }, [currentUser?.availabilityType, currentUser?.availableDate, currentUser?.availableDates]);

    const submitAvailability = async () => {
        setAvailabilityError('');
        setAvailabilitySuccess('');

        if (availabilityType === 'custom' && availableDates.length === 0) {
            setAvailabilityError('Please choose at least one custom date.');
            return;
        }

        const selectedDates = availabilityType === 'custom'
            ? availableDates.map((dateValue) => new Date(`${dateValue}T00:00:00Z`))
            : [];
        if (selectedDates.some((date) => Number.isNaN(date.getTime()))) {
            setAvailabilityError('Please choose valid custom dates.');
            return;
        }

        setIsSubmittingAvailability(true);
        try {
            const response = await authAPI.updateProfile(currentUser._id, {
                availabilityType,
                availableDate: selectedDates[0] ? selectedDates[0].toISOString() : null,
                availableDates: selectedDates.map((date) => date.toISOString()),
            });

            if (!response?.user) {
                throw new Error('Availability update returned no user data.');
            }

            onUserUpdate?.(response.user);
            setAvailabilitySuccess('Available date saved.');
        } catch (error) {
            setAvailabilityError(error instanceof Error ? error.message : 'Failed to save available date.');
        } finally {
            setIsSubmittingAvailability(false);
        }
    };

    return (
        <>
            <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3" aria-label={`Today's Time Summary for ${formatSummaryDate(date)}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-700">
                <span>Today's Time Summary</span>
                <span>{formatSummaryDate(date)}</span>
                {onRefresh && (
                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                )}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2" aria-label="Today's Time Summary">
                <div className="flex items-center justify-center gap-1 rounded-xl bg-slate-200 px-2 py-2">
                    <p className="whitespace-nowrap text-[9px] font-bold uppercase tracking-wide text-slate-600 sm:text-[10px]">Archive time</p>
                    <p className="whitespace-nowrap text-xs font-black text-slate-700 sm:text-sm">{formatMinutes(archiveMinutes)}</p>
                </div>
                <div className="flex items-center justify-center gap-1 rounded-xl bg-red-50 px-2 py-2">
                    <p className="whitespace-nowrap text-[9px] font-bold uppercase tracking-wide text-red-600 sm:text-[10px]">Busy time</p>
                    <p className="whitespace-nowrap text-xs font-black text-red-700 sm:text-sm">{formatMinutes(busyMinutes)}</p>
                </div>
                <div className="flex items-center justify-center gap-1 rounded-xl bg-emerald-100 px-2 py-2">
                    <p className="whitespace-nowrap text-[9px] font-bold uppercase tracking-wide text-emerald-700 sm:text-[10px]">Free time</p>
                    <p className="whitespace-nowrap text-xs font-black text-emerald-800 sm:text-sm">{formatMinutes(freeMinutes)}</p>
                </div>
            </div>
            </div>
            <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-3" aria-label="Available Date">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <p className="text-sm font-bold text-indigo-900">Available Date</p>
                        <p className="mt-1 text-xs text-indigo-700">Choose whether you are available every day or on one custom date.</p>
                    </div>
                    <div className="flex w-full shrink-0 rounded-full border border-indigo-200 bg-white/80 p-1 shadow-sm sm:w-auto" role="group" aria-label="Availability type">
                        {[
                            { value: 'everyday', label: 'Everyday' },
                            { value: 'custom', label: 'Custom' },
                        ].map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    setAvailabilityType(option.value);
                                    setAvailabilityError('');
                                    setAvailabilitySuccess('');
                                }}
                                aria-pressed={availabilityType === option.value}
                                className={`flex-1 rounded-full px-4 py-2 text-xs font-bold transition sm:min-w-24 ${availabilityType === option.value
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                    <label className="flex-1 text-xs font-semibold text-slate-700">
                        Date
                        <input
                            type="date"
                            value={availableDate}
                            min={getTodayInputDate()}
                            disabled={availabilityType !== 'custom'}
                            onChange={(event) => {
                                const nextDate = event.target.value;
                                if (nextDate && !availableDates.includes(nextDate)) {
                                    setAvailableDates((previousDates) => [...previousDates, nextDate].sort());
                                }
                                setAvailableDate('');
                                setAvailabilityError('');
                                setAvailabilitySuccess('');
                            }}
                            className="mt-1 w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                        />
                    </label>
                </div>
                <p className="mt-2 text-sm font-semibold text-indigo-900">
                    {formatAvailableDate(availabilityType, availableDates)}
                </p>
                {availabilityType === 'custom' && availableDates.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2" aria-label="Selected available dates">
                        {availableDates.map((dateValue) => (
                            <span key={dateValue} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-indigo-800">
                                {new Date(`${dateValue}T00:00:00`).toLocaleDateString([], { dateStyle: 'medium' })}
                                <button
                                    type="button"
                                    onClick={() => setAvailableDates((previousDates) => previousDates.filter((date) => date !== dateValue))}
                                    className="rounded-full px-1 text-indigo-600 hover:bg-indigo-100"
                                    aria-label={`Remove ${dateValue}`}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                )}
                <div className="mt-3 flex justify-end">
                    <button
                        type="button"
                        onClick={submitAvailability}
                        disabled={isSubmittingAvailability || !currentUser?._id}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmittingAvailability ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
                {availabilityError && <p className="mt-1 text-xs font-semibold text-red-700">{availabilityError}</p>}
                {availabilitySuccess && <p className="mt-1 text-xs font-semibold text-emerald-700">{availabilitySuccess}</p>}
            </div>
        </>
    );
}

export function ProfileTabs({ currentUser, activeTab, events, now = new Date(), onTabChange, onRefresh, onUserUpdate, hideContent = false }) {
    const navigate = useNavigate();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [internalTab, setInternalTab] = useState(activeTab);
    const selectedTab = onTabChange ? activeTab : internalTab;
    const isMyTimeOpen = selectedTab === 'time';
    const changeTab = (tab) => {
        if (!onTabChange) {
            setInternalTab(tab);
        }
        onTabChange?.(tab);
    };
    const openMyTime = () => {
        navigate('/my-time');
    };
    const refreshMyTime = async () => {
        if (!onRefresh || isRefreshing) return;

        setIsRefreshing(true);
        try {
            await onRefresh();
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-100 p-1.5">
            <div className="grid grid-cols-4 gap-1 sm:gap-2">
                <button
                    type="button"
                    onClick={() => {
                        changeTab('profile');
                        navigate('/profile');
                    }}
                    className={`rounded-xl px-0 py-1 text-xs font-semibold whitespace-nowrap transition sm:px-4 sm:py-2.5 sm:text-sm ${selectedTab === 'profile' && !isMyTimeOpen
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    Profile
                </button>
                <button
                    type="button"
                    onClick={openMyTime}
                    className={`rounded-xl px-0 py-1 text-xs font-semibold whitespace-nowrap transition sm:px-4 sm:py-2.5 sm:text-sm ${isMyTimeOpen
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    My Time
                </button>
                <button
                    type="button"
                    onClick={() => {
                        changeTab('public');
                        navigate(`/public?creatorId=${currentUser._id}`, { state: { activePageOverride: 'profile' } });
                    }}
                    disabled={currentUser.isPaused}
                    className={`rounded-xl px-0 py-1 text-xs font-semibold whitespace-nowrap transition sm:px-4 sm:py-2.5 sm:text-sm ${selectedTab === 'public'
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                    My Public
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/my-notice', { state: { activePageOverride: 'my-notice' } })}
                    className={`rounded-xl px-0 py-1 text-xs font-semibold whitespace-nowrap transition sm:px-4 sm:py-2.5 sm:text-sm ${selectedTab === 'notice'
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    My Notice
                </button>
            </div>
            {isMyTimeOpen && !hideContent && (
                <TimeSummaryDay
                    currentUser={currentUser}
                    events={events}
                    date={now}
                    onRefresh={onRefresh ? refreshMyTime : null}
                    isRefreshing={isRefreshing}
                    onUserUpdate={onUserUpdate}
                />
            )}
        </div>
    );
}
