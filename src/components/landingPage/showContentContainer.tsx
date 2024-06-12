import { motion } from "framer-motion";
import React from "react";

interface ShowContentContainerProps {
  className?: string;
  children: React.ReactNode;
}

const ShowContentContainer: React.FC<ShowContentContainerProps> = ({
  className,
  children,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1, y: 20 }}
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      variants={{
        visible: { opacity: 1, scale: 1, y: 0 },
        hidden: { opacity: 0, scale: 0 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ShowContentContainer;
