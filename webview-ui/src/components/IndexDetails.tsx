import React from "react";
import "./IndexDetails.css";
import { GET_INDEX, substitute } from "../constants/constants";

export interface IndexDetailsProps {
	indexName: string;
}

const IndexDetails: React.FC<IndexDetailsProps> = ({ indexName }) => {

	const handleDownload = async () => {

		const url = substitute(GET_INDEX, { name: indexName });
		const request = new Request(url);

		const res = await fetch(request);
		if (res.ok) {
			const json = await res.json();
			console.log(json);
		} else {
			console.log('fail');
		}
	};

	return (
		<div className="index-details-container">
			<label htmlFor="indexName">Index Name</label>
			<input
				id="indexName"
				type="text"
				value={indexName}
				readOnly
				className="index-details-input"
			/>
			<button
				onClick={handleDownload}
				className="index-details-btn"
				title="Download"
			>
				<span className="index-details-icon" />
			</button>
		</div>
	);
};

export default IndexDetails;
