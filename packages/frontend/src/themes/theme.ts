import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { buttonRecipe } from "./recipes";
import { colors, semanticColors } from "./colors";

const config = defineConfig({
  globalCss: {
    "html, body": {
      color: "gray.600",
      fontFamily: "system-ui, sans-serif",
    },
  },

  theme: {
    recipes: {
      button: buttonRecipe,
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
