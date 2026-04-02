import React from 'react';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';

export function AuthPage({
    authView,
    setAuthView,
    authError,
    authSuccess,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
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
    setAuthError,
    setAuthSuccess,
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-fuchsia-200 via-sky-100 to-cyan-100 p-6">
            <div className="w-full max-w-lg mx-auto bg-white/95 p-8 rounded-3xl shadow-2xl border border-indigo-100 backdrop-blur-sm">
                <div className="mb-6 text-center">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-cyan-600">
                        Welcome to Witting
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {authView === 'login' ? 'Login with your email and password' : 'Create a new account'}
                    </p>
                </div>

                <div className="flex items-center justify-center gap-3 mb-6">
                    <button
                        type="button"
                        onClick={() => {
                            setAuthView('login');
                            setAuthError('');
                            setAuthSuccess('');
                        }}
                        className={`px-4 py-2 rounded-xl font-semibold transition ${authView === 'login'
                            ? 'bg-white text-indigo-700 shadow-lg'
                            : 'bg-indigo-100/70 text-indigo-600 hover:bg-indigo-200/80'
                            }`}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setAuthView('register');
                            setAuthError('');
                            setAuthSuccess('');
                        }}
                        className={`px-4 py-2 rounded-xl font-semibold transition ${authView === 'register'
                            ? 'bg-white text-indigo-700 shadow-lg'
                            : 'bg-indigo-100/70 text-indigo-600 hover:bg-indigo-200/80'
                            }`}
                    >
                        Register
                    </button>
                </div>

                {authError && (
                    <div className="mb-4 p-3 text-sm text-red-900 bg-red-100/90 rounded-xl border border-red-200 shadow-sm">
                        {authError}
                    </div>
                )}
                {authSuccess && (
                    <div className="mb-4 p-3 text-sm text-green-900 bg-green-100/90 rounded-xl border border-green-200 shadow-sm">
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
