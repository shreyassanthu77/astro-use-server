import type { MiddlewareHandler } from "astro";
import { requestStore } from "./request_store.ts";

export const onRequest: MiddlewareHandler = (ctx, next) => {
  return requestStore.run({ ctx }, next);
};
