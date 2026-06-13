import { useState } from 'react';
import { getHealth } from '../api/health';

function Card({ children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {children}
    </div>
  );
}

export default function HomePage() {
  const [status, setStatus] = useState({
    loading: false,
    data: null,
    error: null,
  });

  const onTest = async () => {
    setStatus({ loading: true, data: null, error: null });
    try {
      const data = await getHealth();
      setStatus({ loading: false, data, error: null });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to connect to backend';

      const statusCode = err?.response?.status;
      const requestedUrl = (() => {
        const baseURL = err?.config?.baseURL;
        const url = err?.config?.url;
        if (!baseURL && !url) return undefined;
        if (baseURL && url) return `${baseURL}${url}`;
        return baseURL || url;
      })();

      const detailsParts = [];
      if (statusCode) detailsParts.push(`HTTP ${statusCode}`);
      if (requestedUrl) detailsParts.push(requestedUrl);

      const details = detailsParts.length ? ` (${detailsParts.join(' - ')})` : '';
      setStatus({ loading: false, data: null, error: `${message}${details}` });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">GovtCompass</h1>
          <p className="mt-2 text-gray-600">
            Government Opportunity Intelligence Platform
          </p>
        </header>

        <Card>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700">
                  Backend Connectivity
                </div>
                <div className="text-sm text-gray-500">
                  Verify the API health endpoint.
                </div>
              </div>

              <button
                onClick={onTest}
                disabled={status.loading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {status.loading ? 'Testing...' : 'Test Backend Connection'}
              </button>
            </div>

            {status.loading && (
              <div className="text-sm text-gray-600">Loading...</div>
            )}

            {status.data && (
              <div className="rounded-lg bg-green-50 p-4">
                <div className="mb-2 text-sm font-semibold text-green-800">
                  ✅ Backend Connected
                </div>
                <pre className="overflow-auto text-xs text-green-900">
                  {JSON.stringify(status.data, null, 2)}
                </pre>
              </div>
            )}

            {status.error && (
              <div className="rounded-lg bg-red-50 p-4">
                <div className="mb-2 text-sm font-semibold text-red-800">
                  ❌ Connection Failed
                </div>
                <div className="text-sm text-red-900">{status.error}</div>
              </div>
            )}

            {!status.loading && !status.data && !status.error && (
              <div className="text-sm text-gray-500">
                Click the button to test connectivity.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

