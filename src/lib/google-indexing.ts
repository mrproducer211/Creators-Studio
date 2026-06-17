import crypto from "crypto";

function base64url(str: string | Buffer): string {
  const base64 = typeof str === "string" ? Buffer.from(str).toString("base64") : str.toString("base64");
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

/**
 * Creates and signs a JWT for Google Service Account authentication.
 */
function createSignedJwt(email: string, privateKey: string): string {
  const header = JSON.stringify({ alg: "RS256", typ: "JWT" });
  const now = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({
    iss: email,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  });

  const base64Header = base64url(header);
  const base64Payload = base64url(payload);
  const input = `${base64Header}.${base64Payload}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(input);
  
  // Format private key newlines correctly if stored as a single line in environment variables
  const formattedKey = privateKey.replace(/\\n/g, "\n");
  const signature = signer.sign(formattedKey);
  const base64Signature = base64url(signature);

  return `${input}.${base64Signature}`;
}

/**
 * Obtains an access token from Google OAuth2 endpoint using service account credentials.
 */
async function getGoogleAccessToken(email: string, privateKey: string): Promise<string> {
  const jwt = createSignedJwt(email, privateKey);
  
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to obtain Google access token: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Submits a URL to the Google Indexing API to trigger instant crawling.
 */
export async function submitToGoogleIndexing(url: string): Promise<boolean> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!email || !privateKey) {
    console.warn("Google Indexing API is not configured. Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.");
    return false;
  }

  try {
    const accessToken = await getGoogleAccessToken(email, privateKey);
    
    const res = await fetch("https://indexing.googleapis.com/v1/urlNotifications:publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        url: url,
        type: "URL_UPDATED",
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Google Indexing API publish failed: ${res.status} - ${errorText}`);
      return false;
    }

    console.log(`Successfully submitted to Google Indexing: ${url}`);
    return true;
  } catch (err) {
    console.error("Error submitting to Google Indexing API:", err);
    return false;
  }
}
