import React from 'react';
import { EventSection } from '../components/EventSection';

export function StagePage({
    stage,
    events,
    isLoading,
    error,
    actionError,
    actionSuccess,
    activeEventActionId,
    onRefresh,
    onAdvance,
    onPublish,
}) {
    return (
        <EventSection
            status={stage}
            events={events}
            isLoading={isLoading}
            error={error}
            actionError={actionError}
            actionSuccess={actionSuccess}
            activeEventActionId={activeEventActionId}
            onRefresh={onRefresh}
            onAdvance={onAdvance}
            onPublish={onPublish}
        />
    );
}
