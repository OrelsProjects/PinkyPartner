"use client";

import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function LiveChatProvider() {
  const key = "2545e27e-7032-47eb-b960-f8a5a50c1663";
  const [loadScript, setLoadScript] = useState(false);

  useEffect(() => {
    // Function to update state based on window width
    const handleResize = () => {
      if (window.innerWidth >= 640) { // Assuming 640px is your 'sm' breakpoint
        setLoadScript(true);
      } else {
        setLoadScript(false);
      }
    };

    // Set initial state and add event listener
    handleResize();
    window.addEventListener('resize', handleResize);

    // Cleanup listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {loadScript && (
        <Script
          id="ze-snippet"
          src={`https://static.zdassets.com/ekr/snippet.js?key=${key}`}
        />
      )}
    </>
  );
}
