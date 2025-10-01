import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import React from "react";
import ProgressRingWithStyle from "./ProgressRing";
import successIcon from "../assets/success.svg";
import warningIcon from "../assets/warning.svg";
// You can replace the SVG below with any icon you prefer
const TrainIcon = () => (
	<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="4" y="7" width="16" height="10" rx="4" fill="#2563eb" />
		<rect x="7" y="10" width="2" height="2" rx="1" fill="#fff" />
		<rect x="15" y="10" width="2" height="2" rx="1" fill="#fff" />
		<rect x="10" y="14" width="4" height="1.5" rx="0.75" fill="#fff" />
	</svg>
);


export enum TrainStatus {
	Uninitialized = 'uninitialized',
	InProgress = 'in progress',
	Finished = 'finished',
}

interface TrainRowProps {
	progress?: number; // 0-100
	status?: TrainStatus;
}

const statusColors: Record<TrainStatus, string> = {
	[TrainStatus.Uninitialized]: '#d1d5db', // gray
	[TrainStatus.InProgress]: '#2563eb', // blue
	[TrainStatus.Finished]: '#22c55e', // green
};

const statusLabels: Record<TrainStatus, string> = {
	[TrainStatus.Uninitialized]: 'Uninitialized',
	[TrainStatus.InProgress]: 'In Progress',
	[TrainStatus.Finished]: 'Finished',
};

const WarningIcon = () => (
	<img src={warningIcon} alt="Warning" className="warning-icon" />
);

const SuccessIcon = () => (
	<img src={successIcon} alt="Success" className="success-icon" />
);

const TrainRow: React.FC<TrainRowProps> = ({ progress = 50, status = TrainStatus.Uninitialized }) => {
	return (
		<div style={{
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			padding: '12px 20px',
			background: '#f3f4f6',
			borderRadius: 8,
			boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
		}}>
			<div style={{ display: 'flex', alignItems: 'center' }}>
				<TrainIcon />
				<span style={{ marginLeft: 12, fontWeight: 500, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Train Name</span>
			</div>
			{/* Status indicator */}
			{status === TrainStatus.Uninitialized && <WarningIcon />}
			{status === TrainStatus.InProgress && <ProgressRingWithStyle/>}
			{status === TrainStatus.Finished && <SuccessIcon />}
		</div>
	);
};

export default TrainRow;