import type { MiddlewareHandler } from "astro";
// import { stringify, parse } from "devalue";

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
  if (ctx.url.pathname !== "/_server-fn") return next();
  console.log(manifest);
  return next();

  // const functionId = ctx.url.searchParams.get("functionId");
  // try {
  //   // const fn = await fetchServerFunction(functionId);
  //
  //   let reqBody: any[];
  //   const contentType = ctx.request.headers.get("Content-Type");
  //   const method = ctx.request.method.toLowerCase();
  //   if (
  //     contentType &&
  //     (contentType === "multipart/form-data" ||
  //       contentType === "application/x-www-form-urlencoded")
  //   ) {
  //     if (method === "get") {
  //       throw new Response("GET requests cannot have a body", {
  //         status: 400,
  //       });
  //     }
  //     const body = await ctx.request.formData();
  //     reqBody = [Object.fromEntries(body.entries())];
  //   } else if (method === "get") {
  //     const body = ctx.url.searchParams.get("args");
  //     reqBody = body ? parse(decodeURIComponent(body)) : [];
  //   } else {
  //     const body = await ctx.request.text();
  //     reqBody = parse(body);
  //   }
  //
  //   ctx.url.searchParams.delete("functionId");
  //   const res = await fn(...reqBody);
  //   const body = stringify(res);
  //
  //   return new Response(body, {
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });
  // } catch (e) {
  //   if (e instanceof Response) return e;
  //   throw e;
  // }
};

async function fetchServerFunction(functionId: string | null) {
  if (!functionId) {
    throw new Response("Missing functionId", { status: 400 });
  }
  const fnInfo = manifest[functionId];
  if (!fnInfo) {
    throw new Response("Invalid functionId", { status: 400 });
  }

  let fnModule: Awaited<ReturnType<typeof fnInfo.importer>>;
  // @ts-ignore: astro defines import.meta.env.DEV
  if (import.meta?.env?.DEV) {
    fnModule = await import(/* @vite-ignore */ fnInfo.extractedFilename);
  } else {
    fnModule = await fnInfo.importer();
  }
  if (!fnModule) {
    throw new Response("Something went wrong", { status: 500 });
  }

  const fn = fnModule[fnInfo.functionName];

  if (!fn) {
    console.error(`Function ${fnInfo.functionName} not found`);
    throw new Response("Function not found", { status: 404 });
  }

  return fn;
}
