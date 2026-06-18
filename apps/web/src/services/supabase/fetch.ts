const SUPABASE_FETCH_TIMEOUT_MS = 8_000;

/** Server-side fetch with timeout. Avoid AbortSignal.any — it breaks when Supabase passes an already-aborted signal on retries. */
export function supabaseFetch(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SUPABASE_FETCH_TIMEOUT_MS);

  const abortFromCaller = () => {
    clearTimeout(timeoutId);
    controller.abort();
  };

  init?.signal?.addEventListener("abort", abortFromCaller, { once: true });

  return fetch(input, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timeoutId);
    init?.signal?.removeEventListener("abort", abortFromCaller);
  });
}
