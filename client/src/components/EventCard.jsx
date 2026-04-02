import React from 'react';
import { STATUS_LABELS } from '../constants';

export function EventCard({ event, isPublished, currentUserId, activeEventActionId, onAdvance, onPublish, onEdit, onDelete }) {
    const isStage3TargetUser = event.status === 'stage3' && event.targetId?._id === currentUserId;
    const isStage2CreatorUser = event.status === 'stage2' && event.creatorId?._id === currentUserId;
    const canManageStage3 = event.status === 'stage3' && isStage3TargetUser;
    const canManageStage2 = event.status === 'stage2' && isStage2CreatorUser;

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
                    <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-[1fr_auto_1fr] md:items-center">
                        <div className="rounded-xl bg-white/80 p-3 transition-all duration-300 hover:shadow-lg">
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-500">Creator</p>
                            <p className="mt-1 font-bold text-slate-900">{event.creatorId?.name || 'Unknown user'}</p>
                            <p>{event.creatorId?.profession || 'No profession'}</p>
                        </div>
                        <div className="hidden h-20 w-px bg-slate-200 md:block" />
                        <div className="rounded-xl bg-white/80 p-3 transition-all duration-300 hover:shadow-lg">
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-500">Target</p>
                            <p className="mt-1 font-bold text-slate-900">{event.targetId?.name || 'Unknown user'}</p>
                            <p>{event.targetId?.profession || 'No profession'}</p>
                        </div>
                    </div>
                    <hr className="border-slate-200" />
                    <p className="text-base font-semibold text-slate-800">{event.description}</p>
                    <hr className="border-slate-200" />
                    <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-700 items-center">
                        <span>Date: {new Date(event.date).toLocaleDateString()}</span>
                        <div className="h-4 w-px bg-slate-300 hidden md:block" />
                        <span>Duration: {event.timeDuration} minutes</span>
                    </div>
                </div>

                {!isPublished && (
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                        {(canManageStage3 || canManageStage2) && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => onEdit(event)}
                                    disabled={activeEventActionId === event._id}
                                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(event._id)}
                                    disabled={activeEventActionId === event._id}
                                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {activeEventActionId === event._id ? 'Deleting...' : 'Delete'}
                                </button>
                            </>
                        )}
                        {event.status !== 'stage1' && event.status !== 'stage2' && event.status !== 'stage3' && (
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
