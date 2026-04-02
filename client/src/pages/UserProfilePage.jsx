import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userAPI } from '../api';

export function UserProfilePage() {
    const navigate = useNavigate();
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadUser = async () => {
            try {
                setError('');
                setIsLoading(true);
                const data = await userAPI.getById(userId);
                setUser(data.user);
            } catch (err) {
                setError(err.message || 'Failed to load user profile.');
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, [userId]);

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
                    {error}
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/search')}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                    Back to Search
                </button>
            </div>
        );
    }

    const memberSinceDate = user.createdAt || user.memberSince;

    return (
        <div className="w-full rounded-3xl border border-indigo-100 bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fuchsia-500">User Profile</p>
                    <h2 className="mt-2 text-3xl font-black text-slate-800">{user.name}</h2>
                    <p className="mt-2 text-slate-600">Viewing the selected user profile from search results.</p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/search')}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                    Back to Search
                </button>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-6">
                <div className="space-y-4">
                    <div className="border-b border-indigo-200 pb-4">
                        <p className="text-sm font-semibold text-indigo-600">Name</p>
                        <p className="mt-1 text-lg font-bold text-slate-800">{user.name}</p>
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
                        <p className="mt-1 text-lg font-bold text-slate-800">{user.country || 'Not provided'}</p>
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
