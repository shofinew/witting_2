import React from 'react';

export function ProfilePage({ currentUser }) {
    return (
        <div className="w-full bg-white/95 p-8 rounded-3xl shadow-2xl border border-indigo-100 backdrop-blur-sm">
            <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fuchsia-500">Profile</p>
                <h2 className="mt-2 text-3xl font-black text-slate-800">{currentUser.name}</h2>
                <p className="mt-2 text-slate-600">Your account details are shown here for quick reference.</p>
            </div>

            <div className="mt-8">
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-6">
                    <h3 className="text-lg font-semibold text-indigo-600 mb-4">Account Information</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-indigo-600">Name</p>
                            <p className="mt-1 text-lg font-bold text-slate-800">{currentUser.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-indigo-600">Email</p>
                            <p className="mt-1 text-lg font-bold text-slate-800">{currentUser.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-indigo-600">Member Since</p>
                            <p className="mt-1 text-lg font-bold text-slate-800">
                                {new Date(currentUser.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
