import React from 'react';
import { STATUS_LABELS } from '../constants';
import { EventCard } from './EventCard';

export function EventSection({ status, events, isLoading, error, actionError, actionSuccess, activeEventActionId, onRefresh, onAdvance, onPublish }) {
    const title = STATUS_LABELS[status];
    const isPublished = status === 'published';

    return (
        <div className="w-full rounded-3xl border border-indigo-100 bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">{title}</h2>
                    <p className="mt-1 text-gray-600">
                        {isPublished ? 'Published events live here.' : `Events currently waiting in ${title}.`}
                        {!isLoading && <span className="ml-2 font-semibold text-indigo-600">({events.length} events)</span>}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => onRefresh(status)}
                    className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700"
                >
                    Refresh
                </button>
            </div>

            {actionError && <div className="mb-4 rounded-xl border border-red-200 bg-red-100 px-4 py-3 text-sm text-red-900">{actionError}</div>}
            {actionSuccess && <div className="mb-4 rounded-xl border border-green-200 bg-green-100 px-4 py-3 text-sm text-green-900">{actionSuccess}</div>}
            {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-100 px-4 py-3 text-sm text-red-900">{error}</div>}

            {isLoading ? (
                <p className="font-medium text-indigo-700">Loading events...</p>
            ) : events.length === 0 ? (
                <p className="text-gray-600">No events found in this stage.</p>
            ) : (
                <div className="grid gap-4">
                    {events.map((event) => (
                        <EventCard
                            key={event._id}
                            event={event}
                            isPublished={isPublished}
                            activeEventActionId={activeEventActionId}
                            onAdvance={onAdvance}
                            onPublish={onPublish}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
