import { AsyncLocalStorage } from "node:async_hooks";
import type { APIContext } from "astro";

export interface RequestStore {
  ctx: APIContext;
}

export const requestStore = new AsyncLocalStorage<RequestStore>();
