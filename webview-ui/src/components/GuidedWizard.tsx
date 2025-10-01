import TrainRow from "./TrainRow";
import { TrainStatus } from "./TrainRow";
import ConnectionForm from "./ConnectionForm";
import DataDetails from "./DataDetails";
import IndexDetails from "./IndexDetails";
import QuerySettings from "./QuerySettings";


const trains = [
	{ name: "Connection details", progress: 10, status: TrainStatus.InProgress, component: ConnectionForm },
	{ name: "Data details", progress: 60, status: TrainStatus.Unvisited, component: DataDetails },
	{ name: "Index details", progress: 100, status: TrainStatus.Unvisited, component: IndexDetails },
	{ name: "Query settings", progress: 100, status: TrainStatus.Unvisited, component: QuerySettings }
];


interface GuidedWizardProps {
	selectedStep: number;
	onStepSelect: (idx: number) => void;
}

export const GuidedWizard: React.FC<GuidedWizardProps> = ({ selectedStep, onStepSelect }) => {
	return (
		<div className="bg-white rounded-lg shadow p-6 w-full">
			<div className="flex">
				{/* Train rows */}
				<div className="flex flex-col flex-1 space-y-4">
					{trains.map((train, idx) => (
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
export const trainsList = trains;