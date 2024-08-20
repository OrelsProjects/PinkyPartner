import { useAppSelector } from "../../lib/hooks/redux";
import { cn } from "../../lib/utils";
import { UserAvatar } from "../ui/avatar";
import NotificationBadge from "../ui/notificationBadge";
import ObligationCheckbox from "./obligationCheckbox";

export const ObligationBox = ({
  day,
  dummy,
  index,
  title,
  emoji,
  loading,
  disabled,
  className,
  forceSound,
  isCompleted,
  userPhotoUrl,
  partnersDetails,
  isNewObligation,
  handleCompleteObligation,
}: {
  day: string;
  index: number;
  title: string;
  emoji?: string;
  dummy?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  forceSound?: boolean;
  isCompleted: boolean;
  isNewObligation?: boolean;
  partnersDetails?: {
    isPartnerSigned?: boolean;
    photoURL?: string | null;
    displayName?: string | null;
    isPartnerObligationCompleted?: boolean;
  }[];
  userPhotoUrl?: string | null; // For landing page
  handleCompleteObligation: (day: string, completed: boolean) => void;
}) => {
  const { user } = useAppSelector(state => state.auth);
 
  return (
    <div
      className={cn(
        "rounded-lg h-16 w-full bg-card p-px duration-500 transition-all relative",
        {
          "bg-card/50": isCompleted,
        },
        { "pointer-events-none": disabled },
        className,
      )}
      key={`obligation-in-contract-${day}`}
    >
      <div
        className={cn(
          "w-full h-full flex flex-row justify-between items-start gap-3  bg-card rounded-lg p-2",
        )}
      >
        {isNewObligation && (
          <NotificationBadge
            className="h-2.5 w-2.5  absolute -top-1 left-0.5 bg-primary bg-red-500 text-xs font-semibold rounded-full"
            count={1}
          />
        )}
        <div className="self-center flex flex-row gap-2">
          <ObligationCheckbox
            day={day}
            index={index}
            disabled={disabled}
            loading={loading}
            isCompleted={isCompleted}
            onCompletedChange={(day: string, checked: boolean) => {
              handleCompleteObligation(day, checked);
            }}
            dummy={dummy}
            forceSound={forceSound || dummy}
          />
          <div
            className={cn(
              "h-full flex flex-col gap-1 flex-shrink-1 items-start justify-center",
              {
                "opacity-50 line-through": isCompleted,
              },
            )}
          >
            <div className="h-full flex flex-row gap-3 justify-center items-center">
              <div
                className={cn(
                  "w-fit h-full text-card-foreground line-clamp-1 font-medium",
                )}
              >
                <div className="h-fit w-fit flex flex-col gap-0.5 flex-shrink">
                  <span
                    className={cn(
                      "transition-all  duration-500 line-clamp-1 w-fit",
                      {
                        "text-muted-foreground font-normal": isCompleted,
                      },
                    )}
                  >
                    {emoji} {title}
                  </span>
                  <span className="text-foreground text-sm font-thin">
                    {day}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="self-center flex flex-row gap-3 flex-shrink-0">
          <UserIndicator
            isSigned={true}
            photoURL={userPhotoUrl || user?.photoURL}
            displayName={user?.displayName}
            isObligationCompleted={isCompleted}
          />
          {partnersDetails &&
            partnersDetails.map(partnerDetails => (
              <UserIndicator
                key={partnerDetails.displayName}
                isSigned={partnerDetails.isPartnerSigned}
                photoURL={partnerDetails.photoURL}
                displayName={partnerDetails.displayName}
                isObligationCompleted={
                  partnerDetails.isPartnerObligationCompleted
                }
              />
            ))}
        </div>
      </div>
    </div>
  );
};

const UserIndicator = ({
  isSigned,
  photoURL,
  displayName,
  isObligationCompleted,
}: {
  isSigned?: boolean;
  photoURL?: string | null;
  displayName?: string | null;
  isObligationCompleted?: boolean;
}) => {
  if (!displayName && !photoURL) return null;
  const text = isSigned
    ? isObligationCompleted
      ? "Done"
      : "Waiting"
    : "Not signed";

  return (
    <div className="w-16ו flex flex-col justify-center items-center gap-0.5 transition-all">
      <UserAvatar
        displayName={displayName}
        photoURL={photoURL}
        className={cn(
          "h-9 w-9",
          {
            "border-2 border-green-500 rounded-full": isObligationCompleted,
          },
          { "opacity-50": !isSigned },
        )}
      />
      <span
        className={cn("text-[10px] font-thin text-muted-foreground", {
          "text-muted-foreground/60": !isSigned,
        })}
      >
        {text}
      </span>
    </div>
  );
};
