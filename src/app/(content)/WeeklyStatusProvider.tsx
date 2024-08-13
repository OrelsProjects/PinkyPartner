"use client";

import axios from "axios";
import moment from "moment";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../lib/hooks/redux";
import { StatusReport } from "../../models/statusReport";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  addStatusReport,
  setShowStatusOfContractId,
} from "../../lib/features/status/statusSlice";
import { toast } from "react-toastify";

const StatusReportDialog = ({
  report,
  onClose,
}: {
  report: StatusReport;
  onClose: () => void;
}) => (
  <Dialog
    open={!!report}
    onOpenChange={() => {
      onClose();
    }}
  >
    <DialogContent>
      <DialogClose onClick={onClose} />
      <DialogTitle className="tracking-wide">
        <p>Last week report of:</p>
        <p className="mt-1 text-base font-normal">{report.contract.title}</p>
      </DialogTitle>
      <DialogDescription>
        {report.reports.length > 0
          ? "Here's how you and your partner did last week:"
          : ""}
      </DialogDescription>
      {report.reports.length > 0 ? (
        report.reports.map((userReport, index) => (
          <div key={index} className="flex flex-col">
            <h2 className="font-semibold">{userReport.user.displayName}</h2>
            <span className="font-light">
              Completed:{" "}
              <strong>
                {userReport.report.timesCompleted}/{userReport.report.total}{" "}
                {userReport.report.timesCompleted === userReport.report.total &&
                  "🔥"}
              </strong>
            </span>
            <span>
              Missed: <strong>{userReport.report.timesMissed}</strong>
            </span>
            <span>
              Late: <strong>{userReport.report.timesLate}</strong>
            </span>
          </div>
        ))
      ) : (
        <div className="text-center">
          <p>No reports found. Try again next week :)</p>
        </div>
      )}
    </DialogContent>
  </Dialog>
);

export default function WeeklyStatusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const { showStatusOfContractId } = useAppSelector(state => state.status);

  const [report, setReport] = React.useState<StatusReport | null>(null);

  useEffect(() => {
    if (showStatusOfContractId) {
      const toastId = toast.loading("Loading weekly status report...");
      axios
        .get<StatusReport>("/api/stats/contract/" + showStatusOfContractId)
        .then(res => {
          setReport(res.data);
          dispatch(addStatusReport(res.data));
        })
        .catch(err => {
          toast.error("Failed to load weekly status report");
        })
        .finally(() => {
          toast.dismiss(toastId);
        });
    }
  }, [showStatusOfContractId]);

  return (
    <div className="w-full h-full">
      {report && (
        <StatusReportDialog
          report={report}
          onClose={() => {
            setReport(null);
            dispatch(setShowStatusOfContractId());
          }}
        />
      )}
      {children}
    </div>
  );
}
