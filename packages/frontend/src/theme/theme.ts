import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import {
  buttonRecipe,
  inputRecipe,
  textareaRecipe,
  checkboxRecipe,
  radioRecipe,
  switchRecipe,
} from "./recipes";
import { colors, semanticColors } from "./colors";

const config = defineConfig({
  globalCss: {
    "html, body": {
      color: "fg",
      background: "bg.dark",
      fontFamily: "system-ui, sans-serif",
    },
  },

  theme: {
    recipes: {
      button: buttonRecipe,
      input: inputRecipe,
      textarea: textareaRecipe,
      checkbox: checkboxRecipe,
      radio: radioRecipe,
      switch: switchRecipe,
    },

    tokens: {
      colors,
    },

    semanticTokens: {
      colors: semanticColors,
    },
  },
});

const system = createSystem(defaultConfig, config);

export default system;
