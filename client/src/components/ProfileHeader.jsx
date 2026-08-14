import React from 'react';

export function ProfileHeader({ currentUser }) {
    return (
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-500">Profile</p>
                <h2 className="mt-1 text-2xl font-black text-slate-800 sm:text-3xl">{currentUser.name}</h2>
            </div>
            <p className="text-sm text-slate-600 sm:max-w-md sm:text-right">
                Manage your account details and public profile.
            </p>
        </div>
    );
}
