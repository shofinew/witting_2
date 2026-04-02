import React from 'react';

export function LoginForm({ loginEmail, setLoginEmail, loginPassword, setLoginPassword, isSubmitting, onSubmit }) {
    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <div>
                <label className="block mb-2 text-sm font-semibold text-indigo-700">Email address</label>
                <input
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-indigo-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
                    type="email"
                    placeholder="you@example.com"
                    required
                />
            </div>
            <div>
                <label className="block mb-2 text-sm font-semibold text-indigo-700">Password</label>
                <input
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-indigo-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-fuchsia-400 transition"
                    type="password"
                    placeholder="Your password"
                    required
                />
            </div>
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-fuchsia-500 via-indigo-600 to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transform transition duration-200 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
            >
                {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
}
