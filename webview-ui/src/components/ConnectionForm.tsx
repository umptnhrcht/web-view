import React from "react";
import { completeStepAndNext, type ConnectionFormProps } from "./GuidedWizard";
import { JSON_HEADERS, PING_REDIS } from "../constants/constants";

interface RedisConnectiondetails {
	mode: 'connectString' | 'hostPort';
	user: string;
	password: string;
	host: string;
	port: string;
	connectString: string;
}

export const ConnectionForm: React.FC<ConnectionFormProps> = ({ onSubmit, selectedStep, setSelectedStep, connection }) => {

	if (!connection) throw Error('Undefined connection object.');

	const [mode, setMode] = connection.mode;
	const [host, setHost] = connection.host;
	const [port, setPort] = connection.port;
	const [user, setUser] = connection.user;
	const [password, setPassword] = connection.password
	const [connectString, setConnectString] = connection.connectString;

	setConnectString('redis://default:lQa8f11g3HSqLgJATWHIwpkIwFN2MhwE@redis-13666.crce217.ap-south-1-1.ec2.redns.redis-cloud.com:13666');

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		const formData: RedisConnectiondetails = { host, port, user, password, mode, connectString };

		if (onSubmit) {
			onSubmit(formData);
		}

		const request = new Request(PING_REDIS,
			{
				method: 'POST',
				headers: JSON_HEADERS,
				body: JSON.stringify(formData)
			});
		const res = await fetch(request);
		if (res.ok) {
			completeStepAndNext(selectedStep, setSelectedStep);
		} else {
			console.log('fail');
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "1.5rem",
				maxWidth: 400,
				margin: "0 auto",
				background: "none",
				padding: 0,
				borderRadius: 0,
				boxShadow: "none",
			}}
		>
			<div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
				<label style={{ fontWeight: 500 }}>
					<input
						type="radio"
						name="mode"
						value="hostPort"
						checked={mode === 'hostPort'}
						onChange={() => setMode('hostPort')}
						style={{ marginRight: 6 }}
					/>
					Host:Port
				</label>
				<label style={{ fontWeight: 500 }}>
					<input
						type="radio"
						name="mode"
						value="connectString"
						checked={mode === 'connectString'}
						onChange={() => setMode('connectString')}
						style={{ marginRight: 6 }}
					/>
					Connect String
				</label>
			</div>
			{mode === 'hostPort' && <>
				{/* Host */}
				<div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
					<label htmlFor="host" style={{ minWidth: 90, fontWeight: 500, textAlign: 'right' }}>Host</label>
					<input
						id="host"
						type="text"
						value={host}
						onChange={e => setHost(e.target.value)}
						required
						style={{ flex: 1, padding: "0.5rem", borderRadius: 6, border: "1px solid #ccc" }}
					/>
				</div>
				{/* Port */}
				<div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
					<label htmlFor="port" style={{ minWidth: 90, fontWeight: 500, textAlign: 'right' }}>Port</label>
					<input
						id="port"
						type="text"
						value={port}
						onChange={e => setPort(e.target.value)}
						required
						style={{ flex: 1, padding: "0.5rem", borderRadius: 6, border: "1px solid #ccc" }}
					/>
				</div>
				{/* User */}
				<div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
					<label htmlFor="user" style={{ minWidth: 90, fontWeight: 500, textAlign: 'right' }}>User</label>
					<input
						id="user"
						type="text"
						value={user}
						onChange={e => setUser(e.target.value)}
						style={{ flex: 1, padding: "0.5rem", borderRadius: 6, border: "1px solid #ccc" }}
					/>
				</div>
				{/* Password */}
				<div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
					<label htmlFor="password" style={{ minWidth: 90, fontWeight: 500, textAlign: 'right' }}>Password</label>
					<input
						id="password"
						type="password"
						value={password}
						onChange={e => setPassword(e.target.value)}
						style={{ flex: 1, padding: "0.5rem", borderRadius: 6, border: "1px solid #ccc" }}
					/>
				</div>
			</>}
			{mode === 'connectString' && <>
				<div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
					<label htmlFor="connectString" style={{ minWidth: 90, fontWeight: 500, textAlign: 'right' }}>Connect String</label>
					<input
						id="connectString"
						type="text"
						value={connectString}
						onChange={e => setConnectString(e.target.value)}
						required
						style={{ flex: 1, padding: "0.5rem", borderRadius: 6, border: "1px solid #ccc" }}
					/>
				</div>
			</>}
			<div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
				<button
					type="submit"
					style={{
						padding: "0.4rem 1.1rem",
						borderRadius: 20,
						background: "#2563eb",
						color: "#fff",
						fontWeight: 600,
						border: "none",
						cursor: "pointer",
						fontSize: "0.95rem",
						boxShadow: "0 1px 4px rgba(37,99,235,0.10)",
						transition: "background 0.2s",
					}}
				>
					Connect
				</button>
			</div>
		</form>
	);
};

export default ConnectionForm;
