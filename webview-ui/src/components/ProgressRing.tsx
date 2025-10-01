import React from 'react';

const ProgressRing: React.FC = () => (
  <span className="vscode-progress-ring" aria-label="Loading" />
);

// Tailwind is not required, this is pure CSS for the ring.
const styles = `
.vscode-progress-ring {
  display: inline-block;
  width: 32px;
  height: 32px;
}

.vscode-progress-ring:after {
  content: " ";
  display: block;
  width: 24px;
  height: 24px;
  margin: 4px;
  border-radius: 50%;
  border: 3px solid #0078d4; /* VS Code blue */
  border-color: #0078d4 transparent #0078d4 transparent;
  animation: vscode-spin 1.2s linear infinite;
}

@keyframes vscode-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Inject the CSS rules above (for demo purposes)
const ProgressRingWithStyle: React.FC = () => (
  <>
    <style>{styles}</style>
    <ProgressRing />
  </>
);

export default ProgressRingWithStyle;