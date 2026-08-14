import React from 'react';

export function SearchPage({
    currentUserId,
    searchInput,
    setSearchInput,
    searchedUniqueId,
    onSearch,
    filteredUsers,
    isLoading,
    error,
    onRefresh,
    onViewProfile,
    onAddEvent,
}) {
    return (
        <div className="w-full bg-white/95 p-8 rounded-3xl shadow-2xl border border-indigo-100 backdrop-blur-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">Search Users</h2>
                    <p className="text-gray-600 mt-1">Find users by unique ID and create events from the popup.</p>
                </div>
                <button
                    type="button"
                    onClick={onRefresh}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                >
                    Refresh
                </button>
            </div>

            <form
                className="mb-5 flex flex-col gap-3 sm:flex-row"
                onSubmit={(event) => {
                    event.preventDefault();
                    onSearch();
                }}
            >
                <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full flex-1 rounded-xl border border-indigo-200 px-4 py-3 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    type="text"
                    placeholder="Search by unique ID..."
                />
                <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
                >
                    Search
                </button>
            </form>

            {error && <div className="mb-4 p-3 text-sm text-red-900 bg-red-100/90 rounded-xl border border-red-200 shadow-sm">{error}</div>}

            {isLoading ? (
                <p className="text-indigo-700 font-medium">Loading users...</p>
            ) : !searchedUniqueId.trim() ? (
                <p className="text-gray-600">Enter a unique ID to search for users.</p>
            ) : filteredUsers.length === 0 ? (
                <p className="text-gray-600">No matching users found.</p>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-indigo-100">
                    <table className="w-full min-w-[560px] text-left border-collapse">
                        <thead>
                            <tr className="bg-indigo-50 text-indigo-700">
                                <th className="p-3 font-semibold">Name</th>
                                <th className="p-3 font-semibold">Profession</th>
                                <th className="p-3 font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => {
                                const isSameUser = currentUserId === user._id;

                                return (
                                    <tr key={user._id} className="border-b border-indigo-100 last:border-b-0">
                                    <td className="p-3 font-semibold text-gray-800">{user.name}</td>
                                    <td className="p-3 text-gray-700">{user.profession || 'Not provided'}</td>
                                    <td className="p-3">
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onViewProfile(user)}
                                                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                                            >
                                                View Profile
                                            </button>
                                            <button
                                                type="button"
                                                disabled={isSameUser}
                                                onClick={() => onAddEvent(user)}
                                                className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
                                                title={isSameUser ? 'You cannot create an event for yourself.' : 'Create event'}
                                            >
                                                Create Event
                                            </button>
                                        </div>
                                    </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
