import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileTabs } from '../components/ProfileTabs';
import { myNoticeAPI } from '../api';

export function MyNoticePage({ currentUser, homeEvents, now, onLogout }) {
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [notices, setNotices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        let isMounted = true;

        const loadNotices = async () => {
            try {
                const response = await myNoticeAPI.getAll();
                if (isMounted) {
                    setNotices(Array.isArray(response.notices) ? response.notices : []);
                }
            } catch (loadError) {
                if (isMounted) {
                    setError(loadError instanceof Error ? loadError.message : 'Failed to load My Notice entries.');
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadNotices();

        return () => {
            isMounted = false;
        };
    }, [currentUser?._id]);

    const handleCreateNotice = async (event) => {
        event.preventDefault();
        const trimmedContent = content.trim();
        setError('');
        setSuccess('');

        if (!trimmedContent) {
            setError('Please write a notice before creating it.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await myNoticeAPI.create(trimmedContent);
            if (!response?.notice) {
                throw new Error('The notice could not be saved.');
            }

            setNotices((previousNotices) => [response.notice, ...previousNotices]);
            setContent('');
            setSuccess('Notice created successfully.');
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'Failed to create notice.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full rounded-3xl border border-indigo-100 bg-white/95 p-4 shadow-2xl backdrop-blur-sm sm:p-6">
            <ProfileHeader currentUser={currentUser} />
            <div className="mt-5">
                <ProfileTabs currentUser={currentUser} activeTab="notice" events={homeEvents} now={now} hideContent />
            </div>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="my-notice-page-title">
                <h1 id="my-notice-page-title" className="text-xl font-black text-slate-900">My Notice</h1>
                <p className="mt-2 text-sm text-slate-500">Write and save a notice to your account.</p>

                <form onSubmit={handleCreateNotice} className="mt-5">
                    <label htmlFor="my-notice-content" className="text-sm font-semibold text-slate-700">
                        Notice
                    </label>
                    <textarea
                        id="my-notice-content"
                        value={content}
                        onChange={(event) => {
                            setContent(event.target.value);
                            setError('');
                            setSuccess('');
                        }}
                        maxLength={1000}
                        rows={6}
                        placeholder="Write your notice here..."
                        className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs text-slate-500">{content.length}/1000 characters</span>
                        <button
                            type="submit"
                            disabled={isSubmitting || !content.trim()}
                            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Notice'}
                        </button>
                    </div>
                </form>

                {error && <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
                {success && <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{success}</p>}

                <div className="mt-6 border-t border-slate-200 pt-5">
                    <h2 className="text-base font-bold text-slate-900">Saved notices</h2>
                    {isLoading ? (
                        <p className="mt-3 text-sm text-slate-500">Loading notices...</p>
                    ) : notices.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-500">No saved notices yet.</p>
                    ) : (
                        <div className="mt-3 space-y-3">
                            {notices.map((notice) => (
                                <article key={notice._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">{notice.content}</p>
                                    <p className="mt-2 text-xs text-slate-500">
                                        {notice.createdAt ? new Date(notice.createdAt).toLocaleString() : 'Saved notice'}
                                    </p>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <div className="mt-8 border-t border-slate-200 pt-5">
                <div className="flex flex-col items-start gap-3">
                <button
                    type="button"
                    onClick={() => navigate('/setting')}
                    className="text-sm font-semibold text-indigo-700 transition hover:text-fuchsia-600"
                >
                    Setting
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/feedback')}
                    className="text-sm font-semibold text-indigo-700 transition hover:text-fuchsia-600"
                >
                    Feedback
                </button>
                <button
                    type="button"
                    onClick={onLogout}
                    className="text-sm font-semibold text-slate-700 transition hover:text-red-600"
                >
                    {currentUser.name} (Logout)
                </button>
                </div>
            </div>
        </div>
    );
}

export default MyNoticePage;
