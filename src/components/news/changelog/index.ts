import type { Plugin } from "svelte-exmarkdown";

import h1 from "./h1.svelte";
import h2 from "./h2.svelte";
import h3 from "./h3.svelte";

import ul from "./ul.svelte";

export const changelogPlugin: Plugin = { renderer: { h1, h2, h3, ul } };
export { h1, h2, h3, ul };
