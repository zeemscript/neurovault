import * as esbuild from "esbuild";

const watch = process.argv.includes("--watch");

const sharedConfig = {
  bundle: true,
  sourcemap: true,
  target: "chrome110",
  minify: !watch,
};

const configs = [
  {
    ...sharedConfig,
    entryPoints: ["src/background/service-worker.ts"],
    outfile: "dist/background.js",
    format: "esm",
  },
  {
    ...sharedConfig,
    entryPoints: ["src/content/content-script.ts"],
    outfile: "dist/content.js",
    format: "iife",
  },
  {
    ...sharedConfig,
    entryPoints: ["src/popup/popup.ts"],
    outfile: "dist/popup.js",
    format: "iife",
  },
  {
    ...sharedConfig,
    entryPoints: ["src/blocked/blocked.ts"],
    outfile: "dist/blocked.js",
    format: "iife",
  },
];

async function build() {
  if (watch) {
    const contexts = await Promise.all(
      configs.map((config) => esbuild.context(config))
    );
    await Promise.all(contexts.map((ctx) => ctx.watch()));
    console.log("Watching for changes...");
  } else {
    await Promise.all(configs.map((config) => esbuild.build(config)));
    console.log("Build complete.");
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
