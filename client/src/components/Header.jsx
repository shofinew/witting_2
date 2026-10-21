import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';
import { canManageUsers } from '../utils/user';

export function Header({
    activePage,
    formattedDate,
    formattedTime,
    onClearMessages,
    eventCounts = {},
    currentUser,
    notifications = [],
    onMarkNotificationRead,
    onMarkAllNotificationsRead,
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const notificationRef = useRef(null);
    const navBadgeIds = new Set(['home', 'total-events', 'stage1', 'stage2', 'stage3']);
    const visibleNavItems = NAV_ITEMS.filter((item) => item.id !== 'users' || canManageUsers(currentUser));
    const unreadCount = notifications.filter((notification) => !notification.isRead).length;

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };
        const handleEscape = (event) => {
            if (event.key === 'Escape') setIsNotificationOpen(false);
            if (event.key === 'Escape') setIsMenuOpen(false);
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    useEffect(() => {
        if (!isMenuOpen) {
            document.body.style.overflow = '';
            return undefined;
        }

        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    const handleNavigation = () => {
        onClearMessages();
        setIsMenuOpen(false);
    };

    const renderNavItems = (isMobile = false) => visibleNavItems.map((item) => {
        const isActive = activePage === item.id;
        const badgeCount = navBadgeIds.has(item.id) ? (eventCounts[item.id] || 0) : null;

        return (
            <NavLink
                key={item.id}
                to={`/${item.id}`}
                onClick={handleNavigation}
                className={`group relative flex min-h-[40px] shrink-0 items-center justify-start rounded-2xl px-3 py-2 text-sm font-semibold transition-all ${isMobile ? 'w-full duration-500 hover:outline hover:outline-2 hover:outline-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500' : 'duration-200'} sm:min-h-[36px] sm:justify-center sm:px-2.5 sm:py-1 ${isActive
                    ? 'bg-[#161080] text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 sm:hover:bg-slate-200'
                    }`}
            >
                <span className="leading-tight">{item.label}</span>
                {badgeCount > 0 && (
                    <span className="absolute right-1 top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1.5 text-[10px] font-black leading-none text-white shadow-lg sm:-right-1 sm:-top-1 sm:min-h-6 sm:min-w-6 sm:px-2 sm:text-xs">
                        {badgeCount}
                    </span>
                )}
            </NavLink>
        );
    });

    return (
        <div className="sticky top-0 z-50">
            <div
                className="mb-1 flex items-center justify-between gap-2 rounded-[10px] px-2 py-2 text-white shadow-2xl sm:px-3 md:px-4"
                style={{ backgroundColor: '#161080' }}
            >
                <div className="flex min-w-0 items-center gap-1.5 sm:w-auto sm:gap-2">
                    <button
                        type="button"
                        aria-label="Open navigation menu"
                        aria-expanded={isMenuOpen}
                        onClick={() => setIsMenuOpen(true)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/80 sm:hidden"
                    >
                        <span className="sr-only">Open navigation menu</span>
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <NavLink
                        to="/landing"
                        onClick={handleNavigation}
                        aria-label="Go to Witting landing page"
                        className="shrink-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/80"
                    >
                        <img
                            src="/logo.svg"
                            alt="Witting logo"
                            className="h-8 w-8 rounded-2xl shadow-lg transition hover:scale-105 sm:h-9 sm:w-9 md:h-10 md:w-10"
                        />
                    </NavLink>
                    <div className="hidden min-w-0 sm:block">
                        <h2 className="truncate text-base font-black md:text-lg">Witting</h2>
                    </div>
                </div>

                <div className="min-w-0 flex-1 text-center">
                    <p className="whitespace-nowrap text-xs font-bold text-white sm:text-lg md:text-xl">
                        {formattedDate} | {formattedTime}
                    </p>
                </div>

                <div className="relative flex w-10 justify-end" ref={notificationRef}>
                    <button
                        type="button"
                        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                        aria-expanded={isNotificationOpen}
                        onClick={() => setIsNotificationOpen((isOpen) => !isOpen)}
                        className="relative flex h-10 w-10 items-center justify-center rounded-2xl text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/80"
                    >
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.6A2 2 0 0 1 18 14v-3a6 6 0 0 0-12 0v3a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 0 1-6 0m6 0H9" />
                        </svg>
                        {unreadCount > 0 && (
                            <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#161080] bg-red-500 px-1 text-[10px] font-black leading-none text-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {isNotificationOpen && (
                        <div className="absolute right-0 top-12 z-[60] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                                <div>
                                    <h3 className="text-sm font-black text-slate-900">Notifications</h3>
                                    <p className="mt-0.5 text-xs text-slate-500">Updates from your events</p>
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={onMarkAllNotificationsRead}
                                        className="text-xs font-bold text-indigo-700 hover:text-indigo-900"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-8 text-center">
                                        <p className="text-sm font-semibold text-slate-700">You’re all caught up</p>
                                        <p className="mt-1 text-xs text-slate-500">New event updates will appear here.</p>
                                    </div>
                                ) : notifications.map((notification) => {
                                    const isUnread = !notification.isRead;
                                    return (
                                        <button
                                            type="button"
                                            key={notification._id}
                                            onClick={() => onMarkNotificationRead(notification._id)}
                                            className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${isUnread ? 'bg-indigo-50/60' : 'bg-white'}`}
                                        >
                                            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${isUnread ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                                            <span className="min-w-0">
                                                <span className="block text-sm font-bold text-slate-800">{notification.title}</span>
                                                <span className="mt-1 block text-xs font-semibold text-slate-500">
                                                    Creator: {notification.creatorName} · Target: {notification.targetName}
                                                </span>
                                                <span className="mt-0.5 block text-xs leading-5 text-slate-600">{notification.message}</span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-1 hidden rounded-[10px] border border-slate-200/80 bg-white/90 px-1.5 py-1 shadow-[0_12px_40px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:block sm:px-2 sm:py-1">
                <div className="flex flex-nowrap items-center justify-start gap-1 overflow-x-auto overscroll-x-contain pb-0.5 [scrollbar-width:thin] sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0">
                    {renderNavItems()}
                </div>
            </div>

            <>
                <button
                    type="button"
                    aria-label="Close navigation menu"
                    onClick={() => setIsMenuOpen(false)}
                    className={`fixed inset-0 z-[60] cursor-default bg-slate-950/45 transition-opacity duration-500 sm:hidden ${isMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                />
                <aside
                    id="mobile-navigation"
                    aria-label="Mobile navigation"
                    aria-hidden={!isMenuOpen}
                    inert={!isMenuOpen ? '' : undefined}
                    className={`fixed inset-y-0 left-0 z-[70] flex w-[min(18rem,85vw)] flex-col bg-white p-4 shadow-2xl transition-transform duration-500 ease-in-out sm:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                        <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-4">
                            <div className="flex items-center gap-2">
                                <img src="/logo.svg" alt="Witting logo" className="h-9 w-9 rounded-xl" />
                                <span className="text-lg font-black text-[#161080]">Witting</span>
                            </div>
                            <button
                                type="button"
                                aria-label="Close navigation menu"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            >
                                <span className="sr-only">Close navigation menu</span>
                                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M6 6l12 12M18 6L6 18" />
                                </svg>
                            </button>
                        </div>
                        <nav className="flex flex-col gap-2">
                            {renderNavItems(true)}
                        </nav>
                </aside>
            </>
        </div>
    );
}
