import React, { useEffect } from "react";
import { ContractWithExtras, UpdateContract } from "../../models/contract";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "../ui/dialog";
import { useFormik } from "formik";
import { useContracts } from "../../lib/hooks/useContracts";
import { toast } from "react-toastify";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface EditContractComponentProps {
  open?: boolean;
  onClose?: () => void;
  contract: ContractWithExtras;
}

const EditContractComponent: React.FC<EditContractComponentProps> = ({
  onClose,
  contract,
  open = false,
}) => {
  const { updateContract } = useContracts();
  const [isOpen, setIsOpen] = React.useState(open);
  const formik = useFormik<UpdateContract>({
    initialValues: {
      title: contract.title,
      description: contract.description,
    },
    onSubmit: async values => {
      if (!values.title) {
        formik.setFieldError("title", "Title is required");
        return;
      }
      if (values.title === contract.title) {
        onClose?.();
        return;
      }
      toast.promise(updateContract(contract, values), {
        pending: "Updating contract...",
        success: {
          render() {
            onClose?.();
            return "Contract updated";
          },
        },
        error: "Failed to update contract",
      });
    },
  });

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open && onClose) {
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogTitle>Edit Contract</DialogTitle>
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-10">
          <Input
            label="Title"
            name="title"
            value={formik.values.title}
            onChange={formik.handleChange}
            error={formik.errors.title}
            className="py-4"
          />
          <DialogFooter className="w-full flex justify-center items-center">
            <Button type="submit" onClick={(e: any) => formik.handleSubmit(e)}>
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditContractComponent;
