"use client";
import React from "react";
import { cn } from "@/lib/utils";
import createGlobe from "cobe";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconBrandYoutubeFilled } from "@tabler/icons-react";

import { Language, translations } from "@/lib/translations";

export default function FeaturesSectionDemo({ lang }: { lang: Language }) {
    const t = translations[lang];
    const features = [
        {
            title: t.feature1Title,
            description: t.feature1Desc,
            skeleton: <SkeletonOne />,
            className:
                "col-span-1 lg:col-span-4 border-b lg:border-r border-neutral-100 dark:border-neutral-800",
        },
        {
            title: t.feature2Title,
            description: t.feature2Desc,
            skeleton: <SkeletonTwo />,
            className: "border-b col-span-1 lg:col-span-2 border-neutral-100 dark:border-neutral-800",
        },
        {
            title: t.feature3Title,
            description: t.feature3Desc,
            skeleton: <SkeletonThree />,
            className:
                "col-span-1 lg:col-span-3 lg:border-r border-neutral-100 dark:border-neutral-800",
        },
        {
            title: t.feature4Title,
            description: t.feature4Desc,
            skeleton: <SkeletonFour />,
            className: "col-span-1 lg:col-span-3 border-b lg:border-none border-neutral-100",
        },
    ];
    return (
        <div className="relative z-20 mx-auto max-w-7xl py-10 lg:py-40">
            <div className="px-8">
                <h4 className="mx-auto max-w-5xl text-center text-3xl font-medium tracking-tight text-white lg:text-5xl lg:leading-tight">
                    {t.powerOfOnyx}
                </h4>

                <p className="mx-auto my-4 max-w-2xl text-center text-sm font-normal text-neutral-400 lg:text-base">
                    {t.powerDesc}
                </p>
            </div>

            <div className="relative">
                <div className="mt-12 grid grid-cols-1 rounded-md lg:grid-cols-6 xl:border dark:border-neutral-800">
                    {features.map((feature) => (
                        <FeatureCard key={feature.title} className={feature.className}>
                            <FeatureTitle>{feature.title}</FeatureTitle>
                            <FeatureDescription>{feature.description}</FeatureDescription>
                            <div className="h-full w-full">{feature.skeleton}</div>
                        </FeatureCard>
                    ))}
                </div>
            </div>
        </div>
    );
}

const FeatureCard = ({
    children,
    className,
}: {
    children?: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn(`relative overflow-hidden p-4 sm:p-8`, className)}>
            {children}
        </div>
    );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
    return (
        <p className="mx-auto max-w-5xl text-left text-xl tracking-tight text-black md:text-2xl md:leading-snug dark:text-white">
            {children}
        </p>
    );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
    return (
        <p
            className={cn(
                "mx-auto max-w-4xl text-left text-sm md:text-base",
                "text-center font-normal text-neutral-500 dark:text-neutral-300",
                "mx-0 my-2 max-w-sm text-left md:text-sm",
            )}
        >
            {children}
        </p>
    );
};

export const SkeletonOne = () => {
    return (
        <div className="relative flex h-full gap-10 px-2 py-8">
            <div className="group mx-auto h-full w-full bg-white p-5 shadow-2xl dark:bg-neutral-900">
                <div className="flex h-full w-full flex-1 flex-col space-y-2">
                    {/* TODO */}
                    <img
                        src="https://weetracker.com/wp-content/uploads/2025/08/Stablecoins-1536x864-1.jpg"
                        alt="ONYX Secure Infrastructure"
                        width={800}
                        height={800}
                        className="aspect-square h-full w-full rounded-sm object-cover object-center grayscale"
                    />
                </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-60 w-full bg-gradient-to-t from-white via-white to-transparent dark:from-black dark:via-black" />
            <div className="pointer-events-none absolute inset-x-0 top-0 z-40 h-60 w-full bg-gradient-to-b from-white via-transparent to-transparent dark:from-black" />
        </div>
    );
};

export const SkeletonThree = () => {
    return (
        <div className="group/image relative flex h-full w-full">
            <div className="group mx-auto h-full w-full bg-transparent dark:bg-transparent">
                <div className="relative flex h-full w-full flex-1 flex-col space-y-2">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="aspect-square h-full w-full rounded-sm object-cover object-center grayscale hover:grayscale-0 transition-all duration-700"
                    >
                        <source src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-crypto-currency-symbol-31644-large.mp4" type="video/mp4" />
                    </video>
                </div>
            </div>
        </div>
    );
};

export const SkeletonTwo = () => {
    const images = [
        "https://cdn.prod.website-files.com/625eb292f5b2be0c695a2fce/66b623e2f98dcd2a1bac3bb1_pikaso_texttoimage_ai-and-blockchain%20(1).webp", // AI Blockchain
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_NNMVW5nP0SD0Lge8zhZ6-DWxgGY1-1Axfg&s", // Monochrome Data Visualization
        "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=2000&auto=format&fit=crop", // Graph
        "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?q=80&w=2000&auto=format&fit=crop", // Blockchain
        "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2000&auto=format&fit=crop", // Nodes
    ];

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const imageVariants = {
        whileHover: {
            scale: 1.1,
            rotate: 0,
            zIndex: 100,
        },
        whileTap: {
            scale: 1.1,
            rotate: 0,
            zIndex: 100,
        },
    };

    return (
        <div className="relative flex h-full flex-col items-start gap-10 overflow-hidden p-8">
            <div className="-ml-20 flex flex-row">
                {images.map((image, idx) => (
                    <motion.div
                        variants={imageVariants}
                        key={"images-first" + idx}
                        style={{
                            rotate: isMounted ? Math.random() * 20 - 10 : 0,
                        }}
                        whileHover="whileHover"
                        whileTap="whileTap"
                        className="mt-4 -mr-4 shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-800"
                    >
                        <img
                            src={image}
                            alt="AI analysis"
                            width="500"
                            height="500"
                            className="h-20 w-20 shrink-0 rounded-lg object-cover md:h-40 md:w-40"
                        />
                    </motion.div>
                ))}
            </div>
            <div className="flex flex-row">
                {images.map((image, idx) => (
                    <motion.div
                        key={"images-second" + idx}
                        style={{
                            rotate: isMounted ? Math.random() * 20 - 10 : 0,
                        }}
                        variants={imageVariants}
                        whileHover="whileHover"
                        whileTap="whileTap"
                        className="mt-4 -mr-4 shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-800"
                    >
                        <img
                            src={image}
                            alt="AI analysis"
                            width="500"
                            height="500"
                            className="h-20 w-20 shrink-0 rounded-lg object-cover md:h-40 md:w-40"
                        />
                    </motion.div>
                ))}
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 z-[100] h-full w-20 bg-gradient-to-r from-white to-transparent dark:from-black" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-[100] h-full w-20 bg-gradient-to-l from-white to-transparent dark:from-black" />
        </div>
    );
};

export const SkeletonFour = () => {
    return (
        <div className="relative mt-10 flex h-60 flex-col items-center bg-transparent md:h-60 dark:bg-transparent">
            <Globe className="absolute -right-10 -bottom-80 md:-right-10 md:-bottom-72" />
        </div>
    );
};

export const Globe = ({ className }: { className?: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let phi = 0;

        if (!canvasRef.current) return;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: 600 * 2,
            height: 600 * 2,
            phi: 0,
            theta: 0,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.3, 0.3, 0.3],
            markerColor: [0.1, 0.8, 1],
            glowColor: [1, 1, 1],
            markers: [
                // longitude latitude
                { location: [37.7595, -122.4367], size: 0.03 },
                { location: [40.7128, -74.006], size: 0.1 },
            ],
            onRender: (state) => {
                // Called on every animation frame.
                // `state` will be an empty object, return updated params.
                state.phi = phi;
                phi += 0.01;
            },
        });

        return () => {
            globe.destroy();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
            className={className}
        />
    );
};
