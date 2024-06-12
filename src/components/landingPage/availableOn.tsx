import React from "react";
import ShowContentContainer from "./showContentContainer";
import Image from "next/image";
import Link from "next/link";

interface AvailableOnProps {}

const AvailableOn: React.FC<AvailableOnProps> = () => {
  return (
    <ShowContentContainer className="w-full flex justify-center items-center">
      <div className="card max-w-3xl">
        <div className="card-content md:p-4 lg:p-8 flex flex-col justify-start items-center">
          <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-8">
            Available On
          </span>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <Link
              href="https://play.google.com/store/apps/details?id=com.pinkypartner.www.twa"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/get-on-google-play.png"
                alt="Get on Google Play"
                fill
                className="!relative !h-16 !w-48 flex-shrink-0"
              />
            </Link>
            <Link href="https://www.pinkypartner.com/home">
              <Image
                src="/get-on-web-app.png"
                alt="Get on Google Play"
                fill
                className="!relative !h-16 !w-48 flex-shrink-0"
              />
            </Link>
          </div>
        </div>
      </div>
    </ShowContentContainer>
  );
};

export default AvailableOn;
