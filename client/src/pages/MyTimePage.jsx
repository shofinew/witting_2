import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileTabs, TimeSummaryDay } from '../components/ProfileTabs';

export function MyTimePage({ currentUser, events, now, onRefresh, onUserUpdate, onLogout }) {
    const navigate = useNavigate();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshTimeData = async () => {
        if (!onRefresh || isRefreshing) return;

        setIsRefreshing(true);
        try {
            await onRefresh();
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <main className="mt-2 w-full rounded-3xl border border-indigo-100 bg-white/95 p-4 shadow-2xl backdrop-blur-sm sm:p-6">
            <div className="mb-5">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">My Time</p>
                <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">Manage your time</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                    Review today’s schedule and save the dates when you are available for new events.
                </p>
            </div>

            <ProfileTabs currentUser={currentUser} activeTab="time" hideContent />

            <TimeSummaryDay
                currentUser={currentUser}
                events={events}
                date={now}
                onRefresh={onRefresh ? refreshTimeData : null}
                isRefreshing={isRefreshing}
                onUserUpdate={onUserUpdate}
            />

            <div className="mt-8 border-t border-slate-200 pt-5">
                <div className="flex flex-col items-start gap-3">
                <button
                    type="button"
                    onClick={() => navigate('/setting')}
                    className="text-sm font-semibold text-indigo-700 transition hover:text-fuchsia-600"
                >
                    Setting
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/feedback')}
                    className="text-sm font-semibold text-indigo-700 transition hover:text-fuchsia-600"
                >
                    Feedback
                </button>
                <button
                    type="button"
                    onClick={onLogout}
                    className="text-sm font-semibold text-slate-700 transition hover:text-red-600"
                >
                    {currentUser.name} (Logout)
                </button>
                </div>
            </div>
        </main>
    );
}
