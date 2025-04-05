import type {
  requestStore as rs,
  RequestStore,
} from "./plugin/request_store.ts";

let requestStore: typeof rs;

// @ts-ignore: astro defines import.meta.env.SSR
if (import.meta.env.SSR) {
  requestStore = await import("./plugin/request_store.ts").then(
    (m) => m.requestStore,
  );
}

export function useServerContext(): RequestStore["ctx"] {
  // @ts-ignore: astro defines import.meta.env.SSR
  if (!import.meta.env.SSR) {
    throw new Error("useServerContext must only be called on the client");
  } else {
    const store = requestStore.getStore();
    if (!store) {
      throw new Error(
        "useServerContext must only be called within a server function",
      );
    }
    return store.ctx;
  }
}
