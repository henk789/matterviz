// oxlint-disable import/default -- Vite ?worker&url modules only default-export the asset URL
// oxlint-disable eslint-plugin-unicorn/relative-url-style -- Vite worker detection needs the `./` prefix
// calc_vacf via a persistent Web Worker (main-thread fallback without Worker); see
// create_worker_client for `.cancel` / `.release` semantics
import vacf_worker_url from './vacf-worker.js?worker&url'
import { plain_position_stream } from '$lib/trajectory/async-result.svelte'
import { load_worker } from '$lib/load-worker'

import { create_worker_client } from '$lib/worker-client.svelte'
import { calc_vacf } from './calc-vacf'
import type { VacfInput, VacfOptions, VacfResult } from './index'

export const compute_vacf_async = create_worker_client<VacfInput, VacfOptions, VacfResult>({
  label: `VACF`,
  create_worker: () => load_worker(vacf_worker_url),
  compute_sync: calc_vacf,
  build_payload: (input) => ({
    ...plain_position_stream(input),
    velocities: input.velocities ?? null,
    velocity_unit: input.velocity_unit ?? null,
  }),
})
