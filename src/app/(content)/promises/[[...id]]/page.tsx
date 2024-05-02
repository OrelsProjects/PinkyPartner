"use client";

import React, { useEffect, useMemo, useState } from "react";
import Obligation, {
  CreateObligation,
  Days,
  TimesAWeek,
} from "../../../../models/obligation";
import { useObligations } from "../../../../lib/hooks/useObligations";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { MdOutlineEmojiEmotions as EmojiIcon } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { Button } from "../../../../components/ui/button";
import {
  DialogFooter,
  DialogTrigger,
  Dialog,
  DialogContent,
} from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import ObligationComponent, {
  ObligationComponentLoading,
} from "../../../../components/obligationComponent";
import { useRouter } from "next/navigation";
import IntervalDropdown from "../../../../components/ui/dropdowns/intervalDropdown";
import { Checkbox } from "../../../../components/ui/checkbox";
import TimesAWeekDropdown from "../../../../components/ui/dropdowns/timesAWeekDropdown";
import { useTheme } from "next-themes";
import { DaysToText } from "../../../../lib/utils/dateUtils";
import { cn } from "../../../../lib/utils";
import { motion } from "framer-motion";
import { useContracts } from "../../../../lib/hooks/useContracts";
import { useAppSelector } from "../../../../lib/hooks/redux";

interface ObligationProps {
  params: {
    id?: string;
  };
}

const isFirstObligationView = (): boolean => {
  const isFirstObligationCreated = localStorage.getItem(
    "isFirstObligationCreated",
  );
  return isFirstObligationCreated === "true";
};

const setIsFirstObligationView = () => {
  localStorage.setItem("isFirstObligationCreated", "true");
};

const Weekly = ({
  onChange,
  obligation,
}: {
  onChange: (timesAWeek: TimesAWeek) => void;
  obligation?: Obligation;
}) => {
  const [selected, setSelected] = useState<TimesAWeek>(
    (obligation?.timesAWeek as TimesAWeek) || 1,
  );

  useEffect(() => {
    onChange(selected);
  }, [selected]);

  return (
    <div className="flex flex-row gap-2 justify-center items-center">
      <TimesAWeekDropdown
        defaultValue={(obligation?.timesAWeek as TimesAWeek) || 1}
        onSelect={(timesAWeek: TimesAWeek) => {
          setSelected(timesAWeek);
        }}
      />
      <div className="text-muted-foreground">per week</div>
    </div>
  );
};

const Daily = ({
  onChange,
  days,
  showRepeatText = true,
}: {
  onChange: (days: number[]) => void;
  days?: number[];
  showRepeatText?: boolean;
}) => {
  const formik = useFormik<Record<string, boolean>>({
    initialValues: {
      sunday: days ? days.includes(0) : true,
      monday: days ? days.includes(1) : true,
      tuesday: days ? days.includes(2) : true,
      wednesday: days ? days.includes(3) : true,
      thursday: days ? days.includes(4) : true,
      friday: days ? days.includes(5) : true,
      saturday: days ? days.includes(6) : true,
    },
    onSubmit: _ => {},
  });

  useEffect(() => {
    const days: number[] = [];
    if (formik.values.sunday) days.push(0);
    if (formik.values.monday) days.push(1);
    if (formik.values.tuesday) days.push(2);
    if (formik.values.wednesday) days.push(3);
    if (formik.values.thursday) days.push(4);
    if (formik.values.friday) days.push(5);
    if (formik.values.saturday) days.push(6);

    onChange(days);
  }, [formik.values]);

  return (
    <div className="flex flex-col h-fit w-full gap-0.5">
      <div className="flex flex-row justify-between items-start h-fit w-full gap-3">
        {Object.keys(formik.values).map((day, index) => (
          <div
            key={index}
            className="flex flex-col justify-start items-center text-muted-foreground"
          >
            <Checkbox
              className="w-7 md:w-8 h-10 md:h-11"
              defaultChecked={formik.values[day]}
              checked={formik.values[day]}
              onCheckedChange={checked => formik.setFieldValue(day, checked)}
              variant="outline"
            />
            <div>{day[0].toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RepeatText = ({
  days,
  timesAWeek,
}: {
  days?: number[];
  timesAWeek?: number | null;
}) => {
  return (
    <div className="text-muted-foreground font-light flex flex-row gap-1 text-sm">
      {days ? (
        <>
          <div className="font-normal">Practice every:</div>
          {DaysToText(days)}
        </>
      ) : (
        <div className="font-normal">Practice {timesAWeek} times a week</div>
      )}
    </div>
  );
};

const SectionContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full flex flex-col items-start gap-3 h-fit rounded-lg">
    {children}
  </div>
);

const SectionTitleContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col gap-0 items-start justify-start">
    {children}
  </div>
);

const SectionTitle = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => (
  <Label
    className={cn(
      "text-right text-base md:text-lg font-normal tracking-wide",
      className,
    )}
  >
    {text}
  </Label>
);

const SectionTitleExplanation = ({ text }: { text: string }) => (
  <div className="text-xs font-thin">{text}</div>
);

const PromiseDialog = ({
  obligation,
  onCreate,
  onEdit,
  disabled = false,
  open,
  onOpenChange,
  onCreateNewClick,
}: {
  obligation?: Obligation | null;
  onCreate?: (data: CreateObligation) => Promise<void>;
  onEdit?: (data: Obligation) => Promise<void>;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (state: boolean) => void;
  onCreateNewClick?: () => void;
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { theme } = useTheme();

  const formik = useFormik<Omit<CreateObligation, "userId">>({
    initialValues: {
      title: obligation ? obligation.title : "",
      description: obligation ? obligation.description : "",
      emoji: obligation ? obligation.emoji : "",
      repeat: obligation ? obligation.repeat : "Daily",
      days: (obligation?.days as Days) || [],
      timesAWeek: obligation?.timesAWeek as TimesAWeek,
    },
    onSubmit: values => {
      if (values.repeat === "Daily" && values.days.length === 0) {
        toast.info("Don't forget to select the days!");
        formik.setErrors({ repeat: "Select days" });
        return;
      }
      if (obligation) {
        onEdit?.({ ...obligation, ...values });
      } else {
        onCreate?.(values);
      }
    },
  });

  useEffect(() => {
    if (obligation) {
      formik.setValues({
        title: obligation.title,
        description: obligation.description,
        emoji: obligation.emoji,
        repeat: obligation.repeat,
        days: obligation.days || [],
        timesAWeek: obligation.timesAWeek,
      });
    } else {
      formik.resetForm();
      formik.values.emoji = "🤝";
    }
  }, [obligation]);

  return (
    <Dialog
      open={open}
      onOpenChange={state => {
        onOpenChange?.(state);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-2xl flex justify-center items-center p-2"
          onClick={_ => {
            onCreateNewClick?.();
          }}
        >
          <FaPlus className="w-5 h-5 fill-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-5/6 sm:max-w-[525px] sm:h-[525px] bg-card p-6">
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col justify-start items-start w-full gap-4"
        >
          <SectionContainer>
            <SectionTitleContainer>
              <SectionTitle
                text="I pinky promise to:"
                className="font-semibold"
              />
              <SectionTitleExplanation text="Write the habit you would like start practicing" />
            </SectionTitleContainer>

            <Input
              id="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              placeholder="i.e, Run, Drink water, Read"
              error={formik.errors.title}
              maxLength={24}
              className="h-11 rounded-md w-full"
              required
            />
          </SectionContainer>
          <SectionContainer>
            <SectionTitleContainer>
              <SectionTitle text="Repeat" />
              <SectionTitleExplanation text="Choose how often you'd like to practice the new habit" />
            </SectionTitleContainer>

            <RepeatText
              days={formik.values.days}
              timesAWeek={formik.values.timesAWeek}
            />
            <div
              className={cn(
                "flex flex-col md:flex-row gap-3 justify-start items-start",
                {
                  "!flex-row": formik.values.repeat === "Weekly",
                },
              )}
            >
              <IntervalDropdown
                onSelect={value => {
                  formik.setFieldValue("repeat", value);
                }}
                className="h-10"
                error={formik.errors.repeat}
              />
              <div className="flex flex-col items-start gap-2 w-fit h-fit rounded-lg">
                {formik.values.repeat === "Weekly" && (
                  <Weekly
                    onChange={timesAWeek =>
                      formik.setFieldValue("timesAWeek", timesAWeek)
                    }
                    obligation={obligation ?? undefined}
                  />
                )}
                {formik.values.repeat === "Daily" && (
                  <Daily
                    onChange={days => formik.setFieldValue("days", days)}
                    days={obligation?.days}
                  />
                )}
              </div>
            </div>
          </SectionContainer>

          <SectionContainer>
            <SectionTitle text="Now choose the perfect icon!"></SectionTitle>
            <Button
              className="w-20 h-12 bg-card"
              variant={"outline"}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                setShowEmojiPicker(true);
              }}
            >
              {formik.values.emoji ? (
                <div className="text-3xl">{formik.values.emoji}</div>
              ) : (
                <EmojiIcon className="w-8 h-8 fill-muted-foreground" />
              )}
            </Button>
          </SectionContainer>
          <DialogFooter className="w-full">
            <div className="w-full flex flex-col justify-end items-end">
              <Button
                type="submit"
                disabled={disabled}
                className="px-12 !py-5 rounded-[5px]"
              >
                {obligation ? "I repromise" : "I promise"}
              </Button>
            </div>
          </DialogFooter>
        </form>
        {open && showEmojiPicker && (
          <div className="h-full w-full absolute bottom-0 left-0">
            <div
              className="absolute w-full h-full z-10 bg-black/50 inset-0"
              onClick={() => setShowEmojiPicker(false)}
            />
            <div className="absolute bottom-0 left-0 !w-full h-4/6 z-50">
              <EmojiPicker
                theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                // searchDisabled
                skinTonesDisabled
                lazyLoadEmojis={true}
                previewConfig={{
                  showPreview: false,
                }}
                className="!w-full !h-full"
                onEmojiClick={emojiObject => {
                  formik.setFieldValue("emoji", emojiObject.emoji);
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const NoContractsDialog = () => {
  const router = useRouter();
  useEffect(() => {
    setIsFirstObligationView();
  }, []);
  return (
    <Dialog
      open={true}
      onOpenChange={open => {
        debugger;
        if (!open) {
          setIsFirstObligationView();
        }
      }}
    >
      <DialogContent className="w-5/6 sm:max-w-[450px] sm:h-[450px] bg-card p-6">
        <div className="w-full h-full flex flex-col justify-center items-center gap-3">
          <h1 className="text-xl font-semibold">
            Seems like your pinky is ready to meet another pinky.. 😉
          </h1>
          <div className="w-full flex justify-center items-center flex-col">
            <Button
              onClick={() => {
                setIsFirstObligationView();
                router.push("/contracts/new");
              }}
              className="bg-primary text-white"
            >
              Make it official!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ObligationPage: React.FC<ObligationProps> = ({ params }) => {
  const router = useRouter();
  const {
    getUserObligation,
    createObligation,
    updateObligation,
    obligations,
    loadingData,
  } = useObligations();
  const { contracts } = useAppSelector(state => state.contracts);
  const [obligation, setObligation] = useState<Obligation | undefined | null>(
    null,
  );
  const [showDialog, setShowDialog] = useState<boolean | undefined>();

  useEffect(() => {
    if (loadingData) return;
    if (params.id && params.id.length > 0) {
      const obligationId = params.id[0];
      if (obligationId !== "new") {
        setTimeout(() => {
          const obligation = getUserObligation(params?.id?.[0] ?? "");
          if (!obligation) router.push("/promises");
          setObligation(obligation);
          setShowDialog(true);
        }, 300); // Hack to let the data load
      } else {
        setShowDialog(true);
      }
    }
  }, [params, params.id, loadingData]);

  useEffect(() => {
    if (obligation) {
      setShowDialog(true);
    }
  }, [obligation]);

  const handleOnOpenChange = (state: boolean) => {
    if (!state) {
      router.push("/promises");
      setObligation(null);
    }
    setShowDialog(state);
  };

  const handleOnCreateNewClick = () => {
    setObligation(null);
    router.push("/promises/new");
  };

  const hideDialog = () => {
    setShowDialog(false);
    router.push("/promises");
  };

  const handleCreateObligation = async (data: CreateObligation) => {
    toast.promise(createObligation(data), {
      pending: "Creating obligation...",
      success: {
        render() {
          hideDialog();
          return "Obligation created!";
        },
      },
      error: "Failed to create obligation",
    });
  };

  const handleUpdateObligation = async (data: Obligation) => {
    toast.promise(updateObligation(data), {
      pending: "Updating obligation...",
      success: {
        render() {
          hideDialog();
          return "Obligation updated!";
        },
      },
      error: "Failed to update obligation",
    });
  };

  const handleOnObligationClick = (obligation: Obligation) => {
    // set window state to the obligation id
    window.history.pushState({}, "", `/promises/${obligation.obligationId}`);
    setObligation(obligation);
  };

  // If it's the first time the user is viewing the obligations page
  const shouldShowCreateContract = useMemo(() => {
    return (
      !isFirstObligationView() &&
      contracts.length === 0 &&
      obligations.length > 0
    );
  }, [contracts]);

  return (
    <div className="w-full h-full flex flex-col gap-3">
      <div className="flex flex-row gap-1">
        <span className="text-lg lg:text-xl text-muted-foreground mt-1">
          PROMISES {obligations.length > 0 && `(${obligations.length})`}
        </span>
        <PromiseDialog
          onCreate={handleCreateObligation}
          onEdit={handleUpdateObligation}
          disabled={loadingData}
          open={showDialog}
          onOpenChange={handleOnOpenChange}
          obligation={obligation}
          onCreateNewClick={handleOnCreateNewClick}
        />
      </div>
      <div className="flex flex-wrap gap-5 justify-between items-start overflow-auto mt-4 h-fit max-h-full pb-3">
        {loadingData
          ? Array.from({ length: obligations.length || 6 }).map((_, index) => (
              <ObligationComponentLoading
                key={`obligationComponentLoading - ${index}`}
              />
            ))
          : obligations.map(obligation => (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                key={obligation.obligationId}
                className="w-full pr-2 md:pr-0 md:w-auto"
              >
                <ObligationComponent
                  obligation={obligation}
                  onClick={handleOnObligationClick}
                  showDelete
                />
              </motion.div>
            ))}
      </div>
      {shouldShowCreateContract && <NoContractsDialog />}
    </div>
  );
};

export default ObligationPage;
