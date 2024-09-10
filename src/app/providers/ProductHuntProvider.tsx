"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import useOnboarding from "@/lib/hooks/useOnboarding";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProductHuntProviderProps {}

const ProductHuntProvider: React.FC<ProductHuntProviderProps> = () => {
  const pathname = usePathname();
  const { isOnboardingCompleted } = useOnboarding();
  const [showProductHunt, setShowProductHunt] = useState<boolean>(false);
  const [topLeft, setTopLeft] = useState<{ top: number; left: number }>({
    top: 160,
    left: 40,
  });

  useEffect(() => {
    if (pathname === "/login" || pathname === "/register") {
      setShowProductHunt(false);
    } else {
      if (pathname !== "/") {
        setTopLeft({ top: 40, left: 40 });
      } else {
        setTopLeft({ top: 120, left: 40 });
      }
    }
  }, [pathname]);

  return (
    <div
      className={cn("hidden md:flex absolute z-50", {
        "!hidden": !showProductHunt,
      })}
      style={{
        top: `${topLeft.top}px`,
        left: `${topLeft.left}px`,
      }}
    >
      <a
        href="https://www.producthunt.com/posts/pinkypartner?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-pinkypartner"
        target="_blank"
      >
        <Image
          src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=461391&theme=light"
          alt="PinkyPartner - Building&#0032;habits&#0032;with&#0032;a&#0032;partner | Product Hunt"
          style={{
            width: "250px",
            height: "54px",
          }}
          width="250"
          height="54"
        />
      </a>
    </div>
  );
};

export default ProductHuntProvider;
