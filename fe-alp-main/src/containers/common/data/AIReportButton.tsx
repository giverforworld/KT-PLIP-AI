"use client";

import { useState } from "react";
import SquareButton from "@/components/buttons/SquareButton";
import IconReport from "@images/report.svg";
import AIReportModal from "./AIReportModal";

interface AIReportButtonProps {
  data: DataContainer;
}

export default function AIReportButton({ data }: AIReportButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SquareButton
        Icon={IconReport}
        ariaLabel="AI 리포트"
        onClick={() => setOpen(true)}
      />
      {open && <AIReportModal open={open} setOpen={setOpen} data={data} />}
    </>
  );
}
