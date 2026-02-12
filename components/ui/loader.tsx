"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const LoaderOne = ({ className }: { className?: string }) => {
    return (
        <div className={cn("flex items-center justify-center", className)}>
            <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-neutral-200 dark:border-neutral-800"></div>
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-white"></div>
            </div>
        </div>
    );
};
