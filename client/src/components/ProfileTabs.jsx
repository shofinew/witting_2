import React from 'react';
import { useNavigate } from 'react-router-dom';

export function ProfileTabs({ currentUser, activeTab }) {
    const navigate = useNavigate();

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-100 p-1.5">
            <div className="grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${activeTab === 'profile'
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    Profile
                </button>
                <button
                    type="button"
                    onClick={() => navigate(`/public?creatorId=${currentUser._id}`, { state: { activePageOverride: 'profile' } })}
                    disabled={currentUser.isPaused}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${activeTab === 'public'
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                    My public
                </button>
            </div>
        </div>
    );
}
