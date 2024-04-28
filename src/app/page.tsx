"use client";

import React from "react";
import { HeroHighlight, Highlight } from "../components/ui/heroHighlight";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <HeroHighlight containerClassName="!items-start md:!items-center h-full">
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: [20, -5, 0],
        }}
        transition={{
          duration: 0.5,
          ease: [0.4, 0.0, 0.2, 1],
        }}
        className="w-full text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white text-start leading-relaxed lg:leading-snug text-center mx-auto "
      >
        Building habits is hard{" "}
        <Highlight
          className="text-black dark:text-white 
        from-orange-300/70 to-red-300/70 dark:from-orange-500/70 dark:to-red-500/70
        "
          duration={0.7}
          delay={0.5}
        >
          Alone.
        </Highlight>
        <br />
        But it&apos;s easier when you have a{" "}
        <Highlight
          className="text-black dark:text-white"
          duration={0.5}
          delay={3}
        >
          Partner.
        </Highlight>
      </motion.div>
    </HeroHighlight>
  );
}
