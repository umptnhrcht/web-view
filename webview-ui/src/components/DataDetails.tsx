import React, { useEffect } from "react";

export interface DataDetailsProps extends Pick<ConnectionFormProps, 'selectedStep' | 'setSelectedStep' | 'indexName' | 'setIndexName' | 'dataDetails'> {
}

import "../css/DataDetails.css";
import { INDEX_DATA, INFER_DATA, JSON_HEADERS } from "../constants/constants";
import { completeStepAndNext, type ConnectionFormProps } from "./GuidedWizard";

const DataDetails: React.FC<DataDetailsProps> = ({ selectedStep, setSelectedStep, indexName, setIndexName, dataDetails }) => {
	if (!dataDetails) throw Error('Uninitialized data details passed.');

	const [dataStatus, setDataStatus] = dataDetails?.dataStatus;
	const [pattern, setPattern] = dataDetails.pattern;
	const [columns, setColumns] = dataDetails.columns;
	const [vectorizeState, setVectorizeState] = dataDetails.vectorizeState;
	const [indexState, setIndexState] = dataDetails.indexState;
	const [isLoadIndexDisabled, setIsLoadIndexDisabled] = React.useState<boolean>(false);

	useEffect(() => {

		const isIndexNameEmpty = indexName.trim().length === 0;

		const vectorizeSelected = Object.values(vectorizeState).some(Boolean);
		const indexingSelected = Object.values(indexState).some(Boolean);

		// disabled if:
		// 1. indexName is empty, OR
		// 2. if dataStatus is 'available' AND (columns.length === 0 OR both selections false)
		const disabled =
			isIndexNameEmpty ||
			(dataStatus === "available" &&
				(columns.length === 0 || (!vectorizeSelected && !indexingSelected)));

		setIsLoadIndexDisabled(disabled);
	}, [dataStatus, columns, indexName, indexState, vectorizeState]);


	useEffect(() => {
		if (columns.length === 0) {
			setVectorizeState({});
			setIndexState({});
		}
	}, [columns]);

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
		const toSet = !vectorizeState[colName];
		setVectorizeState({ ...vectorizeState, [colName]: toSet });
		setIndexState({ ...indexState, [colName]: toSet ? true : indexState[colName] });
	};

	const handleIndexChange = (colName: string) => {
		// Only allow manual change if not vectorized
		if (!vectorizeState[colName]) {
			setIndexState(({ ...indexState, [colName]: !indexState[colName] }));
		}
	};

	const indexNameRef = React.useRef<HTMLInputElement>(null);

	const handleVectorizeSubmit = async () => {
		if (!indexName.trim()) {
			if (indexNameRef.current) {
				indexNameRef.current.focus();
			}
			return;
		}

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
			indexName
		};

		const request = new Request(INDEX_DATA, {
			method: 'POST',
			headers: JSON_HEADERS,
			body: JSON.stringify(payload)
		});

		const res = await fetch(request);
		if (res.ok) {
			const json = await res.json();
			console.log(json);
		} else {
			console.log('fail');
		}
	};

	const clearColumns = async () => {
		setColumns([]);
	}

	const moveIntoNext = async () => {

		if (dataStatus === 'available')
			await handleVectorizeSubmit();

		completeStepAndNext(selectedStep, setSelectedStep);
	}

	return (
		<div>
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
				<div className="data-details-row">
					<label htmlFor="index-name" className="data-details-label">Index name:</label>
					<input
						id="index-name"
						type="text"
						value={indexName}
						required
						onChange={e => setIndexName(e.target.value)}
						className="key-types-input"
						ref={indexNameRef}
					/>
				</div>
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
									<div>
										<button type="button" className="outlined-action-btn" onClick={clearColumns}>
											Clear columns
										</button>
									</div>

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

			<button
				type="submit"
				onClick={moveIntoNext}
				disabled={isLoadIndexDisabled}
				style={{
					padding: "0.4rem 1.1rem",
					borderRadius: 20,
					background: "#2563eb",
					color: "#fff",
					fontWeight: 600,
					border: "none",
					cursor: isLoadIndexDisabled ? "not-allowed" : "pointer",
					fontSize: "0.95rem",
					boxShadow: "0 1px 4px rgba(37,99,235,0.10)",
					transition: "background 0.2s",
					opacity: isLoadIndexDisabled ? 0.6 : 1
				}}
			>
				{dataStatus === 'available' ? 'Vectorize & Load index' : 'Load index'}
			</button>
		</div>
	);
};

export default DataDetails;
