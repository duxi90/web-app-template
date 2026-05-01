import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

import base from "./base.mjs";

/** Library config: base + react + react-hooks (no Next.js). */
export default [
  ...base,
  {
    files: ["**/*.{ts,tsx,jsx,js,mjs}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
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
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
    },
  },
];
