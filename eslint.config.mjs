import stencil from "@stencil/eslint-plugin";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/www/**", "**/*.d.ts", "src/components.d.ts", "**/loader/**"],
  },
  stencil.configs.flat.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^h$|^_", caughtErrorsIgnorePattern: "^_" }],
      // Rules not present in the original tslint.json — keep the migration
      // non-breaking by disabling the noisy Stencil jsdoc/react ones.
      "stencil/enforce-slot-jsdoc": "off",
      "stencil/required-jsdoc": "off",
      "stencil/ban-exported-const-enums": "off",
      "react/jsx-no-bind": "off",
      // Both rules match ALL property/method definitions with no
      // `node.static` check, and their --fix autofix rewrites `public` →
      // `private` — including on static class *constants* that other
      // modules import (page-deliveries.tsx → UiGeoMap.DEFAULT_ZOOM & co).
      // `npm run fix` then silently lands the breakage; the prod build
      // (stencil build --prod, a CI gate) is what catches it. PR #176's
      // first CI run failed exactly this way. The rules' intent —
      // undecorated *instance* members on a component should be private —
      // is already covered by decorator usage here (@Prop/@State/… are
      // exempt by design), so nothing real is lost. No upstream fix as of
      // @stencil/eslint-plugin@1.4.0 (latest). Re-enable when the plugin
      // grows static-awareness.
      "stencil/own-props-must-be-private": "off",
      "stencil/own-methods-must-be-private": "off",
    },
  },
];
