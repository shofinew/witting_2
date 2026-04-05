import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

export function ProfilePage({ currentUser, onUserUpdate, onLogout, archivedEvents = [], archiveLoading = false, archiveError = '' }) {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        phone: '',
        country: '',
        dateOfBirth: '',
        specialistAt: '',
        profession: '',
        chamber: '',
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');

    useEffect(() => {
        if (currentUser) {
            setFormData({
                phone: currentUser.phone || '',
                country: currentUser.country || '',
                dateOfBirth: currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth).toISOString().split('T')[0] : '',
                specialistAt: currentUser.specialistAt || '',
                profession: currentUser.profession || '',
                chamber: currentUser.chamber || '',
            });
        }
    }, [currentUser]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdate = async () => {
        setIsUpdating(true);
        setUpdateError('');
        setUpdateSuccess('');

        try {
            const updates = {};
            Object.keys(formData).forEach(key => {
                if (formData[key] !== '') {
                    updates[key] = key === 'dateOfBirth' ? new Date(formData[key]) : formData[key];
                }
            });

            const response = await authAPI.updateProfile(currentUser._id, updates);
            setUpdateSuccess('Profile updated successfully!');
            onUserUpdate(response.user);
            setIsEditing(false);
        } catch (error) {
            setUpdateError(error.message || 'Failed to update profile.');
        } finally {
            setIsUpdating(false);
        }
    };

    const memberSinceDate = currentUser.createdAt || currentUser.memberSince;

    return (
        <div className="w-full bg-white/95 p-8 rounded-3xl shadow-2xl border border-indigo-100 backdrop-blur-sm">
            <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fuchsia-500">Profile</p>
                <h2 className="mt-2 text-3xl font-black text-slate-800">{currentUser.name}</h2>
                <p className="mt-2 text-slate-600">Your account details are shown here. You can update your profile information below.</p>
            </div>

            {updateError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-100 px-3 py-2 text-sm text-red-900">
                    {updateError}
                </div>
            )}
            {updateSuccess && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-100 px-3 py-2 text-sm text-green-900">
                    {updateSuccess}
                </div>
            )}

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-indigo-600">Profile Information</h3>
                        <button
                            type="button"
                            onClick={() => setIsEditing(!isEditing)}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                        >
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div className="pb-4 border-b border-indigo-200">
                            <p className="text-sm font-semibold text-indigo-600">Name</p>
                            <p className="mt-1 text-lg font-bold text-slate-800">{currentUser.name}</p>
                        </div>
                        <div className="py-4 border-b border-indigo-200">
                            <p className="text-sm font-semibold text-indigo-600">Email</p>
                            <p className="mt-1 text-lg font-bold text-slate-800">{currentUser.email}</p>
                        </div>
                        <div className="py-4 border-b border-indigo-200">
                            <label className="block text-sm font-semibold text-indigo-600">Phone</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full rounded-xl border border-indigo-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    placeholder="Enter your phone number"
                                />
                            ) : (
                                <p className="mt-1 text-lg font-bold text-slate-800">{currentUser.phone || 'Not provided'}</p>
                            )}
                        </div>
                        <div className="py-4 border-b border-indigo-200">
                            <label className="block text-sm font-semibold text-indigo-600">Country</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full rounded-xl border border-indigo-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    placeholder="Enter your country"
                                />
                            ) : (
                                <p className="mt-1 text-lg font-bold text-slate-800">{currentUser.country || 'Not provided'}</p>
                            )}
                        </div>
                        <div className="py-4 border-b border-indigo-200">
                            <label className="block text-sm font-semibold text-indigo-600">Date of Birth</label>
                            {isEditing ? (
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full rounded-xl border border-indigo-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                />
                            ) : (
                                <p className="mt-1 text-lg font-bold text-slate-800">
                                    {currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth).toLocaleDateString() : 'Not provided'}
                                </p>
                            )}
                        </div>
                        <div className="py-4 border-b border-indigo-200">
                            <label className="block text-sm font-semibold text-indigo-600">Specialist At</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="specialistAt"
                                    value={formData.specialistAt}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full rounded-xl border border-indigo-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    placeholder="Enter your specialization"
                                />
                            ) : (
                                <p className="mt-1 text-lg font-bold text-slate-800">{currentUser.specialistAt || 'Not provided'}</p>
                            )}
                        </div>
                        <div className="py-4 border-b border-indigo-200">
                            <label className="block text-sm font-semibold text-indigo-600">Profession</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="profession"
                                    value={formData.profession}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full rounded-xl border border-indigo-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    placeholder="Enter your profession"
                                />
                            ) : (
                                <p className="mt-1 text-lg font-bold text-slate-800">{currentUser.profession || 'Not provided'}</p>
                            )}
                        </div>
                        <div className="py-4 border-b border-indigo-200">
                            <label className="block text-sm font-semibold text-indigo-600">Chamber</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="chamber"
                                    value={formData.chamber}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full rounded-xl border border-indigo-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    placeholder="Enter your chamber"
                                />
                            ) : (
                                <p className="mt-1 text-lg font-bold text-slate-800">{currentUser.chamber || 'Not provided'}</p>
                            )}
                        </div>
                        <div className="pt-4">
                            <p className="text-sm font-semibold text-indigo-600">Member Since</p>
                            <p className="mt-1 text-lg font-bold text-slate-800">
                                {memberSinceDate
                                    ? new Date(memberSinceDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })
                                    : 'Not available'}
                            </p>
                        </div>
                    </div>
                    {isEditing && (
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={handleUpdate}
                                disabled={isUpdating}
                                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isUpdating ? 'Updating...' : 'Update Profile'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Event Archive</h3>
                        <p className="mt-1 text-sm text-slate-500">Archived events connected to your account appear here.</p>
                    </div>

                    {archiveLoading && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            Loading archived events...
                        </div>
                    )}

                    {!archiveLoading && archiveError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {archiveError}
                        </div>
                    )}

                    {!archiveLoading && !archiveError && archivedEvents.length === 0 && (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                            No archived events found.
                        </div>
                    )}

                    {!archiveLoading && !archiveError && archivedEvents.length > 0 && (
                        <div className="space-y-4">
                            {archivedEvents.map((event) => (
                                <div key={event._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-slate-700">
                                            Archived
                                        </span>
                                        <span className="text-xs font-medium text-slate-500">
                                            {event.createdAt ? `Created ${new Date(event.createdAt).toLocaleString()}` : 'Archived event'}
                                        </span>
                                    </div>
                                    <p className="mt-3 text-base font-semibold text-slate-800">{event.description}</p>
                                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                                        <p>Date: {event.date ? new Date(event.date).toLocaleDateString() : 'Not available'}</p>
                                        <p>Duration: {event.timeDuration ? `${event.timeDuration} minutes` : 'Not available'}</p>
                                        <p>Creator: {event.creator?.name || 'Unknown user'}</p>
                                        <p>Target: {event.target?.name || 'Unknown user'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 gap-4">
                <button
                    type="button"
                    onClick={() => navigate('/feedback')}
                    className="text-sm font-semibold text-indigo-700 transition hover:text-fuchsia-600"
                >
                    Feedback
                </button>
                <br />
                <button
                    type="button"
                    onClick={onLogout}
                    className="text-sm font-semibold text-slate-700 transition hover:text-red-600"
                >
                    {currentUser.name} (Logout)
                </button>
            </div>
        </div>
    );
}
