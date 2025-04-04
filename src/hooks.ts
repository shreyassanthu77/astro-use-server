import { requestStore } from "./request_store.ts";

export function useServerContext() {
  const store = requestStore.getStore();
  if (!store) {
    throw new Error(
      "useServerContext must only be called within a server function",
    );
  }
  return store.ctx;
}
