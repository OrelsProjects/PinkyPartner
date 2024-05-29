export const canUseNotifications = () => {
  return (
    ("Notification" in window || "PushManager" in window) &&
    "serviceWorker" in navigator
  );
};
