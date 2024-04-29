"use client";

import React, { useRef, useState } from "react";
import { Input } from "../../../components/ui/input";
import { TextArea } from "../../../components/ui/textArea";
import { useFormik } from "formik";
import { CreateContract } from "../../../models/contract";
import { useObligations } from "../../../lib/hooks/useObligations";
import ObligationComponent from "../../../components/obligationComponent";
import Obligation from "../../../models/obligation";
import { AccountabilityPartner } from "../../../models/appUser";
import useSearchUser from "../../../lib/hooks/useSearchUser";
import { Skeleton } from "../../../components/ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../../../components/ui/button";
import { IoArrowBack } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";
import { useAppSelector } from "../../../lib/hooks/redux";
import { Checkbox } from "../../../components/ui/checkbox";
import { useContracts } from "../../../lib/hooks/useContracts";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import AccountabilityPartnerComponent from "../../../components/accountabilityPartnerComponent";
import { getNextWeekDate } from "../../../lib/utils/dateUtils";
import Divider from "../../../components/ui/divider";
import InvitePartnerComponent from "../../../components/invitePartnerComponent";

interface CreateContractPageProps {}

interface FindPartnerProps {
  onPartnerSelect: (partner: AccountabilityPartner) => void;
}

const FindPartner = ({
  onPartnerSelect,
}: FindPartnerProps): React.ReactNode => {
  const { user } = useAppSelector(state => state.auth);
  const { searchResult, searchUsers, status, error } = useSearchUser();

  return (
    <div className="flex flex-col gap-2 w-full justify-center items-start">
      <Input
        label="Search for your partner"
        type="text"
        placeholder="Orel zilberman"
        onChange={e => searchUsers(e.target.value)}
        autoComplete="on"
        autoFocus
        error={error ?? undefined}
      />
      {status === "loading" && (
        <div className="flex flex-col gap-1">
          {[...Array(5)].map((_, index) => (
            <Skeleton
              className="h-4 w-full rounded-full"
              key={`skeleton-${index}`}
            />
          ))}
        </div>
      )}
      <div className="max-h-64 w-full flex flex-col gap-1 overflow-auto">
        {searchResult.map(partner => (
          <AccountabilityPartnerComponent
            partner={partner}
            key={partner.userId}
            onClick={onPartnerSelect}
            className="!items-start"
            signed
          />
        ))}
      </div>
      {(status === "no-results" || status === "success") && (
        <>
          <Divider />
          <div className="mt-2 flex flex-row gap-1 items-start">
            <span className="text-sm text-muted-foreground mt-0.5">
              Can&apos;t find your buddies?
            </span>
            <InvitePartnerComponent
              buttonText="Invite them!"
              referralCode={user?.meta?.referralCode}
            />
          </div>
        </>
      )}
    </div>
  );
};

const CreateContractPage: React.FC<CreateContractPageProps> = () => {
  const router = useRouter();
  const { obligations } = useObligations();
  const { user } = useAppSelector(state => state.auth);
  const { createContract, loading } = useContracts();
  const [accountabilityPartner, setAccountabilityPartner] =
    useState<AccountabilityPartner | null>(null);
  const [previousAccountabilityPartner, setPreviousAccountabilityPartner] =
    useState<AccountabilityPartner | null>(null);
  const [obligationsUsed, setObligationsUsed] = useState<Obligation[]>([]);

  const signatureRef = useRef<HTMLDivElement>(null);
  const obligationsRef = useRef<HTMLDivElement>(null);

  const formik = useFormik<CreateContract>({
    initialValues: {
      title: "",
      dueDate: getNextWeekDate(),
      description: null,
      contractees: [],
      signatures: [],
      obligationIds: [],
    },
    onSubmit: values => {
      if (values.obligationIds.length === 0) {
        toast.error("You must add at least one obligation");
        obligationsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        return;
      }
      if (formik.values.signatures.length === 0) {
        toast.error("You must sign the contract");
        signatureRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        return;
      }
      if (!user || !accountabilityPartner) return;

      toast.promise(
        createContract({
          ...values,
          contractees: [user, accountabilityPartner],
        }),
        {
          pending: "Creating contract...",
          success: {
            render() {
              router.back();
              return "Contract created successfully";
            },
          },
          error: "Error creating contract",
        },
      );
    },
  });

  const unusedObligations = React.useMemo(() => {
    return obligations.filter(
      obligation =>
        !obligationsUsed.find(
          used => used.obligationId === obligation.obligationId,
        ),
    );
  }, [obligations, obligationsUsed]);

  const handleAddObligationToContract = (obligation: Obligation) => {
    if (obligationsUsed.includes(obligation)) return;
    setObligationsUsed([...obligationsUsed, obligation]);
    const obligationUsedIds = obligationsUsed.map(used => used.obligationId);
    formik.setValues({
      ...formik.values,
      obligationIds: [...obligationUsedIds, obligation.obligationId],
    });
  };

  const handleRemoveObligationFromContract = (obligation: Obligation) => {
    const filteredObligations = obligationsUsed.filter(
      used => used.obligationId !== obligation.obligationId,
    );
    setObligationsUsed(filteredObligations);
    const filteredObligationIds = filteredObligations.map(
      used => used.obligationId,
    );
    formik.setValues({
      ...formik.values,
      obligationIds: filteredObligationIds,
    });
  };

  const handleBack = () => {
    setPreviousAccountabilityPartner(accountabilityPartner);
    setAccountabilityPartner(null);
  };

  const handlePartnerSelect = (partner: AccountabilityPartner) => {
    setAccountabilityPartner(partner);
    setPreviousAccountabilityPartner(null);
  };

  const handleSignContract = (signed: boolean) => {
    if (signed && formik.values.signatures.length === 0) {
      if (!user) return;
      formik.setValues({
        ...formik.values,
        signatures: [user.userId],
      });
    } else {
      formik.setValues({
        ...formik.values,
        signatures: [],
      });
    }
  };

  return (
    <div className="w-full h-full flex justify-center items-start">
      <AnimatePresence>
        {!accountabilityPartner ? (
          <motion.div
            // slide in from the right
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            // exit right to left if accountabilityPartner is set, else left to right
            exit={{ x: "-100%" }}
            transition={{ duration: 0.2 }}
            key="find-partner"
            className="flex flex-col gap-4 justify-start md:justify-center items-start w-full h-fit max-h-full p-3 overflow-auto mt-6 md:w-96"
          >
            <div className="flex flex-col gap-4 max-h-full w-full">
              {previousAccountabilityPartner && (
                <div className="flex flex-col gap-1 w-full">
                  <span className="font-bold">Previous selection</span>
                  <AccountabilityPartnerComponent
                    partner={previousAccountabilityPartner}
                    onClick={handlePartnerSelect}
                    signed
                  />
                </div>
              )}
              <FindPartner onPartnerSelect={handlePartnerSelect} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            // slide in from the right
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{
              x: previousAccountabilityPartner ? "-100%" : "100%",
            }}
            transition={{ duration: 0.2 }}
            key="create-contract"
            className="h-full w-full flex flex-col gap-5 justify-start items-start "
          >
            <form
              onSubmit={formik.handleSubmit}
              className="w-full flex flex-col gap-4"
            >
              <Button
                variant="ghost"
                onClick={handleBack}
                className="self-start p-0 sticky top-0 left-0 w-full flex justify-start items-center bg-background z-20"
              >
                <div className="flex flex-row gap-1 items-start">
                  <IoArrowBack className="w-6 h-6" />
                  Back
                </div>
              </Button>
              <Input
                label="Title"
                maxLength={36}
                type="text"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                placeholder="Reading books everyday"
                required
                error={formik.errors.title}
              />
              <TextArea
                label="Description"
                className="h-20"
                name="description"
                value={formik.values.description ?? ""}
                onChange={formik.handleChange}
                placeholder="Orel and Sara will read books everyday for 30 minutes."
                rows={1}
                error={formik.errors.description}
              />
              <Divider />
              <h1 className="text-xl font-bold">Obligations</h1>
              <div className="flex flex-col gap-0 w-full max-h-32">
                <div className="font-bold mt-1">In contract</div>
                <div
                  className="flex flex-col gap-0.5 justify-start items-start overflow-auto w-full max-h-60"
                  ref={obligationsRef}
                >
                  {obligationsUsed.map(obligation => (
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "100%" }}
                      transition={{ duration: 0.2 }}
                      key={obligation.obligationId}
                      className="w-full"
                    >
                      <ObligationComponent
                        obligation={obligation}
                        onClick={handleAddObligationToContract}
                        key={obligation.obligationId}
                        showDelete
                        deleteIcon={MdOutlineCancel}
                        onDelete={handleRemoveObligationFromContract}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-0 w-full max-h-60">
                <div className="font-bold mt-1">Your obligations</div>
                <div className="flex flex-col gap-1 justify-start items-start overflow-auto w-full">
                  {unusedObligations.map(obligation => (
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "100%" }}
                      transition={{ duration: 0.2 }}
                      key={obligation.obligationId}
                      className="w-full"
                    >
                      <ObligationComponent
                        obligation={obligation}
                        onClick={handleAddObligationToContract}
                        key={obligation.obligationId}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
              <Divider />
              <Input
                className="w-full"
                label="Due Date"
                type="date"
                name="dueDate"
                value={formik.values.dueDate.toISOString().split("T")[0]}
                onChange={e => {
                  formik.setValues({
                    ...formik.values,
                    dueDate: new Date(e.target.value),
                  });
                }}
              />
              <div className="flex flex-col gap-1 w-full h-fit">
                <h1 className="font-bold">Signatures</h1>
                <div
                  className="flex flex-row gap-4 w-full justify-center items-center"
                  id="contract-signatures"
                >
                  <div
                    className="flex flex-col justify-center items-center gap-2 w-1/2"
                    ref={signatureRef}
                  >
                    <AccountabilityPartnerComponent
                      className="flex-col !p-0"
                      partner={user as AccountabilityPartner}
                      signed
                    />
                    {/* <SignatureCanvasComponent
                    onSigned={signature => {
                    }}
                  /> */}
                    <Checkbox
                      onCheckedChange={handleSignContract}
                      error={formik.errors.signatures}
                    />
                  </div>

                  <div className="flex flex-col justify-center items-center gap-2 w-1/2 grayscale">
                    <AccountabilityPartnerComponent
                      className="flex-col !p-0"
                      partner={accountabilityPartner}
                    />
                    <Checkbox disabled />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                Create contract
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateContractPage;
