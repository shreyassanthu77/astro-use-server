import type { MiddlewareHandler } from "astro";
import { requestStore } from "./request_store.ts";
import { stringify, parse } from "devalue";

// @ts-ignore: will be defined by tanstack-server-functions-plugin
const manifest = (await import("tsr:server-fn-manifest" as string).then(
  (m) => m.default,
)) as Record<
  string,
  {
    functionId: string;
    functionName: string;
    extractedFilename: string;
    filename: string;
    chunkName: string;
    importer: () => Promise<Record<string, (...args: unknown[]) => unknown>>;
  }
>;

export const onRequest: MiddlewareHandler = async (ctx, next) => {
  if (ctx.url.pathname === "/_server-fn") {
    const functionId = ctx.url.searchParams.get("functionId");
    if (!functionId) {
      return new Response("Missing functionId", { status: 400 });
    }
    const fnInfo = manifest[functionId];
    if (!fnInfo) {
      return new Response("Invalid functionId", { status: 400 });
    }

    let fnModule: Awaited<ReturnType<typeof fnInfo.importer>>;
    // @ts-ignore: astro defines import.meta.env.DEV
    if (import.meta?.env?.DEV) {
      fnModule = await import(/* @vite-ignore */ fnInfo.extractedFilename);
    } else {
      fnModule = await fnInfo.importer();
    }
    if (!fnModule) {
      return new Response("Something went wrong", { status: 500 });
    }

    const fn = fnModule[fnInfo.functionName];

    if (!fn) {
      console.error(`Function ${fnInfo.functionName} not found`);
      return new Response("Function not found", { status: 404 });
    }

    let reqBody: any[];
    if (ctx.request.headers.get("Content-Type") !== "devalue/json") {
      reqBody = await ctx.request.json();
      if (!Array.isArray(reqBody)) {
        throw new Error("Invalid request body");
      }
    } else {
      const body = await ctx.request.text();
      reqBody = parse(body);
    }

    const res = await fn(...reqBody);
    const body = stringify(res);

    return new Response(body, {
      headers: {
        "Content-Type": "devalue/json",
      },
    });
  }
  return next();
};
