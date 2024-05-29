"use client";

import React, { useCallback, useRef } from "react";

import EmojiPicker, { Theme } from "emoji-picker-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "./ui/dialog";
import { MdOutlineEmojiEmotions as EmojiIcon } from "react-icons/md";
import { useFormik } from "formik";
import { useTheme } from "next-themes";
import { useState, useEffect, useMemo } from "react";
import { FaPlus } from "react-icons/fa6";
import { toast } from "react-toastify";
import { cn } from "../lib/utils";
import Obligation, {
  CreateObligation,
  Days,
  TimesAWeek,
} from "../models/obligation";
import { Button } from "./ui/button";
import IntervalDropdown from "./ui/dropdowns/intervalDropdown";
import {
  SectionContainer,
  SectionTitleContainer,
  SectionTitle,
  SectionTitleExplanation,
} from "./ui/section";
import { Input } from "./ui/input";
import { DaysToText } from "../lib/utils/dateUtils";
import { timesAWeekToText } from "../lib/utils/textUtils";
import TimesAWeekDropdown from "./ui/dropdowns/timesAWeekDropdown";
import { Checkbox } from "./ui/checkbox";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../lib/hooks/redux";

const Weekly = ({
  onChange,
  obligation,
  disabled,
}: {
  onChange: (timesAWeek: TimesAWeek) => void;
  obligation?: Obligation | CreateObligation;
  disabled?: boolean;
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
        disabled={disabled}
      />
      <div className="text-muted-foreground">per week</div>
    </div>
  );
};

const Daily = ({
  obligation,
  onChange,
  disabled,
}: {
  obligation?: Obligation | CreateObligation | null;
  disabled?: boolean;
  onChange: (days: number[]) => void;
  showRepeatText?: boolean;
}) => {
  const days = obligation?.days;

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

  const isFirstTimeCheck = useMemo(() => {
    return Object.values(formik.values).every(value => value);
  }, [formik.values]);

  const handleCheck = useCallback(
    (day: string, checked: boolean) => {
      if (isFirstTimeCheck) {
        for (const key in formik.values) {
          if (key !== day) {
            formik.setFieldValue(key, false);
          }
        }
      } else {
        formik.setFieldValue(day, checked);
      }
    },
    [isFirstTimeCheck],
  );

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
              onCheckedChange={(checked: boolean) => {
                handleCheck(day, checked);
              }}
              variant="outline"
              disabled={disabled}
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
  days?: number[] | null;
  timesAWeek?: number | null;
}) => (
  <div className="text-muted-foreground font-light flex flex-row gap-1 text-sm">
    {days ? (
      <>
        <div className="font-normal">Practice every:</div>
        {DaysToText(days)}
      </>
    ) : (
      <div className="font-normal">
        Practice: {timesAWeekToText(timesAWeek)}
      </div>
    )}
  </div>
);

const CreatePromise = ({
  open,
  children,
  obligation,
  onOpen,
  onClose,
  onObligationCreated,
  onObligationUpdated,
}: {
  open: boolean;
  children?: React.ReactNode;
  obligation?: CreateObligation | null;
  onOpen: () => void;
  onClose: () => void;
  onObligationCreated?: (obligation: CreateObligation) => void;
  onObligationUpdated?: (obligation: CreateObligation) => void;
}) => {
  const { user } = useAppSelector(state => state.auth);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { theme } = useTheme();

  const formik = useFormik<CreateObligation>({
    initialValues: {
      userId: user?.userId as string,
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
        onObligationUpdated?.({ ...obligation, ...values });
      } else {
        onObligationCreated?.(values);
      }
    },
  });

  useEffect(() => {
    if (obligation) {
      formik.setValues({
        userId: user?.userId as string,
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

  // Disable edit for now because it requires massive changes in the db
  const disabled = useMemo(() => {
    return false;
  }, [obligation]);

  return (
    <Dialog
      open={open}
      onOpenChange={open => {
        if (!open) {
          onClose();
        } else {
          onOpen();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-2xl flex justify-center items-center !p-0"
        >
          {children ? (
            children
          ) : (
            <FaPlus className="w-5 h-5 fill-muted-foreground" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-11/12 sm:max-w-[525px] sm:h-[525px] bg-card p-6"
        closeOnOutsideClick={false}
      >
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
              days={
                formik.values.repeat === "Daily" ? formik.values.days : null
              }
              timesAWeek={
                formik.values.repeat === "Weekly"
                  ? formik.values.timesAWeek
                  : null
              }
            />
            <div
              className={cn(
                "flex flex-col md:flex-row gap-3 justify-start items-start",
                {
                  "!flex-row": formik.values.repeat === "Weekly",
                },
              )}
            >
              <Daily
                onChange={days => formik.setFieldValue("days", days)}
                obligation={obligation}
                disabled={disabled}
              />
            </div>
            {/* <IntervalDropdown
                onSelect={value => {
                  formik.setFieldValue("repeat", value);
                }}
                className="h-10"
                disabled={disabled}
                error={formik.errors.repeat}
              /> 
              <div className="flex flex-col items-start gap-2 w-fit h-fit rounded-lg">
                {formik.values.repeat === "Weekly" && (
                  <Weekly
                    onChange={timesAWeek =>
                      formik.setFieldValue("timesAWeek", timesAWeek)
                    }
                    disabled={disabled}
                    obligation={obligation ?? undefined}
                  />
                )}
                {formik.values.repeat === "Daily" && (
                  <Daily
                    onChange={days => formik.setFieldValue("days", days)}
                    obligation={obligation}
                    disabled={disabled}
                  />
                )}
              </div>
            </div>
            */}
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
              <Button type="submit" className="px-12 !py-5 rounded-[5px]">
                {obligation ? "I repromise" : "I promise"}
              </Button>
            </div>
          </DialogFooter>
        </form>
        {showEmojiPicker && (
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

export default CreatePromise;
