import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

const pageVariants = {
    initial: {
        opacity: 0,
        y: 24,
        scale: 0.98,
        filter: "blur(6px)",
    },
    enter: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: {
            duration: 0.5,
            ease: [0.25, 0.4, 0.25, 1] as const,
            staggerChildren: 0.08,
        },
    },
    exit: {
        opacity: 0,
        y: -16,
        scale: 0.99,
        filter: "blur(4px)",
        transition: {
            duration: 0.3,
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
            className={`w-full ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
