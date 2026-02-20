import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

// PERFORMANCE: Only animate opacity + translateY (GPU-composited, no blur/scale)
// blur() and scale on full-page elements cause significant repaints
const pageVariants = {
    initial: {
        opacity: 0,
        y: 16,
    },
    enter: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: [0.25, 0.4, 0.25, 1] as const,
        },
    },
    exit: {
        opacity: 0,
        y: -8,
        transition: {
            duration: 0.2,
            ease: [0.25, 0.4, 0.25, 1] as const,
        },
    },
};

const PageTransition = ({ children, className = "" }: PageTransitionProps) => {
    return (
        <motion.div
            initial="initial"
            animate="enter"
            exit="exit"
            variants={pageVariants}
            style={{ willChange: "opacity, transform" }}
            className={`w-full ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
