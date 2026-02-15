
import { motion } from "framer-motion";

const LoadingScreen = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-background"
        >
            <div className="relative flex flex-col items-center justify-center gap-6">
                {/* Animated Logo/Spinner */}
                <motion.div
                    animate={{
                        rotate: 360,
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                    }}
                    className="relative h-24 w-24 rounded-full border-t-4 border-l-4 border-primary shadow-glow"
                >
                    <div className="absolute inset-0 rounded-full border-b-4 border-r-4 border-accent opacity-50 blur-[2px]" />
                </motion.div>

                {/* Loading Text */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center gap-2"
                >
                    <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                        Cozy Corner Goods
                    </h2>
                    <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                    ease: "easeInOut",
                                }}
                                className="h-2 w-2 rounded-full bg-primary"
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default LoadingScreen;
