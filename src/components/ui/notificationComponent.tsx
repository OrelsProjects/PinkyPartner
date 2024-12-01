"use client";
import React from "react";
import { NotificationData } from "@/lib/models/notification";

interface NotificationComponentProps {
  notification: NotificationData;
}

const NotificationComponent: React.FC<NotificationComponentProps> = ({
  notification,
}) => {
  return (
    <div onClick={notification.onClick} className="w-full h-full flex flex-row">
      <div className="flex flex-col gap-0.5 w-fit h-full">
        <p className="text-lg font-medium line-clamp-1">{notification.title}</p>
        <p className="text-small line-clamp-1 font-light">
          {notification.body}
        </p>
      </div>
    </div>
  );
};

export default NotificationComponent;
