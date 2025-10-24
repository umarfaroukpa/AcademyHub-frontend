'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Critical Error</h2>
            <p className="text-gray-400 mb-6">{error.message}</p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}