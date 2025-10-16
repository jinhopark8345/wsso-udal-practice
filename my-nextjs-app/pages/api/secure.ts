import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie";
import { log } from "../../lib/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const reqId = req.headers["x-request-id"] ?? "(none)";
  const cookies = parse(req.headers.cookie ?? "");
  const token = cookies["session"];
  const backend = process.env.BACKEND_URL ?? "http://localhost:8000";

  log(
    `[API] /api/secure start cookiePresent=${Boolean(token)} (reqId=${reqId})`,
  );

  if (!token) {
    log(`[API] /api/secure missing session cookie (reqId=${reqId})`);
    res.status(401).json({ error: "No session cookie" });
    return;
  }

  const r = await fetch(`${backend}/api/data`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-request-id": String(reqId), // propagate
    },
  });
  log(`[API] backend /api/data -> status=${r.status} (reqId=${reqId})`);

  const bodyText = await r.text();
  try {
    const json = JSON.parse(bodyText);
    if (!r.ok) {
      log(`[API] /api/secure backend error json=`, json, `(reqId=${reqId})`);
      res.status(r.status).json(json);
      return;
    }
    log(`[API] /api/secure success json=`, json, `(reqId=${reqId})`);
    res.status(200).json(json);
  } catch {
    log(`[API] /api/secure non-JSON body="${bodyText}" (reqId=${reqId})`);
    res.status(500).json({ error: "Unexpected backend response" });
  }
}
