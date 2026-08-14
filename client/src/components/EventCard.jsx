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
    hideEditButton = false,
    hideSerial = false,
}) {
    const targetUserId = event.target?._id || event.targetId;
    const creatorUserId = event.creator?._id || event.creatorId;
    const messageAuthorId = event.messageAuthor?._id || event.messageAuthorId?._id || event.messageAuthorId || '';
    const isCreator = creatorUserId === currentUserId;
    const cardHighlightClass = isCreator
        ? 'border-amber-100 bg-gradient-to-r from-white via-amber-50 to-amber-100'
        : 'border-emerald-100 bg-gradient-to-r from-white via-emerald-50 to-emerald-100';
    const isStage3TargetUser = event.status === 'stage3' && targetUserId === currentUserId;
    const isStage2CreatorUser = event.status === 'stage2' && creatorUserId === currentUserId;
    const isStage1TargetUser = event.status === 'stage1' && targetUserId === currentUserId;
    const canArchivePublishedEvent = isPublished && (creatorUserId === currentUserId || targetUserId === currentUserId);
    const canStartPublishedEvent = isPublished && creatorUserId === currentUserId;
    const canManageStage3 = event.status === 'stage3' && isStage3TargetUser;
    const canManageStage2 = event.status === 'stage2' && isStage2CreatorUser;
    const canEditOwnMessage = Boolean(messageAuthorId && messageAuthorId === currentUserId);
    const canOpenEditor = canManageStage3 || canManageStage2 || canEditOwnMessage;
    const canDirectPublish = canManageStage3 || canManageStage2;
    const isEventActionActive = activeEventActionId === event._id;
    const isDeleting = isEventActionActive && activeEventActionType === 'delete';
    const isAdvancing = isEventActionActive && activeEventActionType === 'advance';
    const isPublishing = isEventActionActive && activeEventActionType === 'publish';
    const isArchiving = isEventActionActive && activeEventActionType === 'archive';
    const isStarting = isEventActionActive && activeEventActionType === 'start';
    const editButtonClass = ['stage3', 'stage2'].includes(event.status)
        ? 'rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm'
        : 'rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm';
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
        <div className={`rounded-xl p-3 shadow-sm sm:p-4 ${cardHighlightClass}`}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-normal text-indigo-700">
                            {STATUS_LABELS[event.status]}
                        </span>
                        {!hideSerial && isPublished && typeof event.serialNo === 'number' && (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-normal text-emerald-700">
                                Serial {event.serialNo}
                            </span>
                        )}
                        <span className="text-[11px] font-medium text-slate-500">Created {createdAtLabel}</span>
                        <span className="text-[11px] font-medium text-slate-500">Updated {updatedAtLabel}</span>
                    </div>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center overflow-hidden rounded-lg bg-white/80 text-xs text-slate-600 shadow-sm">
                        <div className="min-w-0 px-2.5 py-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-500">Creator</p>
                            <p className="mt-0.5 truncate text-sm font-bold text-slate-900">{event.creator?.name || 'Unknown user'}</p>
                            <p className="truncate text-[11px]">{event.creator?.profession || 'No profession'}</p>
                        </div>
                        <div className="w-px bg-slate-200" />
                        <div className="min-w-0 px-2.5 py-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-500">Target</p>
                            <p className="mt-0.5 truncate text-sm font-bold text-slate-900">{event.target?.name || 'Unknown user'}</p>
                            <p className="truncate text-[11px]">{event.target?.profession || 'No profession'}</p>
                        </div>
                    </div>
                    <p className="text-sm font-semibold leading-5 text-slate-800">{event.description}</p>
                    {event.message && (
                        <div className="rounded-lg border border-indigo-100 bg-white/70 p-2.5 text-xs text-slate-700">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-500">Message thread</p>
                            <p className="mt-1 whitespace-pre-wrap font-medium leading-5">{event.message}</p>
                        </div>
                    )}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-200 pt-2 text-xs font-medium text-slate-700">
                        <span>Date: {formatEventDate(event.date)}</span>
                        <span className="hidden h-3 w-px bg-slate-300 md:block" />
                        <span>{isPublished ? `Duration: ${formatRemainingTime(remainingSeconds)}` : `Duration: ${event.timeDuration} minutes`}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5 border-t border-slate-200 pt-2 lg:max-w-[18rem] lg:justify-end lg:border-t-0 lg:pt-0">
                    {!hideStartAndArchive && canStartPublishedEvent && (
                        <button
                            type="button"
                            onClick={() => onStart(event._id)}
                            disabled={isEventActionActive || isTimerRunning || isTimerFinished}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
                        >
                            {isStarting ? 'Starting...' : isTimerRunning ? 'Running...' : isTimerFinished ? 'Finished' : 'Start'}
                        </button>
                    )}
                    {!hideStartAndArchive && canArchivePublishedEvent && (
                        <button
                            type="button"
                            onClick={() => onArchive(event._id)}
                            disabled={isEventActionActive}
                            className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
                        >
                            {isArchiving ? 'Archiving...' : 'Archive'}
                        </button>
                    )}
                    {!isPublished && (
                        <>
                            {canOpenEditor && !hideEditButton && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => onEdit(event)}
                                        disabled={isEventActionActive}
                                        className={editButtonClass}
                                    >
                                        Edit
                                    </button>
                                    {(canManageStage3 || canManageStage2) && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => onDelete(event._id)}
                                                disabled={isEventActionActive}
                                                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
                                            >
                                                {isDeleting ? 'Deleting...' : 'Delete'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => (canDirectPublish ? onPublish(event._id) : onAdvance(event._id))}
                                                disabled={isEventActionActive}
                                                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
                                            >
                                                {confirmButtonLabel}
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                            {event.status !== 'stage1' && event.status !== 'stage2' && event.status !== 'stage3' && (
                                <button
                                    type="button"
                                    onClick={() => onAdvance(event._id)}
                                    disabled={isEventActionActive}
                                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
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
                                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
                                    >
                                        {isPublishing ? 'Publishing...' : 'Confirm'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(event._id)}
                                        disabled={isEventActionActive}
                                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
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
