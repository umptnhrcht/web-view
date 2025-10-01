import React, { useState } from "react";
import { vscode } from "../vscode";

interface ConnectionFormProps {
  onSubmit?: (details: { host: string; port: string; user: string; password: string }) => void;
}

export const ConnectionForm: React.FC<ConnectionFormProps> = ({ onSubmit }) => {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = { host, port, user, password };
    if (onSubmit) {
      onSubmit(formData);
    }
    // Send message to VS Code backend
    vscode.postMessage({ command: "submitConnectionForm", data: formData });
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
          required
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
          required
          style={{ flex: 1, padding: "0.5rem", borderRadius: 6, border: "1px solid #ccc" }}
        />
      </div>
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
