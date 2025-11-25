// import js from "@eslint/js";
// import globals from "globals";
// import reactHooks from "eslint-plugin-react-hooks";
// import reactRefresh from "eslint-plugin-react-refresh";
// import { defineConfig, globalIgnores } from "eslint/config";

// export default defineConfig([
//   globalIgnores(["dist"]),
//   {
//     files: ["**/*.{js,jsx}"],
//     extends: [
//       js.configs.recommended,
//       react.configs.recommended,
//       reactHooks.configs["recommended-latest"],
//       reactRefresh.configs.vite,
//     ],
//     languageOptions: {
//       ecmaVersion: 2020,
//       globals: globals.browser,
//       parserOptions: {
//         ecmaVersion: "latest",
//         ecmaFeatures: { jsx: true },
//         sourceType: "module",
//       },
//     },
//     plugins: {
//       react: pluginReact,
//     },
//     rules: {
//       // 'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
//       "no-undef": "error",
//       "no-unused-vars": "warn",
//       "react/react-in-jsx-scope": "off",
//       "react/jsx-uses-react": "off",
//       "react/jsx-uses-vars": "warn",
//       "react/no-unescaped-entities": "off",
//       "react/prop-types": "off",
//     },
//   },
// ]);

import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      react: pluginReact,
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": "warn",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "warn",
      "react/no-unescaped-entities": "off",
      "react/prop-types": "off",
    },
    extends: [js.configs.recommended, pluginReact.configs.flat.recommended],
  },
]);
