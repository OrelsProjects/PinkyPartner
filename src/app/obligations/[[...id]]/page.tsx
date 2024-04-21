"use client";

import React, { useEffect, useState } from "react";
import Obligation, { CreateObligation } from "../../../models/obligation";
import { useObligations } from "../../../lib/hooks/useObligations";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { MdOutlineEmojiEmotions as EmojiIcon } from "react-icons/md";
import { Button } from "../../../components/ui/button";
import {
  DialogFooter,
  DialogTrigger,
  Dialog,
  DialogContent,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import ObligationComponent from "../../../components/obligationComponent";
import { useRouter } from "next/navigation";

interface ObligationProps {
  params: {
    id?: string;
  };
}

const ObligationDialog = ({
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

  const formik = useFormik<Omit<CreateObligation, "userId">>({
    initialValues: {
      title: obligation ? obligation.title : "",
      description: obligation ? obligation.description : "",
      emoji: obligation ? obligation.emoji : "",
    },
    onSubmit: values => {
      if (obligation) {
        onEdit?.({ ...obligation, ...values });
      } else {
        onCreate?.(values)
          .then(() => {
            formik.resetForm();
          })
          .catch(() => {});
      }
    },
  });

  useEffect(() => {
    if (obligation) {
      formik.setValues({
        title: obligation.title,
        description: obligation.description,
        emoji: obligation.emoji,
      });
    }
  }, [obligation]);

  return (
    <div
      className={`
    ${open ? "w-screen h-screen relative z-index[99999]" : ""}
    `}
    >
      <Dialog
        open={open}
        onOpenChange={state => {
          onOpenChange?.(state);
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline">Create</Button>
        </DialogTrigger>
        <DialogContent className="w-4/6 sm:max-w-[425px]">
          <div className="w-full flex justify-center items-center">
            <Button
              className="w-fit h-fit"
              variant={"outline"}
              onClick={() => setShowEmojiPicker(true)}
            >
              {formik.values.emoji ? (
                <div className="text-3xl">{formik.values.emoji}</div>
              ) : (
                <EmojiIcon className="w-8 h-8 fill-muted-foreground" />
              )}
            </Button>
          </div>
          <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col justify-center items-center gap-4 py-4"
          >
            <div className="flex flex-col gap-4 py-4 ">
              <div className="flex flex-col justify-center items-center gap-2">
                <Label htmlFor="title" className="text-right">
                  I oblige myself to...
                </Label>
                <Input
                  id="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  placeholder="Run 2km"
                  error={formik.errors.title}
                  explainingText={
                    <div>
                      {"Don't worry about time intervals."}
                      <br />
                      You add them in the contract.
                    </div>
                  }
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={disabled}>
                Save changes
              </Button>
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
                  theme={Theme.AUTO}
                  searchDisabled
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
    </div>
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
      router.push("/obligations");
    }
    setShowDialog(state);
  };

  const hideDialog = () => {
    setShowDialog(false);
    router.push("/obligations");
  };

  const handleCreateObligation = async (data: CreateObligation) => {
    toast.promise(createObligation(data), {
      loading: "Creating obligation...",
      success: () => {
        hideDialog();
        return "Obligation created!";
      },
      error: "Failed to create obligation",
    });
  };

  const handleUpdateObligation = async (data: Obligation) => {
    toast.promise(updateObligation(data), {
      loading: "Updating obligation...",
      success: () => {
        hideDialog();
        return "Obligation updated!";
      },
      error: "Failed to update obligation",
    });
  };

  const handleOnobligationClick = (obligation: Obligation) => {
    // set window state to the obligation id
    router.push(`/obligations/${obligation.obligationId}`);
    setObligation(obligation);
    router.refresh();
  };

  return (
    <div className="w-full h-full flex flex-col">
      <ObligationDialog
        onCreate={handleCreateObligation}
        onEdit={handleUpdateObligation}
        disabled={loading}
        open={showDialog}
        onOpenChange={handleOnOpenChange}
        obligation={obligation}
      />
      <div className="flex flex-wrap gap-3 justify-start items-start overflow-auto">
        {obligations.map(obligation => (
          <ObligationComponent
            obligation={obligation}
            key={obligation.obligationId}
            onClick={handleOnobligationClick}
          />
        ))}
      </div>
    </div>
  );
};

export default ObligationPage;
