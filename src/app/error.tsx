"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Optionally log error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div style={{ textAlign: "center", padding: "4rem" }}>
      <h1>Something went wrong!</h1>
      <p>{error.message}</p>
      <button onClick={reset} style={{ color: "#6366f1" }}>Try again</button>
    </div>
  );
}
