"use client";

import React, { useRef, useState } from "react";
import { Input } from "../../../../components/ui/input";
import { useFormik } from "formik";
import { CreateContract } from "../../../../models/contract";
import { useObligations } from "../../../../lib/hooks/useObligations";
import Obligation, { CreateObligation } from "../../../../models/obligation";
import { AccountabilityPartner } from "../../../../models/appUser";
import useSearchUser from "../../../../lib/hooks/useSearchUser";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../../../../components/ui/button";
import { IoArrowBack } from "react-icons/io5";
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
import {
  SectionContainer,
  SectionTitle,
  SectionTitleContainer,
  SectionTitleExplanation,
} from "../../../../components/ui/section";
import { FaPlus } from "react-icons/fa";
import CreatePromise from "../../../../components/createPromise";
import ObligationComponent from "../../../../components/obligationComponent";

interface CreateContractPageProps {}

interface FindPartnerProps {
  onPartnerSelect: (partner?: AccountabilityPartner) => void;
}

const FindPartner = ({
  onPartnerSelect,
}: FindPartnerProps): React.ReactNode => {
  const { searchResult, searchUsers, status, error } = useSearchUser();

  return (
    <div className="flex flex-col gap-2 w-full justify-center items-start">
      <Input
        label="Search for your partner"
        type="text"
        placeholder="Your pinky partner's name"
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
                className="!items-start"
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
                You don&apos;t have your partner?
              </span>
            )}
            <span className="text-sm text-muted-foreground mt-1.5">
              It&apos;s okay! Create the contract and invite them later.
            </span>
          </div>
          <Button onClick={() => onPartnerSelect()} className="self-end">
            Sounds good!
          </Button>
        </div>
        <Divider className="mt-3" />
      </>
    </div>
  );
};

const CreateContractPage: React.FC<CreateContractPageProps> = () => {
  const router = useRouter();
  const { user } = useAppSelector(state => state.auth);
  const { createContract, loading } = useContracts();
  const [accountabilityPartner, setAccountabilityPartner] =
    useState<AccountabilityPartner | null>(null);
  const [previousAccountabilityPartner, setPreviousAccountabilityPartner] =
    useState<AccountabilityPartner | null>(null);
  const [continueWithoutPartner, setContinueWithoutPartner] =
    useState<boolean>(false);
  const [obligation, setObligation] = useState<CreateObligation | null>(null);

  const [showDialog, setShowDialog] = useState<boolean>(false);

  const signatureRef = useRef<HTMLDivElement>(null);
  const obligationsRef = useRef<HTMLDivElement>(null);

  const formik = useFormik<CreateContract>({
    initialValues: {
      title: "",
      dueDate: getNextWeekDate(),
      description: null,
      contractees: [],
      signatures: [],
      obligation: null,
    },
    onSubmit: values => {
      if (!values.obligation) {
        toast.error("You must add a promise");
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
        formik.errors.signatures = "You must sign the contract";
        return;
      }
      if (!user || (!accountabilityPartner && !continueWithoutPartner)) return;
      const contractees = [user, accountabilityPartner].filter(
        partner => partner !== null,
      ) as AccountabilityPartner[];
      toast.promise(
        createContract({
          ...values,
          contractees,
        }),
        {
          pending: "Creating contract...",
          success: {
            render() {
              router.push("/contracts");
              return "Contract created successfully";
            },
          },
          error: "Error creating contract",
        },
      );
    },
  });

  const handleAddObligationToContract = (obligation: CreateObligation) => {
    setObligation(obligation);

    formik.setValues({
      ...formik.values,
      obligation,
    });

    setShowDialog(false);
  };

  const handleUpdateObligationInContract = (obligation: CreateObligation) => {
    setObligation(obligation);
    setShowDialog(false);
  };

  const handleRemoveObligationFromContract = (obligation: CreateObligation) => {
    if (!formik.values.obligation) return;
    setObligation(null);
    formik.setValues({
      ...formik.values,
      obligation: null,
    });
    setShowDialog(false);
  };

  const handleBack = () => {
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
        {!accountabilityPartner && !continueWithoutPartner ? (
          <motion.div
            initial={{ x: "100%" }}
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
              className="w-full flex flex-col gap-4"
            >
              <Button
                variant="ghost"
                onClick={handleBack}
                className="self-start sticky p-0 top-0 left-0 w-fit flex justify-start items-center bg-background z-20 hover:bg-transparent"
              >
                <div className="flex flex-row gap-1 items-start md:hover:bg-slate-400/40 p-2 rounded-full">
                  <IoArrowBack className="w-6 h-6" />
                  Back
                </div>
              </Button>
              <div className="w-full h-full overflow-auto flex flex-col gap-12">
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
                    placeholder="Reading books everyday"
                    required
                    error={formik.errors.title}
                  />
                </SectionContainer>

                <SectionContainer>
                  <SectionTitleContainer>
                    <SectionTitle text="Promise" />
                    <SectionTitleExplanation text="Create a promise you want to make in this contract" />
                  </SectionTitleContainer>
                  <div className="w-full flex flex-col-reverse md:flex-row">
                    {!obligation && (
                      <CreatePromise
                        obligation={obligation}
                        open={showDialog}
                        onOpen={() => {
                          setShowDialog(true);
                        }}
                        onClose={() => setShowDialog(false)}
                        onObligationCreated={handleAddObligationToContract}
                        onObligationUpdated={handleUpdateObligationInContract}
                      >
                        <Button variant="secondary" type="button">
                          <div className="flex flex-row gap-1 justify-center items-center">
                            <span>Create a promise</span>
                            <FaPlus className="w-4 h-4" />
                          </div>
                        </Button>
                      </CreatePromise>
                    )}
                    <div className="flex flex-col gap-0 w-full">
                      <div
                        className="flex flex-col-reverse lg:flex-col gap-3 justify-start items-start overflow-auto w-full h-full pb-1"
                        ref={obligationsRef}
                      >
                        <AnimatePresence>
                          {obligation && (
                            <motion.div
                              initial={{ x: "-100%", opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              exit={{ x: "-100%", opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="w-full"
                              key={`obligation-in-contract`}
                            >
                              <ObligationComponent
                                obligation={{
                                  ...obligation,
                                  obligationId: "1",
                                }}
                                onDelete={handleRemoveObligationFromContract}
                                onClick={() => {
                                  setShowDialog(true);
                                }}
                                showDelete
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </SectionContainer>

                <SectionContainer>
                  <SectionTitleContainer>
                    <SectionTitle text="Due date" />
                    <SectionTitleExplanation text="This is when the contract will expire" />
                  </SectionTitleContainer>
                  <Input
                    className="w-fit"
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
                </SectionContainer>
                <SectionContainer>
                  <SectionTitleContainer>
                    <SectionTitle text="Signatures" />
                    <SectionTitleExplanation text="Put your pinky where your mouth is" />
                  </SectionTitleContainer>
                  <div
                    className="flex flex-row gap-4 w-full justify-center items-center"
                    data-onboarding-id="contract-signatures"
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
                    {accountabilityPartner && (
                      <div className="flex flex-col justify-center items-center gap-2 w-1/2 grayscale">
                        <AccountabilityPartnerComponent
                          className="flex-col !p-0"
                          partner={accountabilityPartner}
                        />
                        <Checkbox disabled />
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
