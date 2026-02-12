"use client"

import { useAppKit } from '@reown/appkit/react'
import { useAccount } from 'wagmi'
import { cn } from '@/lib/utils'

import { NoiseBackground } from "./noise-background"

export function ConnectButton({ className, onConnectedClick }: { className?: string, onConnectedClick?: () => void }) {
    const { open } = useAppKit()
    const { address, isConnected } = useAccount()

    const sliceAddress = (addr: string) => {
        if (!addr || addr.length < 10) return addr
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    return (
        <div className={cn("flex justify-center", className)}>
            <NoiseBackground
                containerClassName="w-full p-1 rounded-full px-1"
                gradientColors={isConnected ? ["#222", "#444", "#111"] : ["#fff", "#ddd", "#eee"]}
                noiseIntensity={0.15}
            >
                <button
                    onClick={() => isConnected && onConnectedClick ? onConnectedClick() : open()}
                    className={cn(
                        "group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-8 py-4 text-lg font-semibold transition-all hover:scale-[1.02] active:scale-95",
                        isConnected
                            ? "bg-neutral-950/50 text-white"
                            : "bg-white text-black",
                    )}
                >
                    <span>{isConnected ? sliceAddress(address!) : "Claim Airdrop"}</span>
                    {!isConnected && (
                        <svg
                            className="h-5 w-5 transition-transform group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    )}
                </button>
            </NoiseBackground>
        </div>
    )
}
