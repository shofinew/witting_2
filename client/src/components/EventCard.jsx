import React from 'react';
import { STATUS_LABELS } from '../constants';

const formatRemainingTime = (seconds) => {
    const safeSeconds = Math.max(0, seconds);
    const minutes = Math.floor(safeSeconds / 60);
    const remaining = safeSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
};

const formatEventDate = (value) => {
    if (!value) {
        return 'Not available';
    }

    return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export function EventCard({
    event,
    now,
    isPublished,
    currentUserId,
    activeEventActionId,
    activeEventActionType,
    onAdvance,
    onPublish,
    onEdit,
    onDelete,
    onArchive,
    onStart,
    hideStartAndArchive = false,
    hideSerial = false,
}) {
    const targetUserId = event.target?._id || event.targetId;
    const creatorUserId = event.creator?._id || event.creatorId;
    const isCreator = creatorUserId === currentUserId;
    const cardHighlightClass = event.status === 'stage2'
        ? (isCreator
            ? 'border-emerald-100 bg-gradient-to-r from-white via-emerald-50 to-emerald-100'
            : 'border-amber-100 bg-gradient-to-r from-white via-amber-50 to-amber-100')
        : (isCreator
            ? 'border-amber-100 bg-gradient-to-r from-white via-amber-50 to-amber-100'
            : 'border-emerald-100 bg-gradient-to-r from-white via-emerald-50 to-emerald-100');
    const isStage3TargetUser = event.status === 'stage3' && targetUserId === currentUserId;
    const isStage2CreatorUser = event.status === 'stage2' && creatorUserId === currentUserId;
    const isStage1TargetUser = event.status === 'stage1' && targetUserId === currentUserId;
    const canArchivePublishedEvent = isPublished && (creatorUserId === currentUserId || targetUserId === currentUserId);
    const canStartPublishedEvent = isPublished && creatorUserId === currentUserId;
    const canManageStage3 = event.status === 'stage3' && isStage3TargetUser;
    const canManageStage2 = event.status === 'stage2' && isStage2CreatorUser;
    const canDirectPublish = canManageStage3 || canManageStage2;
    const isEventActionActive = activeEventActionId === event._id;
    const isDeleting = isEventActionActive && activeEventActionType === 'delete';
    const isAdvancing = isEventActionActive && activeEventActionType === 'advance';
    const isPublishing = isEventActionActive && activeEventActionType === 'publish';
    const isArchiving = isEventActionActive && activeEventActionType === 'archive';
    const isStarting = isEventActionActive && activeEventActionType === 'start';
    const editButtonClass = ['stage3', 'stage2'].includes(event.status)
        ? 'rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-70'
        : 'rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70';
    const confirmButtonLabel = canDirectPublish
        ? (isPublishing ? 'Publishing...' : 'Confirm')
        : (isAdvancing ? 'Confirming...' : 'Confirm');
    const baseSeconds = typeof event.remainingSeconds === 'number' ? event.remainingSeconds : event.timeDuration * 60;
    const elapsedSeconds = event.timerStartedAt ? Math.floor((now.getTime() - new Date(event.timerStartedAt).getTime()) / 1000) : 0;
    const remainingSeconds = Math.max(0, baseSeconds - Math.max(0, elapsedSeconds));
    const isTimerRunning = Boolean(event.timerStartedAt) && remainingSeconds > 0;
    const isTimerFinished = remainingSeconds <= 0;
    const createdAtLabel = event.createdAt ? new Date(event.createdAt).toLocaleString() : 'Not available';
    const updatedAtLabel = event.updatedAt ? new Date(event.updatedAt).toLocaleString() : 'Not available';

    return (
        <div className={`rounded-2xl p-5 shadow-sm ${cardHighlightClass}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">
                            {STATUS_LABELS[event.status]}
                        </span>
                        {!hideSerial && isPublished && typeof event.serialNo === 'number' && (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                                Serial {event.serialNo}
                            </span>
                        )}
                        <span className="text-xs font-medium text-slate-500">
                            Created {createdAtLabel}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                            Updated {updatedAtLabel}
                        </span>
                    </div>
                    <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-[1fr_auto_1fr] md:items-center">
                        <div className="rounded-xl bg-white/80 p-3 transition-all duration-300 hover:shadow-lg">
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-500">Creator</p>
                            <p className="mt-1 font-bold text-slate-900">{event.creator?.name || 'Unknown user'}</p>
                            <p>{event.creator?.profession || 'No profession'}</p>
                        </div>
                        <div className="hidden h-20 w-px bg-slate-200 md:block" />
                        <div className="rounded-xl bg-white/80 p-3 transition-all duration-300 hover:shadow-lg">
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-500">Target</p>
                            <p className="mt-1 font-bold text-slate-900">{event.target?.name || 'Unknown user'}</p>
                            <p>{event.target?.profession || 'No profession'}</p>
                        </div>
                    </div>
                    <hr className="border-slate-200" />
                    <p className="text-base font-semibold text-slate-800">{event.description}</p>
                    <hr className="border-slate-200" />
                    <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-700 items-center">
                        <span>Date: {formatEventDate(event.date)}</span>
                        <div className="h-4 w-px bg-slate-300 hidden md:block" />
                        <span>{isPublished ? `Duration: ${formatRemainingTime(remainingSeconds)}` : `Duration: ${event.timeDuration} minutes`}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                    {!hideStartAndArchive && canStartPublishedEvent && (
                        <button
                            type="button"
                            onClick={() => onStart(event._id)}
                            disabled={isEventActionActive || isTimerRunning || isTimerFinished}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isStarting ? 'Starting...' : isTimerRunning ? 'Running...' : isTimerFinished ? 'Finished' : 'Start'}
                        </button>
                    )}
                    {!hideStartAndArchive && canArchivePublishedEvent && (
                        <button
                            type="button"
                            onClick={() => onArchive(event._id)}
                            disabled={isEventActionActive}
                            className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isArchiving ? 'Archiving...' : 'Archive'}
                        </button>
                    )}
                    {!isPublished && (
                        <>
                            {(canManageStage3 || canManageStage2) && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => onEdit(event)}
                                        disabled={isEventActionActive}
                                        className={editButtonClass}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(event._id)}
                                        disabled={isEventActionActive}
                                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => (canDirectPublish ? onPublish(event._id) : onAdvance(event._id))}
                                        disabled={isEventActionActive}
                                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {confirmButtonLabel}
                                    </button>
                                </>
                            )}
                            {event.status !== 'stage1' && event.status !== 'stage2' && event.status !== 'stage3' && (
                                <button
                                    type="button"
                                    onClick={() => onAdvance(event._id)}
                                    disabled={isEventActionActive}
                                    className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isEventActionActive ? 'Updating...' : 'Edit'}
                                </button>
                            )}
                            {isStage1TargetUser && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => onPublish(event._id)}
                                        disabled={isEventActionActive}
                                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {isPublishing ? 'Publishing...' : 'Confirm'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(event._id)}
                                        disabled={isEventActionActive}
                                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
