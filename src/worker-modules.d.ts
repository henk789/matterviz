// Ambient declarations for Vite's `?worker&url` and `?worker&inline` import suffixes, which
// resolve to a URL string and an inline Worker constructor respectively at build time.
declare module '*?worker&url' {
  const worker_url: string
  export default worker_url
}

declare module '*?worker&inline' {
  const WorkerConstructor: new (options?: WorkerOptions) => Worker
  export default WorkerConstructor
}
