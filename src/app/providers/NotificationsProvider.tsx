"use client";

import React, { useEffect } from "react";
import { messaging } from "../../../firebase.config";
import { Messaging, onMessage } from "firebase/messaging";
import useNotifications from "../../lib/hooks/useNotifications";
import { useAppDispatch, useAppSelector } from "../../lib/hooks/redux";
import { usePathname } from "next/navigation";
import {
  setNewObligations,
  setNewContracts,
  setShownContractNotification,
  NotificationType,
} from "../../lib/features/notifications/notificationsSlice";
import RequestPermissionDialog, {
  PermissionType,
} from "../../components/requestPermissionDialog";
import useOnboarding from "../../lib/hooks/useOnboarding";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { toast } from "react-toastify";
import { canUseNotifications } from "../../lib/utils/notificationUtils";

const MIN_DELAY_BETWEEN_NOTIFICATIONS = 1000 * 60; // 1 minute

const NotificationsProvider = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { newContracts, newObligations, didShowContractNotification } =
    useAppSelector(state => state.notifications);
  const {
    partnerData: { contractObligations: partnerContractObligations },
  } = useAppSelector(state => state.obligations);
  const { contracts } = useAppSelector(state => state.contracts);
  const { user, state } = useAppSelector(state => state.auth);

  const { onboardingState, isOnboardingCompleted } = useOnboarding();
  const {
    initNotifications: initUserToken,
    showNotification,
    isPermissionGranted,
    didRequestPermission,
    markContractsAsViewed,
    setPermissionRequested,
    markObligationsAsViewed,
    requestNotificationsPermission,
  } = useNotifications();

  const lastShownNewContractsNotification = React.useRef<number>(0);
  const lastShownNewObligationsNotification = React.useRef<number>(0);

  const [showRequestPermissionDialog, setShowRequestPermissionDialog] =
    React.useState(false);
  const [showPermissionNotGrantedDialog, setShowPermissionNotGrantedDialog] =
    React.useState(false);

  const init = async (messaging: Messaging) => {
    await initUserToken();

    // onMessage(messaging, payload => {
    //   showNotification({
    //     title: payload.data?.title ?? "",
    //     body: payload.data?.body ?? "",
    //     image: payload.data?.image ?? "",
    //     type: (payload.data?.type as NotificationType) || "contract",
    //   });
    // });
  };

  useEffect(() => {
    const shouldShowRequestPermissionDialog =
      canUseNotifications() &&
      !didRequestPermission() &&
      (onboardingState === "completed" || isOnboardingCompleted()) &&
      !isPermissionGranted();
    setShowRequestPermissionDialog(shouldShowRequestPermissionDialog);
  }, [onboardingState, user]);

  useEffect(() => {
    if (messaging) {
      init(messaging);
    }
  }, [messaging]);

  useEffect(() => {
    let promise: Promise<void> | null = null;
    switch (pathname) {
      case "/contracts":
        promise = markContractsAsViewed();
        break;
      case "/home":
        promise = markObligationsAsViewed();
        break;
    }
    if (promise) {
      setTimeout(async () => {
        await promise;
      }, 3000);
    }
  }, [newContracts, newObligations]);

  useEffect(() => {
    if (partnerContractObligations.length > 0) {
      const newObligations =
        partnerContractObligations.filter(obligation => !obligation.viewedAt) ||
        [];
      dispatch(setNewObligations(newObligations));

      if (newObligations.length > 0 && canShowObligationsNotification()) {
        lastShownNewObligationsNotification.current = Date.now();
      }
    }
  }, [partnerContractObligations]);

  useEffect(() => {
    if (contracts) {
      const newContracts = contracts.filter(
        contract =>
          !contract.signatures.some(
            signature => signature?.userId === user?.userId,
          ) && contract.viewedAt,
      );

      dispatch(setNewContracts(newContracts));
      setTimeout(() => {
        if (newContracts.length > 0 && canShowContractsNotification()) {
          dispatch(setShownContractNotification(true));
          lastShownNewContractsNotification.current = Date.now();
          const contractees = newContracts.map(contract =>
            contract.contractees.find(
              contractee => contractee?.userId !== user?.userId,
            ),
          );
        }
      }, 3000);
    }
  }, [contracts]);

  const onCloseRequestPermissionDialog = async (
    permission?: PermissionType,
  ) => {
    if (permission) {
      const granted = await requestNotificationsPermission();
      setPermissionRequested();
      setShowRequestPermissionDialog(false);
      if (granted) {
        const toastId = toast.loading("Saving your pinky...");
        await initUserToken();
        toast.dismiss(toastId);
        toast("You're all set! 🎉");
      } else {
        setShowPermissionNotGrantedDialog(true);
      }
    } else {
      setPermissionRequested();
      setShowRequestPermissionDialog(false);
      setShowPermissionNotGrantedDialog(true);
    }
  };

  const canShowContractsNotification = () => {
    if (didShowContractNotification) return false;
    const now = Date.now();
    const timeSinceLastNotification =
      now - lastShownNewContractsNotification.current;
    return timeSinceLastNotification > MIN_DELAY_BETWEEN_NOTIFICATIONS;
  };

  const canShowObligationsNotification = () => {
    const now = Date.now();
    const timeSinceLastNotification =
      now - lastShownNewObligationsNotification.current;
    return timeSinceLastNotification > MIN_DELAY_BETWEEN_NOTIFICATIONS;
  };
  
  return (
    <>
      <RequestPermissionDialog
        open={showRequestPermissionDialog && state === "authenticated"}
        onClose={onCloseRequestPermissionDialog}
        onEnablePermission={onCloseRequestPermissionDialog}
        permission="notifications"
      />

      <Dialog
        open={showPermissionNotGrantedDialog}
        onOpenChange={value => {
          if (!value) {
            setShowPermissionNotGrantedDialog(false);
          }
        }}
      >
        <DialogContent>
          <DialogTitle>We respect your choice.</DialogTitle>
          <DialogDescription>
            You can enable notifications at any time in the settings :)
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => setShowPermissionNotGrantedDialog(false)}>
              Thanks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationsProvider;
