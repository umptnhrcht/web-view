import { useState } from "react";
import TrainRow from "./TrainRow";
import { TrainStatus } from "./TrainRow";

const trains = [
  { name: "Express Alpha", progress: 10, status: TrainStatus.Uninitialized },
  { name: "Regional Beta", progress: 60, status: TrainStatus.InProgress },
  { name: "Metro Gamma", progress: 100, status: TrainStatus.Finished },
];


export const GuidedWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="bg-white rounded-lg shadow p-6 w-full">
      <div className="flex">
        {/* Vertical tab list */}
        <div className="flex flex-col mr-6 w-36">
          {/* ...existing step buttons... */}
        </div>
        {/* Train rows */}
        <div className="flex flex-col flex-1 space-y-4">
          {trains.map(train => (
            <TrainRow
              key={train.name}
              progress={train.progress}
              status={train.status}
            />
          ))}
        </div>
      </div>
    </div>
  );
};