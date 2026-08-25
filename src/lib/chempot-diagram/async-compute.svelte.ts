// oxlint-disable import/default -- Vite ?worker&url modules only default-export the asset URL
// oxlint-disable eslint-plugin-unicorn/relative-url-style -- Vite worker detection needs the `./` prefix
// Async wrapper for compute_chempot_diagram via Web Worker.
// Falls back to synchronous main-thread computation during SSR.
import chempot_worker_url from './chempot-worker.js?worker&url'
import { slim_phase_entry } from '$lib/convex-hull/helpers'
import { load_worker } from '$lib/load-worker'

import type { PhaseData } from '$lib/convex-hull/types'
import { create_worker_client } from '$lib/worker-client.svelte'
import { compute_chempot_diagram } from './compute'
import type { ChemPotDiagramConfig, ChemPotDiagramData } from './types'

// Only the fields the geometry depends on (energies, composition, hull flags and the
// tie-break identifiers) cross the worker boundary; structures and metadata stay behind.
const PAYLOAD_KEYS = [
  `energy`,
  `energy_per_atom`,
  `correction`,
  `exclude_from_hull`,
  `is_stable`,
  `e_above_hull`,
  `entry_id`,
  `name`,
  `reduced_formula`,
] as const

const run_chempot = create_worker_client<
  PhaseData[],
  ChemPotDiagramConfig,
  ChemPotDiagramData
>({
  label: `Chempot`,
  create_worker: () => load_worker(chempot_worker_url),
  compute_sync: compute_chempot_diagram,
  build_payload: (entries) => entries.map((entry) => slim_phase_entry(entry, PAYLOAD_KEYS)),
  dedupe_by_payload: `unordered`,
})

export const compute_chempot_async = (
  entries: PhaseData[],
  config: ChemPotDiagramConfig = {},
): Promise<ChemPotDiagramData> => run_chempot(entries, config)
