import React from 'react';

export function SearchPage({
    searchTerm,
    setSearchTerm,
    filteredUsers,
    isLoading,
    error,
    onRefresh,
    onAddEvent,
}) {
    return (
        <div className="w-full bg-white/95 p-8 rounded-3xl shadow-2xl border border-indigo-100 backdrop-blur-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">Search Users</h2>
                    <p className="text-gray-600 mt-1">Find users by name or email and create events from the popup.</p>
                </div>
                <button
                    type="button"
                    onClick={onRefresh}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                >
                    Refresh
                </button>
            </div>

            <div className="mb-5">
                <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-indigo-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    type="text"
                    placeholder="Search by name or email..."
                />
            </div>

            {error && <div className="mb-4 p-3 text-sm text-red-900 bg-red-100/90 rounded-xl border border-red-200 shadow-sm">{error}</div>}

            {isLoading ? (
                <p className="text-indigo-700 font-medium">Loading users...</p>
            ) : filteredUsers.length === 0 ? (
                <p className="text-gray-600">No matching users found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-indigo-50 text-indigo-700">
                                <th className="p-3 font-semibold rounded-l-xl">Name</th>
                                <th className="p-3 font-semibold">Email</th>
                                <th className="p-3 font-semibold rounded-r-xl">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="border-b border-indigo-100">
                                    <td className="p-3 text-gray-800">{user.name}</td>
                                    <td className="p-3 text-gray-700">{user.email}</td>
                                    <td className="p-3">
                                        <button
                                            type="button"
                                            onClick={() => onAddEvent(user)}
                                            className="px-3 py-2 rounded-lg bg-fuchsia-600 text-white text-sm font-semibold hover:bg-fuchsia-700 transition"
                                        >
                                            Add Event
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
