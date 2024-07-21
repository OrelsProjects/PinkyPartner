// components/PullToRefresh.tsx

import { motion } from "framer-motion";
import React, { useState, useRef } from "react";
import { IoIosRefresh } from "react-icons/io";
import Loading from "./loading";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
}) => {
  const [pulling, setPulling] = useState(false);
  const [thresholdReached, setThresholdReached] = useState(false);
  const [yPos, setYPos] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [startY, setStartY] = useState(0);
  const [loading, setLoading] = useState(false);
  const refContainer = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (refContainer.current?.scrollTop === 0) {
      // Only start tracking if at the top
      const touch = e.touches[0];
      setStartY(touch.clientY);
      setThresholdReached(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!refContainer.current) return;

    const touch = e.touches[0];
    const currentY = touch.clientY;
    const diffY = currentY - startY;
    const topScreenY = refContainer.current.scrollTop;

    console.log("topScreenY", topScreenY);

    if (topScreenY !== 0 && !pulling) {
      setThresholdReached(false);
      setPulling(false);
      setYPos(0);
      setRotation(0);
      return;
    } else {
      setPulling(true);
    }

    // Check if pulling down and already at the top of the scroll
    if (diffY > 0) {
      if (diffY > 50) {
        // Threshold for refresh
        setThresholdReached(true);
      } else {
        setThresholdReached(false);
      }
      // Prevent default to stop scrolling
      e.preventDefault();
    } else {
      setThresholdReached(false);
      setPulling(false);
    }

    // Clamp between 0 and 100
    const currentYClamped = Math.min(Math.max(0, diffY), 200);

    // Make it slowly pull down, not linear
    const currentYClampedSlow = currentYClamped * 0.5;
    const newRotationSlow = (currentYClampedSlow / 200) * 360;

    setYPos(currentYClampedSlow);
    setRotation(newRotationSlow);
  };

  const handleTouchEnd = async () => {
    if (thresholdReached) {
      setLoading(true);
      setYPos(50);
      await onRefresh();
      setPulling(false);
      setLoading(false);
      setThresholdReached(false);
      setYPos(0);
      setRotation(0);
    }
  };

  return (
    <div
      ref={refContainer}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="w-full h-full overflow-auto z-[99999]"
    >
      {pulling ? (
        <motion.div
          className="absolute left-0 w-full flex justify-center items-center z-50"
          style={{ top: `${yPos}px` }}
        >
          <div className="w-fit h-fit flex justify-center items-center rounded-full bg-foreground p-1">
            {loading ? (
              <Loading spinnerClassName="fill-background h-4 w-4" />
            ) : (
              <IoIosRefresh
                className="text-background"
                style={{
                  fontSize: "1rem",
                  transform: `rotate(${rotation}deg)`,
                }}
              />
            )}
          </div>
        </motion.div>
      ) : null}
      {children}
    </div>
  );
};

export default PullToRefresh;
