import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.jpeg";

const LoadingScreen = () => {
    const [progress, setProgress] = useState(0);
    const [show, setShow] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setShow(false), 300);
                    return 100;
                }
                return prev + Math.random() * 15 + 5;
            });
        }, 150);

        return () => clearInterval(interval);
    }, []);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
                    className="fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center bg-background"
                >
                    {/* Animated Background Blobs */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{
                                x: [0, 30, -20, 0],
                                y: [0, -30, 20, 0],
                                scale: [1, 1.2, 0.9, 1],
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
                        />
                        <motion.div
                            animate={{
                                x: [0, -40, 20, 0],
                                y: [0, 20, -30, 0],
                                scale: [1, 0.8, 1.1, 1],
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
                        />
                        <motion.div
                            animate={{
                                x: [0, 20, -30, 0],
                                y: [0, -20, 10, 0],
                            }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute bottom-1/4 left-1/3 h-64 w-64 rounded-full bg-secondary/10 blur-3xl"
                        />
                    </div>

                    <div className="relative flex flex-col items-center justify-center gap-8">
                        {/* Animated Logo */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 20,
                                delay: 0.1,
                            }}
                            className="relative"
                        >
                            {/* Glow Ring */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute -inset-4 rounded-full"
                                style={{
                                    background: "conic-gradient(from 0deg, transparent, hsl(var(--primary)), transparent, hsl(var(--accent)), transparent)",
                                    opacity: 0.6,
                                }}
                            />
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-primary/30 shadow-2xl"
                            >
                                <img src={logo} alt="Logo" className="h-full w-full object-cover" />
                            </motion.div>
                        </motion.div>

                        {/* Store Name */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="flex flex-col items-center gap-2"
                        >
                            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Al-Tabbakh{" "}
                                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                    Store
                                </span>
                            </h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-sm text-muted-foreground"
                            >
                                Premium Home Essentials
                            </motion.p>
                        </motion.div>

                        {/* Progress Bar */}
                        <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 200 }}
                            transition={{ delay: 0.5, duration: 0.3 }}
                            className="relative"
                        >
                            <div className="h-1.5 w-[200px] overflow-hidden rounded-full bg-muted">
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${Math.min(progress, 100)}%` }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-primary"
                                />
                            </div>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="mt-3 text-center text-xs text-muted-foreground"
                            >
                                {progress < 30
                                    ? "Loading assets..."
                                    : progress < 60
                                        ? "Preparing your experience..."
                                        : progress < 90
                                            ? "Almost ready..."
                                            : "Welcome!"}
                            </motion.p>
                        </motion.div>

                        {/* Animated Dots */}
                        <div className="flex gap-1.5">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        scale: [1, 1.5, 1],
                                        opacity: [0.3, 1, 0.3],
                                    }}
                                    transition={{
                                        duration: 1.2,
                                        repeat: Infinity,
                                        delay: i * 0.15,
                                        ease: "easeInOut",
                                    }}
                                    className="h-1.5 w-1.5 rounded-full bg-primary"
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
