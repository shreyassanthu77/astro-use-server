import { createTanStackServerFnPlugin } from "@tanstack/server-functions-plugin";
import type { AstroIntegration, AstroConfig } from "astro";
import { packageName } from "./package-name.deno.ts";
type Plugins = AstroConfig["vite"]["plugins"];

export default function serverFunctions(): AstroIntegration {
  const { client, server } = createTanStackServerFnPlugin({
    manifestVirtualImportId: "tsr:server-fn-manifest",
    client: {
      getRuntimeCode: () => imp(["createClientRpc"], "client-runtime"),
      replacer: (opts) => `createClientRpc("${opts.functionId}")`,
    },
    server: {
      getRuntimeCode: () => imp(["createServerRpc"], "server-runtime"),
      replacer: (opts) => `createServerRpc("${opts.functionId}", ${opts.fn})`,
    },
    ssr: {
      getRuntimeCode: () =>
        `const createSsrRpc = () => throw new Error('Unreachable')`,
      replacer: (_) => `createSsrRpc()`,
    },
  });

  for (const clientPlugin of client) {
    clientPlugin.applyToEnvironment = (env) => env.name === "client";
    // clientPlugin.apply = "build";
  }
  for (const serverPlugin of server) {
    serverPlugin.applyToEnvironment = (env) => {
      return env.name === "ssr";
    };
    // serverPlugin.apply = "build";
  }

  return {
    name: "@shryas/astro-server-functions",
    hooks: {
      "astro:config:setup": ({
        config,
        logger,
        updateConfig,
        addMiddleware,
      }) => {
        if (config.output !== "server") {
          logger.error(
            `astro-server-functions only works with "server" output.`,
          );
          return;
        }
        updateConfig({
          vite: {
            plugins: [...client, ...server] as Plugins,
          },
        });

        addMiddleware({
          entrypoint: `${packageName}/server-middleware`,
          order: "post",
        });
      },
    },
  };
}

function imp(stuff: string[], from: string) {
  return `import { ${stuff.join(", ")} } from '${packageName}/${from}'`;
}
