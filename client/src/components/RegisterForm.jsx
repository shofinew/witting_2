import React from 'react';

export function RegisterForm({
    registerName,
    setRegisterName,
    registerEmail,
    setRegisterEmail,
    registerPassword,
    setRegisterPassword,
    registerPasswordConfirm,
    setRegisterPasswordConfirm,
    isSubmitting,
    onSubmit,
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-3">
            <div>
                <label className="block mb-1 text-sm font-semibold text-indigo-700">Full name</label>
                <input
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-indigo-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-fuchsia-400 transition"
                    type="text"
                    placeholder="Jane Doe"
                    required
                />
            </div>
            <div>
                <label className="block mb-1 text-sm font-semibold text-indigo-700">Email address</label>
                <input
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-indigo-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
                    type="email"
                    placeholder="you@example.com"
                    required
                />
            </div>
            <div>
                <label className="block mb-1 text-sm font-semibold text-indigo-700">Password</label>
                <input
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-indigo-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-fuchsia-400 transition"
                    type="password"
                    placeholder="At least 8 characters"
                    required
                />
            </div>
            <div>
                <label className="block mb-1 text-sm font-semibold text-indigo-700">Confirm password</label>
                <input
                    value={registerPasswordConfirm}
                    onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                    className="w-full px-4 py-2.5 border border-indigo-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
                    type="password"
                    placeholder="Re-enter password"
                    required
                />
            </div>
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-gradient-to-r from-fuchsia-500 via-indigo-600 to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transform transition duration-200 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
            >
                {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
        </form>
    );
}
