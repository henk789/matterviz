// oxlint-disable import/default -- Vite ?worker&url modules only default-export the asset URL
// oxlint-disable eslint-plugin-unicorn/relative-url-style -- Vite worker detection needs the `./` prefix
// calc_msd via a persistent Web Worker (main-thread fallback without Worker); see
// create_worker_client for `.cancel` / `.release` semantics
import msd_worker_url from './msd-worker.js?worker&url'
import type { TrajectoryPositionStream } from '$lib/trajectory'
import { load_worker } from '$lib/load-worker'

import { plain_position_stream } from '$lib/trajectory/async-result.svelte'
import { create_worker_client } from '$lib/worker-client.svelte'
import { calc_msd } from './calc-msd'
import type { MsdOptions, MsdResult } from './index'

export const compute_msd_async = create_worker_client<
  TrajectoryPositionStream,
  MsdOptions,
  MsdResult
>({
  label: `MSD`,
  create_worker: () => load_worker(msd_worker_url),
  compute_sync: calc_msd,
  build_payload: plain_position_stream,
})
