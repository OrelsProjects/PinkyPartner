"use client";

import React, { useEffect, useRef } from "react";
import { HeroHighlight, Highlight } from "../components/ui/heroHighlight";
import { motion } from "framer-motion";
import { TextGenerateEffect } from "../components/ui/textGenerateEffect";
import { Button } from "../components/ui/button";
import { FaArrowDownLong } from "react-icons/fa6";

const ArrowDown = ({ onClick }: { onClick?: () => void }) => (
  <div
    className="h-10 lg:h-16 w-10 lg:w-16 lg:hover:cursor-pointer absolute bottom-6 left-[45%] sm:left-1/2 flex justify-center items-center rounded-full bg-card border-[1.5px] border-muted animate-bounce"
    onClick={onClick}
  >
    <FaArrowDownLong className="text-3xl text-primary h-6 lg:h-8 w-6 lg:w-8" />
  </div>
);

const Video = ({ url }: { url: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1;
    }
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      controls
      playsInline
      className="rounded-3xl aspect-square w-72 sm:w-96 lg:w-[28rem] border-0 dark:border-2 border-base-content/20 dark:shadow-lg mb-8 object-fill"
    >
      <source src={url} type="video/mp4" />
    </video>
  );
};

const CreateObligationVideo = () => (
  <Video
    url={
      "https://firebasestorage.googleapis.com/v0/b/myworkout-ca350.appspot.com/o/landing%2Fcreate-obligation.mp4?alt=media&token=1093c545-4d34-4f92-988a-f4fd6fdd5fa6"
    }
  />
);

const CreateContractVideo = () => (
  <Video
    url={
      "https://firebasestorage.googleapis.com/v0/b/myworkout-ca350.appspot.com/o/landing%2Fcreate-contract.mp4?alt=media&token=92eaf488-6c4b-4998-9af4-21909b1b3456"
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
          <a href="/login" className="hidden lg:flex text-base md:text-lg">
            Login
          </a>
        </Button>
        <Button asChild variant="magic">
          <a href="/register" className="text-lg md:text-xl">
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
      <div className="flex flex-col lg:flex-row items-center gap-1">
        <TextGenerateEffect
          words={"But it's easier when you have a"}
          delay={2}
          className="hidden lg:block !font-medium"
        />
        <TextGenerateEffect
          words={"But it's easier with a"}
          delay={2.5}
          className="lg:hidden !font-medium"
        />
        <Highlight
          duration={0.8}
          delay={3.5}
          className="from-blue-400 to-indigo-400 dark:from-blue-500 dark:to-indigo-500 text-white"
        >
          Partner.
        </Highlight>
      </div>
    </motion.div>
  </HeroHighlight>
);

const Section = ({
  children,
  title,
  body,
  onNext,
}: {
  children: React.ReactNode;
  title?: React.ReactNode;
  body?: React.ReactNode;
  onNext?: () => void;
}) => {
  return (
    <div className="w-screen h-screen bg-background flex flex-col relative sm:px-80 sm:py-28">
      <div className="w-full h-full flex flex-col sm:flex-row justify-center items-center gap-6 bg-card rounded-xl">
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
    partOneRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToPartTwo = () => {
    partTwoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToPartThree = () => {
    partThreeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="h-full w-full gap-1 flex flex-col overflow-auto">
      <Header />
      <HeroSection />
      <div ref={partOneRef}>
        <Section
          title="Create Obligations"
          body="The beginning of every relationship is a promise. Create obligations to keep each other accountable."
          onNext={scrollToPartTwo}
        >
          <CreateObligationVideo />
        </Section>
      </div>
      <div ref={partTwoRef}>
        <Section
          title="Create Contracts"
          body={
            <div>
              <span>
                Now that you have obligations, create contracts to make sure you
                both follow through.
              </span>
            </div>
          }
          onNext={scrollToPartThree}
        >
          <CreateContractVideo />
        </Section>
      </div>
      <div ref={partThreeRef}>
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
        >
          <CreateContractVideo />
        </Section>
      </div>
      <motion.div
        // show with opacity after 4 seconds
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 5 }}
      >
        <ArrowDown onClick={scrollToPartOne} />
      </motion.div>
    </div>
  );
}
