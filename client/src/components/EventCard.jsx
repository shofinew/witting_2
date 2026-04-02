import React from 'react';
import { STATUS_LABELS } from '../constants';

export function EventCard({ event, isPublished, activeEventActionId, onAdvance, onPublish }) {
    return (
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-white to-indigo-50 p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">
                            {STATUS_LABELS[event.status]}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                            Created {new Date(event.createdAt).toLocaleString()}
                        </span>
                    </div>
                    <p className="text-base font-semibold text-slate-800">{event.description}</p>
                    <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                        <div className="rounded-xl bg-white/80 p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-500">Creator</p>
                            <p className="mt-1 font-bold text-slate-900">{event.creatorId?.name || 'Unknown user'}</p>
                            <p>{event.creatorId?.email || 'No email'}</p>
                        </div>
                        <div className="rounded-xl bg-white/80 p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-500">Target</p>
                            <p className="mt-1 font-bold text-slate-900">{event.targetId?.name || 'Unknown user'}</p>
                            <p>{event.targetId?.email || 'No email'}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-700">
                        <span>Date: {new Date(event.date).toLocaleDateString()}</span>
                        <span>Duration: {event.timeDuration} minutes</span>
                    </div>
                </div>

                {!isPublished && (
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                        {event.status !== 'stage1' && (
                            <button
                                type="button"
                                onClick={() => onAdvance(event._id)}
                                disabled={activeEventActionId === event._id}
                                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {activeEventActionId === event._id ? 'Updating...' : 'Edit'}
                            </button>
                        )}
                        {event.status === 'stage1' && (
                            <button
                                type="button"
                                onClick={() => onPublish(event._id)}
                                disabled={activeEventActionId === event._id}
                                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {activeEventActionId === event._id ? 'Publishing...' : 'Confirm'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
