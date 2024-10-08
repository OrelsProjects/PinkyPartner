import Image from "next/image";
import React, { useEffect } from "react";
import { cn } from "@/lib/utils";

export interface DeviceMockupProps {
  ios15?: boolean;
  className?: string;
  ownerPhotoUrl?: string;
  children?: React.ReactNode;
}

const DeviceMockup: React.FC<DeviceMockupProps> = ({
  ios15,
  children,
  className,
  ownerPhotoUrl,
}) => {
  const [time, setTime] = React.useState<string>("");
  const interval = React.useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    interval.current = setInterval(() => {
      // Get time of current locale as HH:MM
      const date = new Date();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      setTime(`${hours}:${minutes < 10 ? `0${minutes}` : minutes}`);
    }, 1000);

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "relative rounded-[2.5rem] h-[475px] w-10/12 md:px-0 md:h-[700px] md:w-[350px] shadow-xl overflow-hide",
        className,
      )}
    >
      {ownerPhotoUrl && (
        <Image
          src={ownerPhotoUrl}
          alt="Orel"
          layout="fixed"
          width={52}
          height={52}
          className="rounded-full absolute -top-2 -left-2 z-10 shadow-lg"
        />
      )}

      <div
        id="top-bar"
        className="w-[148px] h-[18px] bg-gray-900 top-3 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute z-40"
      />
      <div
        id="top-volume"
        className="h-[46px] w-[3px] bg-gray-900 absolute -start-[4px] top-[60px] lg:top-[124px] rounded-s-lg"
      />
      <div
        id="bottom-volume"
        className="h-[46px] w-[3px] bg-gray-900 absolute -start-[4px] top-[114px] lg:top-[178px] rounded-s-lg"
      />
      <div
        id="lock"
        className="h-[64px] w-[3px] bg-gray-900 absolute -end-[4px] top-[78px] lg:top-[142px] rounded-e-lg"
      />
      <div className="h-full w-full relative flex flex-col items-center justify-start gap-10 border-gray-800 dark:border-gray-800 bg-gray-900 border-[14px] rounded-[2.5rem] overflow-clip md:overflow-visible pt-10">
        <div className="w-full h-5 text-7xl font-medium text-white/70 text-center rounded-t-[1rem] z-10">
          {time}
        </div>
        <div className="w-full h-full flex flex-col gap-1 justify-end lg:justify-start items-center z-30 overflow-visible mb-5">
          {children}
        </div>
        <Image
          src={ios15 ? "/iOS-15-wallpaper.jpeg" : "/iOS-17-wallpaper.webp"}
          alt="iOS wallpaper"
          fill
          layout="fill"
          objectFit="cover"
          objectPosition="center"
          className="rounded-[1.75rem] z-0 md:brightness-75"
        />
      </div>
    </div>
  );
};

export default DeviceMockup;
