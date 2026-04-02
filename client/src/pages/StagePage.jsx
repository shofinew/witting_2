import React from 'react';
import { EventSection } from '../components/EventSection';

export function StagePage({
    stage,
    events,
    isLoading,
    error,
    actionError,
    actionSuccess,
    currentUserId,
    activeEventActionId,
    onRefresh,
    onAdvance,
    onPublish,
    onEdit,
    onDelete,
}) {
    return (
        <EventSection
            status={stage}
            events={events}
            isLoading={isLoading}
            error={error}
            actionError={actionError}
            actionSuccess={actionSuccess}
            currentUserId={currentUserId}
            activeEventActionId={activeEventActionId}
            onRefresh={onRefresh}
            onAdvance={onAdvance}
            onPublish={onPublish}
            onEdit={onEdit}
            onDelete={onDelete}
        />
    );
}
