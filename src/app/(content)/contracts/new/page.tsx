"use client";

import React, { useRef, useState } from "react";
import { Input } from "../../../../components/ui/input";
import { useFormik } from "formik";
import { CreateContract } from "../../../../models/contract";
import { useObligations } from "../../../../lib/hooks/useObligations";
import ObligationComponent from "../../../../components/obligationComponent";
import Obligation from "../../../../models/obligation";
import { AccountabilityPartner } from "../../../../models/appUser";
import useSearchUser from "../../../../lib/hooks/useSearchUser";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../../../../components/ui/button";
import { IoArrowBack } from "react-icons/io5";
import { MdOutlineCancel, MdOutlineAddCircleOutline } from "react-icons/md";
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
          <Button onClick={() => onPartnerSelect()} className="self-end">Sounds good!</Button>
        </div>
        <Divider className="mt-3" />
      </>
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
  const [continueWithoutPartner, setContinueWithoutPartner] =
    useState<boolean>(false);
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
        toast.error("You must add at least one promise");
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
                    <SectionTitle text="Promises" />
                    <SectionTitleExplanation text="Choose the promises you want to make in this contract" />
                  </SectionTitleContainer>
                  <div className="w-full md:max-h-[26rem] flex flex-col-reverse md:flex-row gap-6 md:gap-0.5">
                    <div className="flex flex-col gap-0 w-full">
                      <div className="mt-1 font-light">Your promises</div>
                      <div className="flex flex-col gap-3 justify-start items-start overflow-auto w-full pb-1">
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
                              trailingIcon={
                                <MdOutlineAddCircleOutline
                                  className="w-6 h-6 fill-primary/70"
                                  onClick={() =>
                                    handleAddObligationToContract(obligation)
                                  }
                                />
                              }
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-0 w-full">
                      <div className="mt-1 font-light">In contract</div>
                      <div
                        className="flex flex-col-reverse lg:flex-col gap-3 justify-start items-start overflow-auto w-full h-full pb-1"
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
                                onClick={handleRemoveObligationFromContract}
                                key={obligation.obligationId}
                                trailingIcon={
                                  <MdOutlineCancel
                                    className="w-6 h-6 fill-red-500/60"
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
