import { cookies } from "next/headers";

const SECRET_KEY_STR = process.env.AUTH_SECRET || "dev-secret-change-me-in-production";
const COOKIE_NAME = "flowdesk_session";
const TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

// ── Base64url helpers ──────────────────────────────────────────

function base64urlEncode(str: string): string {
  const base64 = btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    })
  );
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
}

// ── Crypto key ─────────────────────────────────────────────────

async function getCryptoKey() {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET_KEY_STR),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// ── JWT sign / verify ──────────────────────────────────────────

export interface TokenPayload {
  userId: string;
  email: string;
  exp: number;
}

export async function signToken(payload: Omit<TokenPayload, "exp">): Promise<string> {
  const fullPayload: TokenPayload = {
    ...payload,
    exp: Date.now() + TOKEN_EXPIRY,
  };
  const dataStr = JSON.stringify(fullPayload);
  const dataEncoded = base64urlEncode(dataStr);

  const enc = new TextEncoder();
  const dataBytes = enc.encode(dataEncoded);

  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, dataBytes);

  const signatureBytes = new Uint8Array(signatureBuffer);
  let signatureBin = "";
  for (let i = 0; i < signatureBytes.length; i++) {
    signatureBin += String.fromCharCode(signatureBytes[i]);
  }
  const signatureEncoded = btoa(signatureBin)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${dataEncoded}.${signatureEncoded}`;
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const [dataEncoded, signatureEncoded] = token.split(".");
    if (!dataEncoded || !signatureEncoded) return null;

    const enc = new TextEncoder();
    const dataBytes = enc.encode(dataEncoded);

    let sigBase64 = signatureEncoded.replace(/-/g, "+").replace(/_/g, "/");
    while (sigBase64.length % 4) sigBase64 += "=";
    const sigBin = atob(sigBase64);
    const signatureBytes = new Uint8Array(sigBin.length);
    for (let i = 0; i < sigBin.length; i++) {
      signatureBytes[i] = sigBin.charCodeAt(i);
    }

    const key = await getCryptoKey();
    const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes, dataBytes);
    if (!isValid) return null;

    const dataStr = base64urlDecode(dataEncoded);
    const payload = JSON.parse(dataStr) as TokenPayload;

    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// ── Session helpers ────────────────────────────────────────────

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
