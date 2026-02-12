"use client";

import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import { Language, translations } from "@/lib/translations";

export default function AppleCardsCarouselDemo({ lang }: { lang: Language }) {
    const t = translations[lang];
    const data = getData(t);
    const cards = data.map((card, index) => (
        <Card key={card.src} card={card} index={index} />
    ));

    return (
        <div className="w-full h-full py-20">
            <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-white font-sans">
                {t.ecoTitle}
            </h2>
            <Carousel items={cards} />
        </div>
    );
}

const DummyContent = ({ title, description, image }: { title: string; description: string; image: string }) => {
    return (
        <div
            className="bg-neutral-900 border border-white/5 p-8 md:p-14 rounded-3xl mb-4"
        >
            <p className="text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
                <span className="font-bold text-white">
                    {title}
                </span>{" "}
                {description}
            </p>
            <img
                src={image}
                alt="ONYX Branding"
                height="500"
                width="500"
                className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain rounded-3xl mt-8 grayscale hover:grayscale-0 transition-all duration-500"
            />
        </div>
    );
};

const getData = (t: any) => [
    {
        category: t.card1Category,
        title: t.card1Title,
        src: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2000&auto=format&fit=crop",
        content: (
            <DummyContent
                title={t.card1ContentTitle}
                description={t.card1ContentDesc}
                image="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2000&auto=format&fit=crop"
            />
        ),
    },
    {
        category: t.card2Category,
        title: t.card2Title,
        src: "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2000&auto=format&fit=crop",
        content: (
            <DummyContent
                title={t.card2ContentTitle}
                description={t.card2ContentDesc}
                image="https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2000&auto=format&fit=crop"
            />
        ),
    },
    {
        category: t.card3Category,
        title: t.card3Title,
        src: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=2000&auto=format&fit=crop",
        content: (
            <DummyContent
                title={t.card3ContentTitle}
                description={t.card3ContentDesc}
                image="https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=2000&auto=format&fit=crop"
            />
        ),
    },

    {
        category: t.card4Category,
        title: t.card4Title,
        src: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?q=80&w=2000&auto=format&fit=crop",
        content: (
            <DummyContent
                title={t.card4ContentTitle}
                description={t.card4ContentDesc}
                image="https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?q=80&w=2000&auto=format&fit=crop"
            />
        ),
    },
    {
        category: t.card5Category,
        title: t.card5Title,
        src: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=2000&auto=format&fit=crop",
        content: (
            <DummyContent
                title={t.card5ContentTitle}
                description={t.card5ContentDesc}
                image="https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=2000&auto=format&fit=crop"
            />
        ),
    },
    {
        category: t.card6Category,
        title: t.card6Title,
        src: "https://www.shutterstock.com/image-photo/global-bitcoin-blockchain-network-cryptocurrency-600nw-2652494645.jpg",
        content: (
            <DummyContent
                title={t.card6ContentTitle}
                description={t.card6ContentDesc}
                image="https://www.shutterstock.com/image-photo/global-bitcoin-blockchain-network-cryptocurrency-600nw-2652494645.jpg"
            />
        ),
    },
];
