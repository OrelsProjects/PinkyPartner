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
interface ObligationProps {
  params: {
    id?: string;
  };
}

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
    onSubmit: values => {},
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

  // Return su, mo, tu, we, th, fr, sa for every corresponding day that is checked
  const daysText = useMemo(() => {
    const days = Object.keys(formik.values)
      .filter(day => formik.values[day as keyof typeof formik.values])
      .map(day => day.slice(0, 2))
      .map(day => day[0].toUpperCase() + day.slice(1));
    return days.join(", ");
  }, [formik.values]);

  return (
    <div className="flex flex-col h-fit w-full gap-0.5">
      <div className="flex flex-row justify-between h-fit w-full gap-3">
        {Object.keys(formik.values).map((day, index) => (
          <div
            key={index}
            className="flex flex-col justify-center items-center text-muted-foreground"
          >
            <Checkbox
              className="w-6 h-6"
              defaultChecked={formik.values[day]}
              checked={formik.values[day]}
              onCheckedChange={checked => formik.setFieldValue(day, checked)}
            />
            <div>{day[0].toUpperCase()}</div>
          </div>
        ))}
      </div>
      {showRepeatText && (
        <div className="text-muted-foreground font-normal italic flex flex-col">
          <div>Repeat every:</div>
          {daysText}
        </div>
      )}
    </div>
  );
};

const PromiseDialog = ({
  obligation,
  onCreate,
  onEdit,
  disabled = false,
  open,
  onOpenChange,
}: {
  obligation?: Obligation | null;
  onCreate?: (data: CreateObligation) => Promise<void>;
  onEdit?: (data: Obligation) => Promise<void>;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (state: boolean) => void;
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { theme } = useTheme();

  const formik = useFormik<Omit<CreateObligation, "userId">>({
    initialValues: {
      title: obligation ? obligation.title : "",
      description: obligation ? obligation.description : "",
      emoji: obligation ? obligation.emoji : "",
      repeat: obligation ? obligation.repeat : "Daily",
      days: obligation?.days as Days,
      timesAWeek: obligation?.timesAWeek as TimesAWeek,
    },
    onSubmit: values => {
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
        days: obligation.days,
        timesAWeek: obligation.timesAWeek,
      });
    } else {
      formik.setValues({
        ...formik.values,
        emoji: formik.values.emoji || "🤝",
      });
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
        >
          <FaPlus className="w-5 h-5 fill-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-5/6 sm:max-w-[525px] sm:h-[525px]">
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col justify-start items-center gap-4 w-full"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col justify-start items-start gap-6">
              <div className="flex flex-col items-start gap-2 p-3 w-fit h-fit rounded-lg">
                <Label htmlFor="title" className="text-right">
                  I pinky promise to...
                </Label>
                <Input
                  id="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  placeholder="Run 2km"
                  error={formik.errors.title}
                  maxLength={24}
                  required
                />
              </div>
              <div className="flex flex-col gap-2 p-3 w-fit h-fit rounded-lg">
                <div className="w-full flex justify-start items-center gap-2">
                  <div className="font-normal">Repeat</div>
                  <IntervalDropdown
                    onSelect={value => {
                      formik.setFieldValue("repeat", value);
                    }}
                  />
                </div>
                <div className="flex flex-col items-start gap-2 py-3 w-fit h-fit rounded-lg">
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
            </div>
          </div>
          <div className="w-full flex flex-col justify-center items-center">
            <div>Now choose the perfect icon!</div>
            <Button
              className="w-fit h-fit"
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
          </div>
          <DialogFooter>
            <div className="flex flex-col">
              <Button type="submit" disabled={disabled}>
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

const ObligationPage: React.FC<ObligationProps> = ({ params }) => {
  const router = useRouter();
  const {
    getUserObligation,
    createObligation,
    updateObligation,
    obligations,
    loading,
  } = useObligations();

  const [obligation, setObligation] = useState<Obligation | undefined | null>(
    null,
  );
  const [showDialog, setShowDialog] = useState<boolean | undefined>();

  useEffect(() => {
    if (params.id && params.id.length > 0) {
      const obligation = getUserObligation(params.id[0]);
      setObligation(obligation);
      setShowDialog(true);
    }
  }, [params, params.id]);

  const handleOnOpenChange = (state: boolean) => {
    if (!state) {
      router.push("/promises");
    }
    setShowDialog(state);
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
    router.push(`/promises/${obligation.obligationId}`);
    setObligation(obligation);
  };

  return (
    <div className="w-full h-full flex flex-col gap-3">
      <div className="flex flex-row gap-1">
        <span className="text-lg lg:text-xl text-muted-foreground mt-1">
          PROMISES {obligations.length > 0 && `(${obligations.length})`}
        </span>
        <PromiseDialog
          onCreate={handleCreateObligation}
          onEdit={handleUpdateObligation}
          disabled={loading}
          open={showDialog}
          onOpenChange={handleOnOpenChange}
          obligation={obligation}
        />
      </div>
      <div className="flex flex-wrap gap-3 justify-start items-start overflow-auto">
        {loading
          ? Array.from({ length: obligations.length || 5 }).map((_, index) => (
              <div className="w-full flex flex-col gap-1" key={index}>
                <ObligationComponentLoading />
              </div>
            ))
          : obligations.map(obligation => (
              <ObligationComponent
                obligation={obligation}
                key={obligation.obligationId}
                onClick={handleOnObligationClick}
                showDelete
              />
            ))}
      </div>
    </div>
  );
};

export default ObligationPage;
