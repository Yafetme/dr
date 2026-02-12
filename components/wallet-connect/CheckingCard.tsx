"use client";

import React from 'react';
import ProgressBar from './ProgressBar';

export default function CheckingCard() {
    return (
        <article className="font-poppins shadow-2xl p-6 border border-white/10 rounded-2xl bg-neutral-900/50 backdrop-blur-md">
            <h2 className="text-white text-2xl mb-4 uppercase font-bold tracking-tighter">Checking Wallet</h2>
            <ProgressBar />
        </article>
    );
}
