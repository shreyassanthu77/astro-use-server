import { stringify, parse } from "devalue";

interface ClientRpc {
  (...args: unknown[]): Promise<unknown>;
  url: URL;
  $get: (...args: unknown[]) => Promise<unknown>;
  $post: (...args: unknown[]) => Promise<unknown>;
  $put: (...args: unknown[]) => Promise<unknown>;
  $delete: (...args: unknown[]) => Promise<unknown>;
  $patch: (...args: unknown[]) => Promise<unknown>;
}

export function createClientRpc(functionId: string): ClientRpc {
  const fnUrl = new URL("/_server-fn", location.origin);
  fnUrl.searchParams.set("functionId", functionId);

  async function $call(method: string, ...args: unknown[]) {
    const reqBody = stringify(args);
    const url = method !== "GET" ? fnUrl : new URL(fnUrl);
    if (method === "GET") {
      url.searchParams.set("args", encodeURIComponent(reqBody));
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": method === "GET" ? "application/json" : "text/plain",
        },
        body: method === "GET" ? undefined : reqBody,
      });
      if (!res.ok) {
        throw new Error(`Server function failed: ${res.status}`);
      }
      const contentType = res.headers.get("Content-Type");
      switch (contentType) {
        case "application/json":
          return await res.json();
        case "application/devalue+json":
          return parse(await res.text());
        default:
          throw new Error(`Invalid Content-Type: ${contentType}`);
      }
    } catch (e) {
      throw e;
    }
  }

  const $fn = $call.bind(null, "POST");
  return Object.assign($fn, {
    url: fnUrl,
    $get: $call.bind(null, "GET"),
    $post: $call.bind(null, "POST"),
    $put: $call.bind(null, "PUT"),
    $delete: $call.bind(null, "DELETE"),
    $patch: $call.bind(null, "PATCH"),
  }) as ClientRpc;
}
