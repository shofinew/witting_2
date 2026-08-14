import React, { useMemo, useState } from 'react';
import { EventSection } from '../components/EventSection';

const isTodayOrFutureDate = (value, today) => {
    if (!value) {
        return false;
    }

    const eventDate = new Date(value);
    const normalizedEventDate = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    return normalizedEventDate >= normalizedToday;
};

export function StagePage({
    stage,
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
}) {
    const [activeTab, setActiveTab] = useState('coming');

    const { comingEvents, goingEvents } = useMemo(() => {
        const stageEvents = Array.isArray(events) ? events : [];
        const visibleEvents = stageEvents.filter((event) => isTodayOrFutureDate(event.date, now));

        return {
            comingEvents: visibleEvents.filter((event) => {
                const creatorId = event.creator?._id || event.creatorId;
                return creatorId !== currentUserId;
            }),
            goingEvents: visibleEvents.filter((event) => {
                const creatorId = event.creator?._id || event.creatorId;
                return creatorId === currentUserId;
            }),
        };
    }, [events, currentUserId, now]);

    const visibleEvents = activeTab === 'going' ? goingEvents : comingEvents;

    return (
        <EventSection
            status={stage}
            events={visibleEvents}
            now={now}
            isLoading={isLoading}
            error={error}
            actionError={actionError}
            actionSuccess={actionSuccess}
            currentUserId={currentUserId}
            activeEventActionId={activeEventActionId}
            activeEventActionType={activeEventActionType}
            onRefresh={onRefresh}
            onAdvance={onAdvance}
            onPublish={onPublish}
            onEdit={onEdit}
            onDelete={onDelete}
            onArchive={onArchive}
            onStart={onStart}
            hideEditButton={
                (stage === 'stage1' && activeTab === 'going')
                || (stage === 'stage2' && activeTab === 'coming')
                || (stage === 'stage3' && activeTab === 'going')
            }
            headerContent={
                <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                    <button
                        type="button"
                        onClick={() => setActiveTab('coming')}
                        className={`min-w-0 px-4 py-3 text-sm font-semibold transition ${
                            activeTab === 'coming'
                                ? 'bg-[#106080] text-white'
                                : 'bg-transparent text-slate-700 hover:bg-white/70'
                        }`}
                    >
                        Coming ({comingEvents.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('going')}
                        className={`min-w-0 border-l border-slate-200 px-4 py-3 text-sm font-semibold transition ${
                            activeTab === 'going'
                                ? 'bg-[#161080] text-white'
                                : 'bg-transparent text-slate-700 hover:bg-white/70'
                        }`}
                    >
                        Going ({goingEvents.length})
                    </button>
                </div>
            }
        />
    );
}
