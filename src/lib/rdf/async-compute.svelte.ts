// oxlint-disable import/default -- Vite ?worker&url modules only default-export the asset URL
// oxlint-disable eslint-plugin-unicorn/relative-url-style -- Vite worker detection needs the `./` prefix
// One frame's partial RDFs via a persistent Web Worker (main-thread fallback without Worker);
// the trajectory sweep in calc-trajectory-rdf.ts posts one frame at a time through this.
import rdf_worker_url from './rdf-worker.js?worker&url'
import type { AnyStructure } from '$lib/structure'
import { load_worker } from '$lib/load-worker'

import { to_structure_id_payload } from '$lib/structure-id/worker-payload'
import { create_worker_client } from '$lib/worker-client.svelte'
import { calc_frame_rdfs, type FrameRdfOptions } from './calc-rdf'
import type { RdfPattern } from './index'

export const calc_frame_rdfs_async = create_worker_client<
  AnyStructure,
  FrameRdfOptions,
  RdfPattern[]
>({
  label: `RDF`,
  create_worker: () => load_worker(rdf_worker_url),
  compute_sync: calc_frame_rdfs,
  // Positions, lattice and species per site (see worker-payload.ts); site properties can
  // hold non-cloneable values and nothing in the histogram reads them
  build_payload: (structure) => to_structure_id_payload(structure, true),
})
