import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { COUNTRY_OPTIONS, getCountryLabel } from '../utils/countries';
import { getUserUniqueId } from '../utils/user';
import { ProfileTabs } from '../components/ProfileTabs';
import { ProfileHeader } from '../components/ProfileHeader';

export function ProfilePage({
    currentUser,
    onUserUpdate,
    onLogout,
}) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        phone: '',
        country: '',
        dateOfBirth: '',
        gender: '',
        specialistAt: '',
        profession: '',
        chamber: '',
        designation: '',
        achievement: '',
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
                gender: currentUser.gender || '',
                specialistAt: currentUser.specialistAt || '',
                profession: currentUser.profession || '',
                chamber: currentUser.chamber || '',
                designation: currentUser.designation || '',
                achievement: currentUser.achievement || '',
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

    const validateDateOfBirth = (dateOfBirthStr) => {
        if (!dateOfBirthStr) {
            return { valid: true };
        }

        const birthDate = new Date(dateOfBirthStr);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 16) {
            return { valid: false, message: 'You must be at least 16 years old.' };
        }

        return { valid: true };
    };

    const handleUpdate = async () => {
        setIsUpdating(true);
        setUpdateError('');
        setUpdateSuccess('');

        try {
            if (formData.dateOfBirth) {
                const dateValidation = validateDateOfBirth(formData.dateOfBirth);
                if (!dateValidation.valid) {
                    setUpdateError(dateValidation.message);
                    setIsUpdating(false);
                    return;
                }
            }

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
    const formatEventTimestamp = (value) => (value ? new Date(value).toLocaleString() : null);
    const uniqueIdLabel = getUserUniqueId(currentUser);

    return (
        <div className="w-full rounded-3xl border border-indigo-100 bg-white/95 p-4 shadow-2xl backdrop-blur-sm sm:p-6">
            <ProfileHeader currentUser={currentUser} />

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

            {currentUser.isPaused && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    This account is paused. Profile actions are currently disabled.
                </div>
            )}

            <div className="mt-5">
                <ProfileTabs currentUser={currentUser} activeTab={activeTab} />

                {activeTab === 'profile' && (
                    <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-fuchsia-500">Profile Information</p>
                                <p className="mt-1 text-sm text-slate-500">Review or update your personal details.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditing(!isEditing)}
                                disabled={currentUser.isPaused}
                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                    isEditing
                                        ? 'bg-slate-900 text-white hover:bg-slate-800'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }`}
                            >
                                {isEditing ? 'Done editing' : 'Edit profile'}
                            </button>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-3">
                                <p className="text-sm font-semibold text-indigo-500">Identity</p>
                                <div className="mt-2 space-y-2">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Name</p>
                                        <p className="mt-1 text-base font-bold text-slate-900">{currentUser.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Unique ID</p>
                                        <p className="mt-1 text-base font-bold text-slate-900" dir="ltr">{uniqueIdLabel}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Email</p>
                                        <p className="mt-1 text-base font-bold text-slate-900 break-all">{currentUser.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                    <p className="text-sm font-medium text-slate-500">Followers</p>
                                    <p className="mt-2 text-3xl font-black text-slate-900">{currentUser.totalFollowers || 0}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                    <p className="text-sm font-medium text-slate-500">Followee</p>
                                    <p className="mt-2 text-3xl font-black text-slate-900">{currentUser.totalFollowee || 0}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                                    <p className="text-sm font-medium text-slate-500">Member Since</p>
                                    <p className="mt-2 text-base font-semibold text-slate-800">
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

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                                <label className="block text-sm font-medium text-slate-500">Designation</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleInputChange}
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                        placeholder="Enter your designation"
                                    />
                                ) : (
                                    <p className="mt-2 text-sm font-semibold text-slate-900">{currentUser.designation || 'Not provided'}</p>
                                )}
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                                <label className="block text-sm font-medium text-slate-500">Achievement</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="achievement"
                                        value={formData.achievement}
                                        onChange={handleInputChange}
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                        placeholder="Enter your achievement"
                                    />
                                ) : (
                                    <p className="mt-2 text-sm font-semibold text-slate-900">{currentUser.achievement || 'Not provided'}</p>
                                )}
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                                <label className="block text-sm font-medium text-slate-500">Phone</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                        placeholder="Enter your phone number"
                                    />
                                ) : (
                                    <p className="mt-2 text-sm font-semibold text-slate-900">{currentUser.phone || 'Not provided'}</p>
                                )}
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                                <label className="block text-sm font-medium text-slate-500">Country</label>
                                {isEditing ? (
                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    >
                                        <option value="">Select country</option>
                                        {COUNTRY_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="mt-2 text-sm font-semibold text-slate-900">{getCountryLabel(currentUser.country)}</p>
                                )}
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                                <label className="block text-sm font-medium text-slate-500">Date of Birth</label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    />
                                ) : (
                                    <p className="mt-2 text-sm font-semibold text-slate-900">
                                        {currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth).toLocaleDateString() : 'Not provided'}
                                    </p>
                                )}
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                                <label className="block text-sm font-medium text-slate-500">Gender</label>
                                {isEditing ? (
                                    <div className="mt-3 flex flex-wrap gap-3">
                                        {[
                                            { value: 'male', label: 'Male' },
                                            { value: 'female', label: 'Female' },
                                            { value: 'others', label: 'Others' },
                                        ].map((option) => (
                                            <label key={option.value} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value={option.value}
                                                    checked={formData.gender === option.value}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 border-indigo-300 text-indigo-600 focus:ring-indigo-400"
                                                />
                                                <span>{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-2 text-sm font-semibold capitalize text-slate-900">{currentUser.gender || 'Not provided'}</p>
                                )}
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                                <label className="block text-sm font-medium text-slate-500">Specialist At</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="specialistAt"
                                        value={formData.specialistAt}
                                        onChange={handleInputChange}
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                        placeholder="Enter your specialization"
                                    />
                                ) : (
                                    <p className="mt-2 text-sm font-semibold text-slate-900">{currentUser.specialistAt || 'Not provided'}</p>
                                )}
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                                <label className="block text-sm font-medium text-slate-500">Profession</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="profession"
                                        value={formData.profession}
                                        onChange={handleInputChange}
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                        placeholder="Enter your profession"
                                    />
                                ) : (
                                    <p className="mt-2 text-sm font-semibold text-slate-900">{currentUser.profession || 'Not provided'}</p>
                                )}
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-500">Chamber</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="chamber"
                                        value={formData.chamber}
                                        onChange={handleInputChange}
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                        placeholder="Enter your chamber"
                                    />
                                ) : (
                                    <p className="mt-2 text-sm font-semibold text-slate-900">{currentUser.chamber || 'Not provided'}</p>
                                )}
                            </div>
                        </div>

                        {isEditing && (
                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleUpdate}
                                    disabled={isUpdating}
                                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isUpdating ? 'Updating...' : 'Save changes'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'archive' && (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
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
                            {archivedEvents.map((event) => {
                                const createdLabel = formatEventTimestamp(event.eventCreatedAt || event.createdAt);
                                const archivedLabel = formatEventTimestamp(event.archivedAt);

                                return (
                                <div key={event._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                                            Archived
                                        </span>
                                        <div className="text-xs text-slate-500">
                                            <div>{createdLabel ? `Created ${createdLabel}` : 'Created date not available'}</div>
                                            <div>{archivedLabel ? `Archived ${archivedLabel}` : 'Archived date not available'}</div>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-base font-semibold text-slate-800">{event.description}</p>
                                    {event.message && (
                                        <div className="mt-3 rounded-xl border border-indigo-100 bg-white p-3 text-sm text-slate-700">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <p className="text-xs font-bold text-indigo-500">Message</p>
                                                {event.messageAuthor?.name && (
                                                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                                        By {event.messageAuthor.name}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1 whitespace-pre-wrap font-medium">{event.message}</p>
                                        </div>
                                    )}
                                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                                        <p>Date: {event.date ? new Date(event.date).toLocaleDateString() : 'Not available'}</p>
                                        <p>Duration: {event.timeDuration ? `${event.timeDuration} minutes` : 'Not available'}</p>
                                        <p>Creator: {event.creator?.name || 'Unknown user'}</p>
                                        <p>Target: {event.target?.name || 'Unknown user'}</p>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    )}
                    </div>
                )}

                {activeTab === 'expired' && (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-slate-800">Expired Events</h3>
                            <p className="mt-1 text-sm text-slate-500">Events whose timers have finished appear here.</p>
                        </div>

                        {expiredLoading && (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                Loading expired events...
                            </div>
                        )}

                        {!expiredLoading && expiredError && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {expiredError}
                            </div>
                        )}

                        {!expiredLoading && !expiredError && expiredEvents.length === 0 && (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                                No expired events found.
                            </div>
                        )}

                        {!expiredLoading && !expiredError && expiredEvents.length > 0 && (
                            <div className="space-y-4">
                                {expiredEvents.map((event) => {
                                    const createdLabel = formatEventTimestamp(event.createdAt);
                                    const expiredLabel = formatEventTimestamp(event.date);

                                    return (
                                        <div key={event._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                                                    {event.status || 'Expired'}
                                                </span>
                                                <div className="text-xs text-slate-500">
                                                    <div>{createdLabel ? `Created ${createdLabel}` : 'Created date not available'}</div>
                                                    <div>{expiredLabel ? `Expired ${expiredLabel}` : 'Expired date not available'}</div>
                                                </div>
                                            </div>
                                            <p className="mt-3 text-base font-semibold text-slate-800">{event.description}</p>
                                            {event.message && (
                                                <div className="mt-3 rounded-xl border border-indigo-100 bg-white p-3 text-sm text-slate-700">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <p className="text-xs font-bold text-indigo-500">Message</p>
                                                        {event.messageAuthor?.name && (
                                                            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                                                By {event.messageAuthor.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 whitespace-pre-wrap font-medium">{event.message}</p>
                                                </div>
                                            )}
                                            <div className="mt-3 space-y-1 text-sm text-slate-600">
                                                <p>Date: {event.date ? new Date(event.date).toLocaleDateString() : 'Not available'}</p>
                                                <p>Duration: {event.timeDuration ? `${event.timeDuration} minutes` : 'Not available'}</p>
                                                <p>Creator: {event.creator?.name || 'Unknown user'}</p>
                                                <p>Target: {event.target?.name || 'Unknown user'}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

            </div>

            <div className="mt-8 flex flex-col items-start gap-3">
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
    );
}
