import React from 'react';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';

export function AuthPage({
    authView,
    setAuthView,
    authError,
    authSuccess,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    forgotEmail,
    setForgotEmail,
    resetOtp,
    setResetOtp,
    resetPassword,
    setResetPassword,
    resetPasswordConfirm,
    setResetPasswordConfirm,
    otpPreview,
    hasRequestedOtp,
    otpExpiresAt,
    registerName,
    setRegisterName,
    registerEmail,
    setRegisterEmail,
    registerPassword,
    setRegisterPassword,
    registerPasswordConfirm,
    setRegisterPasswordConfirm,
    isSubmitting,
    onRegister,
    onLogin,
    onRequestPasswordReset,
    onResetPassword,
    onClearPasswordResetState,
    setAuthError,
    setAuthSuccess,
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-fuchsia-200 via-sky-100 to-cyan-100 p-4 sm:p-5">
            <div className="w-full max-w-md mx-auto bg-white/95 p-5 sm:p-6 rounded-3xl shadow-2xl border border-indigo-100 backdrop-blur-sm">
                <div className="mb-4 text-center">
                    <h1 className="text-3xl sm:text-4xl font-black text-primary">
                        Welcome to Witting
                    </h1>
                    <p className="text-gray-600 mt-1.5 text-sm sm:text-base">
                        {authView === 'login'
                            ? 'Login with your email and password'
                            : authView === 'forgotPassword'
                                ? 'Reset your password with a 20-minute OTP'
                                : 'Create a new account'}
                    </p>
                </div>

                <div className="flex items-center justify-center gap-2 mb-4">
                    <button
                        type="button"
                        onClick={() => {
                            setAuthView('login');
                            onClearPasswordResetState();
                            setAuthError('');
                            setAuthSuccess('');
                        }}
                        className={`px-3.5 py-1.5 rounded-xl font-semibold transition ${authView === 'login'
                            ? 'bg-white text-primary shadow-lg'
                            : 'bg-primary/10 text-primary hover:bg-primary/20'
                            }`}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setAuthView('register');
                            onClearPasswordResetState();
                            setAuthError('');
                            setAuthSuccess('');
                        }}
                        className={`px-3.5 py-1.5 rounded-xl font-semibold transition ${authView === 'register'
                            ? 'bg-white text-primary shadow-lg'
                            : 'bg-primary/10 text-primary hover:bg-primary/20'
                            }`}
                    >
                        Register
                    </button>
                </div>

                {authError && (
                    <div className="mb-3 p-2.5 text-sm text-red-900 bg-red-100/90 rounded-xl border border-red-200 shadow-sm">
                        {authError}
                    </div>
                )}
                {authSuccess && (
                    <div className="mb-3 p-2.5 text-sm text-green-900 bg-green-100/90 rounded-xl border border-green-200 shadow-sm">
                        {authSuccess}
                    </div>
                )}

                {authView === 'login' ? (
                    <LoginForm
                        loginEmail={loginEmail}
                        setLoginEmail={setLoginEmail}
                        loginPassword={loginPassword}
                        setLoginPassword={setLoginPassword}
                        isSubmitting={isSubmitting}
                        onSubmit={onLogin}
                        onForgotPassword={() => {
                            onClearPasswordResetState();
                            setForgotEmail(loginEmail);
                            setAuthView('forgotPassword');
                            setAuthError('');
                            setAuthSuccess('');
                        }}
                    />
                ) : authView === 'forgotPassword' ? (
                    <ForgotPasswordForm
                        forgotEmail={forgotEmail}
                        setForgotEmail={setForgotEmail}
                        resetOtp={resetOtp}
                        setResetOtp={setResetOtp}
                        resetPassword={resetPassword}
                        setResetPassword={setResetPassword}
                        resetPasswordConfirm={resetPasswordConfirm}
                        setResetPasswordConfirm={setResetPasswordConfirm}
                        isSubmitting={isSubmitting}
                        onRequestOtp={onRequestPasswordReset}
                        onResetPassword={onResetPassword}
                        onBackToLogin={() => {
                            setAuthView('login');
                            onClearPasswordResetState();
                            setAuthError('');
                        }}
                        otpPreview={otpPreview}
                        hasRequestedOtp={hasRequestedOtp}
                        otpExpiresAt={otpExpiresAt}
                    />
                ) : (
                    <RegisterForm
                        registerName={registerName}
                        setRegisterName={setRegisterName}
                        registerEmail={registerEmail}
                        setRegisterEmail={setRegisterEmail}
                        registerPassword={registerPassword}
                        setRegisterPassword={setRegisterPassword}
                        registerPasswordConfirm={registerPasswordConfirm}
                        setRegisterPasswordConfirm={setRegisterPasswordConfirm}
                        isSubmitting={isSubmitting}
                        onSubmit={onRegister}
                    />
                )}
            </div>
        </div>
    );
}
