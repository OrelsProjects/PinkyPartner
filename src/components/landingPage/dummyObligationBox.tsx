import React, { useRef, useState } from "react";
import { ObligationBox } from "../contractObligations/obligationBox";
import DeviceMockup from "@/components/ui/deviceMockup";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { FaArrowRightLong } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import NotificationMockup, {
  NotificationMockupProps,
} from "./notificationMockup";
import { EventTracker } from "@/eventTracker";

const OREL_IMAGE_URL =
  "https://lh3.googleusercontent.com/a/ACg8ocJuQcn9RGs6JLIUTa4TJzH4CQKVQatTZE4zIlMqxe9ec8wlXJttvA=s96-c";

const notificationsOrelDefault: NotificationMockupProps[] = [
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
];

const notificationsRandomDefault: NotificationMockupProps[] = [
  {
    title: "Orel Zilberman is progressing!",
    body: "Run 2KM completed!",
    state: "idle",
  },
  {
    title: "Orel Zilberman is progressing!",
    body: "Read completed!",
    state: "idle",
  },
  {
    title: "Orel Zilberman is progressing!",
    body: "Meditate completed!",
    state: "idle",
  },
  {
    title: "Orel Zilberman is progressing!",
    body: "Drink water completed!",
    state: "idle",
  },
  {
    title: "Orel Zilberman is progressing!",
    body: "Eat fruits completed!",
    state: "idle",
  },
  {
    title: "Orel Zilberman is progressing!",
    body: "Sleep 8 hours completed!",
    state: "idle",
  },
];

interface DummyObligationBoxProps {}

const Device = ({
  ios15,
  children,
  notifications,
  ownerPhotoUrl,
  notificationPhotoUrl,
  playNotificationSound,
}: {
  ios15?: boolean;
  ownerPhotoUrl: string;
  children?: React.ReactNode;
  notificationPhotoUrl: string;
  playNotificationSound?: boolean;
  notifications: NotificationMockupProps[];
}) => (
  <div className="flex flex-col gap-2 items-center relative">
    <DeviceMockup
      ownerPhotoUrl={ownerPhotoUrl}
      ios15={ios15}
      className="!overflow-visible"
    >
      <div className="w-full h-full lg:h-fit flex flex-col gap-1 justify-start items-center z-30 overflow-visible mt-10">
        {children}
      </div>
      {notifications?.map((notification, index) => (
        <NotificationMockup
          playNotificationSound={playNotificationSound}
          image={notificationPhotoUrl}
          key={`mockup-notification-${index}`}
          title={notification.title}
          body={notification.body}
          state={notification.state}
        />
      ))}
    </DeviceMockup>
  </div>
);

const DummyObligationBox: React.FC<DummyObligationBoxProps> = () => {
  const titles = [
    // "Read",
    // "Run 2KM",
    // "Meditate",
    "Drink water",
    // "Eat fruits",
    // "Sleep 8 hours",
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

  const [tried, setTried] = useState(false);

  const [notificationsRandom, setNotificationsRandom] = useState<
    NotificationMockupProps[]
  >(notificationsRandomDefault);
  const [notificationsOrel, setNotificationsOrel] = useState<
    NotificationMockupProps[]
  >(notificationsOrelDefault);

  const [currentDay, setCurrentDay] = useState<string>(days[0]);
  const [currentDayOrel, setCurrentDayOrel] = useState<string>(days[0]);
  const [title, setTitle] = useState<string>(titles[0]);
  const [titleOrel, setTitleOrel] = useState<string>(titles[0]);
  const [disabledOrel, setDisabledOrel] = useState<boolean>(false);

  const [completedRandomPinky, setCompletedRandomPinky] =
    useState<boolean>(false);
  const [completedOrel, setCompletedOrel] = useState<boolean>(false);

  const completeOrelSourceTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleCompleteObligation = (
    day: string,
    title: string,
    completed: boolean,
    isOrelSource?: boolean,
  ): void => {
    setTried(true);
    if (isOrelSource) {
      if (completedRandomPinky) return;
      setCompletedRandomPinky(completed);
    } else {
      if (completedOrel) return;
      if (!completedRandomPinky && !completeOrelSourceTimeout.current) {
        completeOrelSourceTimeout.current = setTimeout(() => {
          handleCompleteObligation(day, title, true, true);
          completeOrelSourceTimeout.current = null;
        }, 3500);
      }
      setCompletedOrel(completed);
      setDisabledOrel(true);
    }
    let newNotifications = isOrelSource
      ? [...notificationsRandomDefault]
      : [...notificationsOrelDefault];
    const notificationIndex = newNotifications.findIndex(n =>
      n.body.includes(title),
    );
    if (notificationIndex !== -1) {
      newNotifications[notificationIndex] = {
        ...newNotifications[notificationIndex],
        state: "show",
      };
    }
    if (isOrelSource) {
      setNotificationsOrel(newNotifications);
    } else {
      setNotificationsRandom(newNotifications);
    }

    const newDays = days.filter(d => d !== day);
    // const newTitles = titles.filter(t => t !== title);

    // const newDays = days;
    const newTitles = titles;

    setTimeout(
      () => {
        if (isOrelSource) {
          setCurrentDay(newDays[Math.floor(Math.random() * newDays.length)]);
          setTitle(newTitles[Math.floor(Math.random() * newTitles.length)]);
          setCompletedRandomPinky(false);
        } else {
          setCurrentDayOrel(
            newDays[Math.floor(Math.random() * newDays.length)],
          );
          setTitleOrel(newTitles[Math.floor(Math.random() * newTitles.length)]);
          setCompletedOrel(false);
          setDisabledOrel(false);
        }
      },
      isOrelSource ? 3500 : 7000,
    );

    setTimeout(
      () => {
        newNotifications = isOrelSource
          ? [...notificationsRandomDefault]
          : [...notificationsOrelDefault];
        const notificationIndex = newNotifications.findIndex(n =>
          n.body.includes(title),
        );
        if (notificationIndex !== -1) {
          newNotifications[notificationIndex] = {
            ...newNotifications[notificationIndex],
            state: "hide",
          };
        }
        if (isOrelSource) {
          setNotificationsOrel(newNotifications);
        } else {
          setNotificationsRandom(newNotifications);
        }
      },
      isOrelSource ? 3500 : 7000,
    );
  };

  return (
    <div className="h-full w-full hidden md:flex flex-row-reverse justify-between">
      <Device
        ios15
        playNotificationSound
        notifications={notificationsOrel}
        ownerPhotoUrl="/PP-round.png"
        notificationPhotoUrl={OREL_IMAGE_URL}
      >
        <div className="w-fit absolute -left-16 mt-4 flex flex-row justify-start gap-3">
          <div className="">
            <FaArrowRightLong
              className={cn("text-4xl text-primary animate-bounce-horizontal", {
                hidden: tried,
              })}
            />
          </div>
          <span className="text-xl"></span>
        </div>
        <ObligationBox
          contractId="dummy"
          key="obligation-box-random-pinky"
          index={0}
          className="!max-w-96 md:!max-w-[25rem] !w-[95%] self-center"
          title={titleOrel}
          day={currentDayOrel}
          disabled={disabledOrel}
          isCompleted={completedOrel}
          partnersDetails={[
            {
              photoURL: OREL_IMAGE_URL,
              displayName: "Orel Zilberman",
              isSigned: true,
              isObligationCompleted: completedRandomPinky,
            },
          ]}
          handleCompleteObligation={(day: string, completed: boolean): void => {
            EventTracker.track("user_completed_obligation_in_landing_page");
            handleCompleteObligation(day, titleOrel, completed, false);
          }}
        />
      </Device>
      <Device
        notifications={notificationsRandom}
        ownerPhotoUrl={OREL_IMAGE_URL}
        notificationPhotoUrl="/PP-round.png"
      >
        <ObligationBox
          contractId="dummy"
          key="obligation-box-orel"
          index={0}
          userPhotoUrl={OREL_IMAGE_URL}
          className={cn("!max-w-96 md:!max-w-[25rem] !w-[95%] self-center", {
            "brightness-75": !completedRandomPinky,
          })}
          title={title}
          day={currentDayOrel}
          disabled
          forceSound={completedRandomPinky}
          isCompleted={completedRandomPinky}
          partnersDetails={[
            {
              displayName: "Random Pinky",
              isSigned: true,
              isObligationCompleted: completedOrel,
            },
          ]}
          handleCompleteObligation={(day: string, completed: boolean): void => {
            handleCompleteObligation(day, title, completed, true);
          }}
        />
      </Device>
    </div>
  );
};

export default DummyObligationBox;
