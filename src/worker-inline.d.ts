// Ambient types for Vite's inline worker imports (`?worker&inline`), which bundle the
// worker into the importing chunk as a base64 blob so no runtime fetch is needed.
declare module '*?worker&inline' {
  const worker_constructor: new (options?: WorkerOptions) => Worker
  export default worker_constructor
}
