import React from 'react';

export function ProfilePage({ currentUser }) {
    return (
        <div className="w-full bg-white/95 p-8 rounded-3xl shadow-2xl border border-indigo-100 backdrop-blur-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fuchsia-500">Profile</p>
                    <h2 className="mt-2 text-3xl font-black text-slate-800">{currentUser.name}</h2>
                    <p className="mt-2 text-slate-600">Your account details are shown here for quick reference.</p>
                </div>
                <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-800 px-5 py-4 text-white shadow-xl">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/70">Signed In</p>
                    <p className="mt-2 text-lg font-bold">{currentUser.email}</p>
                </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
                    <p className="text-sm font-semibold text-indigo-600">Name</p>
                    <p className="mt-2 text-lg font-bold text-slate-800">{currentUser.name}</p>
                </div>
                <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-5">
                    <p className="text-sm font-semibold text-cyan-700">Email</p>
                    <p className="mt-2 text-lg font-bold text-slate-800">{currentUser.email}</p>
                </div>
            </div>
        </div>
    );
}
