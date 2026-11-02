import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-semibold text-orange-500">404</p>
      <h1 className="mt-2 text-3xl font-semibold">We could not find that page</h1>
      <p className="mt-3 max-w-md text-stone-400">
        The page may have moved, or the address may be incorrect.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-orange-500 px-6 py-3 font-medium text-white transition hover:bg-orange-600"
      >
        Back to home
      </Link>
    </section>
  );
}
