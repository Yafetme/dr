"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSwitchChain, useChainId } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface SelectNetworkProps {
    selectedChainId: number | null;
    setSelectedChainId: (id: number) => void;
}

export default function SelectNetwork({ selectedChainId, setSelectedChainId }: SelectNetworkProps) {
    const [isOpen, setIsOpen] = useState(false);
    const modalRef = useRef<HTMLDialogElement>(null);
    const { chains, switchChain } = useSwitchChain();
    const currentChainId = useChainId();

    useEffect(() => {
        if (currentChainId) {
            setSelectedChainId(currentChainId);
        }
    }, [currentChainId, setSelectedChainId]);

    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.showModal();
        } else if (modalRef.current) {
            modalRef.current.close();
        }
    }, [isOpen]);

    return (
        <div className="relative w-full">
            <button
                onClick={() => setIsOpen(true)}
                className="w-full py-4 rounded-3xl font-bold transition-all border border-white/10 bg-white text-black shadow-2xl hover:bg-neutral-200 flex items-center justify-center gap-3 px-6"
            >
                <div className="h-6 w-6 rounded-full border border-black/10 flex items-center justify-center text-[10px]">
                    {chains.find(c => c.id === selectedChainId)?.name === 'Ethereum' ? 'Ξ' : 'B'}
                </div>
                <span>{chains.find(c => c.id === selectedChainId)?.name || "Select Network"}</span>
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <dialog
                ref={modalRef}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border border-white/10 p-6 rounded-[2.5rem] w-[90dvw] max-w-sm z-[200] backdrop-blur-3xl shadow-[0_0_50px_rgba(255,255,255,0.1)] outline-none"
            >
                <div className="flex items-center justify-between w-full mb-8">
                    <div className="h-8 w-8 rounded-full border border-white/20 flex items-center justify-center text-white text-xs">
                        ?
                    </div>
                    <span className="text-white font-bold tracking-tight">Select Network</span>
                    <button onClick={() => setIsOpen(false)} className="text-white hover:text-neutral-400">
                        &#10006;
                    </button>
                </div>

                <div className="space-y-3">
                    {chains.map((chain) => {
                        const isCurrent = selectedChainId === chain.id;
                        const isEth = chain.name === 'Ethereum';

                        return (
                            <button
                                key={chain.id}
                                onClick={async () => {
                                    setIsOpen(false);
                                    if (isCurrent) {
                                        toast(`You're already on ${chain.name}`);
                                        return;
                                    }
                                    try {
                                        await switchChain({ chainId: chain.id });
                                        setSelectedChainId(chain.id);
                                        toast.success(`Switched to ${chain.name}`);
                                    } catch (err) {
                                        toast.error(`Failed to switch to ${chain.name}`);
                                    }
                                }}
                                className={`w-full px-6 py-5 rounded-3xl flex items-center gap-4 transition-all group ${isCurrent
                                    ? 'bg-white text-black font-bold border-2 border-white'
                                    : 'bg-neutral-900/50 text-white border border-white/5 hover:border-white/20 hover:bg-neutral-900'
                                    }`}
                            >
                                <div className={`h-12 w-12 rounded-full overflow-hidden flex items-center justify-center border ${isCurrent ? 'border-black/10' : 'border-white/10'}`}>
                                    {isEth ? (
                                        <img src="https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=024" alt="ETH" className={`h-6 w-6 ${isCurrent ? '' : 'brightness-0 invert'}`} />
                                    ) : (
                                        <img src="https://cryptologos.cc/logos/binance-coin-bnb-logo.svg?v=024" alt="BNB" className={`h-6 w-6 ${isCurrent ? '' : 'brightness-0 invert'}`} />
                                    )}
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold">{chain.name}</div>
                                    <div className={`text-[10px] ${isCurrent ? 'text-black/50' : 'text-neutral-500'}`}>
                                        {isEth ? 'Mainnet Environment' : 'Smart Chain Network'}
                                    </div>
                                </div>
                                {isCurrent && (
                                    <div className="ml-auto h-2 w-2 rounded-full bg-black shadow-[0_0_5px_black]" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </dialog>
        </div>
    );
}
