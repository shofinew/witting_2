import React from 'react';

export function FamilyPage() {
    return (
        <div className="w-full rounded-3xl border border-indigo-100 bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
            <div className="max-w-3xl">
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">
                    Family
                </h2>
                <p className="mt-3 text-base text-slate-600">
                    This is the Family page. You can add family-specific events, notes, or private updates here.
                </p>
            </div>
        </div>
    );
}
