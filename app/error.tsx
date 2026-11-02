"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold">We hit a snag</h1>
      <p className="mt-3 max-w-md text-stone-400">
        Something went wrong while loading this page. Please try again.
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-6 rounded-full bg-orange-500 px-6 py-3 font-medium text-white transition hover:bg-orange-600"
      >
        Try again
      </button>
    </section>
  );
}
