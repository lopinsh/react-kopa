import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "**/*.js",
  ]),
  {
    rules: {
      // Avatars and banners are user-supplied URLs (own uploads route, external hosts, generated SVG
      // figures) with no fixed remote-host list, so next/image optimisation cannot be configured for them.
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
