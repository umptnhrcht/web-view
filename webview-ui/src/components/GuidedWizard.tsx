import React from "react";
import TrainRow from "./TrainRow";
import { TrainStatus } from "./TrainRow";
import ConnectionForm from "./ConnectionForm";
import DataDetails from "./DataDetails";
import IndexDetails from "./IndexDetails";

export interface ConnectionFormProps {
	onSubmit?: (details: { host: string; port: string; user: string; password: string }) => void;
	selectedStep: number;
	setSelectedStep: (idx: number) => void;
}



export const steps = [
	{
		name: "Connection details",
		progress: 10,
		status: TrainStatus.InProgress,
		component: (props: { selectedStep: number; setSelectedStep: (idx: number) => void }) => (
			<ConnectionForm {...props} />
		)
	},
	{
		name: "Data details",
		progress: 60,
		status: TrainStatus.Unvisited,
		component: (props: { selectedStep: number; setSelectedStep: (idx: number) => void; indexName: string; setIndexName: (name: string) => void }) => (
			<DataDetails {...props} />
		)
	},
	{
		name: "Index details",
		progress: 100,
		status: TrainStatus.Unvisited,
		component: (props: { indexName: string }) => (
			<IndexDetails {...props} />
		)
	},
];


interface GuidedWizardProps {
	selectedStep: number;
	onStepSelect: (idx: number) => void;
}

export const GuidedWizard: React.FC<GuidedWizardProps> = ({ selectedStep, onStepSelect }) => {
	// const [indexName, setIndexName] = React.useState("hello");

	return (
		<div className="bg-white rounded-lg shadow p-6 w-full">
			<div className="flex">
				{/* Train rows */}
				<div className="flex flex-col flex-1 space-y-4">
					{steps.map((train, idx) => (
						<TrainRow
							key={train.name}
							progress={train.progress}
							status={train.status}
							stepLabel={train.name}
							style={idx === selectedStep ? { border: '2px solid #2563eb', background: '#e0e7ff' } : {}}
							onClick={() => onStepSelect(idx)}
						/>
					))}
				</div>
			</div>
		</div>
	);
};


export function completeStepAndNext(selectedStep: number, onStepSelect: (idx: number) => void) {
	if (selectedStep < steps.length) {
		// Mark current step as finished
		steps[selectedStep].status = TrainStatus.Finished;
		// Mark next step as in progress if exists
		if (selectedStep + 1 < steps.length) {
			steps[selectedStep + 1].status = TrainStatus.InProgress;
			onStepSelect(selectedStep + 1);
		}
	}
}