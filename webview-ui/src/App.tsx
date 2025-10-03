import "./App.css";
import { GuidedWizard, steps, type DataFormat, type IndexFormat, type RedisConnection } from './components/GuidedWizard';

import React from "react";
import { vscode } from "./vscode";

function App() {
	const [leftWidth, setLeftWidth] = React.useState(30); // percent
	const dragging = React.useRef(false);
	const [selectedStep, setSelectedStep] = React.useState(0);
	const [indexName, setIndexName] = React.useState<string>('');


	// Lift states
	// Connection state
	const connection: RedisConnection = {
		host: React.useState(''),
		port: React.useState(''),
		connectString: React.useState(''),
		mode: React.useState<'hostPort' | 'connectString'>('hostPort'),
		password: React.useState(''),
		user: React.useState('')
	}

	// data state
	const dataDetails: DataFormat = {
		dataStatus: React.useState<'available' | 'index'>('available'),
		pattern: React.useState(''),
		columns: React.useState<{ column: string; types: string[] }[]>([]),
		indexState: React.useState({}),
		vectorizeState: React.useState({})
	}

	// index state
	const indexData: IndexFormat = {
		selectedSemanticFields: React.useState({})
	}
	function transform<T extends { [K in keyof T]: [any, any] }>(
		obj: T
	): { [K in keyof T]: T[K][0] } {
		return Object.fromEntries(
			Object.entries(obj).map(([key, value]) => [key, (value as [any, any])[0]])
		) as { [K in keyof T]: T[K][0] };
	}
	function prepareConfigFile() {
		const message = {
			command: 'saveFile',
			data: {
				connection: transform(connection),
				dataDetails: transform(dataDetails),
				indexData: transform(indexData),
				indexName: indexName
			}
		}
		console.log(message);
		vscode.postMessage(message);
	}


	function handleMouseDown(_e: React.MouseEvent<HTMLDivElement>) {
		dragging.current = true;
		document.body.style.cursor = 'col-resize';
	}

	function handleMouseUp(_e: MouseEvent) {
		dragging.current = false;
		document.body.style.cursor = '';
	}

	function handleMouseMove(e: MouseEvent) {
		if (!dragging.current) return;
		const screenWidth = window.innerWidth;
		let newLeftWidth = (e.clientX / screenWidth) * 100;
		// Ensure both columns have at least 30% width
		newLeftWidth = Math.max(30, Math.min(70, newLeftWidth));
		setLeftWidth(newLeftWidth);
	}

	React.useEffect(() => {
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, []);

	// Helper to extract and render the right-side step component from GuidedWizard
	function getStepComponent(selectedStep: number, setSelectedStep: (idx: number) => void) {
		const step = steps[selectedStep];
		return step.component({ selectedStep, setSelectedStep, indexName, setIndexName, connection, dataDetails, indexData, onSuccess: prepareConfigFile });
	}

	return (
		<div className="flex flex-col md:flex-row min-h-screen" style={{ position: 'relative' }}>
			{/* Left Column */}
			<div
				className="bg-gray-100 p-6"
				style={{ width: `${leftWidth}%`, minWidth: '30%', maxWidth: '70%' }}
			>
				<GuidedWizard selectedStep={selectedStep} onStepSelect={setSelectedStep} onSuccess={prepareConfigFile} />
			</div>
			{/* Draggable Separator */}
			<div
				style={{
					width: 8,
					cursor: 'col-resize',
					background: '#e5e7eb',
					zIndex: 10,
					position: 'relative',
				}}
				onMouseDown={handleMouseDown}
			/>
			{/* Right Column */}
			<div
				className="bg-white p-6"
				style={{ width: `calc(100% - ${leftWidth}% - 8px)`, minWidth: '30%', maxWidth: '70%' }}
			>
				{getStepComponent(selectedStep, setSelectedStep)}
			</div>
		</div>
	);
}

export default App;