"use client";

import React, { useEffect, useRef, useState } from "react";
import { HeroHighlight, Highlight } from "../components/ui/heroHighlight";
import { AnimatePresence, motion } from "framer-motion";
import { TextGenerateEffect } from "../components/ui/textGenerateEffect";
import { Button } from "../components/ui/button";
import { FaArrowDownLong } from "react-icons/fa6";
import { cn } from "../lib/utils";
import { EventTracker } from "../eventTracker";

const ArrowDown = ({ onClick }: { onClick?: () => void }) => (
  <div>
    <div
      className={cn(
        "h-12 lg:h-16 w-12 lg:w-16 bg-card absolute bottom-6 left-[45%] sm:left-1/2 flex justify-center items-center rounded-full animate-bounce z-30 lg:hover:cursor-pointer",
        "mb-10 sm:mb-0", // Accomodate for browser top navigation bar
      )}
      onClick={onClick}
    >
      <FaArrowDownLong className="text-3xl text-primary h-6 lg:h-8 w-6 lg:w-8" />
    </div>
  </div>
);

const Video = ({ url }: { url: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  const containerRef = useRef(null);

  const variants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        // Only trigger the timeout if the component is visible
        if (entry.isIntersecting) {
          setTimeout(() => {
            setShowVideo(true);
            if (videoRef.current) {
              videoRef.current.play();
            }
          }, 2000);
          // Stop observing after the element is shown
          observer.disconnect();
        }
      },
      {
        root: null, // Observing for visibility in the viewport
        rootMargin: "0px",
        threshold: 0.1, // Trigger when 10% of the element is visible
      },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1;
    }
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 3,
        }}
      >
        <video
          ref={videoRef}
          loop
          muted
          controls={false}
          playsInline
          className="rounded-3xl aspect-square w-72 sm:w-96 lg:w-[28rem] border-0 dark:border-2 border-base-content/20 dark:shadow-lg mb-8 object-fill"
        >
          <source src={url} type="video/mp4" />
        </video>
      </motion.div>
      <motion.div
        key={`video-placeholder - ${url}`}
        variants={variants}
        animate={!showVideo ? "open" : "closed"}
        transition={{
          duration: 4,
        }}
        className="absolute inset-0 bg-background dark:bg-card rounded-xl aspect-square w-72 sm:w-96 lg:w-[28rem] h-72 sm:h-96 lg:h-[28rem] border-0 dark:border-2 border-base-content/20 dark:shadow-lg mb-8 shimmer-animation"
      />
    </div>
  );
};

const CreateObligationVideo = () => (
  <Video
    url={
      "https://firebasestorage.googleapis.com/v0/b/myworkout-ca350.appspot.com/o/landing%2FObligation_1.mp4?alt=media&token=4fe803ce-9db8-4648-ab59-83103b3f9b66"
    }
  />
);

const CreateContractVideo = () => (
  <Video
    url={
      "https://firebasestorage.googleapis.com/v0/b/myworkout-ca350.appspot.com/o/landing%2FContract_1.mp4?alt=media&token=0cec9ef7-090e-4448-b83a-bc8fe7fa1232"
    }
  />
);

const SignContractVideo = () => (
  <Video
    url={
      "https://firebasestorage.googleapis.com/v0/b/myworkout-ca350.appspot.com/o/landing%2FSign%20contract_1.mp4?alt=media&token=12c8960b-a8e9-4a4d-ac97-e6de4b07e484"
    }
  />
);

const Header = () => (
  <header className="w-full fixed top-0 left-0 h-20 flex flex-row justify-center items-center py-2 bg-card z-50">
    <div className="w-full px-4 lg:px-0 lg:w-[1040px] flex flex-row justify-between items-center">
      <div className="text-3xl md:text-4xl font-medium text-foreground">
        PinkyPartner
      </div>
      <div className="flex flex-row gap-2">
        <Button
          asChild
          variant="outline"
          className="rounded-full h-12 bg-transparent"
        >
          <a href="/login" className="hidden lg:flex text-base md:text-lg ">
            Login
          </a>
        </Button>
        <Button asChild variant="magic" className="bg-card dark:bg-background">
          <a href="/register" className="text-lg md:text-xl">
            Get Started
          </a>
        </Button>
      </div>
    </div>
  </header>
);

const HeroSection = ({ onNext }: { onNext: () => void }) => (
  <HeroHighlight
    containerClassName="items-center h-screen w-full relative"
    className="h-screen flex justify-start items-center pt-20 md:pt-0"
  >
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
      className="w-full h-80 md:h-fit text-2xl md:text-4xl lg:text-5xl font-medium text-start leading-relaxed lg:leading-snug mx-auto lg:w-[1040px]"
    >
      <div className="flex flex-col lg:flex-row justify-start gap-1 tracking-tighter">
        <TextGenerateEffect
          words={"Building habits is hard "}
          className="!font-medium"
        />
        <Highlight
          className="
          w-fit
          from-orange-400 to-red-400 dark:from-orange-500 dark:to-red-500
          text-white
          "
          duration={0.8}
          delay={0.8}
        >
          Alone.
        </Highlight>
      </div>
      <div className="flex flex-col lg:flex-row justify-start gap-1 tracking-tighter">
        <TextGenerateEffect
          words="But it's easier when you have a"
          delay={2}
          className="hidden lg:block !font-medium"
        />
        <TextGenerateEffect
          words="But it's easier with a"
          delay={2.5}
          className="lg:hidden !font-medium"
        />
        <Highlight
          duration={0.8}
          delay={3.5}
          className="w-fit from-blue-400 to-indigo-400 dark:from-blue-500 dark:to-indigo-500 text-white"
        >
          Partner.
        </Highlight>
      </div>
    </motion.div>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 5 }}
      className="z-30 absolute bottom-0 inset-x-0"
    >
      <ArrowDown onClick={onNext} />
    </motion.div>
  </HeroHighlight>
);

const Section = ({
  children,
  title,
  body,
  onNext,
  className,
}: {
  children?: React.ReactNode;
  title?: React.ReactNode;
  body?: React.ReactNode;
  onNext?: () => void;
  className?: string;
}) => {
  return (
    <div className="w-screen h-screen flex flex-col relative sm:px-80 sm:py-28 z-20">
      <HeroHighlight containerClassName="items-center h-full w-full absolute inset-0 z-10" />
      <div
        className={cn(
          "w-full h-full flex flex-col sm:flex-row justify-center items-center gap-6 bg-card rounded-xl z-30",
          className,
        )}
      >
        <div className="flex flex-col justify-center items-center sm:w-[30rem]">
          <h1 className="text-4xl font-medium text-foreground text-center">
            {title}
          </h1>
          <div className="text-foreground text-center font-light tracking-wide leading-7">
            {body}
          </div>
        </div>
        {children}
      </div>
      {onNext && <ArrowDown onClick={onNext} />}
    </div>
  );
};

export default function Home() {
  const partOneRef = useRef<HTMLDivElement>(null);
  const partTwoRef = useRef<HTMLDivElement>(null);
  const partThreeRef = useRef<HTMLDivElement>(null);
  const partFourRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then(registration => {
            console.log("Service Worker registered: ", registration);
          })
          .catch(registrationError => {
            console.log(
              "Service Worker registration failed: ",
              registrationError,
            );
          });
      });
    }
  }, []);

  const scrollToPartOne = () => {
    EventTracker.track("scroll_to_part_one");
    partOneRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToPartTwo = () => {
    EventTracker.track("scroll_to_part_two");
    partTwoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToPartThree = () => {
    EventTracker.track("scroll_to_part_three");
    partThreeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToPartFour = () => {
    EventTracker.track("scroll_to_part_four");
    partFourRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="h-full w-full gap-1 flex flex-col overflow-auto relative">
      <Header />
      <HeroSection onNext={scrollToPartOne} />
      <div ref={partOneRef} className="z-20">
        <Section
          title="Make a Promise"
          body="The beginning of every relationship is a promise. Make promises to keep each other accountable."
          onNext={scrollToPartTwo}
        >
          <CreateObligationVideo />
        </Section>
      </div>
      <div ref={partTwoRef} className="z-20">
        <Section
          title="Create Contracts"
          body={
            <div>
              <span>
                Now that you have made some promises, create contracts to make
                sure you both follow through.
              </span>
            </div>
          }
          onNext={scrollToPartThree}
        >
          <CreateContractVideo />
        </Section>
      </div>
      <div ref={partThreeRef} className="z-20">
        <Section
          title="Wait for your partner"
          body={
            <div>
              <span>
                Now you wait for your partner to accept the contract. Once they
                do, you can start working on your goals together!
              </span>
            </div>
          }
          onNext={scrollToPartFour}
        >
          <SignContractVideo />
        </Section>
      </div>
      <div ref={partFourRef} className="z-20">
        <Section title="Let's get started!" className="flex !flex-col gap-2">
          <Button
            variant="magic"
            className="bg-card dark:bg-background text-lg md:text-xl"
          >
            <a
              href="/register"
              onClick={() => {
                EventTracker.track("get_started_after_scroll");
              }}
            >
              Take my pinky!
            </a>
          </Button>
        </Section>
      </div>
    </div>
  );
}
