import React, { useState } from 'react';
import { getCountryLabel } from '../utils/countries';
import { authAPI } from '../api';

const DETAIL_FIELDS = [
    { label: 'Designation', key: 'designation' },
    { label: 'Achievement', key: 'achievement' },
    { label: 'Country', key: 'country' },
    { label: 'Specialist At', key: 'specialistAt' },
    { label: 'Profession', key: 'profession' },
    { label: 'Chamber', key: 'chamber' },
];

export function UserProfileModal({ user, currentUser, onClose, onUserChange, onCurrentUserUpdate }) {
    const [followError, setFollowError] = useState('');
    const [isFollowSubmitting, setIsFollowSubmitting] = useState(false);
    const [blockMessage, setBlockMessage] = useState('');
    const canFollow = currentUser?._id && currentUser._id !== user._id;
    const initials = String(user.name || 'U')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('');

    const handleToggleFollow = async () => {
        if (!canFollow) {
            return;
        }

        try {
            setFollowError('');
            setBlockMessage('');
            setIsFollowSubmitting(true);
            const response = await authAPI.toggleFollow(currentUser._id, user._id);
            onUserChange(response.targetUser);
            onCurrentUserUpdate(response.currentUser);
        } catch (error) {
            setFollowError(error.message || 'Failed to update follow status.');
        } finally {
            setIsFollowSubmitting(false);
        }
    };

    const handleBlockClick = () => {
        setFollowError('');
        setBlockMessage('Block feature is not connected yet.');
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm">
            <div className="mx-auto flex h-full w-full max-w-[1000px] flex-col overflow-hidden bg-[#fcfcff]">
                <div className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.28),_transparent_42%),linear-gradient(135deg,#0f172a_0%,#1e1b4b_48%,#155e75_100%)] px-4 py-4 text-white sm:px-5">
                    <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-12 left-8 h-20 w-20 rounded-full bg-cyan-300/20 blur-2xl" />
                    <div className="relative flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-lg font-black tracking-[0.12em] text-white shadow-lg">
                                {initials || 'U'}
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-100/80">User Profile</p>
                                <h3 className="mt-1 text-2xl font-black leading-tight">{user.name}</h3>
                                <p className="mt-1 max-w-md text-xs text-slate-200 sm:text-sm">
                                    Quick details from the selected search result with live follow status.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-50">
                                        {user.profession || 'Profession not set'}
                                    </span>
                                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-50">
                                        {getCountryLabel(user.country)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {canFollow && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleToggleFollow}
                                        disabled={isFollowSubmitting}
                                        className={`rounded-xl px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${user.isFollowing
                                            ? 'bg-white/12 text-white ring-1 ring-white/25 hover:bg-white/20'
                                            : 'bg-white text-slate-900 hover:bg-cyan-50'
                                            }`}
                                    >
                                        {isFollowSubmitting ? 'Updating...' : user.isFollowing ? 'Unfollow' : 'Follow'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleBlockClick}
                                        className="rounded-xl bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
                                    >
                                        Block
                                    </button>
                                </>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                    <div className="space-y-4">
                    {followError && (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                            {followError}
                        </div>
                    )}
                    {blockMessage && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                            {blockMessage}
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-indigo-100 bg-[linear-gradient(180deg,#eef2ff_0%,#ffffff_100%)] p-4 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.28em] text-indigo-500">Followers</p>
                            <p className="mt-2 text-2xl font-black text-slate-900">{user.totalFollowers || 0}</p>
                            <p className="mt-1 text-xs text-slate-500 sm:text-sm">People following this user</p>
                        </div>
                        <div className="rounded-2xl border border-cyan-100 bg-[linear-gradient(180deg,#ecfeff_0%,#ffffff_100%)] p-4 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-600">Following</p>
                            <p className="mt-2 text-2xl font-black text-slate-900">{user.totalFollowee || 0}</p>
                            <p className="mt-1 text-xs text-slate-500 sm:text-sm">Accounts this user follows</p>
                        </div>
                        <div className="rounded-2xl border border-fuchsia-100 bg-[linear-gradient(180deg,#fdf4ff_0%,#ffffff_100%)] p-4 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.28em] text-fuchsia-600">Status</p>
                            <p className="mt-2 text-base font-black text-slate-900">
                                {canFollow ? (user.isFollowing ? 'Already Connected' : 'Not Following Yet') : 'Your Profile'}
                            </p>
                            <p className="mt-1 text-xs text-slate-500 sm:text-sm">Live relationship status</p>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Profile Details</p>
                                <h4 className="mt-1 text-lg font-black text-slate-900">Personal Information</h4>
                            </div>
                            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                                Snapshot
                            </div>
                        </div>

                        <div className="grid gap-2.5 sm:grid-cols-2">
                            {DETAIL_FIELDS.map((field) => (
                                <div
                                    key={field.key}
                                    className="rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-3 transition hover:border-slate-300 hover:shadow-sm"
                                >
                                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                                        {field.label}
                                    </p>
                                    <p className="mt-1.5 text-sm font-bold text-slate-900 sm:text-base">
                                        {field.key === 'country'
                                            ? getCountryLabel(user[field.key])
                                            : (user[field.key] || 'Not provided')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50/90 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Quick Summary</p>
                                <p className="mt-1.5 text-sm text-slate-600">
                                    {user.name} is listed as <span className="font-semibold text-slate-900">{user.profession || 'a user without a profession set'}</span>
                                    {user.specialistAt ? ` and specializes in ${user.specialistAt}.` : '.'}
                                </p>
                            </div>
                            <div className="text-sm font-semibold text-slate-500">
                                {canFollow ? (user.isFollowing ? 'You are following this user.' : 'You are not following this user yet.') : 'This is your own profile preview.'}
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
