import nextPlugin from "@next/eslint-plugin-next";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

import base from "./base.mjs";

/** Next.js app config: extends base + react + react-hooks + @next/next. */
export default [
  ...base,
  {
    files: ["**/*.{ts,tsx,jsx,js,mjs}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "@next/next": nextPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
    },
  },
];
