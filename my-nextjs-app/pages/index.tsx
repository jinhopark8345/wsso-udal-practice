import { useState } from "react";
import { log, newReqId } from "../lib/logger";

type Data = { user_id: string; data: string };

export default function Home() {
  const [data, setData] = useState<Data | null>(null);
  const [status, setStatus] = useState("Logged out");

  const login = async () => {
    const reqId = newReqId();
    log(`[UI] Click: Login (reqId=${reqId})`);
    setStatus("Logging in…");
    const r = await fetch("/api/login", {
      method: "POST",
      headers: { "x-request-id": reqId },
    });
    log(`[UI] /api/login status=${r.status} (reqId=${reqId})`);
    if (!r.ok) {
      setStatus("Login failed");
      return;
    }
    setStatus("Logged in (cookie set)");
  };

  const fetchSecure = async () => {
    const reqId = newReqId();
    log(`[UI] Click: Fetch protected data (reqId=${reqId})`);
    setStatus("Fetching secure data…");
    const r = await fetch("/api/secure", {
      headers: { "x-request-id": reqId },
    });
    log(`[UI] /api/secure status=${r.status} (reqId=${reqId})`);
    const json = await r.json();
    if (!r.ok) {
      setStatus("Fetch failed");
      log(`[UI] /api/secure error=`, json, `(reqId=${reqId})`);
      return;
    }
    setData(json);
    setStatus("Data loaded");
    log(`[UI] Data loaded:`, json, `(reqId=${reqId})`);
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
