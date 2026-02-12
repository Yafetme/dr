"use client"

import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, bsc } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, type Config } from 'wagmi'
import React, { type ReactNode } from 'react'

import { cookieStorage, createStorage, http } from '@wagmi/core'

// 1. Get projectId at https://cloud.reown.com
const projectId = '7fb83121f24001fe287ad6e719130eab'

// 2. Set up Wagmi adapter
export const networks = [bsc, mainnet]

const wagmiAdapter = new WagmiAdapter({
    storage: createStorage({
        storage: cookieStorage,
    }),
    transports: {
        [bsc.id]: http('https://bsc-dataseed1.binance.org'),
        [mainnet.id]: http('https://eth-mainnet.public.blastapi.io'),
    },
    ssr: true,
    projectId,
    networks,
})

// 3. Configure AppKit
createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    metadata: {
        name: 'ONYX',
        description: 'ONYX Airdrop & Ecosystem',
        url: 'https://onyx.network',
        icons: ['https://assets.reown.com/reown-profile-pic.png']
    },
    features: {
        email: false,
        socials: false,
        emailShowWallets: false,
        analytics: false,
        swaps: false,
        onramp: false,
    },
    coinbasePreference: 'smartWalletOnly',
    themeMode: 'dark',
})

const queryClient = new QueryClient()

export function AppKitProvider({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </WagmiProvider>
    )
}
