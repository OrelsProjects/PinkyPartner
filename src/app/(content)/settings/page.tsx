"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../lib/hooks/redux";
import Divider from "../../../components/ui/divider";
import { Button } from "../../../components/ui/button";
import useAuth from "../../../lib/hooks/useAuth";
import { toast } from "react-toastify";
import InvitePartnerComponent from "../../../components/invitePartnerComponent";
import { ThemeToggle } from "../../../components/theme-toggle";
import { EventTracker } from "../../../eventTracker";
import { Switch } from "../../../components/ui/switch";
import axios from "axios";
import useNotifications from "../../../lib/hooks/useNotifications";
import { updateUserSettings } from "../../../lib/features/auth/authSlice";
import { canUseNotifications } from "../../../lib/utils/notificationUtils";
import { Input } from "../../../components/ui/input";
import { HiPencil } from "react-icons/hi2";
import { FaCheck } from "react-icons/fa6";
import { MdOutlineCancel } from "react-icons/md";
import Loading from "../../../components/ui/loading";

interface SettingsProps {}

const UpdateUserPreferredName = ({
  value,
  onBlur,
  onSave,
  loading,
  onChange,
}: {
  value?: string;
  loading?: boolean;
  onBlur?: () => void;
  onSave: (value?: string) => void;
  onChange: (value: string) => void;
}) => {
  return (
    <form
      className="flex flex-row gap-4 items-center"
      onSubmit={e => {
        e.preventDefault();
        onSave(value);
      }}
    >
      <Input
        className="w-48"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <div className="flex flex-row gap-2">
        <Button
          variant="ghost"
          type="submit"
          onClick={e => {
            e.stopPropagation();
            onSave(value);
          }}
        >
          {loading ? (
            <Loading spinnerClassName="h-5 w-5 fill-foreground" />
          ) : (
            <FaCheck className="text-foreground text-xl" />
          )}
        </Button>
        <Button variant="ghost" onClick={onBlur}>
          <MdOutlineCancel className="text-foreground text-xl" />
        </Button>
      </div>
    </form>
  );
};

const SettingsScreen: React.FC<SettingsProps> = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { deleteUser, signOut, updateUserDisplayName } = useAuth();

  const { initNotifications: initUserToken, requestNotificationsPermission } =
    useNotifications();

  const [settings, setSettings] = useState(
    user?.settings || {
      showNotifications: false,
      soundEffects: true,
    },
  );

  const [editName, setEditName] = useState(false);
  const [newPreferredName, setNewPreferredName] = useState(user?.displayName);
  const [loadingName, setLoadingName] = useState(false);

  const changeNotificationTimeout = useRef<NodeJS.Timeout | null>(null);

  const isNotificationsGranted =
    canUseNotifications() && Notification.permission === "granted";

  useEffect(() => {
    if (user) {
      setSettings({ ...user?.settings });
      setNewPreferredName(user?.displayName);
    }
  }, [user]);

  const updateSoundSettings = (soundEffects: boolean) => {
    setSettings({ ...settings, soundEffects });
    try {
      axios.patch("/api/user/settings", { soundEffects });
      dispatch(updateUserSettings({ soundEffects }));
    } catch (e) {
      toast.error("Failed to update sound settings");
      setSettings({ ...settings, soundEffects: !soundEffects });
    }
  };

  const updateNotificationSettings = (showNotifications: boolean) => {
    if (changeNotificationTimeout.current) {
      clearTimeout(changeNotificationTimeout.current);
    }
    setSettings({ ...settings, showNotifications });

    changeNotificationTimeout.current = setTimeout(async () => {
      changeNotificationTimeout.current = null;
      try {
        await axios.patch("/api/user/settings", { showNotifications });
        if (showNotifications) {
          await initUserToken();
        }
        dispatch(updateUserSettings({ showNotifications }));
      } catch (e) {
        toast.error("Failed to update notification settings");
        setSettings({ ...settings, showNotifications: !showNotifications });
      }
    }, 1000);
  };

  const handleDeleteUserRequest = async () => {
    // Show alert that asks the user to insert their email. If email correct, delete user.
    // If email incorrect, show error message.
    EventTracker.track("delete_user_request");
    const email = prompt(
      `Please enter your email (${user?.email}) to confirm deletion`,
    );
    if (email === user?.email) {
      toast.promise(deleteUser(), {
        pending: "Deleting user...",
        success: "User deleted",
        error: "Failed to delete user",
      });
    } else {
      if (email) {
        alert("Email is incorrect");
      }
    }
  };

  const handleSignOut = async () => {
    EventTracker.track("sign_out");
    toast.promise(signOut(), {
      pending: "Signing out...",
      success: "Signed out",
      error: "Failed to sign out",
    });
  };

  return (
    <div className="flex flex-col gap-4 mt-3">
      <div className="flex flex-row gap-4 items-center">
        {editName ? (
          <UpdateUserPreferredName
            value={newPreferredName || ""}
            onChange={value => {
              setNewPreferredName(value);
            }}
            onBlur={() => {
              setEditName(false);
              setNewPreferredName(user?.displayName);
            }}
            loading={loadingName}
            onSave={value => {
              setLoadingName(true);
              if (value) {
                updateUserDisplayName(value)
                  .catch(() => {
                    toast.error("Failed to update name.. try again?");
                    setNewPreferredName(user?.displayName);
                  })
                  .finally(() => {
                    setEditName(false);
                    setLoadingName(false);
                  });
              }
            }}
          />
        ) : (
          <>
            <span className="text-xl font-semibold">{user?.displayName}</span>
            <Button
              variant="ghost"
              onClick={() => {
                setEditName(true);
              }}
            >
              <HiPencil className="text-foreground cursor-pointer text-xl" />
            </Button>
          </>
        )}
      </div>
      <Divider />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-lg font-semibold">Appearance</span>
          <div className="pl-2">
            <ThemeToggle />
          </div>
        </div>
        {canUseNotifications() && (
          <div className="flex flex-col gap-2">
            <span className="text-lg font-semibold">Notifications</span>
            <div className="pl-2">
              {isNotificationsGranted ? (
                <Switch
                  className="w-10"
                  onCheckedChange={updateNotificationSettings}
                  checked={settings.showNotifications}
                />
              ) : (
                <Button
                  variant="default"
                  className="w-fit px-2"
                  onClick={() => {
                    requestNotificationsPermission().then(granted => {
                      if (granted) {
                        updateNotificationSettings(true);
                      }
                    });
                  }}
                >
                  Enable notifications
                </Button>
              )}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <span className="text-lg font-semibold">Sounds</span>
          <div className="pl-2">
            <Switch
              className="w-10"
              checked={settings.soundEffects}
              onCheckedChange={updateSoundSettings}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-lg font-semibold">Partners</span>
          <div className="pl-2">
            <InvitePartnerComponent
              variant="default"
              buttonText="Invite a partner"
              referralCode={user?.meta?.referralCode}
              className="w-fit px-2"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full justify-start">
          <span className="text-lg font-semibold">Account</span>
          <div className="flex flex-col gap-1 pl-2">
            <Button
              variant="ghost"
              className="w-fit px-1 md:hover:bg-slate-400/40"
              onClick={handleSignOut}
            >
              LOGOUT
            </Button>
            <Button
              variant="link"
              className="w-fit px-1 md:hover:bg-destructive/40 md:hover:text-destructive-foreground hover:no-underline text-destructive/60 text-sm"
              onClick={handleDeleteUserRequest}
            >
              DELETE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
