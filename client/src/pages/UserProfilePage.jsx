import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authAPI, eventAPI, userAPI } from '../api';
import { getCountryLabel } from '../utils/countries';
import { canManageUsers, getUserUniqueId } from '../utils/user';

const PROFILE_FIELDS = [
    { label: 'Designation', key: 'designation' },
    { label: 'Achievement', key: 'achievement' },
    { label: 'Profession', key: 'profession' },
    { label: 'Specialist At', key: 'specialistAt' },
    { label: 'Chamber', key: 'chamber' },
    { label: 'Country', key: 'country' },
];

const getInitials = (name) => String(name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';

const formatDate = (value) => {
    if (!value) return 'Not available';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? 'Not available'
        : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

function StatCard({ label, value, tone }) {
    const tones = {
        indigo: 'border-indigo-100 bg-indigo-50',
        cyan: 'border-cyan-100 bg-cyan-50',
        emerald: 'border-emerald-100 bg-emerald-50',
    };

    return (
        <div className={`rounded-2xl border p-4 ${tones[tone] || tones.indigo}`}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
        </div>
    );
}

export function UserProfilePage({ currentUser, onCurrentUserUpdate }) {
    const navigate = useNavigate();
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [followError, setFollowError] = useState('');
    const [isFollowSubmitting, setIsFollowSubmitting] = useState(false);
    const [activeEventView, setActiveEventView] = useState(null);
    const [profileEvents, setProfileEvents] = useState([]);
    const [isEventsLoading, setIsEventsLoading] = useState(false);
    const [eventsError, setEventsError] = useState('');
    const [viewerRole, setViewerRole] = useState(currentUser?.role || '');
    const canViewEventHistory = canManageUsers({ role: viewerRole });

    useEffect(() => {
        let isMounted = true;
        const loadViewerRole = async () => {
            if (!currentUser?._id) return;
            if (currentUser.role) {
                setViewerRole(currentUser.role);
                return;
            }
            try {
                const response = await userAPI.getById(currentUser._id, currentUser._id);
                if (isMounted) setViewerRole(response.user?.role || '');
            } catch {
                if (isMounted) setViewerRole('');
            }
        };
        loadViewerRole();
        return () => { isMounted = false; };
    }, [currentUser?._id, currentUser?.role]);

    useEffect(() => {
        let isMounted = true;
        if (!userId) {
            setError('Invalid user ID.');
            setIsLoading(false);
            return undefined;
        }

        const loadUser = async () => {
            try {
                setError('');
                setIsLoading(true);
                const response = await userAPI.getById(userId, currentUser?._id);
                if (isMounted) setUser(response.user);
            } catch (loadError) {
                if (isMounted) setError(loadError.message || 'Failed to load user profile.');
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadUser();
        return () => { isMounted = false; };
    }, [userId, currentUser?._id]);

    const handleToggleFollow = async () => {
        if (!currentUser?._id || !user?._id || currentUser._id === user._id) return;
        try {
            setFollowError('');
            setIsFollowSubmitting(true);
            const response = await authAPI.toggleFollow(currentUser._id, user._id);
            setUser(response.targetUser);
            onCurrentUserUpdate(response.currentUser);
        } catch (followActionError) {
            setFollowError(followActionError.message || 'Failed to update follow status.');
        } finally {
            setIsFollowSubmitting(false);
        }
    };

    const loadProfileEvents = async (view) => {
        if (!canViewEventHistory || !user?._id) return;
        try {
            setActiveEventView(view);
            setIsEventsLoading(true);
            setEventsError('');
            const statuses = view === 'archive' ? ['archived'] : ['stage3', 'stage2', 'stage1', 'published'];
            const responses = await Promise.all(statuses.map((status) => eventAPI.getByStatus(status, user._id)));
            const loadedEvents = responses.flatMap((response) => response.events || []);
            setProfileEvents(view === 'expired'
                ? loadedEvents.filter((event) => event.date && new Date(event.date) < new Date())
                : loadedEvents);
        } catch (loadError) {
            setEventsError(loadError.message || `Failed to load ${view} events.`);
            setProfileEvents([]);
        } finally {
            setIsEventsLoading(false);
        }
    };

    const completion = useMemo(() => {
        if (!user) return 0;
        const fields = ['name', 'designation', 'achievement', 'phone', 'country', 'dateOfBirth', 'gender', 'specialistAt', 'profession', 'chamber'];
        return Math.round((fields.filter((field) => String(user[field] || '').trim()).length / fields.length) * 100);
    }, [user]);

    if (isLoading) {
        return <div className="w-full rounded-[2rem] border border-indigo-100 bg-white/95 p-8 text-center font-semibold text-indigo-700 shadow-2xl">Loading user profile...</div>;
    }

    if (error || !user) {
        return (
            <div className="w-full rounded-[2rem] border border-red-100 bg-white/95 p-6 shadow-2xl sm:p-8">
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
                    <p className="font-bold">Unable to load this profile</p>
                    <p className="mt-1">{error || 'User not found.'}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => window.location.reload()} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Retry</button>
                    <button type="button" onClick={() => navigate('/search')} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Back to Search</button>
                </div>
            </div>
        );
    }

    const uniqueIdLabel = getUserUniqueId(user);
    const isOwnProfile = currentUser?._id === user._id;
    const canFollow = Boolean(currentUser?._id && !isOwnProfile && !user.isPaused);
    const memberSinceDate = user.createdAt || user.memberSince;

    return (
        <div className="w-full overflow-hidden rounded-[2rem] border border-indigo-100 bg-white/95 shadow-2xl backdrop-blur-sm">
            <section className="relative overflow-hidden bg-gradient-to-br from-[#161080] via-indigo-700 to-fuchsia-600 px-5 pb-6 pt-5 text-white sm:px-8 sm:pt-7">
                <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
                <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/30 bg-white/20 text-2xl font-black shadow-xl backdrop-blur-sm sm:h-24 sm:w-24 sm:text-3xl">{getInitials(user.name)}</div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-100">User profile</p>
                            <h1 className="mt-1 break-words text-2xl font-black sm:text-4xl">{user.name}</h1>
                            <p className="mt-1 text-sm text-indigo-100">{user.designation || user.profession || 'Witting member'}</p>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                                <span className="rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/20">ID: {uniqueIdLabel}</span>
                                <span className="rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/20">{getCountryLabel(user.country)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {canFollow && <button type="button" onClick={handleToggleFollow} disabled={isFollowSubmitting} className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-800 shadow-lg transition hover:bg-indigo-50 disabled:opacity-60">{isFollowSubmitting ? 'Updating...' : user.isFollowing ? 'Following' : 'Follow'}</button>}
                        <button type="button" onClick={() => navigate(`/users/${user._id}/notice`)} className="rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20">Notice</button>
                        <button type="button" onClick={() => navigate('/search')} className="rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20">Back to Search</button>
                    </div>
                </div>
                {user.isPaused && <div className="relative mt-5 rounded-xl border border-amber-200/40 bg-amber-300/20 px-3 py-2 text-sm text-amber-50">This account is paused. Actions are currently disabled.</div>}
            </section>

            <div className="space-y-5 p-4 sm:p-7">
                {followError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{followError}</div>}
                <div className="grid gap-3 sm:grid-cols-3">
                    <StatCard label="Followers" value={user.totalFollowers || 0} tone="indigo" />
                    <StatCard label="Following" value={user.totalFollowee || 0} tone="cyan" />
                    <StatCard label="Profile complete" value={`${completion}%`} tone="emerald" />
                </div>

                <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Snapshot</p><h2 className="mt-1 text-xl font-black text-slate-900">Professional details</h2></div>
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">Public profile</span>
                        </div>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {PROFILE_FIELDS.map((field) => <div key={field.key} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{field.label}</p><p className="mt-1.5 break-words text-sm font-bold text-slate-800">{field.key === 'country' ? getCountryLabel(user[field.key]) : (user[field.key] || 'Not provided')}</p></div>)}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-fuchsia-600">Account information</p>
                        <div className="mt-4 space-y-4">
                            <div><p className="text-xs font-bold text-slate-400">Phone</p><p className="mt-1 text-sm font-semibold text-slate-800">{user.phone || 'Not provided'}</p></div>
                            <div><p className="text-xs font-bold text-slate-400">Date of birth</p><p className="mt-1 text-sm font-semibold text-slate-800">{formatDate(user.dateOfBirth)}</p></div>
                            <div><p className="text-xs font-bold text-slate-400">Member since</p><p className="mt-1 text-sm font-semibold text-slate-800">{formatDate(memberSinceDate)}</p></div>
                        </div>
                    </section>
                </div>

                {canViewEventHistory && <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Administration</p><h2 className="mt-1 text-lg font-black text-slate-900">Event history</h2></div>
                        <div className="flex gap-2">{['archive', 'expired'].map((view) => <button key={view} type="button" onClick={() => loadProfileEvents(view)} className={`rounded-xl px-3 py-2 text-sm font-bold capitalize transition ${activeEventView === view ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-100'}`}>{view}</button>)}</div>
                    </div>
                    {activeEventView && <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between gap-3"><p className="text-sm font-bold text-slate-900">{activeEventView === 'archive' ? 'Archived events' : 'Expired events'}</p><button type="button" onClick={() => setActiveEventView(null)} className="text-xs font-semibold text-slate-500 hover:text-slate-800">Close</button></div>
                        {isEventsLoading && <p className="mt-3 text-sm text-indigo-700">Loading events...</p>}
                        {!isEventsLoading && eventsError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{eventsError}</p>}
                        {!isEventsLoading && !eventsError && profileEvents.length === 0 && <p className="mt-3 text-sm text-slate-500">No {activeEventView} events found.</p>}
                        {!isEventsLoading && !eventsError && profileEvents.length > 0 && <div className="mt-3 space-y-2">{profileEvents.map((event) => <div key={event._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="flex flex-wrap justify-between gap-2"><span className="text-xs font-bold capitalize text-indigo-700">{event.status || activeEventView}</span><span className="text-xs text-slate-500">{event.date ? new Date(event.date).toLocaleDateString() : 'Date unavailable'}</span></div><p className="mt-1 text-sm font-semibold text-slate-800">{event.description}</p><p className="mt-1 text-xs text-slate-500">Creator: {event.creator?.name || 'Unknown'} · Target: {event.target?.name || 'Unknown'}</p></div>)}</div>}
                    </div>}
                </section>}
            </div>
        </div>
    );
}

