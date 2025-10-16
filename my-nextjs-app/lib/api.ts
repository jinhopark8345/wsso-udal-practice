export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export type TokenResponse = {
  access_token: string;
  token_type: "bearer";
};

export async function getToken(): Promise<string> {
  const res = await fetch(`${API_BASE}/token`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to get token");
  const data: TokenResponse = await res.json();
  return data.access_token;
}

export async function getSecureData(token: string) {
  const res = await fetch(`${API_BASE}/api/data`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json() as Promise<{ user_id: string; data: string }>;
}
