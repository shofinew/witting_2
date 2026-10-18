import React, { useMemo, useState } from 'react';
import { EventSection } from '../components/EventSection';

const isSameLocalDate = (value, today) => {
    if (!value) {
        return false;
    }

    const eventDate = new Date(value);

    return eventDate.getFullYear() === today.getFullYear()
        && eventDate.getMonth() === today.getMonth()
        && eventDate.getDate() === today.getDate();
};

export function HomePage({
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
    onArchive,
}) {
    const [activeTab, setActiveTab] = useState('coming');

    const { comingEvents, goingEvents } = useMemo(() => {
        const publishedEvents = Array.isArray(events) ? events : [];
        const todaysEvents = publishedEvents.filter((event) => isSameLocalDate(event.date, now));

        return {
            comingEvents: todaysEvents.filter((event) => {
                const creatorId = event.creator?._id || event.creatorId;
                return creatorId !== currentUserId;
            }),
            goingEvents: todaysEvents.filter((event) => {
                const creatorId = event.creator?._id || event.creatorId;
                return creatorId === currentUserId;
            }),
        };
    }, [events, currentUserId, now]);

    const visibleEvents = activeTab === 'going' ? goingEvents : comingEvents;

    return (
        <EventSection
            status="published"
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
            onArchive={onArchive}
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
