import packageJson from "../package.json" with { type: "json" };
import denoJson from "../deno.json" with { type: "json" };
import { build, emptyDir } from "@deno/dnt";

await emptyDir("./npm");

await build({
  entryPoints: Object.entries(denoJson.exports).map(([name, value]) => ({
    kind: "export",
    name,
    path: value,
  })),

  outDir: "./npm",
  shims: {
    deno: false,
  },
  mappings: {
    "./src/package-name.deno.ts": "./src/package-name.node.ts",
  },
  compilerOptions: {
    lib: ["ESNext", "DOM", "DOM.Iterable"],
  },
  scriptModule: false,
  skipNpmInstall: true,
  test: false,
  typeCheck: false,
  packageManager: "bun",
  package: {
    ...packageJson,
    version: denoJson.version,
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    // Deno.copyFileSync("README.md", "npm/README.md");
  },
});
