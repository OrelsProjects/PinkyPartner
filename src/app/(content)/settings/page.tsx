"use client";

import React, { useState } from "react";
import { useAppSelector } from "../../../lib/hooks/redux";
import Divider from "../../../components/ui/divider";
import { Button } from "../../../components/ui/button";
import useAuth from "../../../lib/hooks/useAuth";
import { toast } from "react-toastify";
import InvitePartnerComponent from "../../../components/invitePartnerComponent";
import { ThemeToggle } from "../../../components/theme-toggle";

interface SettingsProps {}

const SettingsButton: React.FC<SettingsProps> = () => {
  const { user } = useAppSelector(state => state.auth);
  const { deleteUser, signOut } = useAuth();
  const [deleteUserRequest, setDeleteUserRequest] = useState(false);

  const handleDeleteUserRequest = async () => {
    // Show alert that asks the user to insert their email. If email correct, delete user.
    // If email incorrect, show error message.
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
      alert("Email is incorrect");
    }
  };

  const handleSignOut = async () => {
    toast.promise(signOut(), {
      pending: "Signing out...",
      success: "Signed out",
      error: "Failed to sign out",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row justify-between items-center">
        <span className="text-xl font-semibold">{user?.email}</span>
      </div>
      <Divider />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-lg font-semibold">Appearance</span>
          <div className="pl-2">
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-lg font-semibold">Notifications</span>
          <span className="text-base-content/75 pl-2">
            Manage notifications and reminders
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-lg font-semibold">Partners</span>
          <div className="pl-2">
            <InvitePartnerComponent
              variant="default"
              buttonText="Invite a partner"
              referralCode={user?.meta?.referralCode}
              className="text-base w-fit px-2"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full justify-start">
          <span className="text-lg font-semibold">Account</span>
          <div className="flex flex-col gap-1 pl-2">
            <Button
              variant="ghost"
              className="w-fit !px-0"
              onClick={handleSignOut}
            >
              LOGOUT
            </Button>
            <Button
              variant="ghost"
              className="w-fit !px-0"
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

export default SettingsButton;
