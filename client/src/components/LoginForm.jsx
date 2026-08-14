import React, { useState } from 'react';

export function LoginForm({
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    isSubmitting,
    onSubmit,
    onForgotPassword,
    onCreateAccount,
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form onSubmit={onSubmit} className="space-y-2.5">
            <div>
                <label className="block mb-0.5 text-xs font-semibold text-indigo-700">Email address</label>
                <input
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
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
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-10 text-sm border border-indigo-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-fuchsia-400 transition"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Your password"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((visible) => !visible)}
                        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-500 transition hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-400"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        title={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-3.42M9.88 5.09A10.94 10.94 0 0112 4.75c5 0 8.27 4.5 9.25 6.25a11.77 11.77 0 01-2.16 2.78M6.61 6.61C4.83 7.7 3.6 9.36 2.75 11c.98 1.75 4.25 6.25 9.25 6.25 1.25 0 2.4-.25 3.42-.68" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.75 12s3.25-6.25 9.25-6.25S21.25 12 21.25 12 18 18.25 12 18.25 2.75 12 2.75 12z" />
                                <circle cx="12" cy="12" r="2.75" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-xs font-semibold text-indigo-700 transition hover:text-fuchsia-600"
                >
                    Forgot password?
                </button>
            </div>
            <div className="flex items-center justify-center text-xs text-slate-600">
                <span>Need an account?</span>
                <button
                    type="button"
                    onClick={onCreateAccount}
                    className="ml-1 font-semibold text-indigo-700 transition hover:text-fuchsia-600"
                >
                    Register
                </button>
            </div>
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 text-sm bg-emerald-600 text-white font-bold rounded-lg shadow-md transition duration-200 hover:bg-emerald-700 hover:scale-[1.02] transform disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
            >
                {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
}
