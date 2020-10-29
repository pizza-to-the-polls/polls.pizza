import Bugsnag from "@bugsnag/js";
import { Build } from "@stencil/core";

if (process.env.BUGSNAG_KEY && Build.isBrowser) {
  Bugsnag.start({
    apiKey: process.env.BUGSNAG_KEY,
    releaseStage: process.env.NODE_ENV,
  });
}
