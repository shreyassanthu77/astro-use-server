import { stringify, parse } from "devalue";

export function createClientRpc(functionId: string) {
  return async function (...args: unknown[]) {
    const url = new URL("/_server-fn", location.origin);
    url.searchParams.set("functionId", functionId);
    try {
      const reqBody = stringify(args);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "devalue/json",
        },
        body: reqBody,
      });
      if (!res.ok) {
        throw new Error(`Server function failed: ${res.status}`);
      }
      if (res.headers.get("Content-Type") !== "devalue/json") {
        throw new Error(
          `Invalid Content-Type: ${res.headers.get("Content-Type")}`,
        );
      }
      const body = await res.text();
      return parse(body);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
}
