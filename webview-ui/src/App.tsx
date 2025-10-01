import "./App.css";
import { GuidedWizard, trainsList } from './components/GuidedWizard';

import React from "react";



function App() {
	const [leftWidth, setLeftWidth] = React.useState(30); // percent
	const dragging = React.useRef(false);
	const [selectedStep, setSelectedStep] = React.useState(0);

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

	const StepComponent = trainsList[selectedStep].component;
	return (
		<div className="flex flex-col md:flex-row min-h-screen" style={{ position: 'relative' }}>
			{/* Left Column */}
			<div
				className="bg-gray-100 p-6"
				style={{ width: `${leftWidth}%`, minWidth: '30%', maxWidth: '70%' }}
			>
				<GuidedWizard selectedStep={selectedStep} onStepSelect={setSelectedStep} />
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
				<StepComponent />
			</div>
		</div>
	);
}

export default App;