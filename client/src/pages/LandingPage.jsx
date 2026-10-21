import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicEventAPI } from '../api';

const destinationCards = [
    {
        id: 'home',
        label: 'Home',
        description: 'See today’s confirmed events and what is coming up.',
        accent: 'from-cyan-500 to-blue-600',
        icon: '⌂',
    },
    {
        id: 'total-events',
        label: 'Total Events',
        description: 'Review all of your current confirmed events.',
        accent: 'from-indigo-500 to-violet-600',
        icon: '▦',
    },
    {
        id: 'public',
        label: 'My Public',
        description: 'Create and manage your active public events.',
        accent: 'from-fuchsia-500 to-pink-600',
        icon: '◎',
    },
    {
        id: 'time',
        label: 'My Time',
        description: 'Check your daily schedule and availability.',
        accent: 'from-amber-500 to-orange-600',
        icon: '◷',
    },
    {
        id: 'my-notice',
        label: 'My Notice',
        description: 'Write and manage your personal notices.',
        accent: 'from-emerald-500 to-teal-600',
        icon: '✎',
    },
    {
        id: 'stage1',
        label: 'Stage1',
        description: 'Review and manage your Stage1 events.',
        accent: 'from-sky-500 to-cyan-600',
        icon: '1',
    },
    {
        id: 'stage2',
        label: 'Stage2',
        description: 'Continue working on your Stage2 events.',
        accent: 'from-purple-500 to-indigo-600',
        icon: '2',
    },
    {
        id: 'stage3',
        label: 'Stage3',
        description: 'Continue working on your Stage3 events.',
        accent: 'from-rose-500 to-red-600',
        icon: '3',
    },
];

export function LandingPage({ currentUser, eventCounts = {} }) {
    const navigate = useNavigate();
    const [publicEventCount, setPublicEventCount] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadPublicEventCount = async () => {
            if (!currentUser?._id) {
                return;
            }

            try {
                const data = await publicEventAPI.getAll(currentUser._id, currentUser._id);
                if (isMounted) {
                    const count = Number(data?.total);
                    setPublicEventCount(Number.isFinite(count) ? count : (data?.events || []).length);
                }
            } catch {
                if (isMounted) {
                    setPublicEventCount(null);
                }
            }
        };

        loadPublicEventCount();

        return () => {
            isMounted = false;
        };
    }, [currentUser?._id]);

    const openDestination = (id) => {
        if (id === 'public') {
            navigate(`/public?creatorId=${encodeURIComponent(currentUser?._id || '')}`);
            return;
        }

        if (id === 'time') {
            navigate('/my-time');
            return;
        }

        navigate(`/${id}`);
    };

    return (
        <main className="mt-2 overflow-hidden rounded-[10px] border border-white/70 bg-white/90 p-[10px] shadow-2xl backdrop-blur-xl lg:min-h-[calc(100vh-7rem)]">
            <section aria-labelledby="workspace-destinations-title">
                <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                        <h2 id="workspace-destinations-title" className="text-xl font-black text-slate-900 sm:text-2xl">Go to</h2>
                        <p className="mt-1 text-sm font-medium text-slate-500">Everything you need, one click away.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-[repeat(4,150px)] lg:justify-center">
                    {destinationCards.map((card) => {
                        const count = eventCounts[card.id];
                        const hasCount = Number.isFinite(count) && ['home', 'total-events', 'stage1', 'stage2', 'stage3'].includes(card.id);

                        return (
                            <button
                                key={card.id}
                                type="button"
                                onClick={() => openDestination(card.id)}
                                className="group relative flex h-[120px] w-full min-h-0 flex-col justify-between overflow-hidden rounded-[10px] border border-slate-200 bg-white p-3 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-4 lg:w-[150px]"
                            >
                                <div className="flex h-9 w-9 self-center items-center justify-center rounded-xl bg-transparent text-[23px] font-black text-[#0084ff]" aria-hidden="true">
                                    {card.icon}
                                </div>
                                <div className="mt-2 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="truncate text-sm font-black text-slate-900">{card.label}</h3>
                                        {hasCount && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-600">{count}</span>}
                                    </div>
                                    <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-4 text-slate-500">
                                        {card.id === 'public'
                                            ? `Total created public events: ${publicEventCount ?? 'Loading...'}`
                                            : card.description}
                                    </p>
                                </div>
                                <span className="absolute bottom-4 right-4 text-lg font-black text-indigo-300 transition group-hover:translate-x-1 group-hover:text-indigo-600" aria-hidden="true">→</span>
                            </button>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}
