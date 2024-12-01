import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/lib/store";
import { StatusReport } from "../../models/statusReport";

type ContractId = string;

export interface StatusState {
  showStatusOfContractId?: ContractId;
  reports: StatusReport[];
}

export const initialState: StatusState = {
  reports: [],
};

const statusSlice = createSlice({
  name: "status",
  initialState,
  reducers: {
    setShowStatusOfContractId: (
      state,
      action: { payload: ContractId | undefined },
    ) => {
      state.showStatusOfContractId = action.payload;
    },
    addStatusReport: (state, action: { payload: StatusReport }) => {
      const existingReport = state.reports.find(
        report =>
          report.contract.contractId === action.payload.contract.contractId,
      );
      if (existingReport) {
        existingReport.reports = action.payload.reports;
        return;
      }
      state.reports.push(action.payload);
    },
  },
});

export const { setShowStatusOfContractId, addStatusReport } =
  statusSlice.actions;

export const selectSlice = (state: RootState): StatusState => state.status;

export default statusSlice.reducer;
