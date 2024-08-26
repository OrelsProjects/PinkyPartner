import React from "react";
import ShowContentContainer from "./showContentContainer";
import Image from "next/image";
import Link from "next/link";
import useOnboarding from "../../lib/hooks/useOnboarding";
import { EventTracker } from "../../eventTracker";
import CustomLink from "../ui/customLink";

interface AvailableOnProps {}

const AvailableOn: React.FC<AvailableOnProps> = () => {
  const { isOnboardingCompleted } = useOnboarding();

  return (
    <ShowContentContainer
      className="flex justify-center items-center"
      variant="secondary"
    >
      <div className="card w-full">
        <div className="card-content md:p-4 lg:p-8 flex flex-col justify-start items-center">
          <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-8">
            Download PinkyPartner on
          </span>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <CustomLink
              href="https://play.google.com/store/apps/details?id=com.pinkypartner.www.twa"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                EventTracker.track("downloaded_on_google_play");
              }}
            >
              <Image
                src="/get-on-google-play.png"
                alt="Get on Google Play"
                fill
                className="!relative !h-14 !w-48 flex-shrink-0 px-1"
              />
            </CustomLink>
            <CustomLink
              href={
                "https://www.pinkypartner.com/" + isOnboardingCompleted()
                  ? "register"
                  : "home"
              }
              onClick={() => {
                EventTracker.track("downloaded_on_web_app");
              }}
            >
              <Image
                src="/get-on-web-app.png"
                alt="Get on Google Play"
                fill
                className="!relative !h-14 !w-48 flex-shrink-0 px-1"
              />
            </CustomLink>
          </div>
        </div>
      </div>
    </ShowContentContainer>
  );
};

export default AvailableOn;
