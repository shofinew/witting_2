import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authAPI, eventAPI, userAPI } from '../api';
import { getCountryLabel } from '../utils/countries';
import { canManageUsers, getUserUniqueId } from '../utils/user';

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
                if (isMounted) {
                    setViewerRole(response.user?.role || '');
                }
            } catch {
                if (isMounted) setViewerRole('');
            }
        };

        loadViewerRole();
        return () => {
            isMounted = false;
        };
    }, [currentUser?._id, currentUser?.role]);

    useEffect(() => {
        if (!userId) {
            setError('Invalid user ID');
            setIsLoading(false);
            return;
        }

        const loadUser = async () => {
            try {
                setError('');
                setIsLoading(true);
                const data = await userAPI.getById(userId, currentUser?._id);
                setUser(data.user);
            } catch (err) {
                console.error('Error loading user profile:', err);
                setError(err.message || 'Failed to load user profile. Please check your connection and try again.');
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, [userId, currentUser?._id]);

    const handleToggleFollow = async () => {
        if (!currentUser?._id || !user?._id || currentUser._id === user._id) {
            return;
        }

        try {
            setFollowError('');
            setIsFollowSubmitting(true);
            const response = await authAPI.toggleFollow(currentUser._id, user._id);
            setUser(response.targetUser);
            onCurrentUserUpdate(response.currentUser);
        } catch (err) {
            setFollowError(err.message || 'Failed to update follow status.');
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
            const statuses = view === 'archive'
                ? ['archived']
                : ['stage3', 'stage2', 'stage1', 'published'];
            const responses = await Promise.all(statuses.map((status) => eventAPI.getByStatus(status, user._id)));
            const loadedEvents = responses.flatMap((response) => response.events || []);
            setProfileEvents(view === 'expired'
                ? loadedEvents.filter((event) => event.date && new Date(event.date) < new Date())
                : loadedEvents);
        } catch (err) {
            setEventsError(err.message || `Failed to load ${view} events.`);
            setProfileEvents([]);
        } finally {
            setIsEventsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full rounded-3xl border border-indigo-100 bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
                <p className="font-medium text-indigo-700">Loading user profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full rounded-3xl border border-indigo-100 bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
                <div className="mb-4 rounded-lg border border-red-200 bg-red-100 px-4 py-3 text-sm text-red-900">
                    <p className="font-semibold">Error loading user profile</p>
                    <p className="mt-1">{error}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                        Retry
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/search')}
                        className="rounded-xl bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
                    >
                        Back to Search
                    </button>
                </div>
            </div>
        );
    }

    const memberSinceDate = user.createdAt || user.memberSince;
    const uniqueIdLabel = getUserUniqueId(user);
    const canFollow = currentUser?._id && currentUser._id !== user._id && !user.isPaused;

    return (
        <div className="w-full rounded-3xl border border-indigo-100 bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-sm font-semibold text-fuchsia-500">User Profile</p>
                    <h2 className="mt-2 text-3xl font-black text-slate-800">{user.name}</h2>
                    <p className="mt-2 text-slate-600">Viewing the selected user profile from search results.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {canFollow && (
                        <button
                            type="button"
                            onClick={handleToggleFollow}
                            disabled={isFollowSubmitting}
                            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70 ${user.isFollowing ? 'bg-slate-700 hover:bg-slate-800' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                        >
                            {isFollowSubmitting ? 'Updating...' : user.isFollowing ? 'Unfollow' : 'Follow'}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => navigate('/search')}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                        Back to Search
                    </button>
                </div>
            </div>

            {followError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-100 px-4 py-3 text-sm text-red-900">
                    {followError}
                </div>
            )}

            {user.isPaused && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    This account is paused. Actions are currently disabled.
                </div>
            )}

            {canViewEventHistory && (
                <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-100 p-1.5">
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => loadProfileEvents('archive')}
                            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${activeEventView === 'archive'
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                        >
                            Archive
                        </button>
                        <button
                            type="button"
                            onClick={() => loadProfileEvents('expired')}
                            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${activeEventView === 'expired'
                                ? 'bg-rose-600 text-white shadow-lg'
                                : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                        >
                            Expired
                        </button>
                    </div>
                </div>
            )}

            {canViewEventHistory && activeEventView && (
                <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">
                                {activeEventView === 'archive' ? 'Event Archive' : 'Expired Events'}
                            </h3>
                            <p className="mt-0.5 text-xs text-slate-500">Admin view for {user.name}</p>
                        </div>
                        <button type="button" onClick={() => setActiveEventView(null)} className="text-xs font-semibold text-slate-500 hover:text-slate-800">
                            Close
                        </button>
                    </div>
                    {isEventsLoading && <p className="text-sm text-indigo-700">Loading events...</p>}
                    {!isEventsLoading && eventsError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{eventsError}</p>}
                    {!isEventsLoading && !eventsError && profileEvents.length === 0 && <p className="text-sm text-slate-500">No {activeEventView} events found.</p>}
                    {!isEventsLoading && !eventsError && profileEvents.length > 0 && (
                        <div className="space-y-2">
                            {profileEvents.map((event) => (
                                <div key={event._id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${activeEventView === 'archive' ? 'bg-slate-200 text-slate-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {activeEventView === 'archive' ? 'Archived' : event.status || 'Expired'}
                                        </span>
                                        <span className="text-xs text-slate-500">{event.date ? new Date(event.date).toLocaleDateString() : 'Date unavailable'}</span>
                                    </div>
                                    <p className="mt-2 text-sm font-semibold text-slate-800">{event.description}</p>
                                    <p className="mt-1 text-xs text-slate-600">Creator: {event.creator?.name || 'Unknown'} · Target: {event.target?.name || 'Unknown'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-6">
                <div className="space-y-4">
                    <div className="border-b border-indigo-200 pb-4">
                        <p className="text-sm font-semibold text-indigo-600">Name</p>
                        <p className="mt-1 text-lg font-bold text-slate-800">{user.name}</p>
                    </div>
                    <div className="border-b border-indigo-200 py-4">
                        <p className="text-sm font-semibold text-indigo-600">Total Followers</p>
                        <p className="mt-1 text-lg font-bold text-slate-800">{user.totalFollowers || 0}</p>
                    </div>
                    <div className="border-b border-indigo-200 py-4">
                        <p className="text-sm font-semibold text-indigo-600">Total Followee</p>
                        <p className="mt-1 text-lg font-bold text-slate-800">{user.totalFollowee || 0}</p>
                    </div>
                    <div className="border-b border-indigo-200 py-4">
                        <p className="text-sm font-semibold text-indigo-600">Designation</p>
                        <p className="mt-1 text-lg font-bold text-slate-800">{user.designation || 'Not provided'}</p>
                    </div>
                    <div className="border-b border-indigo-200 py-4">
                        <p className="text-sm font-semibold text-indigo-600">Achievement</p>
                        <p className="mt-1 text-lg font-bold text-slate-800">{user.achievement || 'Not provided'}</p>
                    </div>
                    <div className="border-b border-indigo-200 py-4">
                        <p className="text-sm font-semibold text-indigo-600">Unique ID</p>
                        <p className="mt-1 text-lg font-bold text-slate-800" dir="ltr">{uniqueIdLabel}</p>
                    </div>
                    <div className="border-b border-indigo-200 py-4">
                        <p className="text-sm font-semibold text-indigo-600">Email</p>
                        <p className="mt-1 text-lg font-bold text-slate-800">{user.email}</p>
                    </div>
                    <div className="border-b border-indigo-200 py-4">
                        <p className="text-sm font-semibold text-indigo-600">Phone</p>
                        <p className="mt-1 text-lg font-bold text-slate-800">{user.phone || 'Not provided'}</p>
                    </div>
                    <div className="border-b border-indigo-200 py-4">
                        <p className="text-sm font-semibold text-indigo-600">Country</p>
                        <p className="mt-1 text-lg font-bold text-slate-800">{getCountryLabel(user.country)}</p>
                    </div>
                    <div className="border-b border-indigo-200 py-4">
                        <p className="text-sm font-semibold text-indigo-600">Date of Birth</p>
                        <p className="mt-1 text-lg font-bold text-slate-800">
                            {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                        </p>
                    </div>
                    <div className="border-b border-indigo-200 py-4">
                        <p className="text-sm font-semibold text-indigo-600">Specialist At</p>
                        <p className="mt-1 text-lg font-bold text-slate-800">{user.specialistAt || 'Not provided'}</p>
                    </div>
                    <div className="border-b border-indigo-200 py-4">
                        <p className="text-sm font-semibold text-indigo-600">Profession</p>
                        <p className="mt-1 text-lg font-bold text-slate-800">{user.profession || 'Not provided'}</p>
                    </div>
                    <div className="border-b border-indigo-200 py-4">
                        <p className="text-sm font-semibold text-indigo-600">Chamber</p>
                        <p className="mt-1 text-lg font-bold text-slate-800">{user.chamber || 'Not provided'}</p>
                    </div>
                    <div className="pt-4">
                        <p className="text-sm font-semibold text-indigo-600">Member Since</p>
                        <p className="mt-1 text-lg font-bold text-slate-800">
                            {memberSinceDate
                                ? new Date(memberSinceDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })
                                : 'Not available'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
