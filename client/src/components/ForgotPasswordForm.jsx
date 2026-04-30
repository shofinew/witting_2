import React from 'react';

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
    const otpExpiryLabel = otpExpiresAt
        ? new Date(otpExpiresAt).toLocaleString()
        : '';

    return (
        <div className="space-y-4">
            <form onSubmit={onRequestOtp} className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Request reset OTP</h3>
                    <p className="mt-1 text-sm text-slate-600">Enter your email to generate a one-time password. The OTP stays valid for 20 minutes.</p>
                </div>
                <div>
                    <label className="block mb-1 text-sm font-semibold text-indigo-700">Email address</label>
                    <input
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full rounded-xl border border-indigo-200 px-4 py-2.5 shadow-sm transition focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        type="email"
                        placeholder="you@example.com"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 py-2.5 font-bold text-white shadow-lg transition duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
                >
                    {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
                </button>
            </form>

            <form onSubmit={onResetPassword} className="space-y-3 rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Reset password</h3>
                    <p className="mt-1 text-sm text-slate-600">Use the OTP and choose a new password. Resetting your password logs out every device.</p>
                </div>
                {!hasRequestedOtp && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
                        Request an OTP first, then enter it here to reset your password.
                    </div>
                )}
                {hasRequestedOtp && otpExpiryLabel && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
                        OTP requested successfully. It expires at {otpExpiryLabel}.
                    </div>
                )}
                <div>
                    <label className="block mb-1 text-sm font-semibold text-indigo-700">OTP code</label>
                    <input
                        value={resetOtp}
                        onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full rounded-xl border border-indigo-200 px-4 py-2.5 shadow-sm transition focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        type="text"
                        inputMode="numeric"
                        placeholder="6-digit OTP"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 text-sm font-semibold text-indigo-700">New password</label>
                    <input
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                        className="w-full rounded-xl border border-indigo-200 px-4 py-2.5 shadow-sm transition focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                        type="password"
                        placeholder="At least 8 characters"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 text-sm font-semibold text-indigo-700">Confirm new password</label>
                    <input
                        value={resetPasswordConfirm}
                        onChange={(e) => setResetPasswordConfirm(e.target.value)}
                        className="w-full rounded-xl border border-indigo-200 px-4 py-2.5 shadow-sm transition focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                        type="password"
                        placeholder="Repeat new password"
                        required
                    />
                </div>
                {otpPreview && (
                    <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm text-sky-800">
                        Development OTP: <span className="font-bold">{otpPreview}</span>
                    </div>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting || !hasRequestedOtp}
                    className="w-full rounded-xl bg-gradient-to-r from-fuchsia-500 via-indigo-600 to-cyan-500 py-2.5 font-bold text-white shadow-lg transition duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
                >
                    {isSubmitting ? 'Resetting password...' : 'Reset Password'}
                </button>
                <button
                    type="button"
                    onClick={onBackToLogin}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    Back to Login
                </button>
            </form>
        </div>
    );
}
