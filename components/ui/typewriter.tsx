"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const Typewriter = ({
    words,
    className,
    delay = 0,
}: {
    words: string[];
    className?: string;
    delay?: number;
}) => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [speed, setSpeed] = useState(150);

    useEffect(() => {
        const timer = setTimeout(() => {
            const currentFullWord = words[currentWordIndex];

            if (isDeleting) {
                setCurrentText(currentFullWord.substring(0, currentText.length - 1));
                setSpeed(50);
            } else {
                setCurrentText(currentFullWord.substring(0, currentText.length + 1));
                setSpeed(150);
            }

            if (!isDeleting && currentText === currentFullWord) {
                setTimeout(() => setIsDeleting(true), 1500);
            } else if (isDeleting && currentText === "") {
                setIsDeleting(false);
                setCurrentWordIndex((prev) => (prev + 1) % words.length);
            }
        }, speed);

        return () => clearTimeout(timer);
    }, [currentText, isDeleting, currentWordIndex, words, speed]);

    return (
        <span className={cn("inline-block", className)}>
            {currentText}
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="inline-block w-[2px] h-[0.8em] bg-white ml-1 align-middle"
            />
        </span>
    );
};
