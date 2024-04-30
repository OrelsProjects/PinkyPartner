"use client";

import React, { useEffect, useRef } from "react";
import { HeroHighlight, Highlight } from "../components/ui/heroHighlight";
import { motion } from "framer-motion";
import { TextGenerateEffect } from "../components/ui/textGenerateEffect";
import { Button } from "../components/ui/button";
import { FaArrowDownLong } from "react-icons/fa6";

const ArrowDown = ({ onClick }: { onClick?: () => void }) => (
  <div
    className="h-10 lg:h-16 w-10 lg:w-16 lg:hover:cursor-pointer absolute bottom-6 inset-x-1/2 flex justify-center items-center rounded-full bg-card border-[1.5px] border-muted animate-bounce"
    onClick={onClick}
  >
    <FaArrowDownLong className="text-3xl text-primary h-6 lg:h-8 w-6 lg:w-8" />
  </div>
);

const Header = () => (
  <header className="w-full fixed top-0 left-0 h-20 flex flex-row justify-center items-center py-2 bg-card z-50">
    <div className="w-full px-4 lg:px-0 lg:w-1/2 flex flex-row justify-between items-center">
      <div className="text-2xl font-bold text-foreground">PinkyPartner</div>
      <div className="flex flex-row gap-2">
        <Button asChild variant="outline" className="rounded-full h-12">
          <a
            href="/login"
            className="hidden lg:flex text-black dark:text-white text-base md:text-lg"
          >
            Login
          </a>
        </Button>
        <Button asChild variant="magic">
          <a
            href="/register"
            className="text-black dark:text-white text-lg md:text-xl"
          >
            Get Started
          </a>
        </Button>
      </div>
    </div>
  </header>
);

const HeroSection = () => (
  <HeroHighlight containerClassName="items-center h-screen w-full">
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
      className="w-full h-80 md:h-fit text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white text-start leading-relaxed lg:leading-snug mx-auto lg:w-[980px]"
    >
      <div className="flex flex-col lg:flex-row items-center gap-1">
        <TextGenerateEffect words={"Building habits is hard "} />
        <Highlight
          className="text-black dark:text-white 
      from-orange-300/70 to-red-300/70 dark:from-orange-500/70 dark:to-red-500/70
      "
          duration={0.8}
          delay={0.8}
        >
          Alone.
        </Highlight>
      </div>
      <div className="flex flex-col lg:flex-row items-center gap-1">
        <TextGenerateEffect
          words={"But it's easier when you have a"}
          delay={2}
          className="hidden lg:block"
        />
        <TextGenerateEffect
          words={"But it's easier with a"}
          delay={2.5}
          className="lg:hidden"
        />
        <Highlight
          className="text-black dark:text-white"
          duration={0.8}
          delay={3.5}
        >
          Partner.
        </Highlight>
      </div>
    </motion.div>
  </HeroHighlight>
);

const PartOne = () => {
  return <div></div>;
};

const Content = () => {
  return <div className="w-screen h-screen bg-red-500"></div>;
};

export default function Home() {
  const partOneRef = useRef<HTMLDivElement>(null);

  const scrollToPartOne = () => {
    partOneRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="h-full w-full gap-1 flex flex-col overflow-auto">
      <Header />
      <HeroSection />
      <div ref={partOneRef}>
        <Content />
      </div>
      <ArrowDown onClick={scrollToPartOne} />
    </div>
  );
}
