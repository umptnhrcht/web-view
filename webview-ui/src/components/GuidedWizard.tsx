import { useState } from "react";


const steps = [
	{ title: "Step 1", content: "Enter your information." },
	{ title: "Step 2", content: "Verify your details." },
	{ title: "Step 3", content: "Complete and submit." },
];


export const GuidedWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  return (
	<div className="bg-white rounded-lg shadow p-6 w-full">
	  <div className="flex">
		{/* Vertical tab list */}
		<div className="flex flex-col mr-6 w-36">
		  {steps.map((step, idx) => (
			<button
			  key={step.title}
			  className={`
				text-left px-4 py-3 mb-2 rounded-lg transition 
				focus:outline-none 
				${idx === currentStep
				  ? 'bg-blue-600 text-white font-semibold border-l-4 border-blue-700 shadow'
				  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-l-4 border-transparent'}
			  `}
			  onClick={() => setCurrentStep(idx)}
			>
			  {step.title}
			</button>
		  ))}
		</div>
		{/* Step Content */}
		<div className="flex-1">
		  <h2 className="text-lg font-semibold mb-2">{steps[currentStep].title}</h2>
		  <p className="mb-4">{steps[currentStep].content}</p>
		  <div className="flex space-x-2">
			<button
			  className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
			  disabled={currentStep === 0}
			  onClick={() => setCurrentStep((s) => Math.max(s - 1, 0))}
			>
			  Backkkk
			</button>
			<button
			  className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
			  disabled={currentStep === steps.length - 1}
			  onClick={() => setCurrentStep((s) => Math.min(s + 1, steps.length - 1))}
			>
			  Next
			</button>
		  </div>
		</div>
	  </div>
	</div>
  );
};