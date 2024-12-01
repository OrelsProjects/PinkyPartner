export type PermissionType = "notifications";

export type NotificationType = "contract" | "obligation" | "nudge" | "response" | "daily-reminder";

export type NotificationData = {
  title: string;
  type: NotificationType;
  body?: string;
  image?: string;
  onClick?: () => void;
};
