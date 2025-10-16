import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const cookies = parse(req.headers.cookie ?? "");
  const token = cookies["session"];
  if (!token) {
    res.status(401).json({ error: "No session cookie" });
    return;
  }

  const backend = process.env.BACKEND_URL ?? "http://localhost:8000";
  const r = await fetch(`${backend}/api/data`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!r.ok) {
    const text = await r.text();
    res.status(r.status).json({ error: text || "Backend error" });
    return;
  }

  const data = await r.json();
  res.status(200).json(data);
}
