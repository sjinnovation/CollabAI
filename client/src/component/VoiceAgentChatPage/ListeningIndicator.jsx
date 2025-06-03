import { motion } from "framer-motion";

const ListeningIndicator = () => {
    return (
        <div className="listening-indicator-container">
            {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
                key={i}
                className="listening-indicator-bar"
                animate={{
                    height: [4, 12, 4],
                    opacity: [0.4, 1, 0.4],
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                }}
            />
            ))}
        </div>
    );
};

export default ListeningIndicator; 