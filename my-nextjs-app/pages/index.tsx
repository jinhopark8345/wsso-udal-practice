import { useState } from "react";

type Data = { user_id: string; data: string };

export default function Home() {
  const [data, setData] = useState<Data | null>(null);
  const [status, setStatus] = useState("Logged out");

  const login = async () => {
    setStatus("Logging in…");
    const r = await fetch("/api/login", { method: "POST" });
    if (!r.ok) {
      setStatus("Login failed");
      return;
    }
    setStatus("Logged in (cookie set)");
  };

  const fetchSecure = async () => {
    setStatus("Fetching secure data…");
    const r = await fetch("/api/secure");
    const json = await r.json();
    if (!r.ok) {
      setStatus("Fetch failed");
      console.error(json);
      return;
    }
    setData(json);
    setStatus("Data loaded");
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>WSSO + UDAL (Mock)</h1>
      <p>Status: {status}</p>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={login}>Login (WSSO mock)</button>
        <button onClick={fetchSecure}>Fetch protected data</button>
      </div>
      <pre style={{ marginTop: 16 }}>
        {data ? JSON.stringify(data, null, 2) : "No data"}
      </pre>
    </div>
  );
}
