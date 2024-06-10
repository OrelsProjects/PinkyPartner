"use client";
import { useEffect, useState } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  delay,
}: {
  words: string;
  className?: string;
  delay?: number;
}) => {
  const [scope, animate] = useAnimate();
  const [show, setShow] = useState(false);

  let wordsArray = words.split(" ");
  useEffect(() => {
    if (!show) {
      return;
    }
    animate(
      "span",
      {
        opacity: 1,
      },
      {
        duration: 2,
        delay: stagger(0.2),
      },
    );
  }, [scope.current, show]);

  useEffect(() => {
    if (delay) {
      setTimeout(() => {
        setShow(true);
      }, delay * 1000);
    } else {
      setShow(true);
    }
  }, [delay]);

  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className="opacity-0"
            >
              {word}{" "}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className={cn("font-bold", className)}>
      <motion.div className="w-full text-start leading-relaxed lg:leading-snug mx-auto">
        {show && renderWords()}
      </motion.div>
    </div>
  );
};
