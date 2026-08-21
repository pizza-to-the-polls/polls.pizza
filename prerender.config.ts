import { PrerenderConfig } from "@stencil/core";

export const config: PrerenderConfig = {
  hydrateOptions(_url: URL) {
    return {
      prettyHtml: true,
    };
  },
};
