"use client";

import React, { useRef, useState } from "react";
import { Input } from "../../../../components/ui/input";
import { TextArea } from "../../../../components/ui/textArea";
import { useFormik } from "formik";
import { CreateContract } from "../../../../models/contract";
import { useObligations } from "../../../../lib/hooks/useObligations";
import ObligationComponent from "../../../../components/obligationComponent";
import Obligation from "../../../../models/obligation";
import { AccountabilityPartner } from "../../../../models/appUser";
import useSearchUser from "../../../../lib/hooks/useSearchUser";
import { Skeleton } from "../../../../components/ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../../../../components/ui/button";
import { IoArrowBack } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";
import { useAppSelector } from "../../../../lib/hooks/redux";
import { Checkbox } from "../../../../components/ui/checkbox";
import { useContracts } from "../../../../lib/hooks/useContracts";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import AccountabilityPartnerComponent, {
  AccountabilityPartnerComponentLoading,
} from "../../../../components/accountabilityPartnerComponent";
import { getNextWeekDate } from "../../../../lib/utils/dateUtils";
import Divider from "../../../../components/ui/divider";
import InvitePartnerComponent from "../../../../components/invitePartnerComponent";
import { Label } from "@radix-ui/react-label";

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
      <div className="max-h-80 w-full flex flex-col gap-5 overflow-auto">
        {status === "loading"
          ? Array.from({ length: 3 }).map((_, index) => (
              <AccountabilityPartnerComponentLoading
                key={`accountabilityPartnerComponentLoading - ${index}`}
                className="!items-start"
              />
            ))
          : searchResult.map(partner => (
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
          <div className="mt-2 flex flex-row gap-1 items-start bg-card p-3 rounded-lg">
            <span className="text-sm text-muted-foreground mt-1.5">
              Can&apos;t find your partner?
            </span>
            <InvitePartnerComponent
              buttonText="Invite them!"
              referralCode={user?.meta?.referralCode}
              className="items-start"
              variant="default"
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
  const [usedObligations, setObligationsUsed] = useState<Obligation[]>([]);

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
        !usedObligations.find(
          used => used.obligationId === obligation.obligationId,
        ),
    );
  }, [obligations, usedObligations]);

  const handleAddObligationToContract = (obligation: Obligation) => {
    if (usedObligations.includes(obligation)) return;
    setObligationsUsed([obligation, ...usedObligations]);
    const obligationUsedIds = usedObligations.map(used => used.obligationId);

    formik.setValues({
      ...formik.values,
      obligationIds: [obligation.obligationId, ...obligationUsedIds],
    });
  };

  const handleRemoveObligationFromContract = (obligation: Obligation) => {
    const filteredObligations = usedObligations.filter(
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
            className="h-full w-full flex flex-col gap-5 justify-start items-start"
          >
            <form
              onSubmit={formik.handleSubmit}
              className="w-full flex flex-col gap-4 pr-8"
            >
              <Button
                variant="ghost"
                onClick={handleBack}
                className="self-start sticky p-0 top-0 left-0 w-fit flex justify-start items-center bg-background z-20 !rounded-none"
              >
                <div className="flex flex-row gap-1 items-start">
                  <IoArrowBack className="w-6 h-6" />
                  Back
                </div>
              </Button>
              <div className="w-full h-full overflow-auto flex flex-col gap-12">
                <div className="flex flex-col gap-1" id="title">
                  <h1 className="text-xl font-bold">Title</h1>
                  <Input
                    maxLength={36}
                    type="text"
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    placeholder="Reading books everyday"
                    required
                    error={formik.errors.title}
                  />
                </div>

                <div className="flex flex-col gap-1" id="promises">
                  <h1 className="text-xl font-bold">Promises</h1>
                  <div className="flex flex-col-reverse md:flex-row md:max-h-[26rem] gap-6 md:gap-0.5">
                    <div className="flex flex-col gap-0 w-full">
                      <div className="mt-1 font-semibold md:font-normal">
                        Your promises
                      </div>
                      <div className="flex flex-col gap-3 justify-start items-start overflow-auto w-full">
                        {unusedObligations.map(obligation => (
                          <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ duration: 0.2 }}
                            key={`used-obligation-${obligation.obligationId}`}
                            className="w-full md:w-auto"
                          >
                            <ObligationComponent
                              obligation={obligation}
                              onClick={handleAddObligationToContract}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-0 w-full">
                      <div className="mt-1 font-semibold md:font-normal">
                        In contract
                      </div>
                      <div
                        className="flex flex-col-reverse lg:flex-col gap-3 justify-start items-start overflow-auto w-full h-full"
                        ref={obligationsRef}
                      >
                        {usedObligations.length > 0 ? (
                          usedObligations.map(obligation => (
                            <motion.div
                              initial={{ x: "-100%" }}
                              animate={{ x: 0 }}
                              exit={{ x: "100%" }}
                              transition={{ duration: 0.2 }}
                              className="w-full"
                              key={`used-obligation-${obligation.obligationId}`}
                            >
                              <ObligationComponent
                                obligation={obligation}
                                onClick={handleAddObligationToContract}
                                key={obligation.obligationId}
                                trailingIcon={
                                  <MdOutlineCancel
                                    className="w-6 h-6 fill-red-500"
                                    onClick={() =>
                                      handleRemoveObligationFromContract(
                                        obligation,
                                      )
                                    }
                                  />
                                }
                              />
                            </motion.div>
                          ))
                        ) : (
                          <div
                            className="h-full w-full flex flex-col justify-center items-center
                          font-thin md:font-normal
                          "
                          >
                            <div>You didn&apos;t make any promises yet.</div>
                            <div className="hidden md:block">
                              Choose some from the left 💪
                            </div>
                            <div className="block md:hidden">
                              Choose some from the below 💪
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div id="due-date">
                  <h1 className="text-xl font-bold">Due date</h1>
                  <Input
                    className="w-full"
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
                </div>
                <div
                  className="flex flex-col gap-1 w-full h-fit"
                  id="signatures"
                >
                  <h1 className="font-bold text-xl">Signatures</h1>
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
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateContractPage;
