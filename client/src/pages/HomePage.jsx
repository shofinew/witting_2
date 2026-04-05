import React from 'react';
import { EventSection } from '../components/EventSection';

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
    onStart,
}) {
    return (
        <EventSection
            status="published"
            events={events}
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
            onStart={onStart}
        />
    );
}
