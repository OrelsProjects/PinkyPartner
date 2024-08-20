import React, { useState } from "react";
import { ObligationBox } from "../contractObligations/obligationBox";
import DeviceMockup from "../ui/deviceMockup";
import { FaArrowRightLong } from "react-icons/fa6";
import { cn } from "../../lib/utils";
import NotificationMockup, {
  NotificationMockupProps,
} from "./notificationMockup";
import { EventTracker } from "../../eventTracker";

const OREL_IMAGE_URL =
  "https://lh3.googleusercontent.com/a/ACg8ocJuQcn9RGs6JLIUTa4TJzH4CQKVQatTZE4zIlMqxe9ec8wlXJttvA=s96-c";

interface DummyObligationBoxProps {}

const Device = ({
  notifications,
  children,
  ios15,
}: {
  notifications: NotificationMockupProps[];
  children?: React.ReactNode;
  ios15?: boolean;
}) => (
  <div className="flex flex-col gap-2 items-center">
    <DeviceMockup ownerPhotoUrl={OREL_IMAGE_URL} ios15>
      {notifications?.map((notification, index) => (
        <NotificationMockup
          image="/PP-round.png"
          key={`mockup-notification-${index}`}
          title={notification.title}
          body={notification.body}
          state={notification.state}
        />
      ))}
    </DeviceMockup>
  </div>
);

const DummyObligationBoxMobile: React.FC<DummyObligationBoxProps> = () => {
  const titles = [
    "Read",
    "Run 2KM",
    "Meditate",
    "Drink water",
    "Eat fruits",
    "Sleep 8 hours",
  ];
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const [notifications, setNotifications] = useState<NotificationMockupProps[]>(
    [
      {
        title: "Random Pinky is progressing!",
        body: "Run 2KM completed!",
        state: "idle",
      },
      {
        title: "Random Pinky is progressing!",
        body: "Read completed!",
        state: "idle",
      },
      {
        title: "Random Pinky is progressing!",
        body: "Meditate completed!",
        state: "idle",
      },
      {
        title: "Random Pinky is progressing!",
        body: "Drink water completed!",
        state: "idle",
      },
      {
        title: "Random Pinky is progressing!",
        body: "Eat fruits completed!",
        state: "idle",
      },
      {
        title: "Random Pinky is progressing!",
        body: "Sleep 8 hours completed!",
        state: "idle",
      },
    ],
  );
  const [currentDay, setCurrentDay] = useState<string>(days[0]);
  const [title, setTitle] = useState<string>(titles[0]);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [tried, setTried] = useState<boolean>(false);

  const handleCompleteObligation = (day: string, completed: boolean): void => {
    setCompleted(completed);
    setDisabled(true);
    setTried(true);

    let newNotifications = [...notifications];
    const notificationIndex = newNotifications.findIndex(n =>
      n.body.includes(title),
    );
    if (notificationIndex !== -1) {
      newNotifications[notificationIndex] = {
        ...newNotifications[notificationIndex],
        state: "show",
      };
    }

    setNotifications(newNotifications);

    const newDays = days.filter(d => d !== day);
    const newTitles = titles.filter(t => t !== title);

    setTimeout(() => {
      setCurrentDay(newDays[Math.floor(Math.random() * newDays.length)]);
      setTitle(newTitles[Math.floor(Math.random() * newTitles.length)]);
      setCompleted(false);
      setDisabled(false);
    }, 3300);

    setTimeout(() => {
      newNotifications = [...notifications];
      const notificationIndex = newNotifications.findIndex(n =>
        n.body.includes(title),
      );
      if (notificationIndex !== -1) {
        newNotifications[notificationIndex] = {
          ...newNotifications[notificationIndex],
          state: "hide",
        };
      }
      setNotifications(newNotifications);
    }, 3000);
  };

  return (
    <div className="h-full w-full flex flex-col-reverse justify-start gap-14 md:hidden">
      <div className="flex flex-row gap-1 relative justify-center items-center">
        <div className="w-fit absolute -top-[2.25rem] md:top-5 md:-left-[6.25rem] flex flex-row-reverse md:flex-row justify-end md:justify-start gap-2">
          <span className="text-xl">Try me</span>
          <div className="rotate-90">
            <FaArrowRightLong
              className={cn("text-3xl text-primary", {
                "animate-bounce-horizontal": !tried,
              })}
            />
          </div>
        </div>
        <ObligationBox
          index={0}
          title={title}
          day={currentDay}
          className="!max-w-96 md:!max-w-[27rem] !w-10/12 md:!w-full self-center"
          disabled={disabled}
          isCompleted={completed}
          partnersDetails={[{
            photoURL: OREL_IMAGE_URL,
            displayName: "Orel Zilberman",
            isSigned: true,
            isObligationCompleted: false,
          }]}
          handleCompleteObligation={(day: string, completed: boolean): void => {
            EventTracker.track(
              "user_completed_obligation_in_landing_page_mobile",
            );
            handleCompleteObligation(day, completed);
          }}
        />
      </div>
      <Device notifications={notifications} ios15 />
    </div>
  );
};

export default DummyObligationBoxMobile;
