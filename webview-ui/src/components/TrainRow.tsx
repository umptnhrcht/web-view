import React from "react";
import "../css/TrainRow.css";
import ProgressRingWithStyle from "./ProgressRing";
// Use static public asset URLs for CSP compliance

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
	Unvisited = 'unvisited',
	Uninitialized = 'uninitialized',
	InProgress = 'in progress',
	Finished = 'finished',
}

interface TrainRowProps {
	progress?: number; // 0-100
	status?: TrainStatus;
	stepLabel?: string;
	style?: React.CSSProperties;
	onClick?: () => void;
}

const WarningIconBg = () => <span className="warning-icon-bg" title="Warning" />;
const SuccessIconBg = () => <span className="success-icon-bg" title="Success" />;
const NeutralIconBg = () => <span className="neutral-icon-bg" title="Unvisited" />;

const TrainRow: React.FC<TrainRowProps> = ({status = TrainStatus.Uninitialized, stepLabel, style, onClick}) => {
	const isClickable = status !== TrainStatus.Uninitialized && status !== TrainStatus.Unvisited;
	const rowClass = `train-row${isClickable ? ' clickable' : ' disabled'}`;
	return (
		<div
			className={rowClass}
			style={style}
			onClick={isClickable ? onClick : undefined}
			tabIndex={isClickable ? 0 : -1}
			role={isClickable ? 'button' : undefined}
			aria-disabled={!isClickable}
		>
			<div className="train-row-label-container">
				<TrainIcon />
				<span className="train-row-label">{stepLabel}</span>
			</div>
			{/* Status indicator */}
			{status === TrainStatus.Unvisited && <NeutralIconBg />}
			{status === TrainStatus.Uninitialized && <WarningIconBg />}
			{status === TrainStatus.InProgress && <ProgressRingWithStyle/>}
			{status === TrainStatus.Finished && <SuccessIconBg />}
		</div>
	);
};

export default TrainRow;