import { NoiseBackground } from "@/components/ui/noise-background";

export default function NoiseBackgroundDemo() {
    return (
        <div className="flex justify-center">
            <NoiseBackground
                containerClassName="w-fit p-2 rounded-full mx-auto"
                gradientColors={[
                    "rgb(100, 100, 100)",
                    "rgb(200, 200, 200)",
                    "rgb(50, 50, 50)",
                ]}
            >
                <button className="h-full w-full cursor-pointer rounded-full bg-gradient-to-r from-neutral-100 via-neutral-100 to-white px-4 py-2 text-black shadow-[inset_0_2px_0_rgba(255,255,255,0.5),0_0.5px_1px_rgba(0,0,0,0.1)] transition-all duration-100 active:scale-95 dark:from-black dark:via-black dark:to-neutral-900 dark:text-white dark:shadow-[inset_0_1px_0_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.05)]">
                    Start publishing &rarr;
                </button>
            </NoiseBackground>
        </div>
    );
}
