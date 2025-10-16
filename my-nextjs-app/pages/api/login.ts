import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import { log } from "../../lib/logger";

type TokenResponse = { access_token: string; token_type: "bearer" };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const reqId = req.headers["x-request-id"] ?? "(none)";
  const backend = process.env.BACKEND_URL ?? "http://localhost:8000";

  log(`[API] /api/login start (reqId=${reqId})`);
  const r = await fetch(`${backend}/token`, {
    method: "POST",
    headers: { "x-request-id": String(reqId) }, // propagate to backend
  });
  log(`[API] /token -> status=${r.status} (reqId=${reqId})`);

  if (!r.ok) {
    const text = await r.text();
    log(`[API] /api/login failed body=${text} (reqId=${reqId})`);
    res.status(500).json({ error: "Failed to obtain token" });
    return;
  }
  const data = (await r.json()) as TokenResponse;

  const cookie = serialize("session", data.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60,
  });

  res.setHeader("Set-Cookie", cookie);
  log(`[API] /api/login set cookie 'session' (reqId=${reqId})`);
  res.status(200).json({ ok: true });
}
