"use client";

import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LIST = [
    'AML/KYT screening',
    'KYC verification',
    'Corporate accounts at CEX/EMI',
    'Blockchain accounts',
    'Security Analysis',
];

export default function ProgressBar() {
    const [position, setPosition] = useState(-100);
    const [showModal, setShowModal] = useState(false);
    const modalRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setPosition((prev) => {
                if (prev >= 0) {
                    setShowModal(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev + 1;
            });
        }, 150); // Faster than original for better UX
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (showModal && modalRef.current) {
            modalRef.current.showModal();
        } else if (modalRef.current) {
            modalRef.current.close();
        }
    }, [showModal]);

    const handleGetPercentage = (idx: number) => {
        return (idx / LIST.length) * 100;
    };

    return (
        <div className="w-full">
            <span className="text-xl font-bold text-white mb-2 block animate-pulse">
                {position + 100}% Completed
            </span>
            <div className="h-3 w-full rounded-full bg-neutral-800 overflow-hidden mb-4">
                <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: `${position}%` }}
                    className="h-full w-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                />
            </div>
            <ul className="space-y-2">
                {LIST.map((list, idx) => {
                    const isDone = handleGetPercentage(idx) <= position + 100;
                    return (
                        <li
                            key={list}
                            className={`text-sm font-medium transition-colors ${isDone ? 'text-white' : 'text-neutral-600'}`}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`h-1.5 w-1.5 rounded-full ${isDone ? 'bg-white shadow-[0_0_5px_white]' : 'bg-neutral-800'}`} />
                                {list}
                            </div>
                        </li>
                    );
                })}
            </ul>

            <AnimatePresence>
                {showModal && (
                    <dialog
                        ref={modalRef}
                        className="fixed bottom-2/4 translate-y-2/4 left-2/4 -translate-x-2/4 p-8 w-[90dvw] max-w-md flex items-center flex-col justify-center font-poppins border border-white/20 rounded-3xl z-[200] bg-neutral-950 text-white shadow-2xl backdrop-blur-xl outline-none"
                    >
                        <div className="flex justify-end w-full absolute top-4 right-4">
                            <button onClick={() => setShowModal(false)} className="text-neutral-500 hover:text-white text-xl">
                                &#10006;
                            </button>
                        </div>

                        <div className="mb-6 h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                            <svg className="h-10 w-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h2 className="text-3xl font-bold mb-3 text-center tracking-tighter">CONGRATULATIONS</h2>
                        <p className="text-neutral-400 text-center text-lg font-light leading-snug">
                            Your wallet has passed all security screenings. No malicious activity detected.
                        </p>

                        <button
                            onClick={() => setShowModal(false)}
                            className="mt-8 w-full py-4 rounded-2xl bg-white text-black font-bold hover:bg-neutral-200 transition-all shadow-xl"
                        >
                            Back To Home
                        </button>
                    </dialog>
                )}
            </AnimatePresence>
        </div>
    );
}
