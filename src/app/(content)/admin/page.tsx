"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import Loading from "../../../components/ui/loading";

export type ContractsStats = {
  [key: string]: {
    contractsCount: number;
    promisesDoneCount: number;
    email: string;
  };
};

async function getContracts() {
  const contracts = await axios.get<ContractsStats>("/api/admin/contracts");
  return contracts.data || [];
}

const ContractStatComponent = ({
  name,
  contractsCount,
  promisesDoneCount,
  email,
}: {
  name: string;
  contractsCount: number;
  promisesDoneCount: number;
  email: string;
}) => (
  <div className="grid grid-cols-[1fr_0.2fr_0.2fr_1fr] justify-center items-center gap-10 p-4 shadow-lg rounded-md dark:bg-card">
    <h2>{name}</h2>
    <p className="h-12 w-12 rounded-full border-[1px] border-secondary p-2 text-center flex justify-center items-center">
      {contractsCount}
    </p>
    <p className="h-12 w-12 rounded-full border-[1px] border-secondary p-2 text-center flex justify-center items-center">
      {promisesDoneCount}
    </p>
    <p>{email}</p>
  </div>
);

export default function Home() {
  const [contracts, setContracts] = useState<ContractsStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContracts()
      .then(contracts => setContracts(contracts))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <Loading spinnerClassName="w-12 h-12" />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-[1fr_0.2fr_0.2fr_1fr] justify-center items-center gap-6">
            <h2>Creator</h2>
            <h2>Contracts</h2>
            <h2>Promises</h2>
            <h2>Email</h2>
          </div>
          {Object.entries(contracts)
            .sort(([, a], [, b]) => b.promisesDoneCount - a.promisesDoneCount)
            .map(([name, { contractsCount, promisesDoneCount, email }]) => (
              <ContractStatComponent
                key={name}
                name={name}
                promisesDoneCount={promisesDoneCount}
                contractsCount={contractsCount}
                email={email}
              />
            ))}
        </div>
      )}
    </div>
  );
}
