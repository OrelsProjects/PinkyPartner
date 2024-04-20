"use client";

import React from "react";
import { Button } from "../../../components/ui/button";
import { useRouter } from "next/navigation";

interface ContractsProps {}

const ContractsPage: React.FC<ContractsProps> = () => {
  const router = useRouter();
  return (
    <Button onClick={() => router.push("/contracts/new")}>
      Create new contract
    </Button>
  );
};

export default ContractsPage;
