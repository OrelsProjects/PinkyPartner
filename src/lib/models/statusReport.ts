import { Contract, Obligation } from "@prisma/client";

export interface UserDetails {
  displayName: string;
}

export interface UserReport {
  timesCompleted: number;
  timesMissed: number;
  timesLate: number;
  total: number;
}

export interface StatusReport {
  contract: Contract;
  reports: {
    obligation: Obligation;
    report: UserReport;
    user: UserDetails;
  }[];
}
