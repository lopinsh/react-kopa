// Preloaded by run.mjs. Next's data cache needs a running Next server; outside one, unstable_cache throws.
// Services only use it as a memo, so tests replace it with a pass-through (and make the revalidate calls no-ops).
const path = require.resolve('next/cache');
require.cache[path] = {
  id: path, filename: path, loaded: true, children: [], paths: [],
  exports: { unstable_cache: (fn) => fn, revalidatePath: () => {}, revalidateTag: () => {}, updateTag: () => {}, refresh: () => {} },
};
