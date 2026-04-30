import React, { useMemo, useState } from 'react';
import { EventSection } from '../components/EventSection';

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

        return {
            comingEvents: stageEvents.filter((event) => {
                const creatorId = event.creator?._id || event.creatorId;
                return creatorId !== currentUserId;
            }),
            goingEvents: stageEvents.filter((event) => {
                const creatorId = event.creator?._id || event.creatorId;
                return creatorId === currentUserId;
            }),
        };
    }, [events, currentUserId]);

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
