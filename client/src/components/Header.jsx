import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';

export function Header({
    activePage,
    formattedDate,
    formattedTime,
    onClearMessages,
}) {
    return (
        <div className="sticky top-0 z-50 pb-1">
            <div
                className="mb-1 flex items-center rounded-3xl px-3 py-3 text-white shadow-2xl md:px-4"
                style={{ backgroundColor: '#106080' }}
            >
                <div className="flex min-w-0 items-center gap-2 w-1/5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-base font-black text-white shadow-lg md:h-12 md:w-12 md:text-lg">
                        W
                    </div>
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-black md:text-xl">Witting</h2>
                    </div>
                </div>

                <div className="w-3/5 text-center">
                    <p className="text-lg font-semibold text-white md:text-2xl">
                        {formattedDate} | {formattedTime}
                    </p>
                </div>

                <div className="w-1/5" />
            </div>

            <div className="mb-1 overflow-visible rounded-3xl border border-white/60 bg-white/80 shadow-2xl backdrop-blur-md">
                <div className="flex flex-col gap-3 border-b border-slate-200/80 px-4 py-3">
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
                </div>
            </div>
        </div>
    );
}
