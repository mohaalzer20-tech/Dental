"use client";

import { useState } from "react";
import OdontogramChart, { type ToothStatus } from "./OdontogramChart";
import ChartForm from "./ChartForm";

type Patient = { id: string; name: string };

export default function ChartPanel({
  patients,
  patientId,
  statuses,
}: {
  patients: Patient[];
  patientId: string;
  statuses: Record<number, ToothStatus>;
}) {
  const [selectedTooth, setSelectedTooth] = useState<number | undefined>(undefined);

  return (
    <div className="flex flex-col gap-4">
      <OdontogramChart statuses={statuses} selected={selectedTooth} onSelect={setSelectedTooth} />
      <ChartForm patients={patients} lockedPatientId={patientId} selectedTooth={selectedTooth} />
    </div>
  );
}
