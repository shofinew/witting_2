import React from 'react';
import { STATUS_LABELS } from '../constants';
import { EventCard } from './EventCard';

export function EventSection({
    status,
    events,
    now,
    isLoading,
    error,
    actionError,
    actionSuccess,
    currentUserId,
    activeEventActionId,
    activeEventActionType,
    onRefresh,
    onAdvance,
    onPublish,
    onEdit,
    onDelete,
    onArchive,
    onStart,
    headerContent = null,
    hideStartAndArchive = false,
    hideEditButton = false,
    description = null,
    hideSerial = false,
}) {
    const title = STATUS_LABELS[status];
    const isPublished = status === 'published';

    return (
        <div className="w-full rounded-3xl border border-indigo-100 bg-white/95 p-4 shadow-2xl backdrop-blur-sm sm:p-5">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">{title}</h2>
                    <p className="mt-0.5 text-sm text-gray-600">
                        {description || (isPublished ? "Today's events live here." : `Events currently waiting in ${title}.`)}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => onRefresh(status)}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                    Refresh
                </button>
            </div>

            {headerContent && (
                <div className="mb-4">
                    {headerContent}
                </div>
            )}

            {actionError && <div className="mb-4 rounded-xl border border-red-200 bg-red-100 px-4 py-3 text-sm text-red-900">{actionError}</div>}
            {actionSuccess && <div className="mb-4 rounded-xl border border-green-200 bg-green-100 px-4 py-3 text-sm text-green-900">{actionSuccess}</div>}
            {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-100 px-4 py-3 text-sm text-red-900">{error}</div>}

            {isLoading ? (
                <p className="font-medium text-indigo-700">Loading events...</p>
            ) : events.length === 0 ? (
                <p className="text-gray-600">No events found in this stage.</p>
            ) : (
                <div className="grid gap-3">
                    {events.map((event) => (
                        <EventCard
                            key={event._id}
                            event={event}
                            now={now}
                            isPublished={isPublished}
                            currentUserId={currentUserId}
                            activeEventActionId={activeEventActionId}
                            activeEventActionType={activeEventActionType}
                            onAdvance={onAdvance}
                            onPublish={onPublish}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onArchive={onArchive}
                            onStart={onStart}
                            hideStartAndArchive={hideStartAndArchive}
                            hideEditButton={hideEditButton}
                            hideSerial={hideSerial}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
