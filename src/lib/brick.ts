import "server-only";

type BrickTokenResponse = {
  data?: {
    accessToken?: string;
  };
  accessToken?: string;
  message?: string;
  error?: unknown;
};

type BrickDynamicQrisRequest = {
  referenceId: string;
  amount: number;
  validityPeriod?: string;
};

export type BrickDynamicQrisData = {
  id: string;
  referenceId: string;
  amount: number;
  createdAt?: string;
  expiredAt?: string;
  qrData: string;
};

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function getBaseUrl(): string {
  return (process.env.BRICK_BASE_URL ?? "https://sandbox.onebrick.io/v2").replace(
    /\/$/,
    "",
  );
}

export async function getBrickPublicAccessToken(): Promise<string> {
  const clientId = getEnv("BRICK_CLIENT_ID");
  const clientSecret = getEnv("BRICK_CLIENT_SECRET");
  const baseUrl = getBaseUrl();
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const tokenResponse = await fetch(`${baseUrl}/payments/auth/token`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${basicAuth}`,
    },
    cache: "no-store",
  });

  if (tokenResponse.ok) {
    const parsed = (await tokenResponse.json()) as BrickTokenResponse;
    const accessToken = parsed.data?.accessToken ?? parsed.accessToken;
    if (accessToken) {
      return accessToken;
    }
    throw new Error("Brick token response missing accessToken");
  }

  const errorText = await tokenResponse.text();
  throw new Error(
    `Brick token request failed (${tokenResponse.status}) at ${baseUrl}/payments/auth/token: ${errorText}`,
  );
}

export async function createDynamicQris(
  payload: BrickDynamicQrisRequest,
): Promise<BrickDynamicQrisData> {
  const baseUrl = getBaseUrl();
  const publicAccessToken = await getBrickPublicAccessToken();

  const response = await fetch(`${baseUrl}/payments/gs/qris/dynamic`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      publicAccessToken,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brick QRIS request failed (${response.status}): ${errorText}`);
  }

  const parsed = (await response.json()) as {
    data?: BrickDynamicQrisData;
  };

  if (!parsed.data?.qrData) {
    throw new Error("Brick QRIS response missing qrData");
  }

  return parsed.data;
}
