import React, { useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';

export function Header({
    activePage,
    currentUser,
    isUserMenuOpen,
    setIsUserMenuOpen,
    onLogout,
    formattedDate,
    formattedTime,
    onClearMessages,
}) {
    const userMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setIsUserMenuOpen]);

    return (
        <>
            <div className="mb-4 flex flex-col gap-4 rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-100 via-lime-50 to-green-100 px-5 py-4 text-emerald-950 shadow-2xl md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-lime-500 to-green-400 text-xl font-black text-white shadow-lg">
                        W
                    </div>
                    <div>
                        <h2 className="text-2xl font-black">Witting</h2>
                    </div>
                </div>

                <div className="text-left md:text-right">
                    <p className="text-base font-medium text-slate-800">
                        {formattedDate} | {formattedTime}
                    </p>
                </div>
            </div>

            <div className="mb-6 overflow-visible rounded-3xl border border-white/60 bg-white/80 shadow-2xl backdrop-blur-md">
                <div className="flex flex-col gap-4 border-b border-slate-200/80 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        {NAV_ITEMS.map((item) => {
                            const isActive = activePage === item.id;
                            return (
                                <NavLink
                                    key={item.id}
                                    to={`/${item.id}`}
                                    onClick={onClearMessages}
                                    className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${isActive
                                        ? 'bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white shadow-lg'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    {item.label}
                                </NavLink>
                            );
                        })}
                    </div>

                    <div className="relative self-start lg:self-auto" ref={userMenuRef}>
                        <button
                            type="button"
                            onClick={() => setIsUserMenuOpen((prev) => !prev)}
                            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
                        >
                            <span>{currentUser.name}</span>
                            <span aria-hidden="true">{isUserMenuOpen ? '^' : 'v'}</span>
                        </button>
                        {isUserMenuOpen && (
                            <div className="absolute right-0 z-20 mt-2 w-40 rounded-xl border border-indigo-100 bg-white p-2 shadow-xl">
                                <button
                                    type="button"
                                    onClick={onLogout}
                                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
