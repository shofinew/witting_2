import React, { useState } from 'react';

export function FeedbackPage({ currentUser }) {
    const [feedback, setFeedback] = useState('');
    const [submittedMessage, setSubmittedMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!feedback.trim()) {
            setSubmittedMessage('Please write your feedback first.');
            return;
        }

        setSubmittedMessage(`Thanks ${currentUser.name}, your feedback has been noted.`);
        setFeedback('');
    };

    return (
        <div className="w-full rounded-3xl border border-indigo-100 bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
            <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fuchsia-500">Feedback</p>
                <h2 className="mt-2 text-3xl font-black text-slate-800">Share your thoughts</h2>
                <p className="mt-2 text-slate-600">Tell us what is working well or what you would like to improve in Witting.</p>
            </div>
            <hr className="mb-6 border-slate-300 border-t-2" />

            {submittedMessage && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
                    {submittedMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="feedback" className="block text-sm font-semibold text-indigo-600">
                        Your feedback
                    </label>
                    <textarea
                        id="feedback"
                        rows="7"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Write your feedback here..."
                        className="mt-2 w-full rounded-2xl border border-indigo-200 px-4 py-3 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary"
                    >
                        Submit Feedback
                    </button>
                </div>
            </form>
        </div>
    );
}
