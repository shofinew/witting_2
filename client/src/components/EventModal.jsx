import React from 'react';
import { DURATION_OPTIONS } from '../constants';

export function EventModal({
    currentUser,
    creatorUser,
    eventUser,
    mode = 'create',
    eventDescription,
    setEventDescription,
    eventDate,
    setEventDate,
    eventDuration,
    setEventDuration,
    eventError,
    eventSuccess,
    isEventSubmitting,
    onSubmit,
    onCancel,
}) {
    const isEditMode = mode === 'edit';
    const displayCreator = isEditMode ? creatorUser || currentUser : currentUser;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-indigo-100">
                <h3 className="text-2xl font-bold text-indigo-700">{isEditMode ? 'Edit Event' : 'Add Event'}</h3>
                <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-slate-700 md:flex-row md:items-center">
                    <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Creator</p>
                        <p className="mt-1 font-bold text-slate-900">{displayCreator?.name || 'Unknown user'}</p>
                    </div>
                    <div className="hidden h-12 w-px bg-indigo-200 md:block" />
                    <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Target</p>
                        <p className="mt-1 font-bold text-slate-900">{eventUser.name}</p>
                    </div>
                </div>
                {eventError && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-100 px-3 py-2 text-sm text-red-900">
                        {eventError}
                    </div>
                )}
                {eventSuccess && (
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-100 px-3 py-2 text-sm text-green-900">
                        {eventSuccess}
                    </div>
                )}

                <div className="mt-4 space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-indigo-700">Description</label>
                        <textarea
                            value={eventDescription}
                            onChange={(e) => setEventDescription(e.target.value)}
                            disabled={isEventSubmitting}
                            rows={3}
                            className="w-full rounded-xl border border-indigo-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-100 disabled:text-gray-500"
                            placeholder="Write event details..."
                        />
                    </div>
                    <hr className="border-indigo-200" />
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="mb-2 block text-sm font-semibold text-indigo-700">Date</label>
                            <input
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                                disabled={isEventSubmitting}
                                type="date"
                                className="w-full rounded-xl border border-indigo-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-100 disabled:text-gray-500"
                            />
                        </div>
                        <div className="flex items-center pb-2">
                            <div className="h-12 w-px bg-indigo-200" />
                        </div>
                        <div className="flex-1">
                            <label className="mb-2 block text-sm font-semibold text-indigo-700">Time Duration</label>
                            <select
                                value={eventDuration}
                                onChange={(e) => setEventDuration(e.target.value)}
                                disabled={isEventSubmitting}
                                className="w-full rounded-xl border border-indigo-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-100 disabled:text-gray-500"
                            >
                                <option value="">Select duration</option>
                                {DURATION_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={isEventSubmitting}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isEventSubmitting ? (isEditMode ? 'Updating...' : 'Submitting...') : (isEditMode ? 'Ok' : 'Submit')}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isEventSubmitting}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
