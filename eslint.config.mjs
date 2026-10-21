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
      // Zero-Any Law (AGENTS.md).
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": ["error", { "ts-ignore": true, "ts-expect-error": "allow-with-description" }],
    },
  },
  // Service Law and Defensive Coding Law, checked by lint (AGENTS.md "guarded by").
  // Type-only imports stay allowed everywhere; enums from @prisma/client are plain values, not DB access.
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["lib/services/**", "lib/auth.ts", "lib/prisma.ts", "lib/validations/**", "prisma/**", "scripts/**", "*.spec.ts", "tests/**"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [
          { name: "@/lib/prisma", message: "Service Law: Prisma access lives in lib/services/ (lib/auth.ts is the one exception).", allowTypeImports: true },
          { name: "@prisma/client", importNames: ["PrismaClient"], message: "Service Law: Prisma access lives in lib/services/.", allowTypeImports: true },
          { name: "zod", message: "Defensive Coding Law: Zod schemas live in lib/validations/. Use `import type` for types.", allowTypeImports: true },
        ],
      }],
    },
  },
]);

export default eslintConfig;
