import React, { useState } from 'react';

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
    onBackToLogin,
}) {
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showRegisterPasswordConfirm, setShowRegisterPasswordConfirm] = useState(false);

    return (
        <form onSubmit={onSubmit} className="space-y-2.5">
            <div>
                <label className="block mb-0.5 text-xs font-semibold text-indigo-700">Full name</label>
                <input
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-indigo-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-fuchsia-400 transition"
                    type="text"
                    placeholder="Your Name"
                    required
                />
            </div>
            <div>
                <label className="block mb-0.5 text-xs font-semibold text-indigo-700">Email address</label>
                <input
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-indigo-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
                    type="email"
                    placeholder="you@example.com"
                    required
                />
            </div>
            <div>
                <label className="block mb-0.5 text-xs font-semibold text-indigo-700">Password</label>
                <div className="relative">
                    <input
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-10 text-sm border border-indigo-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-fuchsia-400 transition"
                        type={showRegisterPassword ? 'text' : 'password'}
                        placeholder="At least 8 characters"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowRegisterPassword((visible) => !visible)}
                        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-500 transition hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-400"
                        aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                        title={showRegisterPassword ? 'Hide password' : 'Show password'}
                    >
                        <PasswordVisibilityIcon visible={showRegisterPassword} />
                    </button>
                </div>
            </div>
            <div>
                <label className="block mb-0.5 text-xs font-semibold text-indigo-700">Confirm password</label>
                <div className="relative">
                    <input
                        value={registerPasswordConfirm}
                        onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                        className="w-full px-3 py-2 pr-10 text-sm border border-indigo-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
                        type={showRegisterPasswordConfirm ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowRegisterPasswordConfirm((visible) => !visible)}
                        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-500 transition hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-400"
                        aria-label={showRegisterPasswordConfirm ? 'Hide confirmed password' : 'Show confirmed password'}
                        title={showRegisterPasswordConfirm ? 'Hide confirmed password' : 'Show confirmed password'}
                    >
                        <PasswordVisibilityIcon visible={showRegisterPasswordConfirm} />
                    </button>
                </div>
            </div>
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 text-sm bg-emerald-600 text-white font-bold rounded-lg shadow-md transition duration-200 hover:bg-emerald-700 hover:scale-[1.02] transform disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
            >
                {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
            <div className="flex items-center justify-center text-xs text-slate-600">
                <span>Already have an account?</span>
                <button
                    type="button"
                    onClick={onBackToLogin}
                    className="ml-1 font-semibold text-indigo-700 transition hover:text-fuchsia-600"
                >
                    Login
                </button>
            </div>
        </form>
    );
}

function PasswordVisibilityIcon({ visible }) {
    return visible ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-3.42M9.88 5.09A10.94 10.94 0 0112 4.75c5 0 8.27 4.5 9.25 6.25a11.77 11.77 0 01-2.16 2.78M6.61 6.61C4.83 7.7 3.6 9.36 2.75 11c.98 1.75 4.25 6.25 9.25 6.25 1.25 0 2.4-.25 3.42-.68" />
        </svg>
    ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.75 12s3.25-6.25 9.25-6.25S21.25 12 21.25 12 18 18.25 12 18.25 2.75 12 2.75 12z" />
            <circle cx="12" cy="12" r="2.75" />
        </svg>
    );
}
