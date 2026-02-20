import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import logo from "@/assets/logo.jpeg";

const LoadingScreen = () => {
    const [progress, setProgress] = useState(0);
    const [show, setShow] = useState(true);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    setTimeout(() => setShow(false), 200);
                    return 100;
                }
                return Math.min(prev + Math.random() * 18 + 7, 100);
            });
        }, 120);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const label =
        progress < 30 ? "Loading assets..." :
            progress < 60 ? "Preparing your experience..." :
                progress < 90 ? "Almost ready..." : "Welcome!";

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    key="loading-screen"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center bg-background"
                    style={{ willChange: "opacity" }}
                >
                    {/* CSS-only background blobs — no JS animation, zero CPU cost */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                        <div className="loading-blob-1 absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
                        <div className="loading-blob-2 absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
                        <div className="loading-blob-3 absolute bottom-1/4 left-1/3 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
                    </div>

                    <div className="relative flex flex-col items-center justify-center gap-8">
                        {/* Logo — spring entrance only, no continuous animation */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 220,
                                damping: 22,
                                delay: 0.05,
                            }}
                            className="relative"
                            style={{ willChange: "transform, opacity" }}
                        >
                            {/* CSS spinning ring — GPU composited via CSS animation */}
                            <div
                                className="loading-ring absolute -inset-4 rounded-full"
                                style={{
                                    background: "conic-gradient(from 0deg, transparent, hsl(var(--primary)), transparent, hsl(var(--accent)), transparent)",
                                    opacity: 0.6,
                                }}
                            />
                            <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-primary/30 shadow-2xl">
                                <img src={logo} alt="Logo" className="h-full w-full object-cover" />
                            </div>
                        </motion.div>

                        {/* Store Name */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                            className="flex flex-col items-center gap-2"
                            style={{ willChange: "opacity, transform" }}
                        >
                            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Al-Tabbakh{" "}
                                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                    Store
                                </span>
                            </h1>
                            <p className="text-sm text-muted-foreground">Premium Home Essentials</p>
                        </motion.div>

                        {/* Progress Bar */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.3 }}
                            className="relative w-[200px]"
                            style={{ willChange: "opacity" }}
                        >
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <motion.div
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: progress / 100 }}
                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                    className="h-full origin-left rounded-full bg-gradient-to-r from-primary via-accent to-primary"
                                    style={{ willChange: "transform" }}
                                />
                            </div>
                            <p className="mt-3 text-center text-xs text-muted-foreground">{label}</p>
                        </motion.div>

                        {/* Dots — CSS animation instead of JS */}
                        <div className="flex gap-1.5" aria-hidden>
                            {[0, 1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="h-1.5 w-1.5 rounded-full bg-primary loading-dot"
                                    style={{ animationDelay: `${i * 0.15}s` }}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingScreen;
