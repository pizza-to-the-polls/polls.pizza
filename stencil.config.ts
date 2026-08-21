import { Config } from "@stencil/core";
import { sass } from "@stencil/sass";
import replace from "@rollup/plugin-replace";
import dotenv from "dotenv";

dotenv.config();

// https://stenciljs.com/docs/config

export const config: Config = {
  globalStyle: "styles/main.scss",
  globalScript: "src/app.ts",
  taskQueue: "async",

  plugins: [
    replace({
      exclude: "node_modules/**",
      values: {
        "process.env.STRIPE_PUBLIC_KEY": JSON.stringify(process.env.STRIPE_PUBLIC_KEY || ""),
        "process.env.PIZZA_BASE_DOMAIN": JSON.stringify(process.env.PIZZA_BASE_DOMAIN || "https://base-next.polls.pizza"),
        "process.env.BUGSNAG_KEY": JSON.stringify(process.env.BUGSNAG_KEY || ""),
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "dev"),
      },
      preventAssignment: false,
    }),
    sass({
      injectGlobalPaths: ["styles/include/_vars.scss", "styles/include/_mixins.scss"],
    }),
  ],

  outputTargets: [
    {
      type: "www",
      baseUrl: process.env.ROOT_URL || "https://polls.pizza/",
      dir: "dist/www",
      prerenderConfig: "./prerender.config.ts",
      copy: [{ src: "../public", dest: "." }],
    },
  ],

  // Required for headless Chromium on CI runners (GitHub Actions, Docker).
  // For local development, these flags can be removed if you have a working Chrome/Chromium.
  testing: {
    browserArgs: process.env.CI ? ["--no-sandbox", "--disable-setuid-sandbox"] : [],
  },
};
