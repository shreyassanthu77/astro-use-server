import { requestStore, type RequestStore } from "./request_store.ts";

export function useServerContext(): RequestStore["ctx"] {
  const store = requestStore.getStore();
  if (!store) {
    throw new Error(
      "useServerContext must only be called within a server function",
    );
  }
  return store.ctx;
}
