import React from 'react';
import "../css/ProgressRing.css";

const ProgressRing: React.FC = () => (
  <span className="vscode-progress-ring" aria-label="Loading" />
);

const ProgressRingWithStyle: React.FC = () => <ProgressRing />;

export default ProgressRingWithStyle;