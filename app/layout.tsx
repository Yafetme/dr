import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "ONYX Airdrop",
    description: "The next generation of decentralized finance",
    icons: {
        icon: "./public/favicon.png",
    },
};

import { AppKitProvider } from "@/context";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AppKitProvider>
                    {children}
                </AppKitProvider>
            </body>
        </html>
    );
}
