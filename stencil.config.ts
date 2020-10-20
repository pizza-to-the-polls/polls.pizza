import replace from "@rollup/plugin-replace";
import { Config } from "@stencil/core";
import { sass } from "@stencil/sass";

require("dotenv").config();

// https://stenciljs.com/docs/config

export const config: Config = {
  globalStyle: "styles/main.scss",
  // globalScript: 'src/global/app.ts',
  taskQueue: "async",
  outputTargets: [
    {
      type: "www",
      serviceWorker: null,
      baseUrl: "https://polls.pizza/",
      dir: "dist/www",
      prerenderConfig: "./prerender.config.ts",
      copy: [{ src: "../public", dest: "." }],
    },
  ],
  buildEs5: "prod",
  plugins: [
    replace({
      exclude: "node_modules/**",
      values: {
        "process.env.STRIPE_PUBLIC_KEY": process.env.STRIPE_PUBLIC_KEY ? `"${process.env.STRIPE_PUBLIC_KEY}"` : "process.env.STRIPE_PUBLIC_KEY",
        "process.env.PIZZA_BASE_DOMAIN": process.env.PIZZA_BASE_DOMAIN ? `"${process.env.PIZZA_BASE_DOMAIN}"` : `"https://base.polls.pizza"`,
        "process.env.DONATION_FORM": process.env.DONATION_FORM ? `"${process.env.DONATION_FORM}"` : `"https://docs.google.com/forms/d/e/form-id/formResponse"`,
      },
    }),
    sass({
      injectGlobalPaths: ["styles/include/vars.scss", "styles/include/mixins.scss"],
    }),
  ],
  extras: {
    cssVarsShim: true,
    dynamicImportShim: true,
    safari10: true,
    shadowDomShim: true,
  },
};
