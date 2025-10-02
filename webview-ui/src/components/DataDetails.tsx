import React from "react";
import { vscode } from "../vscode";
import "../css/DataDetails.css";

const DataDetails: React.FC = () => {
	const [dataStatus, setDataStatus] = React.useState<string>('');
	const [keyTypes, setKeyTypes] = React.useState<string>('');
		const handleInferData = () => {
			vscode.postMessage({ command: "inferData" });
		};

	return (
			<div>
				<div className="data-details-row">
					<label className="data-details-label">Data status:</label>
					<label style={{ marginRight: 16 }}>
					<input
						type="radio"
						name="dataStatus"
						value="available"
						checked={dataStatus === 'available'}
						onChange={() => setDataStatus('available')}
						style={{ marginRight: 6 }}
					/>
					Data already available in redis
				</label>
				<label>
					<input
						type="radio"
						name="dataStatus"
						value="index"
						checked={dataStatus === 'index'}
						onChange={() => setDataStatus('index')}
						style={{ marginRight: 6 }}
					/>
					Index already available
				</label>
			</div>
							{dataStatus === 'available' && (
								<div className="data-details-row">
									<label htmlFor="keyTypes" className="data-details-label">Key types:</label>
									<input
										id="keyTypes"
										type="text"
										value={keyTypes}
										onChange={e => setKeyTypes(e.target.value)}
										className="key-types-input"
									/>
									<button
										type="button"
										onClick={handleInferData}
										className="cta-infer-btn"
										aria-label="Infer Data"
									>
										<span className="search-icon-bg" />
									</button>
								</div>
							)}
		</div>
	);
};

export default DataDetails;
