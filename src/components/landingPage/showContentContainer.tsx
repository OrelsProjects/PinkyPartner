import { motion } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";

interface ShowContentContainerProps {
  variant: "main" | "secondary" | "tertiary";
  className?: string;
  children: React.ReactNode;
  animate?: boolean;
}

const ShowContentContainer: React.FC<ShowContentContainerProps> = ({
  className,
  children,
  variant = "main",
  animate = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: animate ? 0 : 1, scale: 1, y: animate ? 20 : 0 }}
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      variants={{
        visible: { opacity: 1, scale: 1, y: 0 },
        hidden: { opacity: 0, scale: 0 },
      }}
      className={cn(
        "w-full",
        {
          "lg:w-full": variant === "main",
          "lg:w-9/12": variant === "secondary",
          "lg:w-1/2": variant === "tertiary",
        },
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export default ShowContentContainer;
