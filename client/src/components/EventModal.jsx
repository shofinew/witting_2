import React from 'react';
import { DURATION_OPTIONS } from '../constants';

export function EventModal({
    currentUser,
    creatorUser,
    eventUser,
    mode = 'create',
    canEditDetails = true,
    eventDescription,
    setEventDescription,
    eventMessage,
    setEventMessage,
    existingMessage = '',
    canAddMessage = true,
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
    const minEventDate = new Date().toLocaleDateString('en-CA');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[calc(100dvh-2rem)] w-full max-w-[21rem] overflow-y-auto rounded-2xl border border-indigo-100 bg-white p-2.5 shadow-2xl sm:p-3">
                <h3 className="text-lg font-bold text-indigo-700">{isEditMode ? 'Edit Event' : 'Add Event'}</h3>
                <div className="mt-1 flex flex-col gap-1 rounded-xl border border-indigo-100 bg-indigo-50/70 p-2 text-xs text-slate-700 md:flex-row md:items-center">
                    <div className="flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-normal text-indigo-500">Creator</p>
                        <p className="mt-0.5 text-xs font-bold text-slate-900">{displayCreator?.name || 'Unknown user'}</p>
                    </div>
                    <div className="hidden h-9 w-px bg-indigo-200 md:block" />
                    <div className="flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-normal text-indigo-500">Target</p>
                        <p className="mt-0.5 text-xs font-bold text-slate-900">{eventUser.name}</p>
                    </div>
                </div>
                {eventError && (
                    <div className="mt-2 rounded-lg border border-red-200 bg-red-100 px-2 py-1.5 text-xs text-red-900">
                        {eventError}
                    </div>
                )}
                {eventSuccess && (
                    <div className="mt-2 rounded-lg border border-green-200 bg-green-100 px-2 py-1.5 text-xs text-green-900">
                        {eventSuccess}
                    </div>
                )}

                <div className="mt-2 space-y-2">
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-indigo-700">Description</label>
                        {isEditMode ? (
                            <p className="min-h-14 w-full whitespace-pre-wrap rounded-lg border border-indigo-100 bg-gray-100 px-2 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
                                {eventDescription}
                            </p>
                        ) : (
                            <textarea
                                value={eventDescription}
                                onChange={(e) => setEventDescription(e.target.value)}
                                disabled={isEventSubmitting}
                                rows={2}
                                className="w-full rounded-lg border border-indigo-200 px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-100 disabled:text-gray-500"
                                placeholder="Write event details..."
                            />
                        )}
                    </div>
                    <div>
                        <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
                            <label className="block text-xs font-semibold text-indigo-700">
                                {isEditMode ? 'Messages' : 'Message'}
                            </label>
                        </div>
                        {isEditMode && (
                            <div className="mb-1 rounded-lg border border-indigo-100 bg-gray-50 px-2 py-1.5">
                                <p className="text-[11px] font-semibold uppercase tracking-normal text-indigo-500">Current thread</p>
                                {existingMessage ? (
                                    <div className="mt-1.5 space-y-1 text-xs font-medium text-slate-700">
                                        {existingMessage.split('\n').map((line, index) => (
                                            <p key={`${index}-${line}`} className="whitespace-pre-wrap">
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-1.5 text-xs font-medium text-slate-700">No message added yet.</p>
                                )}
                            </div>
                        )}
                        {canAddMessage ? (
                            <textarea
                                value={eventMessage}
                                onChange={(e) => setEventMessage(e.target.value)}
                                disabled={isEventSubmitting}
                                rows={2}
                                className="w-full rounded-lg border border-indigo-200 px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-100 disabled:text-gray-500"
                                placeholder={isEditMode ? 'Add a reply...' : 'Add a message for this user...'}
                            />
                        ) : (
                            <p className="min-h-14 w-full whitespace-pre-wrap rounded-lg border border-indigo-100 bg-gray-100 px-2 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
                                {existingMessage || 'No message added.'}
                            </p>
                        )}
                    </div>
                    <hr className="border-indigo-200" />
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                        <div className="flex-1">
                            <label className="mb-1 block text-xs font-semibold text-indigo-700">Date</label>
                            {isEditMode && !canEditDetails ? (
                                <p className="w-full rounded-lg border border-indigo-100 bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
                                    {eventDate ? new Date(eventDate).toLocaleDateString() : 'Not available'}
                                </p>
                            ) : (
                                <input
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    disabled={isEventSubmitting}
                                    type="date"
                                    min={minEventDate}
                                    className="w-full rounded-lg border border-indigo-200 px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-100 disabled:text-gray-500"
                                />
                            )}
                        </div>
                        <div className="hidden items-center pb-2 sm:flex">
                            <div className="h-12 w-px bg-indigo-200" />
                        </div>
                        <div className="flex-1">
                            <label className="mb-1 block text-xs font-semibold text-indigo-700">Time Duration</label>
                            {isEditMode && !canEditDetails ? (
                                <p className="w-full rounded-lg border border-indigo-100 bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
                                    {eventDuration ? `${eventDuration} minutes` : 'Not available'}
                                </p>
                            ) : (
                                <select
                                    value={eventDuration}
                                    onChange={(e) => setEventDuration(e.target.value)}
                                    disabled={isEventSubmitting}
                                    className="w-full rounded-lg border border-indigo-200 px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-100 disabled:text-gray-500"
                                >
                                    <option value="">Select duration</option>
                                    {DURATION_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={isEventSubmitting}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isEventSubmitting ? (isEditMode ? 'Updating...' : 'Submitting...') : (isEditMode ? 'Update' : 'Submit')}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isEventSubmitting}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
