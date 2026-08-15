import Bugsnag from "@bugsnag/js";
import { Build } from "@stencil/core";

import { installComponentLoadGuard } from "./util/componentLoadGuard";

export default () => {
  if (process.env.BUGSNAG_KEY && Build.isBrowser) {
    Bugsnag.start({
      apiKey: process.env.BUGSNAG_KEY,
      releaseStage: process.env.NODE_ENV,
    });
    if (typeof window !== "undefined") {
      (window as any).__pizza_bugsnag_started = true;
      (window as any).__pizza_bugsnag_client = Bugsnag;
    }
  }
  if (Build.isBrowser) {
    installComponentLoadGuard();
  }
};
