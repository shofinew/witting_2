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
        <>
            <div className="mb-1 flex flex-col gap-4 rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-100 via-lime-50 to-green-100 px-4 py-4 text-emerald-950 shadow-2xl md:flex-row md:items-center md:justify-between">
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
        </>
    );
}
