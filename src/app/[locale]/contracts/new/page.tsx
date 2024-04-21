"use client";

import React, { useState } from "react";
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
import { useAppSelector } from "../../../../lib/hooks/redux";
import { Checkbox } from "../../../../components/ui/checkbox";

interface CreateContractPageProps {}

interface FindPartnerProps {
  onPartnerSelect: (partner: AccountabilityPartner) => void;
}

const AccountabilityPartnerComponent: React.FC<{
  partner: AccountabilityPartner;
  onClick?: (partner: AccountabilityPartner) => void;
  className?: string;
}> = ({ partner, onClick, className }) => {
  return (
    <div
      className={`flex flex-row gap-1 justify-start items-center pr-4 ${className}`}
      onClick={() => onClick?.(partner)}
    >
      <img
        src={partner.photoURL ?? ""}
        alt={"Partner photo"}
        className="rounded-lg h-10 w-10 object-cover"
      />
      <div key={partner.userId} className="truncate">
        {partner.displayName}
      </div>
    </div>
  );
};

const FindPartner = ({
  onPartnerSelect,
}: FindPartnerProps): React.ReactNode => {
  const { searchResult, searchUsers, loading } = useSearchUser();

  return (
    <div className="flex flex-col gap-2 w-full">
      <Input
        label="Search for your partner"
        type="text"
        placeholder="Orel zilberman"
        onChange={e => searchUsers(e.target.value)}
        autoComplete="on"
        autoFocus
      />
      {loading && (
        <div className="flex flex-col gap-1">
          {[...Array(5)].map((_, index) => (
            <Skeleton
              className="h-4 w-full rounded-full"
              key={`skeleton-${index}`}
            />
          ))}
        </div>
      )}
      {searchResult.map(partner => (
        <AccountabilityPartnerComponent
          partner={partner}
          key={partner.userId}
          onClick={onPartnerSelect}
        />
      ))}
    </div>
  );
};

const CreateContractPage: React.FC<CreateContractPageProps> = () => {
  const { obligations } = useObligations();
  const { user } = useAppSelector(state => state.auth);
  const [accountabilityPartner, setAccountabilityPartner] =
    useState<AccountabilityPartner | null>(null);
  const [previousAccountabilityPartner, setPreviousAccountabilityPartner] =
    useState<AccountabilityPartner | null>(null);
  const [obligationsUsed, setObligationsUsed] = useState<Obligation[]>([]);

  const formik = useFormik<CreateContract>({
    initialValues: {
      title: "",
      dueDate: new Date(),
      description: null,
    },
    onSubmit: values => {
      console.log(values);
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
  };

  const handleBack = () => {
    setPreviousAccountabilityPartner(accountabilityPartner);
    setAccountabilityPartner(null);
  };

  const handlePartnerSelect = (partner: AccountabilityPartner) => {
    setAccountabilityPartner(partner);
    setPreviousAccountabilityPartner(null);
  };

  return (
    <AnimatePresence>
      {!accountabilityPartner ? (
        <motion.div
          // slide in from the right
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          // exit right to left if accountabilityPartner is set, else left to right
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ duration: 0.2 }}
          key="find-partner"
          className="flex flex-col gap-4 justify-start items-start w-full h-fit max-h-full p-3 overflow-auto"
        >
          <div className="flex flex-col gap-4 max-h-full w-full">
            {previousAccountabilityPartner && (
              <div className="flex flex-col gap-1 w-full">
                <span className="font-bold">Previous selection</span>
                <AccountabilityPartnerComponent
                  partner={previousAccountabilityPartner}
                  onClick={handlePartnerSelect}
                />
              </div>
            )}
            <FindPartner onPartnerSelect={handlePartnerSelect} />
          </div>
        </motion.div>
      ) : (
        <motion.div
          // slide in from the right
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{
            x: previousAccountabilityPartner ? "-100%" : "100%",
            opacity: 0,
          }}
          transition={{ duration: 0.2 }}
          key="create-contract"
          className="h-full w-full flex flex-col gap-5 justify-start items-start p-3 overflow-auto"
        >
          <Button
            variant="ghost"
            onClick={handleBack}
            className="self-start p-0"
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
          />
          <TextArea
            label="Description"
            className="h-20"
            name="description"
            value={formik.values.description ?? ""}
            onChange={formik.handleChange}
            placeholder="Orel and Sara will read books everyday for 30 minutes."
            rows={1}
          />
          <div className="flex flex-col gap-0 w-full max-h-32">
            <div className="font-bold mt-1">In contract</div>
            <div className="flex flex-col gap-0.5 justify-start items-start overflow-auto w-full">
              {obligationsUsed.map(obligation => (
                <ObligationComponent
                  obligation={obligation}
                  onClick={handleAddObligationToContract}
                  key={obligation.obligationId}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-0 w-full max-h-32">
            <div className="font-bold mt-1">Your obligations</div>
            <div className="flex flex-col gap-0.5 justify-start items-start overflow-auto w-full">
              {unusedObligations.map(obligation => (
                <ObligationComponent
                  obligation={obligation}
                  onClick={handleAddObligationToContract}
                  key={obligation.obligationId}
                />
              ))}
            </div>
          </div>
          <div className="h-1 w-full border-b border-b-muted mb-4"></div>
          <Input
            className="w-full"
            label="Due Date"
            type="date"
            name="dueDate"
            value={formik.values.dueDate.toISOString().split("T")[0]}
            onChange={e => {
              formik.setFieldValue("dueDate", new Date(e.target.value));
            }}
          />
          <div className="flex flex-col gap-1 w-full h-fit">
            <h1>Signatures</h1>
            <div
              className="flex flex-row gap-4 w-full justify-center items-center"
              id="contract-signatures"
            >
              <div className="flex flex-col justify-center items-center gap-2 w-1/2">
                <AccountabilityPartnerComponent
                  className="flex-col !p-0"
                  partner={user as AccountabilityPartner}
                />
                <Checkbox />
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateContractPage;
