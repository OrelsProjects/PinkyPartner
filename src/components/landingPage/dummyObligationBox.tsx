import React, { useState } from "react";
import { ObligationBox } from "../contractObligations/contractObligation";
import DeviceMockup from "../ui/deviceMockup";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { FaArrowRightLong } from "react-icons/fa6";

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

export interface NotificationMockupProps {
  title: string;
  body: string;
  image?: string;
  state?: "show" | "hide" | "idle";
}

const NotificationMockup: React.FC<NotificationMockupProps> = ({
  title,
  body,
  image,
  state,
}) => {
  return (
    // Make it appear like a notification, with animation from top to bottom and shadow
    <AnimatePresence>
      {state === "show" && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative w-11/12 h-16 flex flex-col gap-0 justify-center items-center rounded-xl bg-black/35 notification-shadow px-2 pt-2 select-none"
        >
          <div className="w-full text-white/40 text-[10px] font-medium text-end mt-1.5">
            now
          </div>
          <div className="w-full h-full flex flex-row items-start ">
            {image && (
              <Image
                src={image}
                alt="notification"
                fill
                layout="fill"
                objectFit="cover"
                objectPosition="center"
                className="rounded-[1.75rem] z-0 !relative !h-8 !w-8"
              />
            )}
            <div className="w-fit flex-shrink h-16 flex flex-col gap-0 px-2 pt-0.5">
              <span className="text-xs font-semibold truncate">{title}</span>
              <span className="text-xs">{body}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Device = ({
  ios15,
  children,
  notifications,
  ownerPhotoUrl,
  notificationPhotoUrl,
}: {
  ios15?: boolean;
  ownerPhotoUrl: string;
  children?: React.ReactNode;
  notificationPhotoUrl: string;
  notifications: NotificationMockupProps[];
}) => (
  <div className="flex flex-col gap-2 items-center relative">
    <DeviceMockup
      ownerPhotoUrl={ownerPhotoUrl}
      ios15={ios15}
      className="!overflow-visible"
    >
      <div className="w-full h-full flex flex-col gap-1 justify-start items-center z-30 overflow-visible mt-10">
        {children}
      </div>
      {notifications?.map((notification, index) => (
        <NotificationMockup
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

  const [triedOrel, setTriedOrel] = useState<boolean>(false);
  const [triedRandom, setTriedRandom] = useState<boolean>(false);

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
  const [disabled, setDisabled] = useState<boolean>(false);
  const [disabledOrel, setDisabledOrel] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [completedOrel, setCompletedOrel] = useState<boolean>(false);

  const handleCompleteObligation = (
    day: string,
    title: string,
    completed: boolean,
    isOrelSource?: boolean,
  ): void => {
    if (isOrelSource) {
      setTriedOrel(true);
      setCompleted(completed);
      setDisabled(true);
    } else {
      setTriedRandom(true);
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
    const newTitles = titles.filter(t => t !== title);

    setTimeout(() => {
      if (isOrelSource) {
        setCurrentDay(newDays[Math.floor(Math.random() * newDays.length)]);
        setTitle(newTitles[Math.floor(Math.random() * newTitles.length)]);
        setCompleted(false);
        setDisabled(false);
      } else {
        setCurrentDayOrel(newDays[Math.floor(Math.random() * newDays.length)]);
        setTitleOrel(newTitles[Math.floor(Math.random() * newTitles.length)]);
        setCompletedOrel(false);
        setDisabledOrel(false);
      }
    }, 3300);

    setTimeout(() => {
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
    }, 3000);
  };

  return (
    <div className="h-full w-fit hidden md:flex flex-row-reverse justify-start gap-32">
      <Device
        ios15
        notifications={notificationsOrel}
        ownerPhotoUrl="/PP-round.png"
        notificationPhotoUrl={OREL_IMAGE_URL}
      >
        <div className="w-fit absolute -right-36 mt-5  flex flex-row justify-start gap-3">
          <div>
            <FaArrowRightLong className="text-3xl text-primary rotate-180" />
          </div>
          <motion.span
            // shake animation (rotate left and right)
            animate={{
              rotate: triedRandom
                ? []
                : [0, 10, 0, -10, 0, 10, 0, 10, 0, 10, 0, 10, 0, 10, 0, 10, 0],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatDelay: 2.5, // Waits for 2 seconds before repeating
              ease: "linear",
            }}
            className="text-xl"
          >
            Try me
          </motion.span>
        </div>
        <ObligationBox
          index={0}
          className="!max-w-96 md:!max-w-[25rem] !w-[95%] self-center"
          title={titleOrel}
          day={currentDayOrel}
          disabled={disabledOrel}
          isCompleted={completedOrel}
          partnerDetails={{
            photoURL: OREL_IMAGE_URL,
            displayName: "Orel Zilberman",
            isPartnerSigned: true,
            isPartnerObligationCompleted: false,
          }}
          handleCompleteObligation={(day: string, completed: boolean): void => {
            handleCompleteObligation(day, titleOrel, completed, false);
          }}
        />
      </Device>
      <Device
        notifications={notificationsRandom}
        ownerPhotoUrl={OREL_IMAGE_URL}
        notificationPhotoUrl="/PP-round.png"
      >
        <div className="w-fit absolute -left-36 mt-5  flex flex-row-reverse justify-start gap-3">
          <div>
            <FaArrowRightLong className="text-3xl text-primary" />
          </div>
          <motion.span
            // shake animation (rotate left and right)
            animate={{
              rotate: triedOrel
                ? []
                : [0, 10, 0, -10, 0, 10, 0, 10, 0, 10, 0, 10, 0, 10, 0, 10, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2.5, // Waits for 2 seconds before repeating
              ease: "linear",
            }}
            className="text-xl"
          >
            Try me
          </motion.span>
        </div>
        <ObligationBox
          index={0}
          userPhotoUrl={OREL_IMAGE_URL}
          className="!max-w-96 md:!max-w-[25rem] !w-[95%] self-center"
          title={title}
          day={currentDay}
          disabled={disabled}
          isCompleted={completed}
          partnerDetails={{
            displayName: "Random Pinky",
            isPartnerSigned: true,
            isPartnerObligationCompleted: false,
          }}
          handleCompleteObligation={(day: string, completed: boolean): void => {
            handleCompleteObligation(day, title, completed, true);
          }}
        />
      </Device>
    </div>
  );
};

export default DummyObligationBox;
