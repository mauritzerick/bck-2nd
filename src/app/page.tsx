import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <h1 className="text-3xl font-semibold">Dynamic QRIS Demo</h1>
      <p className="text-zinc-600 dark:text-zinc-300">
        Generate a QR deposit code and scan it with your banking app.
      </p>
      <Link
        href="/deposit"
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
      >
        Go to Deposit Page
      </Link>
    </main>
  );
}
