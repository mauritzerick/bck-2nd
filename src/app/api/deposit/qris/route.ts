import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createDynamicQris } from "@/lib/brick";

type RequestBody = {
  amount?: number;
  validityPeriod?: number;
};

function validateAmount(amount?: number): string | null {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return "Amount must be a number.";
  }
  if (!Number.isInteger(amount)) {
    return "Amount must be an integer.";
  }
  if (amount < 1000 || amount > 10_000_000) {
    return "Amount must be between 1000 and 10000000.";
  }
  return null;
}

function validateValidityPeriod(validityPeriod?: number): string | null {
  if (validityPeriod === undefined) {
    return null;
  }
  if (typeof validityPeriod !== "number" || Number.isNaN(validityPeriod)) {
    return "validityPeriod must be a number of seconds.";
  }
  if (!Number.isInteger(validityPeriod)) {
    return "validityPeriod must be an integer.";
  }
  if (validityPeriod < 600 || validityPeriod > 86400) {
    return "validityPeriod must be between 600 and 86400 seconds.";
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const amountError = validateAmount(body.amount);
    if (amountError) {
      return NextResponse.json({ error: amountError }, { status: 400 });
    }

    const validityError = validateValidityPeriod(body.validityPeriod);
    if (validityError) {
      return NextResponse.json({ error: validityError }, { status: 400 });
    }

    const qris = await createDynamicQris({
      // Brick requires a max length of 25 chars for referenceId.
      referenceId: `dep${randomUUID().replace(/-/g, "").slice(0, 22)}`,
      amount: body.amount!,
      validityPeriod:
        body.validityPeriod !== undefined ? String(body.validityPeriod) : undefined,
    });

    return NextResponse.json(
      {
        id: qris.id,
        referenceId: qris.referenceId,
        amount: qris.amount,
        createdAt: qris.createdAt,
        expiredAt: qris.expiredAt,
        qrData: qris.qrData,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message.replace(/Brick/gi, "provider")
        : "Failed to generate dynamic QRIS. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
