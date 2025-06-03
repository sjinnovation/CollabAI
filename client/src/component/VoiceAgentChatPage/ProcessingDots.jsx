import { motion } from "framer-motion";

const ProcessingDots = () => {
    return (
        <div className="processing-dots-container">
            {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
                key={i}
                className="processing-dot"
                animate={{
                    y: [0, -8, 0],
                    opacity: [0.5, 1, 0.5],
                }}
                transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut",
                }}
            />
            ))}
        </div>
    );
};

export default ProcessingDots; 
