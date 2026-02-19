import { motion } from "framer-motion";

export const ProductCardSkeleton = () => (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* Image skeleton */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent"
            />
        </div>
        {/* Content skeleton */}
        <div className="p-5 space-y-3">
            <div className="h-3 w-20 rounded-full bg-muted">
                <motion.div
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                    className="h-full w-full bg-gradient-to-r from-transparent via-foreground/5 to-transparent"
                />
            </div>
            <div className="h-5 w-3/4 rounded-full bg-muted" />
            <div className="h-4 w-full rounded-full bg-muted" />
            <div className="h-4 w-2/3 rounded-full bg-muted" />
            <div className="flex items-center gap-2 pt-2">
                <div className="h-6 w-6 rounded-full bg-muted" />
                <div className="h-3 w-24 rounded-full bg-muted" />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex gap-3">
                    <div className="h-4 w-12 rounded-full bg-muted" />
                    <div className="h-4 w-12 rounded-full bg-muted" />
                </div>
                <div className="h-6 w-16 rounded-full bg-muted" />
            </div>
        </div>
    </div>
);

export const ProductGridSkeleton = ({ count = 6 }: { count?: number }) => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
            >
                <ProductCardSkeleton />
            </motion.div>
        ))}
    </div>
);

export const HeroSkeleton = () => (
    <div className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background pb-16 pt-12">
        <div className="container mx-auto px-4">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
                <div className="h-8 w-48 rounded-full bg-muted" />
                <div className="h-14 w-96 rounded-lg bg-muted" />
                <div className="h-6 w-80 rounded-full bg-muted" />
                <div className="flex gap-4">
                    <div className="h-12 w-32 rounded-lg bg-muted" />
                    <div className="h-12 w-32 rounded-lg bg-muted" />
                </div>
            </div>
        </div>
    </div>
);

export const OrderSkeleton = () => (
    <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="rounded-xl border border-border bg-card p-6"
            >
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-4 w-32 rounded-full bg-muted" />
                        <div className="h-3 w-24 rounded-full bg-muted" />
                    </div>
                    <div className="h-6 w-20 rounded-full bg-muted" />
                </div>
                <div className="mt-4 flex gap-3">
                    {Array.from({ length: 2 }).map((_, j) => (
                        <div key={j} className="h-16 w-16 rounded-lg bg-muted" />
                    ))}
                </div>
            </motion.div>
        ))}
    </div>
);
