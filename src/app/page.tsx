"use client";

import React, { useEffect, useRef } from "react";
import { HeroHighlight, Highlight } from "../components/ui/heroHighlight";
import { motion } from "framer-motion";
import { TextGenerateEffect } from "../components/ui/textGenerateEffect";
import { StickyScroll } from "../components/ui/stickyScrollReveal";
import GoogleLogin from "../components/auth/googleLogin";

const HeroSection = () => (
  <HeroHighlight containerClassName="!items-start md:!items-center h-screen w-full">
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
      className="w-full text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white text-start leading-relaxed lg:leading-snug mx-auto lg:w-[980px]"
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

const Content = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.autoplay = true;
      videoRef.current.loop = false;
      videoRef.current.muted = true;
      videoRef.current.playbackRate = 2.5;
    }
  }, [videoRef.current]);

  return (
    <StickyScroll
      contentClassName="!h-96 w-80"
      content={[
        {
          title: "Create an obligation",
          description:
            "Set a goal, create a contract, and invite a friend to keep you accountable.",
          background: false,
          content: (
            <div className="h-full w-full relative flex items-center justify-center text-white">
              <video
                height={400}
                width={250}
                preload="none"
                ref={videoRef}
                className="absolute inset-0 rounded-xl object-cover overflow-visible"
              >
                <source src="/landing/create-obligation.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ),
        },
        {
          title: "Create an obligation",
          description:
            "Set a goal, create a contract, and invite a friend to keep you accountable.",
          background: false,
          content: (
            <div className="h-full w-full relative flex items-center justify-center text-white">
              <video
                height={400}
                width={250}
                preload="none"
                ref={videoRef}
                className="absolute inset-0 rounded-xl object-cover overflow-visible"
              >
                <source src="/landing/create-obligation.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ),
        },
        {
          title: "Create an obligation",
          description:
            "Set a goal, create a contract, and invite a friend to keep you accountable.",
          background: false,
          content: (
            <div className="h-full w-full relative flex items-center justify-center text-white">
              <video
                height={400}
                width={250}
                preload="none"
                ref={videoRef}
                className="absolute inset-0 rounded-xl object-cover overflow-visible"
              >
                <source src="/landing/create-obligation.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ),
        },
        {
          title: "Create an obligation",
          description:
            "Set a goal, create a contract, and invite a friend to keep you accountable.",
          background: false,
          content: (
            <div className="h-full w-full relative flex items-center justify-center text-white">
              <video
                height={400}
                width={250}
                preload="none"
                ref={videoRef}
                className="absolute inset-0 rounded-xl object-cover overflow-visible"
              >
                <source src="/landing/create-obligation.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ),
        },
      ]}
    />
  );
};

export default function Home() {
  return (
    <div className="h-full w-full gap-1">
      <HeroSection />
      <Content />
      {/* <GoogleLogin /> */}
    </div>
  );
}
