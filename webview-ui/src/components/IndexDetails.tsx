import React, { useEffect } from "react";
import "./IndexDetails.css";
import { GET_INDEX, substitute } from "../constants/constants";
import type { ConnectionFormProps } from "./GuidedWizard";

export interface IndexDetailsProps extends Pick<ConnectionFormProps, 'indexName' | 'indexData' | 'onSuccess'> {

}

const IndexDetails: React.FC<IndexDetailsProps> = ({ indexName, indexData, onSuccess }) => {

	if (!indexData) throw Error("Uninited index data passed");

	const [details, setDetails] = React.useState<any | null>(null);
	const [selectedSemanticFields, setSelectedSemanticFields] = indexData.selectedSemanticFields;
	const [saveDisabled, setSaveDisabled] = React.useState<boolean>(true);
	useEffect(() => {
		// Enable save only if at least one semantic field is selected
		const anySelected = Object.values(selectedSemanticFields).some(v => v);
		setSaveDisabled(!anySelected);
	}, [selectedSemanticFields]);

	const handleLoadIndexDetails = async () => {
		const url = substitute(GET_INDEX, { name: indexName });
		const request = new Request(url);
		const res = await fetch(request);
		if (res.ok) {
			const json = await res.json();
			setDetails(json);
			// Reset selected fields when loading new details
			if (json.fields) {
				const initial: { [key: string]: boolean } = {};
				json.fields.forEach((field: any) => {
					initial[field.alias] = false;
				});
				setSelectedSemanticFields(initial);
			}
		} else {
			setDetails(null);
			setSelectedSemanticFields({});
			console.log('fail');
		}
	};

	const handleSemanticCheckboxChange = (alias: string) => {
		setSelectedSemanticFields({ ...selectedSemanticFields, [alias]: !selectedSemanticFields[alias] });
	};

	const handleSaveConfig = () => {
		onSuccess();
	};

	return (
		<div className="index-details-container">
			<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
				<label htmlFor="indexName">Index Name</label>
				<input
					id="indexName"
					type="text"
					value={indexName}
					readOnly
					className="index-details-input"
				/>
				<button
					onClick={handleLoadIndexDetails}
					className="outlined-action-btn"
					style={{ padding: "0.4rem 1.1rem", borderRadius: 20, fontWeight: 600, fontSize: "0.95rem" }}
					title="Load Index Details"
				>
					Load Index Details
				</button>
			</div>
			<hr className="index-details-divider" style={{ margin: "24px 0" }} />
			{details && (
				<div className="index-details-info" style={{ background: '#f8fafc', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 6px rgba(37,99,235,0.07)', marginTop: 0 }}>
					<div style={{ display: 'flex', gap: 32, marginBottom: 18 }}>
						<div style={{ minWidth: 180 }}>
							<span style={{ fontWeight: 600, color: '#2563eb', fontSize: '1.05rem' }}>Index Name:</span>
							<div style={{ fontSize: '1.05rem', color: '#222', marginTop: 2 }}>{details.index_name}</div>
						</div>
						<div style={{ minWidth: 180 }}>
							<span style={{ fontWeight: 600, color: '#2563eb', fontSize: '1.05rem' }}>Number of Documents:</span>
							<div style={{ fontSize: '1.05rem', color: '#222', marginTop: 2 }}>{details.num_docs}</div>
						</div>
						<div style={{ minWidth: 180 }}>
							<span style={{ fontWeight: 600, color: '#2563eb', fontSize: '1.05rem' }}>Indexing:</span>
							<div style={{ fontSize: '1.05rem', color: '#222', marginTop: 2 }}>{details.indexing}</div>
						</div>
					</div>
					<div style={{ marginBottom: 12 }}>
						<span style={{ fontWeight: 600, color: '#2563eb', fontSize: '1.05rem' }}>Fields:</span>
						<table className="index-details-table" style={{ marginTop: 10, width: "100%", borderCollapse: "collapse", background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(37,99,235,0.07)' }}>
							<thead>
								<tr style={{ background: '#e0e7ff' }}>
									<th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #dbeafe", fontWeight: 600, color: '#2563eb' }}>Alias</th>
									<th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #dbeafe", fontWeight: 600, color: '#2563eb' }}>Path</th>
									<th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #dbeafe", fontWeight: 600, color: '#2563eb' }}>Type</th>
									<th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #dbeafe", fontWeight: 600, color: '#2563eb' }}>Weight</th>
									<th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #dbeafe", fontWeight: 600, color: '#2563eb' }}>Select for Semantic Search</th>
								</tr>
							</thead>
							<tbody>
								{details.fields.map((field: any, idx: number) => (
									<tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
										<td style={{ padding: "8px 12px", color: '#222' }}>{field.alias}</td>
										<td style={{ padding: "8px 12px", color: '#222' }}>{field.path}</td>
										<td style={{ padding: "8px 12px", color: '#222' }}>{field.type}</td>
										<td style={{ padding: "8px 12px", color: '#222' }}>{field.weight !== null ? field.weight : "-"}</td>
										<td style={{ padding: "8px 12px", textAlign: 'center' }}>
											<input
												type="checkbox"
												checked={!!selectedSemanticFields[field.alias]}
												onChange={() => handleSemanticCheckboxChange(field.alias)}
												disabled={field.type !== 'VECTOR'}
												style={{ width: 18, height: 18, accentColor: '#2563eb', cursor: field.type === 'VECTOR' ? 'pointer' : 'not-allowed' }}
											/>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
						<button
							type="button"
							className="outlined-action-btn"
							disabled={saveDisabled}
							style={{
								padding: "0.5rem 1.4rem",
								borderRadius: 20,
								fontWeight: 600,
								fontSize: "1rem",
								background: saveDisabled ? '#a5b4fc' : '#2563eb',
								color: '#fff',
								boxShadow: '0 1px 4px rgba(37,99,235,0.10)',
								cursor: saveDisabled ? 'not-allowed' : 'pointer',
								opacity: saveDisabled ? 0.6 : 1
							}}
							onClick={handleSaveConfig}
						>
							Save Config
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

export default IndexDetails;