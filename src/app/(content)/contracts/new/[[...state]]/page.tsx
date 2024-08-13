"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "../../../../../components/ui/input";
import { useFormik } from "formik";
import { CreateContractForm } from "../../../../../models/contract";
import { AccountabilityPartner } from "../../../../../models/appUser";
import useSearchUser from "../../../../../lib/hooks/useSearchUser";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../../../../../components/ui/button";
import { IoArrowBack } from "react-icons/io5";
import { useAppSelector } from "../../../../../lib/hooks/redux";
import { Checkbox } from "../../../../../components/ui/checkbox";
import { useContracts } from "../../../../../lib/hooks/useContracts";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import AccountabilityPartnerComponent, {
  AccountabilityPartnerComponentLoading,
} from "../../../../../components/accountabilityPartnerComponent";
import { getNextWeekDate } from "../../../../../lib/utils/dateUtils";
import Divider from "../../../../../components/ui/divider";
import {
  SectionContainer,
  SectionTitle,
  SectionTitleContainer,
  SectionTitleExplanation,
} from "../../../../../components/ui/section";
import { FaPlus } from "react-icons/fa";
import CreatePromise from "../../../../../components/createPromise";
import ObligationComponent from "../../../../../components/obligationComponent";
import { cn } from "../../../../../lib/utils";
import { getRandomTimeToFinishRequest } from "../../../../../lib/utils/apiUtils";
import { EventTracker } from "../../../../../eventTracker";
import { Calendar } from "../../../../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../../components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import Obligation from "../../../../../models/obligation";

interface FindPartnerProps {
  onPartnerSelect: (partner?: AccountabilityPartner) => void;
}

const FindPartner = ({
  onPartnerSelect,
}: FindPartnerProps): React.ReactNode => {
  const { state } = useAppSelector(state => state.auth);
  const { searchResult, searchUsers, status, error } = useSearchUser();

  return (
    <div className="flex flex-col gap-2 w-full justify-center items-start">
      <Input
        label="Search for your partner"
        type="text"
        placeholder={
          state === "authenticated"
            ? "Your pinky partner's name"
            : "You need to sign up to find a partner"
        }
        disabled={state !== "authenticated"}
        onChange={e => searchUsers(e.target.value)}
        autoComplete="on"
        autoFocus
        error={error ?? undefined}
        data-onboarding-id="search-partner"
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
                className="!items-start hover:cursor-pointer md:hover:bg-slate-400/40 rounded-lg p-2"
                signed
              />
            ))}
      </div>

      <>
        <div className="mt-2 flex flex-col gap-5 items-start rounded-lg bg-card p-3">
          <div className="flex flex-col">
            {status === "no-results" || status === "success" ? (
              <span className="text-sm text-muted-foreground mt-1.5">
                Can&apos;t find your partner?
              </span>
            ) : (
              <span className="text-sm text-muted-foreground mt-1.5">
                You don&apos;t have a partner?
              </span>
            )}
            <span className="text-sm text-muted-foreground mt-1.5">
              It&apos;s okay! Create the contract and invite them later.
            </span>
          </div>
          <Button
            onClick={() => onPartnerSelect()}
            className="self-end"
            data-onboarding-id="no-partner"
          >
            Continue without a partner
          </Button>
        </div>
        <Divider className="mt-3" />
      </>
    </div>
  );
};

const CreateContractPage = ({ params }: { params: { state: string[] } }) => {
  const router = useRouter();
  const { user } = useAppSelector(state => state.auth);
  const { createContract, loading } = useContracts();
  const [accountabilityPartner, setAccountabilityPartner] =
    useState<AccountabilityPartner | null>(null);
  const [previousAccountabilityPartner, setPreviousAccountabilityPartner] =
    useState<AccountabilityPartner | null>(null);
  const [continueWithoutPartner, setContinueWithoutPartner] =
    useState<boolean>(false);

  const [obligationToEdit, setObligationToEdit] = useState<Obligation | null>(
    null,
  );

  const [showDialog, setShowDialog] = useState<boolean>(false);

  const signatureRef = useRef<HTMLDivElement>(null);
  const obligationsRef = useRef<HTMLDivElement>(null);

  const formik = useFormik<CreateContractForm>({
    initialValues: {
      title: "",
      dueDate: getNextWeekDate(),
      description: null,
      contractees: [],
      signatures: [],
      obligations: undefined,
    },
    onSubmit: async values => {
      EventTracker.track("contract_created");
      if (!values.obligations) {
        EventTracker.track("contract_created_no_promise");
        toast.error("You must add a promise");
        obligationsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        return;
      }
      if (formik.values.signatures.length === 0) {
        EventTracker.track("contract_created_no_signature");
        toast.error("You must sign the contract");
        signatureRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        formik.errors.signatures = "You must sign the contract";
        return;
      }
      if (!accountabilityPartner && !continueWithoutPartner) return;
      EventTracker.track(
        "contract_created_" + continueWithoutPartner
          ? "without"
          : "with" + "_partner",
      );
      const contractees = [user, accountabilityPartner].filter(
        partner => partner !== null,
      ) as AccountabilityPartner[];
      toast.promise(getRandomTimeToFinishRequest(), {
        pending: "Creating contract...",
        success: {
          render() {
            router.push("/contracts");
            return "Contract created successfully";
          },
        },
        error: "Error creating contract",
      });
      try {
        const obligationsNoId = values.obligations.map(obligation => {
          const { obligationId, ...rest } = obligation;
          return rest;
        });
        await createContract({
          ...values,
          obligations: obligationsNoId,
          contractees,
        });
      } catch (error) {
        console.error(error);
        toast.error(
          "Something went wrong with creating the contract. Please try again.",
        );
      }
    },
  });

  useEffect(() => {
    formik.setValues({
      ...formik.values,
      signatures: [
        user || {
          userId: "anonymous",
          displayName: "Random Pinky",
        },
      ],
    });
  }, [user]);

  useEffect(() => {
    // if continue without partner is true, make sure the url contains the state. otherwise, remove it
    if (continueWithoutPartner) {
      EventTracker.track("continue_without_partner");
      router.push("/contracts/new/no-partner");
    } else {
      EventTracker.track("create_contract");
      router.push("/contracts/new");
    }
  }, [continueWithoutPartner]);

  useEffect(() => {
    if (params?.state?.[0] === "no-partner") {
      setContinueWithoutPartner(true);
    } else {
      setContinueWithoutPartner(false);
    }
  }, [params]);

  const obligations = useMemo(() => {
    const { obligations } = formik.values;
    return obligations || [];
  }, [formik.values]);

  const generateNewId = () => {
    return Math.random().toString(36).substring(7);
  };

  const handleAddObligationToContract = (obligation: Obligation) => {
    if (obligations.map(ob => ob.title).indexOf(obligation.title) !== -1) {
      toast.error("You have already added a promise with the same name");
      return;
    }
    obligation.obligationId = generateNewId();
    const newObligations = obligations.concat(obligation);
    formik.setValues({
      ...formik.values,
      obligations: newObligations,
    });

    setShowDialog(false);
    setObligationToEdit(null);
  };

  const handleUpdateObligationInContract = (obligation: Obligation) => {
    const obligationIndex = obligations.findIndex(
      ob => ob.obligationId === obligation.obligationId,
    );

    if (obligationIndex === -1) return;

    obligations[obligationIndex] = obligation;
    formik.setValues({
      ...formik.values,
      obligations: obligations,
    });

    setShowDialog(false);
    setObligationToEdit(null);
  };

  const handleRemoveObligationFromContract = (obligation: Obligation) => {
    if (!formik.values.obligations) return;
    const obligationIndex = formik.values.obligations.findIndex(
      ob => ob.obligationId === obligation.obligationId,
    );
    if (obligationIndex === -1) return;

    const obligations = formik.values.obligations;
    obligations.splice(obligationIndex, 1);

    formik.setValues({
      ...formik.values,
      obligations: obligations,
    });

    setShowDialog(false);
  };

  const handleBack = () => {
    EventTracker.track("back_to_find_partner");
    setPreviousAccountabilityPartner(accountabilityPartner);
    setAccountabilityPartner(null);
    setContinueWithoutPartner(false);
  };

  const handlePartnerSelect = (partner?: AccountabilityPartner) => {
    if (!partner) {
      // continue without partner
      setContinueWithoutPartner(true);
      return;
    }
    setAccountabilityPartner(partner);
    setPreviousAccountabilityPartner(null);
  };

  const handleSignContract = (signed: boolean) => {
    if (signed && formik.values.signatures.length === 0) {
      formik.setValues({
        ...formik.values,
        signatures: [
          user || {
            userId: "anonymous",
            displayName: "Random Pinky",
          },
        ],
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
        {!accountabilityPartner && !continueWithoutPartner ? (
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.2 }}
            key="find-partner"
            data-onboarding-id="find-partner"
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
                    className="hover:cursor-pointer md:hover:bg-slate-400/40 rounded-lg p-2"
                  />
                </div>
              )}
              <FindPartner onPartnerSelect={handlePartnerSelect} />
            </div>
          </motion.div>
        ) : (
          <motion.div
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
              className="w-full flex flex-col gap-4 pb-10 md:pb-0"
            >
              <div className="w-full md:w-fit bg-background sticky p-0 top-0 left-0 flex justify-start items-center z-20 hover:bg-transparent">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="w-full md:w-fit self-start sticky p-0 top-0 left-0 flex justify-start items-center bg-background z-20 hover:bg-transparent px-1 md:px-2 "
                >
                  <div className="flex flex-row gap-1 items-start md:rounded-full">
                    <IoArrowBack className="w-6 h-6" />
                    Back
                  </div>
                </Button>
              </div>
              <div className="w-full h-full overflow-auto flex flex-col gap-8 md:gap-10 px-1 md:px-2 ">
                <SectionContainer>
                  <SectionTitleContainer>
                    <SectionTitle text="Title" />
                    <SectionTitleExplanation text="Give your contract a name" />
                  </SectionTitleContainer>
                  <Input
                    maxLength={36}
                    type="text"
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    placeholder="Read more books"
                    required
                    error={formik.errors.title}
                  />
                </SectionContainer>

                <SectionContainer>
                  <SectionTitleContainer>
                    <SectionTitle text="Promise" />
                    <SectionTitleExplanation text="Create a promise you want to make in this contract" />
                  </SectionTitleContainer>
                  <div className="w-full flex flex-col-reverse md:gap-4 md:items-start">
                    <CreatePromise
                      showPlus={false}
                      obligation={obligationToEdit}
                      open={showDialog}
                      onOpen={() => {
                        setShowDialog(true);
                      }}
                      onClose={() => {
                        setShowDialog(false);
                        setObligationToEdit(null);
                      }}
                      onObligationCreated={handleAddObligationToContract}
                      onObligationUpdated={handleUpdateObligationInContract}
                    >
                      {!(obligations.length >= 3) && (
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={() => {
                            setObligationToEdit(null);
                          }}
                        >
                          <div className="flex flex-row gap-1 justify-center items-center">
                            <span>Create a promise</span>
                            <FaPlus className="w-4 h-4" />
                          </div>
                        </Button>
                      )}
                    </CreatePromise>
                    <div
                      className="flex flex-col-reverse lg:flex-col gap-3 justify-start items-start overflow-auto w-full h-full pb-1"
                      ref={obligationsRef}
                    >
                      <AnimatePresence>
                        {obligations.map(obligation => (
                          <motion.div
                            initial={{ x: "-100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "-100%", opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="w-full"
                            key={`obligation-in-contract-${obligation.obligationId}`}
                          >
                            <ObligationComponent
                              obligation={obligation}
                              onDelete={handleRemoveObligationFromContract}
                              onClick={() => {
                                setObligationToEdit(obligation);
                                setShowDialog(true);
                              }}
                              showDelete
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </SectionContainer>

                <SectionContainer>
                  <SectionTitleContainer>
                    <SectionTitle text="Due date" />
                    <SectionTitleExplanation text="This is when the contract will expire" />
                  </SectionTitleContainer>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !formik.values.dueDate && "text-muted-foreground",
                        )}
                      >
                        {formik.values.dueDate ? (
                          format(formik.values.dueDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formik.values.dueDate}
                        onSelect={date => {
                          if (!date) return;
                          formik.setValues({
                            ...formik.values,
                            dueDate: date,
                          });
                        }}
                        disabled={date => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </SectionContainer>
                <SectionContainer
                  className={cn({ hidden: !accountabilityPartner })}
                >
                  <SectionTitleContainer>
                    <SectionTitle text="Signatures" />
                    <SectionTitleExplanation text="Put your pinky where your mouth is" />
                  </SectionTitleContainer>
                  <div
                    className={cn(
                      "flex flex-row gap-4 w-full justify-start items-center",
                      {
                        "justify-between": accountabilityPartner,
                      },
                    )}
                    data-onboarding-id="contract-signatures"
                  >
                    <div
                      className="flex flex-col justify-center items-center gap-2 w-fit md:w-1/2"
                      ref={signatureRef}
                    >
                      <AccountabilityPartnerComponent
                        className="flex-col "
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
                        className="h-7 w-7"
                        defaultChecked
                      />
                    </div>
                    {accountabilityPartner && (
                      <div className="flex flex-col justify-center items-center gap-2 w-fit md:w-1/2 grayscale">
                        <AccountabilityPartnerComponent
                          className="flex-col "
                          partner={accountabilityPartner}
                        />
                        <Checkbox disabled className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                </SectionContainer>
                <Button type="submit" className="w-full" disabled={loading}>
                  Seal your pinky
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
