import path from "node:path";
import cloudflare from "@astrojs/cloudflare"; // Changed from @astrojs/node
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import compress from "@playform/compress";
import { defineConfig } from "astro/config";
import { viteStaticCopy } from "vite-plugin-static-copy";
import INConfig from "./config";

// Note: Removed 'wisp' and 'execFileSync' as they are incompatible with Cloudflare's runtime environment.

const integrations = [react(), tailwind({ applyBaseStyles: false })];

if (INConfig.server?.compress !== false) {
  integrations.push(
    compress({
      CSS: false,
      HTML: true,
      Image: false,
      JavaScript: true,
      SVG: true,
      Logger: 0,
    }),
  );
}

export default defineConfig({
  output: "server", // Required for proxy functionality
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  integrations,
  prefetch: {
    defaultStrategy: "viewport",
    prefetchAll: false,
  },
  image: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/UseInterstellar/**",
      },
    ],
  },
  vite: {
    logLevel: "warn",
    define: {
      // Replaced execFileSync with a standard timestamp to avoid build errors on Cloudflare
      __COMMIT_DATE__: JSON.stringify(new Date().toISOString()),
    },
    resolve: {
      alias: {
        "@": path.resolve("./src"),
      },
    },
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: `${epoxyPath}/**/*.mjs`.replace(/\\/g, "/"),
            dest: "assets/bundled",
            overwrite: false,
            rename: (name) => `ex-${name}.mjs`,
          },
          {
            src: `${baremuxPath}/**/*.js`.replace(/\\/g, "/"),
            dest: "assets/bundled",
            overwrite: false,
            rename: (name) => `bm-${name}.js`,
          },
        ],
      }),
    ],
  },
});
