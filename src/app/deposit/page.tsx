"use client";

import { FormEvent, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

type DepositResponse = {
  id: string;
  referenceId: string;
  amount: number;
  createdAt?: string;
  expiredAt?: string;
  qrData: string;
};

export default function DepositPage() {
  const [amount, setAmount] = useState("10000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DepositResponse | null>(null);

  const formattedAmount = useMemo(() => {
    if (!result) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(result.amount);
  }, [result]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const parsedAmount = Number(amount);

    try {
      const response = await fetch("/api/deposit/qris", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parsedAmount,
        }),
      });

      const json = (await response.json()) as DepositResponse & { error?: string };
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to generate QRIS.");
      }

      setResult(json);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unexpected error while generating QRIS.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <section>
        <h1 className="text-3xl font-semibold">QR Deposit</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Enter an amount, generate a dynamic QRIS, and scan it from your mobile banking
          app.
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800"
      >
        <label className="mb-2 block text-sm font-medium" htmlFor="amount">
          Amount (IDR)
        </label>
        <input
          id="amount"
          type="number"
          min={1000}
          max={10000000}
          step={1}
          required
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {loading ? "Generating..." : "Generate QRIS"}
        </button>
      </form>

      {error ? (
        <p className="rounded-lg border border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      ) : null}

      {result ? (
        <section className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="text-xl font-semibold">Scan to Pay</h2>
          <div className="mt-4 flex justify-center rounded-lg bg-white p-4">
            <QRCodeSVG
              value={result.qrData}
              size={240}
              imageSettings={{
                src: "/supercharge.7d8ad02d.svg",
                width: 36,
                height: 36,
                excavate: true,
              }}
            />
          </div>
          <dl className="mt-4 space-y-1 text-sm">
            <div>
              <dt className="inline font-medium">Reference:</dt>{" "}
              <dd className="inline">{result.referenceId}</dd>
            </div>
            <div>
              <dt className="inline font-medium">Amount:</dt>{" "}
              <dd className="inline">{formattedAmount}</dd>
            </div>
            {result.expiredAt ? (
              <div>
                <dt className="inline font-medium">Expires:</dt>{" "}
                <dd className="inline">
                  {new Date(result.expiredAt).toLocaleString("id-ID")}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}
    </main>
  );
}
