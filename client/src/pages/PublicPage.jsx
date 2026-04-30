import React, { useEffect, useState } from 'react';
import { publicEventAPI } from '../api';

function PublicEventModal({
    title,
    setTitle,
    description,
    setDescription,
    eventDate,
    setEventDate,
    eventTime,
    setEventTime,
    error,
    isSubmitting,
    onSubmit,
    onCancel,
}) {
    const minEventDate = new Date().toLocaleDateString('en-CA');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl border border-indigo-100 bg-white p-6 shadow-2xl">
                <h3 className="text-2xl font-bold text-indigo-700">Create Public Event</h3>
                <p className="mt-2 text-sm text-slate-600">
                    Add the main details for your public event.
                </p>

                {error && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-100 px-3 py-2 text-sm text-red-900">
                        {error}
                    </div>
                )}

                <div className="mt-4 space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-indigo-700">Title</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            type="text"
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-indigo-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            placeholder="Write event title..."
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-indigo-700">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-indigo-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            placeholder="Write event details..."
                        />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-indigo-700">Date</label>
                            <input
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                                type="date"
                                min={minEventDate}
                                disabled={isSubmitting}
                                className="w-full rounded-xl border border-indigo-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-indigo-700">Time</label>
                            <input
                                value={eventTime}
                                onChange={(e) => setEventTime(e.target.value)}
                                type="time"
                                disabled={isSubmitting}
                                className="w-full rounded-xl border border-indigo-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Event'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
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
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [error, setError] = useState('');
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadPublicEvents = async () => {
            try {
                setIsLoading(true);
                setError('');
                const data = await publicEventAPI.getAll();
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

        return () => {
            isMounted = false;
        };
    }, []);

    const closeModal = () => {
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        setEventDate('');
        setEventTime('');
        setError('');
    };

    const handleCreateEvent = () => {
        const run = async () => {
            if (!currentUser?._id) {
                setError('User information is missing. Please log in again.');
                return;
            }

            if (!title.trim() || !description.trim() || !eventDate || !eventTime) {
                setError('Title, description, date, and time are required.');
                return;
            }

            try {
                setIsSubmitting(true);
                setError('');
                const data = await publicEventAPI.create(
                    currentUser._id,
                    title.trim(),
                    description.trim(),
                    eventDate,
                    eventTime
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

    return (
        <>
            <div className="w-full rounded-3xl border border-indigo-100 bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-3xl">
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">
                            Public
                        </h2>
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
                        {events.map((event) => (
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
                                    </div>
                                    <div className="shrink-0 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700">
                                        {new Date(event.date).toISOString().split('T')[0]} | {event.time}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <PublicEventModal
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    eventDate={eventDate}
                    setEventDate={setEventDate}
                    eventTime={eventTime}
                    setEventTime={setEventTime}
                    error={error}
                    isSubmitting={isSubmitting}
                    onSubmit={handleCreateEvent}
                    onCancel={closeModal}
                />
            )}
        </>
    );
}
