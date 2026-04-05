import React from 'react';
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
    return (
        <EventSection
            status={stage}
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
            onEdit={onEdit}
            onDelete={onDelete}
            onArchive={onArchive}
            onStart={onStart}
        />
    );
}
