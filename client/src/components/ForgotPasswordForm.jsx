import React, { useState } from 'react';

export function ForgotPasswordForm({
    forgotEmail,
    setForgotEmail,
    resetOtp,
    setResetOtp,
    resetPassword,
    setResetPassword,
    resetPasswordConfirm,
    setResetPasswordConfirm,
    isSubmitting,
    onRequestOtp,
    onResetPassword,
    onBackToLogin,
    otpPreview,
    hasRequestedOtp,
    otpExpiresAt,
}) {
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [showResetPasswordConfirm, setShowResetPasswordConfirm] = useState(false);

    const otpExpiryLabel = otpExpiresAt
        ? new Date(otpExpiresAt).toLocaleString()
        : '';

    return (
        <div className="space-y-3">
            <form onSubmit={onRequestOtp} className="space-y-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3">
                <div>
                    <h3 className="text-base font-bold text-slate-800">Request reset OTP</h3>
                    <p className="mt-0.5 text-xs text-slate-600">Enter your email to generate a one-time password. The OTP stays valid for 20 minutes.</p>
                </div>
                <div>
                    <label className="block mb-0.5 text-xs font-semibold text-indigo-700">Email address</label>
                    <input
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full rounded-lg border border-indigo-200 px-3 py-2 text-sm shadow-sm transition focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        type="email"
                        placeholder="you@example.com"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 py-2 text-sm font-bold text-white shadow-md transition duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
                >
                    {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
                </button>
            </form>

            <form onSubmit={onResetPassword} className="space-y-2.5 rounded-xl border border-indigo-200 bg-white p-3 shadow-sm">
                <div>
                    <h3 className="text-base font-bold text-slate-800">Reset password</h3>
                    <p className="mt-0.5 text-xs text-slate-600">Use the OTP and choose a new password. Resetting your password logs out every device.</p>
                </div>
                {!hasRequestedOtp && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        Request an OTP first, then enter it here to reset your password.
                    </div>
                )}
                {hasRequestedOtp && otpExpiryLabel && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                        OTP requested successfully. It expires at {otpExpiryLabel}.
                    </div>
                )}
                <div>
                    <label className="block mb-0.5 text-xs font-semibold text-indigo-700">OTP code</label>
                    <input
                        value={resetOtp}
                        onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full rounded-lg border border-indigo-200 px-3 py-2 text-sm shadow-sm transition focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        type="text"
                        inputMode="numeric"
                        placeholder="6-digit OTP"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-0.5 text-xs font-semibold text-indigo-700">New password</label>
                    <div className="relative">
                        <input
                            value={resetPassword}
                            onChange={(e) => setResetPassword(e.target.value)}
                            className="w-full rounded-lg border border-indigo-200 px-3 py-2 pr-10 text-sm shadow-sm transition focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                            type={showResetPassword ? 'text' : 'password'}
                            placeholder="At least 8 characters"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowResetPassword((visible) => !visible)}
                            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-500 transition hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-400"
                            aria-label={showResetPassword ? 'Hide new password' : 'Show new password'}
                            title={showResetPassword ? 'Hide new password' : 'Show new password'}
                        >
                            <PasswordVisibilityIcon visible={showResetPassword} />
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block mb-0.5 text-xs font-semibold text-indigo-700">Confirm new password</label>
                    <div className="relative">
                        <input
                            value={resetPasswordConfirm}
                            onChange={(e) => setResetPasswordConfirm(e.target.value)}
                            className="w-full rounded-lg border border-indigo-200 px-3 py-2 pr-10 text-sm shadow-sm transition focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                            type={showResetPasswordConfirm ? 'text' : 'password'}
                            placeholder="Repeat new password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowResetPasswordConfirm((visible) => !visible)}
                            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-500 transition hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-400"
                            aria-label={showResetPasswordConfirm ? 'Hide confirmed password' : 'Show confirmed password'}
                            title={showResetPasswordConfirm ? 'Hide confirmed password' : 'Show confirmed password'}
                        >
                            <PasswordVisibilityIcon visible={showResetPasswordConfirm} />
                        </button>
                    </div>
                </div>
                {otpPreview && (
                    <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
                        Development OTP: <span className="font-bold">{otpPreview}</span>
                    </div>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting || !hasRequestedOtp}
                    className="w-full rounded-lg bg-gradient-to-r from-fuchsia-500 via-indigo-600 to-cyan-500 py-2 text-sm font-bold text-white shadow-md transition duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
                >
                    {isSubmitting ? 'Resetting password...' : 'Reset Password'}
                </button>
                <button
                    type="button"
                    onClick={onBackToLogin}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    Back to Login
                </button>
            </form>
        </div>
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
