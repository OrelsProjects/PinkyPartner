import React, { useEffect, useState } from "react";
import { ObligationBox } from "../contractObligations/contractObligation";
import DeviceMockup from "../ui/deviceMockup";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { FaArrowRightLong } from "react-icons/fa6";

const OREL_IMAGE_URL =
  "https://lh3.googleusercontent.com/a/ACg8ocJuQcn9RGs6JLIUTa4TJzH4CQKVQatTZE4zIlMqxe9ec8wlXJttvA=s96-c";

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
  notifications,
  children,
}: {
  notifications: NotificationMockupProps[];
  children?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-2 items-center">
    <DeviceMockup ownerPhotoUrl={OREL_IMAGE_URL}>
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

  const handleCompleteObligation = (day: string, completed: boolean): void => {
    setCompleted(completed);
    setDisabled(true);

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
    <div className="h-full w-full flex flex-col-reverse justify-start gap-14">
      <div className="flex flex-row gap-1 relative justify-center items-center">
        <div className="w-fit absolute -top-[2rem] md:top-5 md:-left-[6.25rem] flex flex-row-reverse md:flex-row justify-end md:justify-start gap-2">
          <motion.span
            // shake animation (rotate left and right)
            animate={{
              rotate: [
                0, 10, 0, -10, 0, 10, 0, 10, 0, 10, 0, 10, 0, 10, 0, 10, 0,
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 4, // Waits for 2 seconds before repeating
              ease: "linear",
            }}
          >
            Try me
          </motion.span>
          <div>
            <FaArrowRightLong className="text-2xl text-primary rotate-90 md:rotate-0" />
          </div>
        </div>
        <ObligationBox
          index={0}
          title={title}
          day={currentDay}
          className="!max-w-96 md:!max-w-[27rem] !w-11/12 md:!w-full self-center"
          disabled={disabled}
          isCompleted={completed}
          partnerDetails={{
            photoURL: OREL_IMAGE_URL,
            displayName: "Orel Zilberman",
            isPartnerSigned: true,
            isPartnerObligationCompleted: false,
          }}
          handleCompleteObligation={(day: string, completed: boolean): void => {
            handleCompleteObligation(day, completed);
          }}
        />
      </div>
      <Device notifications={notifications} />
    </div>
  );
};

export default DummyObligationBox;
