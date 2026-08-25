// Worker loading for hosts where `new Worker(asset_url)` cannot work directly.
//
// VS Code webviews serve extension files through an internal service worker that only
// intercepts document resource loads. A worker script request bypasses that service
// worker, hits the virtual vscode-resource.vscode-cdn.net origin over real DNS (which is
// unresolvable), and hangs for tens of seconds before failing. Webviews also enforce
// Trusted Types on Worker constructors, so raw script URLs are rejected outright.
// Microsoft's documented pattern for workers in webviews is fetch -> blob -> Worker:
//
//   const blob_url = URL.createObjectURL(await fetch(worker_url).then((r) => r.blob()))
//   const worker = new Worker(trusted_blob_url(blob_url))
//
// The fetch runs in the document context, where the service worker serves the asset from
// disk; the resulting blob: URL needs no network at all. Outside webviews (Hive, the docs
// site) workers are constructed from the same-origin URL as before.
interface TrustedTypesApi {
  createPolicy: (
    name: string,
    rules: { createScriptURL: (url: string) => string },
  ) => { createScriptURL: (url: string) => string }
}

let blob_script_policy: { createScriptURL: (url: string) => string } | undefined

// Vouch for blob: URLs on behalf of the inline-worker spawn below. A non-default policy
// must be applied explicitly at the sink; other URLs keep normal enforcement.
const trusted_blob_url = (blob_url: string): string => {
  const trusted_types = (globalThis as { trustedTypes?: TrustedTypesApi }).trustedTypes
  if (!trusted_types) return blob_url
  try {
    blob_script_policy ??= trusted_types.createPolicy(`matterviz-worker`, {
      createScriptURL: (url) => url,
    })
  } catch {
    // Policy name already registered; reuse it via the cached handle above.
  }
  return blob_script_policy ? blob_script_policy.createScriptURL(blob_url) : blob_url
}

export const in_webview = (): boolean => globalThis.location?.protocol === `vscode-webview:`

export const load_worker = async (worker_url: string): Promise<Worker> => {
  const resolved = new URL(worker_url, import.meta.url)
  if (!in_webview()) return new Worker(resolved, { type: `module` })

  const response = await fetch(resolved)
  if (!response.ok) {
    throw new Error(`Failed to load worker from ${resolved}: ${response.status}`)
  }
  const blob_url = URL.createObjectURL(await response.blob())
  const worker = new Worker(trusted_blob_url(blob_url), { type: `module` })
  // The blob only needs to live as long as the worker does.
  const terminate = worker.terminate.bind(worker)
  worker.terminate = (): void => {
    terminate()
    URL.revokeObjectURL(blob_url)
  }
  return worker
}
