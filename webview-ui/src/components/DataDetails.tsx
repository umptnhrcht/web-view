import React from "react";
import { vscode } from "../vscode";
import "../css/DataDetails.css";
import { nanoid } from "nanoid";
import GlobalEventHandler from "../GlobalEventHandler";

const DataDetails: React.FC = () => {
	const [dataStatus, setDataStatus] = React.useState<string>('');
	const [pattern, setPattern] = React.useState<string>('');
	const [columns, setColumns] = React.useState<Array<{ column: string, types: string[] }>>([]);
	const [vectorizeState, setVectorizeState] = React.useState<Record<string, boolean>>({});
	const [indexState, setIndexState] = React.useState<Record<string, boolean>>({});

	// Generate a unique id for each inferData request
	const handleInferData = () => {
		const id = nanoid();
		vscode.postMessage({ command: "inferData", id, data: { pattern } });
		GlobalEventHandler.getInstance().register(id, (payload: any) => {
			console.log("payload is", payload)
			if (payload && Array.isArray(payload.externalpayload.keys)) {
				console.log(payload.externalpayload.keys);
				console.log('hello');
				setColumns(payload.externalpayload.keys);
			}
		});
	};

	const handleVectorizeChange = (colName: string) => {
		setVectorizeState(prev => ({ ...prev, [colName]: !prev[colName] }));
		setIndexState(prev => ({ ...prev, [colName]: !prev[colName] ? true : prev[colName] }));
	};

	const handleIndexChange = (colName: string) => {
		// Only allow manual change if not vectorized
		if (!vectorizeState[colName]) {
			setIndexState(prev => ({ ...prev, [colName]: !prev[colName] }));
		}
	};

	const handleVectorizeSubmit = () => {
		const vectorizeCols = Object.entries(vectorizeState)
			.filter(([_, v]) => v)
			.map(([col]) => col);
		const indexCols = Object.entries(indexState)
			.filter(([_, v]) => v && !vectorizeState[_])
			.map(([col]) => col);

		console.log(vectorizeCols, indexCols);
		const id = nanoid();
		vscode.postMessage({
			command: "vectorize",
			id,
			data: {
				columns: {
					vectorize: vectorizeCols,
					index: indexCols
				},
				pattern
			}
		});
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
					<label htmlFor="pattern" className="data-details-label">Pattern:</label>
					<input
						id="pattern"
						type="text"
						value={pattern}
						onChange={e => setPattern(e.target.value)}
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

			{columns.length > 0 && (
				<>
					<hr className="data-details-divider" />
					<div className="data-details-columns">
						<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
							<h4>Inferred Columns</h4>
							<button type="button" className="outlined-action-btn" onClick={handleVectorizeSubmit}>
								Vectorize &amp; Create Index
							</button>
						</div>
						<table className="data-details-table">
							<thead>
								<tr>
									<th className="table-header">Column Name</th>
									<th className="table-header">Datatype</th>
									<th className="table-header">Vectorize</th>
									<th className="table-header">Index</th>
								</tr>
							</thead>
							<tbody>
								{columns.map(col => (
									<tr key={col.column}>
										<td className="table-cell-accent">{col.column}</td>
										<td className="table-cell-accent">{col.types.join(', ')}</td>
										<td>
											<input
												type="checkbox"
												name={`vectorize-${col.column}`}
												checked={!!vectorizeState[col.column]}
												onChange={() => handleVectorizeChange(col.column)}
											/>
										</td>
										<td>
											<input
												type="checkbox"
												name={`index-${col.column}`}
												checked={!!indexState[col.column]}
												disabled={!!vectorizeState[col.column]}
												onChange={() => handleIndexChange(col.column)}
											/>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</>
			)}
		</div>
	);
};

export default DataDetails;
