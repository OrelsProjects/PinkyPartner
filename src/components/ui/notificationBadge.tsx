import React from "react";
import { cn } from "../../lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface NotificationBadgeOptions {
  exitDelay?: number;
}

interface NotificationBadgeProps {
  count: number;
  className?: string;
  options?: NotificationBadgeOptions;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  className,
  options,
}) => {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { delay: options?.exitDelay || 0, duration: 3 },
          }}
          transition={{ duration: 2 }}
          className={cn(
            "inline-block w-2.5 h-2.5 mr-2 bg-red-500 rounded-full",
            className,
          )}
        ></motion.span>
      )}
    </AnimatePresence>
  );
  if (count < 10) {
    return (
      <span
        className={cn(
          "inline-block w-2 h-2 mr-2 bg-primary rounded-full",
          className,
        )}
      ></span>
    );
  }
  if (count < 100)
    return (
      <span
        className={cn(
          "inline-block text-transparent lg:inline-flex items-center justify-center h-2.5 w-2.5 lg:h-fit lg:w-fit lg:px-2 lg:py-1 mr-2 text-xs font-bold leading-none lg:text-primary-foreground bg-primary rounded-full",
          className,
        )}
      >
        {count}
      </span>
    );

  return (
    <span
      className={cn(
        "inline-block lg:inline-flex items-center justify-center h-2.5 w-2.5 lg:h-fit lg:w-fit lg:px-2 lg:py-1 lg:text-xs font-bold leading-none text-transparent lg:text-primary-foreground bg-primary rounded-full",
        className,
      )}
    >
      99+
    </span>
  );
};

export default NotificationBadge;
