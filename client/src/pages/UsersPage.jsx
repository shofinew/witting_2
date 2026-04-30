import React from 'react';
import { getUserUniqueId } from '../utils/user';

export function UsersPage({ users, isLoading, error, onRefresh }) {
    return (
        <div className="w-full bg-white/95 p-8 rounded-3xl shadow-2xl border border-indigo-100 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">All Users</h2>
                    <p className="text-gray-600 mt-1">Showing registered users data</p>
                </div>
                <button
                    type="button"
                    onClick={onRefresh}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                >
                    Refresh
                </button>
            </div>

            {error && <div className="mb-4 p-3 text-sm text-red-900 bg-red-100/90 rounded-xl border border-red-200 shadow-sm">{error}</div>}

            {isLoading ? (
                <p className="text-indigo-700 font-medium">Loading users...</p>
            ) : users.length === 0 ? (
                <p className="text-gray-600">No users found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-indigo-50 text-indigo-700">
                                <th className="p-3 font-semibold rounded-l-xl">Name</th>
                                <th className="p-3 font-semibold">Unique ID</th>
                                <th className="p-3 font-semibold">Email</th>
                                <th className="p-3 font-semibold">Created</th>
                                <th className="p-3 font-semibold rounded-r-xl">Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id} className="border-b border-indigo-100">
                                    <td className="p-3 text-gray-800">{user.name}</td>
                                    <td className="p-3 text-gray-700" dir="ltr">{getUserUniqueId(user)}</td>
                                    <td className="p-3 text-gray-700">{user.email}</td>
                                    <td className="p-3 text-gray-700">{new Date(user.createdAt).toLocaleString()}</td>
                                    <td className="p-3 text-gray-700">{new Date(user.updatedAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
