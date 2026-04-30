import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';

export function Header({
    activePage,
    formattedDate,
    formattedTime,
    onClearMessages,
    eventCounts = {},
}) {
    const navBadgeIds = new Set(['home', 'total-events', 'stage1', 'stage2', 'stage3']);

    return (
        <div className="sticky top-0 z-50 pb-1">
            <div
                className="mb-1 flex flex-col gap-3 rounded-3xl px-3 py-3 text-white shadow-2xl sm:flex-row sm:items-center sm:justify-between md:px-4"
                style={{ backgroundColor: '#161080' }}
            >
                <div className="flex min-w-0 items-center gap-2 sm:w-auto">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-base font-black text-white shadow-lg md:h-12 md:w-12 md:text-lg">
                        W
                    </div>
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-black md:text-xl">Witting</h2>
                    </div>
                </div>

                <div className="text-left sm:flex-1 sm:text-center">
                    <p className="text-base font-semibold text-white sm:text-lg md:text-2xl">
                        {formattedDate} | {formattedTime}
                    </p>
                </div>

                <div className="hidden sm:block sm:w-10" />
            </div>

            <div className="mb-1 overflow-visible rounded-3xl border border-white/60 bg-white/80 shadow-2xl backdrop-blur-md">
                <div className="border-b border-slate-200/80 p-2 sm:p-3">
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-200 shadow-inner">
                        <div className="flex min-w-max gap-px">
                        {NAV_ITEMS.map((item) => {
                            const isActive = activePage === item.id;
                            const badgeCount = navBadgeIds.has(item.id) ? (eventCounts[item.id] || 0) : null;
                            return (
                                <NavLink
                                    key={item.id}
                                    to={`/${item.id}`}
                                    onClick={onClearMessages}
                                    className={`relative flex min-h-[44px] min-w-[96px] items-center justify-center px-2.5 py-1.5 text-center text-sm font-semibold whitespace-nowrap transition sm:text-[15px] ${isActive
                                        ? 'bg-[#161080] text-white'
                                        : 'bg-white text-slate-700 hover:bg-slate-100'
                                        }`}
                                >
                                    <span className="max-w-full leading-tight">{item.label}</span>
                                    {badgeCount > 0 && (
                                        <span className="absolute right-2 top-[calc(0.5rem-13px)] inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-none text-white shadow-md sm:min-h-6 sm:min-w-6 sm:px-2 sm:text-xs">
                                            {badgeCount}
                                        </span>
                                    )}
                                </NavLink>
                            );
                        })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
