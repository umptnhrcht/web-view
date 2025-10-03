import React from "react";
import TrainRow from "./TrainRow";
import { TrainStatus } from "./TrainRow";
import ConnectionForm from "./ConnectionForm";
import DataDetails from "./DataDetails";
import IndexDetails from "./IndexDetails";


export interface RedisConnection {
	host: [string, React.Dispatch<React.SetStateAction<string>>];
	port: [string, React.Dispatch<React.SetStateAction<string>>];
	user: [string, React.Dispatch<React.SetStateAction<string>>];
	password: [string, React.Dispatch<React.SetStateAction<string>>];
	mode: ['hostPort' | 'connectString', React.Dispatch<React.SetStateAction<'hostPort' | 'connectString'>>];
	connectString: [string, React.Dispatch<React.SetStateAction<string>>];
}

export interface DataFormat {
	dataStatus: ['available' | 'index', React.Dispatch<React.SetStateAction<'available' | 'index'>>];
	pattern: [string, React.Dispatch<React.SetStateAction<string>>];
	columns: [Array<{ column: string, types: string[] }>, React.Dispatch<Array<{ column: string, types: string[] }>>];
	vectorizeState: [Record<string, boolean>, React.Dispatch<Record<string, boolean>>];
	indexState: [Record<string, boolean>, React.Dispatch<Record<string, boolean>>]
}

export interface IndexFormat {
	selectedSemanticFields: [{ [key: string]: boolean }, React.Dispatch<{ [key: string]: boolean }>];
    resultFields: [{ [key: string]: boolean }, React.Dispatch<{ [key: string]: boolean }>];
}


export interface ConnectionFormProps {
	onSubmit?: (details: { host: string; port: string; user: string; password: string }) => void;
	selectedStep: number;
	setSelectedStep: (idx: number) => void;
	connection: RedisConnection;
	dataDetails: DataFormat;
	indexData: IndexFormat;
	indexName: string;
	setIndexName: (value: any) => void;
	onSuccess: () => void;
}


export const steps = [
	{
		name: "Connection details",
		progress: 10,
		status: TrainStatus.InProgress,
		component: (props: ConnectionFormProps) => (
			<ConnectionForm {...props} />
		)
	},
	{
		name: "Data details",
		progress: 60,
		status: TrainStatus.Unvisited,
		component: (props: Pick<ConnectionFormProps, 'selectedStep' | 'setSelectedStep' | 'indexName' | 'setIndexName' | 'dataDetails'>) => (
			<DataDetails {...props} />
		)
	},
	{
		name: "Index details",
		progress: 100,
		status: TrainStatus.Unvisited,
		component: (props: Pick<ConnectionFormProps, 'indexName' | 'indexData' | 'onSuccess'>) => (
			<IndexDetails {...props} />
		)
	},
];


interface GuidedWizardProps {
	selectedStep: number;
	onStepSelect: (idx: number) => void;
	onSuccess: () => void;
}


export const GuidedWizard: React.FC<GuidedWizardProps> = ({ selectedStep, onStepSelect }) => {
	// const [indexName, setIndexName] = React.useState("hello");

	const handleStepClick = (idx: number) => {
		if (idx <= selectedStep) {
			// Set all steps after idx to Unvisited
			for (let i = idx + 1; i < steps.length; i++) {
				steps[i].status = TrainStatus.Unvisited;
			}
			onStepSelect(idx);
		}
	};

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
							disabled={idx > selectedStep}
							onClick={() => handleStepClick(idx)}
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