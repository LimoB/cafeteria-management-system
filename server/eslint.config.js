import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";

export default [
  js.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node, // ✅ Adds 'process', '__dirname', etc.
      },
    },
    rules: {
      // ✅ Allows variables starting with _ (like _next) to be unused
      "no-unused-vars": [
        "error",
        { 
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      // React specific tweaks if needed
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off"
    },
  },
];