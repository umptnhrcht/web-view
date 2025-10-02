import React from "react";

export interface DataDetailsProps extends ConnectionFormProps {
	indexName: string;
	setIndexName: (name: string) => void;
}
import "../css/DataDetails.css";
import { INDEX_DATA, INFER_DATA, JSON_HEADERS } from "../constants/constants";
import { completeStepAndNext, type ConnectionFormProps } from "./GuidedWizard";

const DataDetails: React.FC<DataDetailsProps> = ({ selectedStep, setSelectedStep }) => {
	const [dataStatus, setDataStatus] = React.useState<string>('');
	const [pattern, setPattern] = React.useState<string>('');
	const [columns, setColumns] = React.useState<Array<{ column: string, types: string[] }>>([]);
	const [vectorizeState, setVectorizeState] = React.useState<Record<string, boolean>>({});
	const [indexState, setIndexState] = React.useState<Record<string, boolean>>({});

	const handleInferData = async () => {

		const payload = {
			pattern
		}
		const request = new Request(INFER_DATA, {
			method: 'POST',
			headers: JSON_HEADERS,
			body: JSON.stringify(payload)
		});

		const res = await fetch(request);
		if (res.ok) {
			const json = await res.json();
			const columnsData = json.columns;
			setColumns(columnsData);
		} else {
			console.log('fail');
		}
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

	const handleVectorizeSubmit = async () => {
		const vectorizeCols = Object.entries(vectorizeState)
			.filter(([_, v]) => v)
			.map(([col]) => col);
		const indexCols = Object.entries(indexState)
			.filter(([_, v]) => v && !vectorizeState[_])
			.map(([col]) => col);

		const payload = {
			columns: {
				Vectorizable: vectorizeCols,
				indexable: indexCols
			},
			keyPrefix: pattern,
			indexName: "hello"
		}

		const request = new Request(INDEX_DATA, {
			method: 'POST',
			headers: JSON_HEADERS,
			body: JSON.stringify(payload)
		});

		const res = await fetch(request);
		if (res.ok) {
			const json = await res.json();
			console.log(json);
			completeStepAndNext(selectedStep, setSelectedStep);
		} else {
			console.log('fail');
		}
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
				<div>
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
			)}

		</div>
	);
};

export default DataDetails;
