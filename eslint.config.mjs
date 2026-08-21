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
    },
  },
];
